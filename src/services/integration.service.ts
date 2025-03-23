import { Payload } from 'payload'
import { BaseService } from './base.service'
import { Integration } from '../payload-types'
import { IntegrationEvent, IntegrationEventData } from '../types/events'
import { LRUCache } from 'lru-cache'

interface EventData {
  id: string
  [key: string]: any
}

export class IntegrationService extends BaseService {
  private eventCache: LRUCache<string, boolean>

  constructor(payload: Payload) {
    super(payload)
    this.eventCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
    })
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

  private async notifyWebhooks(type: ProductEventType, data: EventData): Promise<void> {
    try {
      const settings = await this.payload.findGlobal({
        slug: 'settings',
      })

      const webhooks = settings?.webhooks || []
      
      await Promise.all(webhooks.map(async (webhook) => {
        if (!webhook.enabled || !webhook.url) return

        const eventKey = `${type}-${data.id}-${webhook.url}`
        if (this.eventCache.get(eventKey)) return

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Type': type,
              'X-Webhook-Signature': webhook.secret || '',
            },
            body: JSON.stringify({
              type,
              data,
              timestamp: new Date().toISOString(),
            }),
          })

          if (!response.ok) {
            throw new Error(`Webhook failed with status ${response.status}`)
          }

          this.eventCache.set(eventKey, true)
        } catch (error) {
          console.error(`Webhook delivery failed for ${webhook.url}:`, error)
        }
      }))
    } catch (error) {
      console.error('Failed to notify webhooks:', error)
    }
  }

  async processEvent(type: IntegrationEvent, data: IntegrationEventData): Promise<void> {
    try {
      const integrations = await this.payload.find({
        collection: 'integrations',
        where: {
          status: 'active',
          events: {
            contains: type
          }
        }
      })

      await Promise.all(
        integrations.docs.map(integration => 
          this.sendEventToIntegration(integration as Integration, type, data)
        )
      )
    } catch (error) {
      console.error(`Failed to process integration event ${type}:`, error)
      throw error
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
}
