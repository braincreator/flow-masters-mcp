import { getPayload } from 'payload'
import type { Payload } from 'payload'
import configPromise from '@payload-config'
import { connectionMonitor } from './monitoring'

let cached: Payload | null = null

export const getPayloadClient = async (): Promise<Payload> => {
  if (cached) {
    return cached
  }

  try {
    const config = await configPromise
    const payload = await getPayload({
      config,
      // This ensures we don't try to initialize twice
      initOptions: {
        local: true,
        secret: process.env.PAYLOAD_SECRET || '',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
      }
    })
    
    cached = payload
    return payload
  } catch (error) {
    console.error('Error initializing Payload client:', error)
    throw error
  }
}
