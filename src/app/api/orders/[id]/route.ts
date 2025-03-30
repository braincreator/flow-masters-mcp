import { getPayloadClient } from '@/utilities/payload'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const payload = await getPayloadClient()

    const order = await payload.findByID({
      collection: 'orders',
      id,
      depth: 2, // Include related products
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
