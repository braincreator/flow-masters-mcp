import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getPayloadClient } from '@/utilities/payload'
import { authOptions } from '@/utilities/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const session = await getServerSession(authOptions)

    // Security check: Only allow fetching own cart or admin access
    if (!session?.user || (session.user.id !== userId && !session.user.isAdmin)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()

    // Find cart sessions for the user
    const cartSessions = await payload.find({
      collection: 'cart-sessions',
      where: {
        user: {
          equals: userId,
        },
        convertedToOrder: {
          equals: false,
        },
      },
      sort: '-updatedAt',
      limit: 1,
      depth: 2, // Load related product data
    })

    if (cartSessions.docs.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const cartSession = cartSessions.docs[0]

    // Format cart data
    return NextResponse.json({
      id: cartSession.id,
      items: cartSession.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      total: cartSession.total,
      currency: cartSession.currency,
      updatedAt: cartSession.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching user cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
