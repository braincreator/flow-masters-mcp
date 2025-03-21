import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const getPayloadClient = async (local = false) => {
  const config = await configPromise
  return getPayload({
    config,
    local // Allow passing local mode
  })
}
