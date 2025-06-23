import type { Payload } from 'payload'
import { getPayload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import payloadConfig from '@/payload-config'
import { addProductsAndUpdateHeader } from '@/utilities/products'
import { logger } from '@/utilities/logger'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Get the directory name properly in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load environment variables from the root directory
const envPath = path.resolve(__dirname, '../../.env')
dotenv.config({ path: envPath })

// Debug logging to verify environment variables
logDebug('Environment variables loaded from:', envPath)
logDebug('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET)
logDebug('DATABASE_URI:', process.env.DATABASE_URI)

if (!process.env.PAYLOAD_SECRET) {
  throw new Error(`PAYLOAD_SECRET not found in environment.
    Please check that ${envPath} exists and contains PAYLOAD_SECRET`)
}

// Initialize Payload
const init = async () => {
  try {
    // Get the config and explicitly set the secret
    const config = {
      ...payloadConfig,
      secret: process.env.PAYLOAD_SECRET,
      db: {
        ...payloadConfig.db,
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

    logDebug('Successfully added products and updated header')

    if (payload && typeof payload.db?.destroy === 'function') {
      await payload.db.destroy()
    }
  } catch (error) {
    logError('Error details:', error)
    process.exit(1)
  }

  process.exit(0)
}

init()
