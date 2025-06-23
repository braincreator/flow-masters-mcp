import type { Payload, PayloadRequest } from 'payload'
import { testProducts } from './test-products'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
            description: [
              {
                children: [{ text: productData.description.en }],
              },
            ],
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

export async function fixProductCategories(payload: Payload) {
  logDebug('Starting product category migration...')

  // Check if categories collection exists and create a default product category if needed
  try {
    const collections = await payload.find({ collection: 'collections' })
    if (!collections.docs.find((col) => col.slug === 'categories')) {
      logError('Categories collection does not exist!')
      return
    }
  } catch (error) {
    logError('Error checking collections:', error)
  }

  // First, get a valid product category to use as a fallback
  const productCategories = await payload.find({
    collection: 'categories',
    where: {
      categoryType: {
        equals: 'product',
      },
    },
    limit: 100,
  })

  logDebug(`Found ${productCategories.totalDocs} product categories`)

  if (!productCategories.docs.length) {
    logDebug('No product categories found. Creating a default one...')

    try {
      const defaultCategory = await payload.create({
        collection: 'categories',
        data: {
          title: 'General Products',
          categoryType: 'product',
          slug: 'general-products',
        },
      })

      logDebug(`Created default product category: ${defaultCategory.id}`)

      const fallbackCategory = defaultCategory.id

      // Update all products with the new fallback category
      await updateAllProductsWithCategory(payload, fallbackCategory)

      logDebug('Completed product category migration with new default category')
      return
    } catch (error) {
      logError('Failed to create default product category:', error)
      return
    }
  }

  const fallbackCategory = productCategories.docs[0].id
  logDebug(`Using fallback category: ${fallbackCategory}`)

  await updateAllProductsWithCategory(payload, fallbackCategory)

  logDebug('Completed product category migration')
}

// Helper function to update all products with a valid category
async function updateAllProductsWithCategory(payload: Payload, fallbackCategoryId: string) {
  // Find all products
  const allProducts = await payload.find({
    collection: 'products',
    limit: 250,
  })

  logDebug(`Checking ${allProducts.totalDocs} products...`)

  let updatedCount = 0
  let validCount = 0

  for (const product of allProducts.docs) {
    try {
      // Check if the product has a valid category
      let needsUpdate = false

      if (!product.category) {
        needsUpdate = true
      } else {
        try {
          // Check if the category exists and is a product category
          const category = await payload.findByID({
            collection: 'categories',
            id: product.category,
          })

          if (!category) {
            logDebug(`Product ${product.id}: Category ${product.category} not found`)
            needsUpdate = true
          } else if (category.categoryType !== 'product') {
            logDebug(`Product ${product.id}: Category ${product.category} is not a product category`,  )
            needsUpdate = true
          } else {
            validCount++
          }
        } catch (error) {
          logError(`Error checking product ${product.id} category:`, error)
          needsUpdate = true
        }
      }

      if (needsUpdate) {
        await payload.update({
          collection: 'products',
          id: product.id,
          data: {
            category: fallbackCategoryId,
          },
        })
        logDebug(`Fixed product: ${product.title || product.id}`)
        updatedCount++
      }
    } catch (error) {
      logError(`Failed to process product ${product.id}:`, error)
    }
  }

  logDebug(`${validCount} products already had valid categories`)
  logDebug(`Updated ${updatedCount} products with the fallback category`)
}
