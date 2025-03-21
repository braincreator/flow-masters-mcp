import type { Payload, PayloadRequest } from 'payload'
import { testProducts } from './test-products'

export const addProductsAndUpdateHeader = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  try {
    payload.logger.info('Adding products and updating header...')

    // Get existing header to preserve current navigation
    const existingHeader = await payload.findGlobal({
      slug: 'header',
    })

    // Create demo image if not exists (for product thumbnails)
    let demoImage
    try {
      const mediaResult = await payload.find({
        collection: 'media',
        where: {
          filename: {
            equals: 'product-demo-image.jpg',
          },
        },
      })

      demoImage = mediaResult.docs[0]
    } catch (err) {
      payload.logger.warn('Error finding demo image:', err)
    }

    payload.logger.info('— Adding products...')

    // Add products without removing existing ones
    for (const productData of testProducts) {
      try {
        const existingProduct = await payload.find({
          collection: 'products',
          where: {
            slug: {
              equals: productData.slug,
            },
          },
        })

        if (existingProduct.docs.length === 0) {
          const productDoc = {
            title: {
              en: productData.title.en,
              ru: productData.title.ru,
            },
            category: productData.category || 'n8n',
            description: [{
              children: [{ text: productData.description.en }]
            }],
            price: productData.price,
            slug: productData.slug,
            status: 'published',
            meta: {
              title: productData.title.en,
              description: productData.description.en,
            },
          }

          if (demoImage) {
            productDoc['thumbnail'] = demoImage.id
          }

          const createdProduct = await payload.create({
            collection: 'products',
            data: productDoc,
          })
          
          payload.logger.info(`Created product: ${createdProduct.id}`)
        } else {
          payload.logger.info(`Product ${productData.slug} already exists, skipping...`)
        }
      } catch (err) {
        payload.logger.error(`Error creating product ${productData.slug}:`, err)
        throw err // Re-throw to be caught by outer try-catch
      }
    }

    payload.logger.info('✅ Products update completed')
  } catch (error) {
    payload.logger.error('Error in addProductsAndUpdateHeader:', error)
    throw error
  }
}
