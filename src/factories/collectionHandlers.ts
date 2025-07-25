import { Payload } from 'payload'
import { ServiceRegistry } from '@/services/service.registry'
import { CollectionHandlers, SupportedCollections } from '../types/api'

export function createCollectionHandlers(payload: Payload) {
  const serviceRegistry = ServiceRegistry.getInstance(payload)
  const productService = serviceRegistry.getProductService()

  const handlers: CollectionHandlers = {
    products: {
      create: async (formData: FormData) => {
        const file = formData.get('file') as File
        const data = JSON.parse(formData.get('data') as string)
        return productService.createProduct(data, file)
      },
      update: async (id: string, formData: FormData) => {
        const file = formData.get('file') as File
        const data = JSON.parse(formData.get('data') as string)
        return productService.updateProduct(id, data, file)
      },
      delete: async (id: string) => {
        return productService.deleteProduct(id)
      },
    },
  }

  return handlers
}

export function isSpecialCollection(collection: string): collection is SupportedCollections {
  return ['products'].includes(collection)
}
