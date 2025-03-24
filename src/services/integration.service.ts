import type { Payload } from 'payload'
import { BaseService } from './base.service'
import { Integration } from '../payload-types'
import { IntegrationEvent, IntegrationEventData } from '../types/events'
import { LRUCache } from 'lru-cache'

interface EventData {
  id: string
  [key: string]: any
}

export class IntegrationService extends BaseService {
  private static instance: IntegrationService | null = null
  private eventCache: LRUCache<string, boolean>

  private constructor(payload: Payload) {
    super(payload)
    this.eventCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
    })
  }

  public static getInstance(payload: Payload): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService(payload)
    }
    return IntegrationService.instance
  }

  private async logEvent(type: string, data: EventData): Promise<void> {
    try {
      await this.payload.create({
        collection: 'events',
        data: {
          type,
          data,
          timestamp: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to log event:', error)
    }
  }

  private async sendEventToIntegration(
    integration: Integration, 
    type: IntegrationEvent, 
    data: IntegrationEventData
  ): Promise<void> {
    try {
      const response = await fetch(integration.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Integration-Key': integration.apiKey,
          'X-Event-Type': type
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      await this.payload.update({
        collection: 'integrations',
        id: integration.id,
        data: {
          lastSync: new Date(),
          lastSyncStatus: 'success'
        }
      })
    } catch (error) {
      await this.payload.update({
        collection: 'integrations',
        id: integration.id,
        data: {
          lastSync: new Date(),
          lastSyncStatus: 'error',
          lastError: error.message
        }
      })
      throw error
    }
  }

  async getIntegrationByType(type: string) {
    try {
      const result = await this.payload.find({
        collection: 'integrations',
        where: {
          type: {
            equals: type
          },
          status: {
            equals: 'active'
          }
        },
        limit: 1
      })

      return result.docs[0]
    } catch (error) {
      console.error('Failed to get integration:', error)
      throw error
    }
  }

  async processEvent(type: IntegrationEvent, data: IntegrationEventData): Promise<void> {
    try {
      const integrations = await this.payload.find({
        collection: 'integrations',
        where: {
          status: { equals: 'active' },
          'triggers.event': { equals: type },
        },
      })

      for (const integration of integrations.docs) {
        await this.sendEventToIntegration(integration, type, data)
      }

      await this.logEvent(type, data)
    } catch (error) {
      console.error('Failed to process event:', error)
      throw error
    }
  }
}
