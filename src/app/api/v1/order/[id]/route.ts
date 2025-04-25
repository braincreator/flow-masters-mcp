import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Initialize Payload
    let payload
    try {
      payload = await getPayloadClient()
    } catch (error) {
      console.error('Failed to initialize Payload client:', error)
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order details
    let order
    try {
      order = await payload.findByID({
        collection: 'orders',
        id,
        depth: 1, // Populate product references in items
      })
    } catch (error) {
      console.error('Failed to fetch order:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Remove sensitive fields for client
    const safeOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      items: order.items.map((item) => ({
        product: {
          id: item.product?.id,
          title: item.product?.title || 'Product',
          price: item.price,
        },
        quantity: item.quantity,
        price: item.price,
      })),
      createdAt: order.createdAt,
      paidAt: order.paidAt,
    }

    return NextResponse.json({
      success: true,
      order: safeOrder,
    })
  } catch (error) {
    console.error('Order fetching error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
