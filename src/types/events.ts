/**
 * Centralized event type definitions for the integration system.
 * Used throughout the application to maintain consistency in event naming.
 */
export const IntegrationEvents = {
  // Order related events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_UPDATED: 'order.status.updated',

  // Payment related events
  PAYMENT_RECEIVED: 'payment.received',

  // User related events
  USER_REGISTERED: 'user.registered',

  // Form related events
  FORM_SUBMITTED: 'form.submitted',

  // Product related events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',

  // Contact related events
  CONTACT_CREATED: 'contact.created',
  CRM_CONTACT_CREATED: 'crm.contact.created',

  // Custom events
  CUSTOM: 'custom',
} as const

// Type for all possible event names
export type IntegrationEventType = (typeof IntegrationEvents)[keyof typeof IntegrationEvents]
export type IntegrationEvent = IntegrationEventType
export type IntegrationEventData = Record<string, any>

// Interface for event payloads
export interface EventPayloads {
  [IntegrationEvents.ORDER_CREATED]: {
    id: string
    orderNumber: string
    status: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.ORDER_UPDATED]: {
    id: string
    orderNumber: string
    status: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.ORDER_STATUS_UPDATED]: {
    orderId: string
    status: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.PAYMENT_RECEIVED]: {
    orderId: string
    amount: number
    currency: string
    paymentMethod: string
    [key: string]: any
  }
  [IntegrationEvents.USER_REGISTERED]: {
    id: string
    email: string
    name: string
    role: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.FORM_SUBMITTED]: {
    formId: string
    formTitle: string
    submission: Record<string, any>
    submittedAt: string
    [key: string]: any
  }
  [IntegrationEvents.PRODUCT_CREATED]: {
    id: string
    title: string
    price: number
    category: string
    createdAt: string
    [key: string]: any
  }
  [IntegrationEvents.PRODUCT_UPDATED]: {
    id: string
    title: string
    price: number
    category: string
    updatedAt: string
    [key: string]: any
  }
  [IntegrationEvents.CONTACT_CREATED]: {
    id: string
    email: string
    name: string
    source: string
    [key: string]: any
  }
  [IntegrationEvents.CRM_CONTACT_CREATED]: {
    id: string
    email: string
    name: string
    source: string
    [key: string]: any
  }
  [IntegrationEvents.CUSTOM]: Record<string, any>
}

// Helper type to get the payload type for a specific event
export type EventPayload<T extends IntegrationEventType> = EventPayloads[T]
