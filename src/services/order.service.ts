import type { Order } from '@/payload-types'
import type { OrderCreateInput, OrderUpdateInput } from '@/types/order'
import { BaseService } from '@/services/base.service'
import { IntegrationService } from '@/services/integration.service'
import { revalidateContent } from '@/utilities/revalidation'

export class OrderService extends BaseService {
  async create(input: OrderCreateInput): Promise<Order> {
    return this.withErrorHandling(async () => {
      const order = await this.payload.create({
        collection: 'orders',
        data: {
          ...input,
          status: 'pending',
          createdAt: new Date()
        }
      })

      await this.triggerEvent('order.created', order)
      await revalidateContent({
        collection: 'orders',
        payload: this.payload
      })
      return order as Order
    }, 'Failed to create order')
  }

  async update(id: string, input: OrderUpdateInput): Promise<Order> {
    return this.withErrorHandling(async () => {
      const order = await this.payload.update({
        collection: 'orders',
        id,
        data: input
      })

      await this.triggerEvent('order.updated', order)
      await revalidateContent({
        collection: 'orders',
        slug: order.id,
        payload: this.payload
      })
      return order as Order
    }, 'Failed to update order')
  }

  private async triggerEvent(type: string, order: Order): Promise<void> {
    const integrationService = new IntegrationService(this.payload)
    await integrationService.processEvent(type, order)
  }
}
