import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'
import { verifyApiKey } from '@/utilities/auth'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!verifyApiKey(apiKey)) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { id } = params
    const payload = await getPayloadClient()

    const product = await payload.findByID({
      collection: 'products',
      id,
      depth: 2,
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}