import type { Order } from '@/payload-types'
import type { OrderCreateInput, OrderUpdateInput } from '@/types/order'
import { BaseService } from '@/services/base.service'
import { ServiceRegistry } from '@/services/service.registry'
import { revalidateContent } from '@/utilities/revalidation'
import type { Payload } from 'payload'

export class OrderService extends BaseService {
  private static instance: OrderService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService(payload)
    }
    return OrderService.instance
  }

  async create(input: OrderCreateInput): Promise<Order> {
    return this.withErrorHandling(async () => {
      const order = await this.payload.create({
        collection: 'orders',
        data: {
          ...input,
          status: 'pending',
          createdAt: new Date(),
        },
      })

      await this.triggerEvent('order.created', order)
      await revalidateContent({
        collection: 'orders',
        payload: this.payload,
      })
      return order as Order
    }, 'Failed to create order')
  }

  async update(id: string, input: OrderUpdateInput): Promise<Order> {
    return this.withErrorHandling(async () => {
      const order = await this.payload.update({
        collection: 'orders',
        id,
        data: input,
      })

      await this.triggerEvent('order.updated', order)
      await revalidateContent({
        collection: 'orders',
        slug: order.id,
        payload: this.payload,
      })
      return order as Order
    }, 'Failed to update order')
  }

  private async triggerEvent(type: string, order: Order): Promise<void> {
    const serviceRegistry = ServiceRegistry.getInstance(this.payload)
    const integrationService = serviceRegistry.getIntegrationService()
    await integrationService.processEvent(type, order)
  }
}
