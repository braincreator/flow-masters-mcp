import { Payload, getPayload } from 'payload'
import { ServiceRegistry } from '../../services/service.registry'
import config from '../../payload.config'
import { connectionMonitor } from './monitoring'
import { logger } from '../logger'

let cached: Payload | null = null

export const getPayloadClient = async (): Promise<Payload> => {
  if (cached) {
    return cached
  }

  try {
    const payload = await getPayload({
      config,
      initOptions: {
        local: true,
        secret: process.env.PAYLOAD_SECRET || '',
        mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
      }
    })
    
    cached = payload
    
    // Initialize service registry
    ServiceRegistry.getInstance(payload)
    
    return payload
  } catch (error) {
    console.error('Error initializing Payload client:', error)
    connectionMonitor.recordError(error instanceof Error ? error : new Error(String(error)))
    throw error
  }
}
