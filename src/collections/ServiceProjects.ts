import { CollectionConfig, Access } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { authenticated } from '@/access/authenticated'
import { ServiceRegistry } from '@/services/service.registry'

// Функция доступа для проверки является ли пользователь заказчиком проекта или администратором
const isAdminOrProjectCustomer: Access = ({ req: { user } }) => {
  if (!user) return false

  // Администраторы имеют полный доступ
  if (user.roles?.includes('admin')) return true

  // Для запросов на создание/обновление/удаление доступ имеют только заказчики к своим проектам
  return {
    customer: {
      equals: user.id,
    },
  }
}

const ServiceProjects: CollectionConfig = {
  slug: 'service-projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sourceOrder', 'customer', 'status', 'createdAt'],
    group: 'E-commerce',
  },
  access: {
    create: isAdmin,
    read: isAdminOrProjectCustomer,
    update: isAdminOrProjectCustomer,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Название проекта',
      },
    },
    {
      name: 'sourceOrder',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      admin: {
        description: 'Исходный заказ',
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Заказчик',
        readOnly: true,
      },
    },
    {
      name: 'serviceDetails',
      type: 'group',
      admin: {
        description: 'Детали заказанной услуги',
        readOnly: true,
      },
      fields: [
        {
          name: 'serviceName',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'serviceType',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'specificationText',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Текстовое ТЗ',
        readOnly: true,
      },
    },
    {
      name: 'specificationFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Файлы ТЗ',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Новый', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'На проверке', value: 'on_review' },
        { label: 'Завершен', value: 'completed' },
        { label: 'Отменен', value: 'cancelled' },
      ],
      defaultValue: 'new',
      required: true,
      localized: true,
      admin: {
        description: 'Статус выполнения проекта',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Исполнитель',
        condition: () => true, // Всегда отображается, но редактировать могут только администраторы
      },
      access: {
        update: () => false, // Только в админке через стандартный контроль доступа
      },
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Внутренние заметки по проекту',
      },
    },
    {
      name: 'appliedTemplate',
      type: 'relationship',
      relationTo: 'project-templates',
      admin: {
        description: 'Примененный шаблон проекта',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [
      // Добавляем хук для событий проектов
      async ({ doc, previousDoc, operation, req }) => {
        const serviceRegistry = ServiceRegistry.getInstance(req.payload)
        const eventService = serviceRegistry.getEventService()

        if (!eventService) return

        if (operation === 'create') {
          // Событие создания проекта
          await eventService.publishEvent('project.created', {
            id: doc.id,
            name: doc.name,
            sourceOrder: typeof doc.sourceOrder === 'object' ? doc.sourceOrder.id : doc.sourceOrder,
            customer: typeof doc.customer === 'object' ? doc.customer.id : doc.customer,
            customerName: typeof doc.customer === 'object' ? doc.customer.name : null,
            customerEmail: typeof doc.customer === 'object' ? doc.customer.email : null,
            serviceDetails: doc.serviceDetails,
            status: doc.status,
            assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
            createdAt: doc.createdAt,
          }, {
            source: 'project_creation',
            collection: 'service-projects',
            operation,
            userId: req.user?.id,
            userEmail: req.user?.email,
          })
        } else if (operation === 'update' && previousDoc) {
          // Событие начала работы над проектом
          if (doc.status === 'in_progress' && previousDoc.status === 'new') {
            await eventService.publishEvent('project.started', {
              id: doc.id,
              name: doc.name,
              sourceOrder: typeof doc.sourceOrder === 'object' ? doc.sourceOrder.id : doc.sourceOrder,
              customer: typeof doc.customer === 'object' ? doc.customer.id : doc.customer,
              customerName: typeof doc.customer === 'object' ? doc.customer.name : null,
              customerEmail: typeof doc.customer === 'object' ? doc.customer.email : null,
              assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
              assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
              startedAt: new Date().toISOString(),
            }, {
              source: 'project_start',
              collection: 'service-projects',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие завершения проекта
          if (doc.status === 'completed' && previousDoc.status !== 'completed') {
            await eventService.publishEvent('project.completed', {
              id: doc.id,
              name: doc.name,
              sourceOrder: typeof doc.sourceOrder === 'object' ? doc.sourceOrder.id : doc.sourceOrder,
              customer: typeof doc.customer === 'object' ? doc.customer.id : doc.customer,
              customerName: typeof doc.customer === 'object' ? doc.customer.name : null,
              customerEmail: typeof doc.customer === 'object' ? doc.customer.email : null,
              assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
              assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
              completedAt: new Date().toISOString(),
              duration: doc.createdAt ?
                Math.round((Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null,
            }, {
              source: 'project_completion',
              collection: 'service-projects',
              operation,
              userId: req.user?.id,
              userEmail: req.user?.email,
            })
          }

          // Событие просрочки проекта (если есть дедлайн и он прошел)
          // Это можно реализовать через отдельный cron job, но добавим базовую логику
          if (doc.status === 'in_progress' && previousDoc.status === 'in_progress') {
            const daysSinceCreation = doc.createdAt ?
              Math.floor((Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0

            // Если проект в работе больше 30 дней - считаем просроченным
            if (daysSinceCreation > 30) {
              await eventService.publishEvent('project.overdue', {
                id: doc.id,
                name: doc.name,
                customer: typeof doc.customer === 'object' ? doc.customer.id : doc.customer,
                customerName: typeof doc.customer === 'object' ? doc.customer.name : null,
                customerEmail: typeof doc.customer === 'object' ? doc.customer.email : null,
                assignedTo: typeof doc.assignedTo === 'object' ? doc.assignedTo.id : doc.assignedTo,
                assignedToName: typeof doc.assignedTo === 'object' ? doc.assignedTo.name : null,
                daysSinceCreation,
                status: doc.status,
              }, {
                source: 'project_overdue',
                collection: 'service-projects',
                operation,
                userId: req.user?.id,
                userEmail: req.user?.email,
              })
            }
          }
        }
      },
    ],
  },
  timestamps: true,
}

export default ServiceProjects
