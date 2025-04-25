import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'
import { ServiceRegistry } from '@/services/service.registry'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession()

    // Проверяем, авторизован ли пользователь
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const notificationId = params.id

    // Получаем payload client
    const payload = await getPayloadClient()

    // Получаем уведомление
    const notification = await payload.findByID({
      collection: 'notifications',
      id: notificationId,
    })

    // Проверяем, принадлежит ли уведомление пользователю
    if (notification.user !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Отмечаем уведомление как прочитанное
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()
    await notificationService.markNotificationAsRead(notificationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }
}
