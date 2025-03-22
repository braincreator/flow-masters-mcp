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

  async processEvent(event: string, data: any) {
    const integrations = await this.payload.find({
      collection: 'integrations',
      where: {
        status: { equals: 'active' },
        'triggers.event': { equals: event },
      },
    })

    for (const integration of integrations.docs) {
      try {
        // Check conditions
        const shouldRun = integration.triggers.every(trigger => {
          if (!trigger.conditions?.length) return true
          return trigger.conditions.every(condition => {
            const fieldValue = data[condition.field]
            switch (condition.operator) {
              case 'eq': return fieldValue === condition.value
              case 'ne': return fieldValue !== condition.value
              case 'gt': return fieldValue > condition.value
              case 'lt': return fieldValue < condition.value
              case 'contains': return fieldValue?.includes(condition.value)
              default: return true
            }
          })
        })

        if (!shouldRun) continue

        // Execute actions
        for (const action of integration.actions) {
          await this.executeAction(action, {
            ...data,
            ...integration.config,
          })
        }
      } catch (error) {
        console.error(`Error processing integration ${integration.id}:`, error)
      }
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
    const body = typeof config.body === 'string' 
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
    const body = evaluateTemplate(config.body, data)
    
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
