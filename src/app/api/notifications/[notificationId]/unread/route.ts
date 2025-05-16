import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { getServerSession } from '@/lib/auth'
// import { ServiceRegistry } from '@/services/service.registry' // Not strictly needed if using payload.update directly

export async function POST(request: NextRequest, { params }: { params: { notificationId: string } }) {
  try {
    const session = await getServerSession()

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    // Per Next.js warning for dynamic APIs, ensure request stream is consumed
    // before accessing params. Using request.text() if body content isn't strictly needed here.
    await request.text();
    const { notificationId } = params

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    // Get payload client
    const payload = await getPayloadClient()

    // Get the notification
    let notification
    try {
      notification = await payload.findByID({
        collection: 'notifications',
        id: notificationId,
      })
    } catch (e) {
      // Handle cases where ID format might be invalid for Payload
      return NextResponse.json({ error: 'Invalid Notification ID format or not found' }, { status: 400 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Check if the notification belongs to the user or if the user is an admin
    // Assuming notification.user stores the ID of the recipient.
    // If notification.user is an object, access notification.user.id
    const recipientId = typeof notification.user === 'string' ? notification.user : notification.user?.id

    if (recipientId !== userId && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark the notification as unread
    const updatedNotification = await payload.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        isRead: false,
      },
    })

    return NextResponse.json({ success: true, notification: updatedNotification })
  } catch (error) {
    console.error('Error marking notification as unread:', error)
    let errorMessage = 'Failed to mark notification as unread'
    if (error instanceof Error) {
        errorMessage = error.message
    }
    // Check if the error is due to non-existence, though findByID should catch it first
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes('Not Found')) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}