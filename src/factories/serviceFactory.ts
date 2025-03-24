import type { Payload } from 'payload'
import { ProductService } from '@/services/product.service'
import { IntegrationService } from '@/services/integration.service'
import { StorageService } from '@/services/storage.service'

export async function getProductService(payload?: Payload): Promise<ProductService> {
  if (!payload) {
    const { getPayloadClient } = await import('@/utilities/payload')
    payload = await getPayloadClient()
  }
  return ProductService.getInstance(payload)
}

export async function getIntegrationService(payload?: Payload): Promise<IntegrationService> {
  if (!payload) {
    const { getPayloadClient } = await import('@/utilities/payload')
    payload = await getPayloadClient()
  }
  return IntegrationService.getInstance(payload)
}

export async function getStorageService(payload?: Payload): Promise<StorageService> {
  if (!payload) {
    const { getPayloadClient } = await import('@/utilities/payload')
    payload = await getPayloadClient()
  }
  return StorageService.getInstance(payload)
}