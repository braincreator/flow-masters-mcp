import { MigrateUpArgs, MigrateDownArgs } from 'payload/database'

const testProducts = [
  {
    title: {
      en: 'N8N Workflow Bundle',
      ru: 'Набор рабочих процессов N8N'
    },
    category: 'n8n',
    description: {
      en: 'A collection of automation workflows for N8N',
      ru: 'Коллекция рабочих процессов автоматизации для N8N'
    },
    shortDescription: 'Comprehensive bundle of N8N automation workflows',
    price: 49.99,
    slug: 'n8n-workflow-bundle',
    features: [
      { feature: 'Multiple automation templates' },
      { feature: 'Ready to use configurations' },
      { feature: 'Documentation included' }
    ]
  },
  // Add more test products as needed
]

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  payload.logger.info('Running add-products migration...')

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
          title: productData.title,
          category: productData.category,
          description: [{
            children: [{ text: productData.description.en }]
          }],
          shortDescription: productData.shortDescription,
          price: productData.price,
          slug: productData.slug,
          status: 'published',
          features: productData.features,
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
      throw err
    }
  }

  payload.logger.info('✅ Products migration completed')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('Rolling back add-products migration...')

  // Remove all products that match our test products
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

      if (existingProduct.docs.length > 0) {
        await payload.delete({
          collection: 'products',
          id: existingProduct.docs[0].id,
        })
        payload.logger.info(`Deleted product: ${productData.slug}`)
      }
    } catch (err) {
      payload.logger.error(`Error deleting product ${productData.slug}:`, err)
      throw err
    }
  }

  payload.logger.info('✅ Products rollback completed')
}