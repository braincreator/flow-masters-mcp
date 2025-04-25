import { getPayloadClient } from '../utilities/payload/index.ts'

/**
 * Script to create a consulting product
 */
async function createConsultingProduct() {
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
      return existingProducts.docs[0].id
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
          en: 'Book a one-hour consulting session with our expert',
          ru: 'Забронируйте часовую консультацию с нашим экспертом',
        },
        price: 100,
        currency: 'USD',
        status: 'active',
        type: 'service',
        isConsulting: true,
      },
    })

    console.log('Consulting product created:', product.id)
    return product.id
  } catch (error) {
    console.error('Error creating consulting product:', error)
    throw error
  }
}

// Run the script
createConsultingProduct()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
