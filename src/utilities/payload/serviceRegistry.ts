import { Payload } from 'payload'
import { RewardService } from '@/services/reward.service'

/**
 * Service Registry for Payload CMS
 * Provides access to various services used throughout the application
 */
export class ServiceRegistry {
  private payload: Payload
  private services: Map<string, any> = new Map()

  constructor(payload: Payload) {
    this.payload = payload
    this.initializeServices()
  }

  /**
   * Initialize all services
   */
  private initializeServices() {
    // Initialize reward service
    const rewardService = new RewardService(this.payload)
    this.services.set('reward', rewardService)
  }

  /**
   * Get the reward service
   */
  getRewardService() {
    return this.services.get('reward')
  }

  /**
   * Get a service by name
   * @param name Service name
   */
  getService(name: string) {
    return this.services.get(name)
  }
}

/**
 * Initialize the service registry for Payload CMS
 * @param payload Payload instance
 */
export function initializeServiceRegistry(payload: Payload) {
  if (!payload.services) {
    payload.services = new ServiceRegistry(payload)
  }
  return payload.services
}
