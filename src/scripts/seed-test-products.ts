import dotenv from 'dotenv'
import path from 'path'
import payload from 'payload'
import { addProductsAndUpdateHeader } from '../endpoints/seed/add-products'

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
})

// Initialize Payload
const init = async () => {
  try {
    // Initialize Payload
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || '',
      local: true,
      mongoURL: process.env.MONGODB_URI || '',
    })

    // Create a mock request object
    const req = {} as any

    // Add products
    await addProductsAndUpdateHeader({
      payload,
      req,
    })

    console.log('✨ Successfully added test products')
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

init()