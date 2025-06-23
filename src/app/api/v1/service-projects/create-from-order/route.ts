import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import type { Order, Service } from '@/payload-types'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface LocalizedTitle {
  en: string
  ru: string
}

// Глобальная переменная для отслеживания заказов, для которых создаются проекты
if (typeof global.creatingServiceProjects === 'undefined') {
  global.creatingServiceProjects = new Set();
}

export async function POST(request: NextRequest) {
  // Создаем уникальный идентификатор для этого запроса
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    const payload = await getPayloadClient()
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    logDebug(`[${requestId}] [create-from-order] Creating service project for order ${orderId}`)

    // Проверяем, не запущен ли уже процесс создания проекта для этого заказа
    if (global.creatingServiceProjects.has(orderId)) {
      logDebug(`[${requestId}] [create-from-order] Project creation already in progress for order ${orderId}, waiting...`);

      // Ждем небольшое время и проверяем, не создан ли уже проект
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check if a service project already exists for this order
    const existingProjects = await payload.find({
      collection: 'service-projects',
      where: {
        sourceOrder: {
          equals: orderId,
        },
      },
    })

    if (existingProjects.totalDocs > 0) {
      logDebug(`[create-from-order] Service project already exists for order ${orderId}`)
      return NextResponse.json({
        success: true,
        projectId: existingProjects.docs[0].id,
        message: 'Service project already exists'
      })
    }

    // Get the order
    const order = await payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2, // To get nested service details
    }) as Order

    if (!order) {
      logError(`[create-from-order] Order ${orderId} not found`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.orderType !== 'service') {
      logError(`[create-from-order] Order ${orderId} is not a service order`)
      return NextResponse.json({ error: 'Order is not a service order' }, { status: 400 })
    }

    // Get service details
    let serviceName = 'Unknown Service'
    let serviceType = ''
    let serviceId = null

    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.service) {
          try {
            if (typeof item.service === 'string') {
              // Get service by ID
              const service = await payload.findByID({
                collection: 'services',
                id: item.service,
              }) as Service

              // Check fields before accessing them
              if (service.title) {
                if (typeof service.title === 'object' && service.title !== null) {
                  // Handle localized title
                  const titleObj = service.title as unknown as LocalizedTitle
                  serviceName = titleObj.ru || titleObj.en || 'Услуга'
                } else {
                  serviceName = service.title.toString()
                }
              }
              serviceType = service.serviceType || ''
              serviceId = service.id

              // Break after finding the first service
              break
            } else if (typeof item.service === 'object') {
              // Service data is already in the object
              if (item.service.title) {
                if (typeof item.service.title === 'object' && item.service.title !== null) {
                  // Handle localized title
                  const titleObj = item.service.title as unknown as LocalizedTitle
                  serviceName = titleObj.ru || titleObj.en || 'Услуга'
                } else {
                  serviceName = item.service.title.toString()
                }
              }
              serviceType = item.service.serviceType || ''
              serviceId = item.service.id

              // Break after finding the first service
              break
            }
          } catch (error: unknown) {
            // Error getting service data
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            logError(`[create-from-order] Error getting service data: ${errorMessage}`)
          }
        }
      }
    }

    // Import the utility function for extracting short order number
    const { getShortOrderNumber } = require('@/utilities/orderNumber')

    // Create project name with short order number for better readability
    const shortOrderNumber = getShortOrderNumber(order.orderNumber)
    const projectName = `${order.orderNumber} (${shortOrderNumber})`

    // Create the project
    try {
      // Устанавливаем флаг, что мы начали создание проекта
      global.creatingServiceProjects.add(orderId);
      logDebug(`[${requestId}] [create-from-order] Added order ${orderId} to creation tracking`);

      // Ensure we have a valid customer ID
      let customerId = '';

      if (order.customer) {
        customerId = typeof order.customer === 'string' ? order.customer : order.customer?.id || '';
      }

      // If no customer is found, create a guest user
      if (!customerId) {
        logDebug(`[${requestId}] [create-from-order] No customer found for order, creating a guest user`);
        try {
          const randomEmail = `guest_${Date.now()}@example.com`;
          const guestUser = await payload.create({
            collection: 'users',
            data: {
              email: randomEmail,
              name: 'Guest User',
              roles: ['customer'],
            },
          });
          customerId = guestUser.id;
          logDebug(`[${requestId}] [create-from-order] Created guest user with ID: ${customerId}`);
        } catch (userError) {
          logError(`[${requestId}] [create-from-order] Error creating guest user:`, userError);
          throw new Error('Failed to create guest user');
        }
      }

      const createdProject = await payload.create({
        collection: 'service-projects',
        data: {
          name: projectName,
          sourceOrder: order.id,
          customer: customerId,
          serviceDetails: {
            serviceName,
            serviceType,
          },
          specificationText: order.specificationText,
          specificationFiles: order.specificationFiles,
          status: 'new',
        },
      })

      logDebug(`[create-from-order] Service project created: ${createdProject.id}`)

      // Create system message in the project
      if (createdProject.id) {
        try {
          // Find first admin user for system message
          const adminUsers = await payload.find({
            collection: 'users',
            where: {
              roles: {
                contains: 'admin',
              },
            },
            limit: 1,
          })

          const adminUser = adminUsers.docs[0]

          if (adminUser) {
            // Create system message
            await payload.create({
              collection: 'project-messages',
              data: {
                project: createdProject.id,
                author: adminUser.id,
                content: [
                  {
                    children: [
                      {
                        text: `Проект создан автоматически на основе заказа ${order.orderNumber}.`,
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Пожалуйста, ознакомьтесь с техническим заданием и ожидайте дальнейших действий от нашей команды.',
                      },
                    ],
                  },
                ],
                isSystemMessage: true,
              },
            })
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          logError(`[create-from-order] Error creating system message: ${errorMessage}`)
        }
      }

      // Удаляем заказ из множества создаваемых проектов
      if (global.creatingServiceProjects && global.creatingServiceProjects.has(orderId)) {
        global.creatingServiceProjects.delete(orderId);
        logDebug(`[${requestId}] [create-from-order] Removed order ${orderId} from creation tracking after success`);
      }

      return NextResponse.json({
        success: true,
        projectId: createdProject.id,
        message: 'Service project created successfully'
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError(`[${requestId}] [create-from-order] Error creating service project: ${errorMessage}`)

      // Удаляем заказ из множества создаваемых проектов в случае ошибки
      if (global.creatingServiceProjects && global.creatingServiceProjects.has(orderId)) {
        global.creatingServiceProjects.delete(orderId);
        logDebug(`[${requestId}] [create-from-order] Removed order ${orderId} from creation tracking after error`);
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    logError(`[${requestId}] [create-from-order] Error creating service project from order:`, error)
    let message = 'Failed to create service project from order'
    if (error instanceof Error) message = error.message

    // Удаляем заказ из множества создаваемых проектов в случае ошибки
    if (orderId && global.creatingServiceProjects && global.creatingServiceProjects.has(orderId)) {
      global.creatingServiceProjects.delete(orderId);
      logDebug(`[${requestId}] [create-from-order] Removed order ${orderId} from creation tracking after outer error`);
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
