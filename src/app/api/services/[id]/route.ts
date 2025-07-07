import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * GET /api/services/:id
 * Получение информации об услуге по ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const serviceService = serviceRegistry.getServiceService()

    // Получаем информацию об услуге
    const service = await serviceService.getServiceById(id)

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    logError('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}

/**
 * PUT /api/services/:id
 * Обновление услуги
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const data = await request.json()

    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const serviceService = serviceRegistry.getServiceService()

    // Обновляем услугу
    const service = await serviceService.updateService({
      id,
      ...data,
    })

    return NextResponse.json(service)
  } catch (error) {
    logError('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

/**
 * DELETE /api/services/:id
 * Удаление услуги
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const serviceService = serviceRegistry.getServiceService()

    // Удаляем услугу
    await serviceService.deleteService(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
