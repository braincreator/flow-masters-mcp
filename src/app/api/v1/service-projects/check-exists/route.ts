import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    
    console.log(`[check-exists] Checking if service project exists for order ${orderId}`)
    
    // Check if a service project already exists for this order
    const existingProjects = await payload.find({
      collection: 'service-projects',
      where: {
        sourceOrder: {
          equals: orderId,
        },
      },
    })

    const exists = existingProjects.totalDocs > 0
    console.log(`[check-exists] Service project exists for order ${orderId}: ${exists}`)
    
    return NextResponse.json({ 
      exists,
      projectId: exists && existingProjects.docs.length > 0 ? existingProjects.docs[0].id : null,
      count: existingProjects.totalDocs
    })
  } catch (error) {
    console.error('[check-exists] Error checking if service project exists:', error)
    let message = 'Failed to check if service project exists'
    if (error instanceof Error) message = error.message
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
