import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/utilities/payload/index'

export async function POST(req: Request) {
  try {
    const payload = await getPayloadClient()

    // Extract cart data from request
    const { sessionId, items, total, currency } = await req.json()

    if (!items || !Array.isArray(items) || !sessionId) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 })
    }

    // No session in this version, using only sessionId
    const userId = null

    // Try to find existing cart session
    const existingCartSessions = await payload.find({
      collection: 'cart-sessions',
      where: { sessionId: { equals: sessionId } },
      limit: 1,
    })

    const existingCartSession = existingCartSessions.docs[0]

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Update or create cart session
    if (existingCartSession) {
      // Skip update if not changed
      const currentItems = existingCartSession.items || []

      // Simple comparison of items (could be more sophisticated)
      const itemsChanged = JSON.stringify(currentItems) !== JSON.stringify(items)

      if (itemsChanged || existingCartSession.total !== total) {
        await payload.update({
          collection: 'cart-sessions',
          id: existingCartSession.id,
          data: {
            user: userId || existingCartSession.user,
            sessionId,
            items,
            total,
            currency,
            expiresAt: expiresAt.toISOString(),
            // Only reset reminder status if items have changed
            ...(itemsChanged && {
              reminderSent: false,
              reminderSentAt: null,
            }),
          },
        })
      }
    } else {
      // Create new cart session
      await payload.create({
        collection: 'cart-sessions',
        data: {
          user: userId,
          sessionId,
          items,
          total,
          currency,
          expiresAt: expiresAt.toISOString(),
          reminderSent: false,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing cart:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}
