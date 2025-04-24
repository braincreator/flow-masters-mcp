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

      // If order status changed to 'paid', process course enrollments
      if (input.status === 'paid') {
        await this.processOrderCourseEnrollments(order)
      }

      return order as Order
    }, 'Failed to update order')
  }

  /**
   * Process course enrollments for paid orders
   * This checks if any products in the order are courses and enrolls the user
   */
  private async processOrderCourseEnrollments(order: Order): Promise<void> {
    try {
      // Get the user from the order
      const userId = order.user || order.customer
      if (!userId) return

      // Get the items from the order
      const items = order.items || []
      if (items.length === 0) return

      // Get the enrollment service
      const serviceRegistry = ServiceRegistry.getInstance(this.payload)
      const enrollmentService = serviceRegistry.getEnrollmentService()

      // For each item, check if it's a course product and enroll the user
      for (const item of items) {
        const productId = item.product
        if (!productId) continue

        // Get the product details
        const product = await this.payload.findByID({
          collection: 'products',
          id: productId,
          depth: 1, // Include related fields
        })

        // If product is a course, enroll the user
        if (product.isCourse && product.course) {
          const courseId = product.course

          // Get course details to check access duration
          const course = await this.payload.findByID({
            collection: 'courses',
            id: courseId,
          })

          // Calculate expiration date if course has limited access
          let expiresAt = undefined
          if (
            course.accessDuration?.type === 'limited' &&
            course.accessDuration?.duration &&
            course.accessDuration?.unit
          ) {
            const duration = course.accessDuration.duration
            const unit = course.accessDuration.unit
            const now = new Date()

            switch (unit) {
              case 'days':
                expiresAt = new Date(now.setDate(now.getDate() + duration)).toISOString()
                break
              case 'weeks':
                expiresAt = new Date(now.setDate(now.getDate() + duration * 7)).toISOString()
                break
              case 'months':
                expiresAt = new Date(now.setMonth(now.getMonth() + duration)).toISOString()
                break
              case 'years':
                expiresAt = new Date(now.setFullYear(now.getFullYear() + duration)).toISOString()
                break
            }
          }

          // Enroll the user in the course
          await enrollmentService.enrollUserInCourse({
            userId,
            courseId,
            source: 'purchase',
            orderId: order.id,
            expiresAt,
            notes: `Enrolled via order ${order.orderNumber || order.id}`,
          })
        }
      }
    } catch (error) {
      console.error('Error processing course enrollments:', error)
    }
  }

  private async triggerEvent(type: string, order: Order): Promise<void> {
    const serviceRegistry = ServiceRegistry.getInstance(this.payload)
    const integrationService = serviceRegistry.getIntegrationService()
    await integrationService.processEvent(type, order)
  }
}
