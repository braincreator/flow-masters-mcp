import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

/**
 * API endpoint to create a consulting product
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Payload
    const payload = await getPayloadClient()

    console.log('Creating consulting product...')

    // Check if a consulting product already exists
    const existingProducts = await payload.find({
      collection: 'products',
      where: {
        isConsulting: {
          equals: true,
        },
      },
    })

    if (existingProducts.docs.length > 0) {
      console.log('Consulting product already exists:', existingProducts.docs[0].id)
      return NextResponse.json({
        success: true,
        message: 'Consulting product already exists',
        productId: existingProducts.docs[0].id,
        product: existingProducts.docs[0],
      })
    }

    // Create the consulting product
    const product = await payload.create({
      collection: 'products',
      data: {
        title: {
          en: 'Consulting Session',
          ru: 'Консультационная сессия',
        },
        description: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Book a one-hour consulting session with our expert',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        shortDescription: 'One-hour consulting session with our expert',
        pricing: {
          basePrice: 100,
          finalPrice: 100,
        },
        productType: 'service',
        status: 'published',
        isConsulting: true,
      },
    })

    console.log('Consulting product created:', product.id)

    return NextResponse.json({
      success: true,
      message: 'Consulting product created successfully',
      productId: product.id,
      product,
    })
  } catch (error) {
    console.error('Error creating consulting product:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
