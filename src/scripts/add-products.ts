import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import { addProductsAndUpdateHeader } from '../endpoints/seed/add-products'
import configPromise from '../payload.config'

// Get the directory name properly in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from the root directory
const envPath = path.resolve(__dirname, '../../.env')
dotenv.config({ path: envPath })

// Debug logging to verify environment variables
console.log('Environment variables loaded from:', envPath)
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET)
console.log('DATABASE_URI:', process.env.DATABASE_URI)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error(`PAYLOAD_SECRET not found in environment. 
    Please check that ${envPath} exists and contains PAYLOAD_SECRET`)
}

// Initialize Payload
const init = async () => {
  try {
    // Get the config and explicitly set the secret
    const originalConfig = await configPromise
    const config = {
      ...originalConfig,
      secret: process.env.PAYLOAD_SECRET,
      db: {
        ...originalConfig.db,
        url: process.env.DATABASE_URI,
      },
    }

    const payload = await getPayload({
      config,
    })

    // Create a request context
    const req = {} as any

    await addProductsAndUpdateHeader({
      payload,
      req,
    })

    console.log('Successfully added products and updated header')
    
    if (payload) {
      await payload.disconnect()
    }
    
  } catch (error) {
    console.error('Error details:', error)
    process.exit(1)
  }

  process.exit(0)
}

init()
