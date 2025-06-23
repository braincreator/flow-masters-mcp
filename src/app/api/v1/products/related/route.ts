import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ProductService } from '@/services/product.service'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const limit = parseInt(searchParams.get('limit') || '4')

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const productService = ProductService.getInstance(payload)

    // First fetch the product
    const product = await productService.getProduct(id)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If product has no category, return empty array
    if (!product.category) {
      return NextResponse.json([])
    }

    // Then fetch related products
    const relatedProducts = await productService.getRelatedProducts(product, limit)

    return NextResponse.json(relatedProducts)
  } catch (error) {
    logError('Error fetching related products:', error)
    return NextResponse.json({ error: 'Failed to fetch related products' }, { status: 500 })
  }
}
