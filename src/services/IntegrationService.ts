import { Payload } from 'payload'

// Simple template evaluation function
function evaluateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim()
    return data[trimmedKey] !== undefined ? data[trimmedKey] : match
  })
}

export class IntegrationService {
  constructor(private payload: Payload) {}

  async processEvent(event: string, data: any): Promise<void> {
    try {
      console.log(`[Integration] Processing event ${event}`, data)

      // Try to log the event to events collection if it exists
      try {
        await this.payload.create({
          collection: 'events',
          data: {
            type: event,
            data,
            timestamp: new Date(),
          },
        })
      } catch (error) {
        // Silent fail if events collection doesn't exist
        console.log('Could not log event to events collection', error.message)
      }

      // Try to find integrations, but don't fail if the collection doesn't exist
      try {
        const integrations = await this.payload.find({
          collection: 'integrations',
          where: {
            status: { equals: 'active' },
            'triggers.event': { equals: event },
          },
        })

        if (integrations.docs.length > 0) {
          console.log(`Found ${integrations.docs.length} integration(s) for event ${event}`)
        }
      } catch (error) {
        // Silent fail if integrations collection doesn't exist
        console.log('Could not query integrations collection', error.message)
      }
    } catch (e) {
      // Never fail the main process because of integration issues
      console.error('Error in integration service:', e)
    }
  }

  private async executeAction(action: any, data: any) {
    switch (action.type) {
      case 'http':
        return this.executeHttpAction(action.config, data)
      case 'email':
        return this.executeEmailAction(action.config, data)
      default:
        throw new Error(`Unsupported action type: ${action.type}`)
    }
  }

  private async executeHttpAction(config: any, data: any) {
    const url = evaluateTemplate(config.url, data)
    const body =
      typeof config.body === 'string'
        ? evaluateTemplate(config.body, data)
        : JSON.stringify(config.body)

    const response = await fetch(url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private async executeEmailAction(config: any, data: any) {
    const subject = evaluateTemplate(config.subject, data)
    const body = evaluateTemplate(config.emailBody || config.body, data)

    // Implement your email sending logic here
    // For example:
    await this.payload.sendEmail({
      to: evaluateTemplate(config.to, data),
      from: config.from,
      subject,
      html: body,
    })
  }
}
