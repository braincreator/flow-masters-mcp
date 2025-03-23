import { Payload } from 'payload'
import { ProductService } from './product.service'
import { PriceService } from './price.service'
import { RecommendationService } from './recommendation.service'
import { IntegrationService } from './integration.service'
import { StorageService } from './storage.service'

export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, any> = new Map()
  private payload: Payload

  private constructor(payload: Payload) {
    this.payload = payload
  }

  static getInstance(payload: Payload): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(payload)
    }
    return ServiceRegistry.instance
  }

  getProductService(): ProductService {
    const key = 'product'
    if (!this.services.has(key)) {
      this.services.set(key, new ProductService(this.payload))
    }
    return this.services.get(key)
  }

  getPriceService(): PriceService {
    const key = 'price'
    if (!this.services.has(key)) {
      this.services.set(key, PriceService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getRecommendationService(): RecommendationService {
    const key = 'recommendation'
    if (!this.services.has(key)) {
      this.services.set(key, new RecommendationService(this.payload))
    }
    return this.services.get(key)
  }

  getIntegrationService(): IntegrationService {
    const key = 'integration'
    if (!this.services.has(key)) {
      this.services.set(key, IntegrationService.getInstance(this.payload))
    }
    return this.services.get(key)
  }

  getStorageService(): StorageService {
    const key = 'storage'
    if (!this.services.has(key)) {
      this.services.set(key, new StorageService(this.payload))
    }
    return this.services.get(key)
  }
}