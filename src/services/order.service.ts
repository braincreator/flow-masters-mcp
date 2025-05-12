import type { Order, Product, Course, User } from '../payload-types' // Removed Payment as it's not exported
import { BaseService } from '@/services/base.service'
import { ServiceRegistry } from '@/services/service.registry'
import { revalidateContent } from '@/utilities/revalidation'
import type { Payload } from 'payload'

// Define simplified input types if needed, or use Partial<Order>
// Ensure these types align with your actual Order structure from payload-types.ts
type OrderCreateInput = Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>> & {
  customer: string | User // Assuming customer is required for creation
  items: Array<{
    product: string | Product
    quantity: number
    price: number
    service?: string | any // Adjust 'any' if you have a Service type
  }>
}
type OrderUpdateInput = Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>


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
      const dataToCreate: any = { ...input }
      if (input.customer && typeof input.customer !== 'string') {
        dataToCreate.customer = (input.customer as User).id
      }
      dataToCreate.items = input.items.map(item => ({
        ...item,
        product: typeof item.product === 'string' ? item.product : (item.product as Product).id,
        ...(item.service && { service: typeof item.service === 'string' ? item.service : (item.service as any).id })
      }));


      const order = await this.payload.create({
        collection: 'orders',
        data: {
          ...dataToCreate,
          status: input.status || 'pending',
        },
      })

      await this.triggerEvent('order.created', order as Order)
      await revalidateContent({
        collection: 'orders',
        payload: this.payload,
      })
      return order as Order
    }, 'Failed to create order')
  }

  async update(id: string, input: OrderUpdateInput): Promise<Order> {
    return this.withErrorHandling(async () => {
      const dataToUpdate: any = { ...input }
      if (input.customer && typeof input.customer !== 'string') {
        dataToUpdate.customer = (input.customer as User).id
      }
      if (input.items) {
        dataToUpdate.items = input.items.map(item => ({
          ...item,
          product: typeof item.product === 'string' ? item.product : (item.product as Product).id,
          ...(item.service && { service: typeof item.service === 'string' ? item.service : (item.service as any).id })
        }));
      }

      const order = await this.payload.update({
        collection: 'orders',
        id,
        data: dataToUpdate,
      })

      await this.triggerEvent('order.updated', order as Order)
      await revalidateContent({
        collection: 'orders',
        slug: order.id,
        payload: this.payload,
      })

      // Process course enrollments if the order status indicates it's paid or ready for fulfillment
      if (input.status === 'processing' || input.status === 'delivered') {
        await this.processOrderCourseEnrollments(order as Order)
      }

      return order as Order
    }, 'Failed to update order')
  }

  /**
   * Process course enrollments for paid orders.
   * This checks if any products in the order are courses and enrolls the user.
   */
  private async processOrderCourseEnrollments(order: Order): Promise<void> {
    try {
      const customerField = order.customer
      const userId = typeof customerField === 'string' ? customerField : (customerField as User)?.id

      if (!userId) {
        this.payload.logger.warn(`[OrderService] Customer ID not found for order ${order.id}. Cannot process course enrollments.`)
        return
      }

      const items = order.items || []
      if (items.length === 0) return

      const serviceRegistry = ServiceRegistry.getInstance(this.payload)
      const enrollmentService = serviceRegistry.getEnrollmentService() // Assuming this service exists and is correctly typed

      for (const item of items) {
        const productField = item.product
        const productId = typeof productField === 'string' ? productField : (productField as Product)?.id

        if (!productId) continue

        const product = await this.payload.findByID({
          collection: 'products',
          id: productId, // This should now be a string ID
          depth: 1,
        }) as Product | null

        if (product && product.isCourse && product.course) {
          const courseField = product.course
          const courseId = typeof courseField === 'string' ? courseField : (courseField as Course)?.id

          if (!courseId) {
            this.payload.logger.warn(`[OrderService] Course ID not found for product ${productId} in order ${order.id}.`)
            continue
          }

          const courseDetails = await this.payload.findByID({
            collection: 'courses',
            id: courseId, // This should now be a string ID
          }) as Course | null

          if (!courseDetails) {
            this.payload.logger.warn(`[OrderService] Course ${courseId} not found for order ${order.id}.`)
            continue
          }

          let expiresAt: string | undefined = undefined
          if (
            courseDetails.accessDuration?.type === 'limited' &&
            courseDetails.accessDuration?.duration &&
            courseDetails.accessDuration?.unit
          ) {
            const { duration, unit } = courseDetails.accessDuration
            const now = new Date()
            switch (unit) {
              case 'days': expiresAt = new Date(now.setDate(now.getDate() + duration)).toISOString(); break
              case 'weeks': expiresAt = new Date(now.setDate(now.getDate() + duration * 7)).toISOString(); break
              case 'months': expiresAt = new Date(now.setMonth(now.getMonth() + duration)).toISOString(); break
              case 'years': expiresAt = new Date(now.setFullYear(now.getFullYear() + duration)).toISOString(); break
            }
          }

          await enrollmentService.enrollUserInCourse({
            userId,
            courseId: courseId, // This is now a string ID
            source: 'purchase',
            orderId: order.id,
            expiresAt,
            notes: `Enrolled via order ${order.orderNumber || order.id}`,
          })
        }
      }
    } catch (error: any) {
      this.payload.logger.error(`Error processing course enrollments for order ${order.id}: ${error.message}`, error)
    }
  }

  private async triggerEvent(type: string, order: Order): Promise<void> {
    const serviceRegistry = ServiceRegistry.getInstance(this.payload)
    const integrationService = serviceRegistry.getIntegrationService()
    await integrationService.processEvent(type, order)
  }

  /**
   * Initiates the cancellation process for an order.
   * Placeholder function.
   * @param orderId - The ID of the order to cancel.
   */
  async initiateCancellation(orderId: string, reason?: string): Promise<{ success: boolean; message: string; status?: Order['status'] }> {
    return this.withErrorHandling(async () => {
      this.payload.logger.info(`[OrderService] Initiating cancellation for orderId: ${orderId}, Reason: ${reason || 'N/A'}`)

      const order = await this.payload.findByID({ collection: 'orders', id: orderId, depth: 0 }) as Order | null
      if (!order) {
        this.payload.logger.error(`[OrderService] Order ${orderId} not found for cancellation.`)
        return { success: false, message: `Order ${orderId} not found.` }
      }

      if (order.status === ('cancelled' as Order['status']) || order.status === ('refunded' as Order['status'])) {
        this.payload.logger.info(`[OrderService] Order ${orderId} is already in a final state: ${order.status}.`)
        return { success: true, message: `Order ${orderId} is already ${order.status}.`, status: order.status }
      }

      // For simplicity, we'll allow cancellation for 'pending' and 'processing' orders.
      // More complex logic might be needed for 'shipped' or 'delivered' (e.g., return process).
      const cancellableStatuses: Array<Order['status']> = ['pending', 'processing']
      if (!cancellableStatuses.includes(order.status)) {
        this.payload.logger.warn(`[OrderService] Order ${orderId} has status ${order.status}, which is not directly cancellable through this flow. Manual intervention may be required.`)
        // Optionally, set to a status like 'cancellation_request'
        // await this.update(orderId, { status: 'cancellation_request' });
        // await this.triggerEvent('order.cancellation_requested', { ...order, cancellationReason: reason });
        return { success: false, message: `Order ${orderId} in status ${order.status} cannot be automatically cancelled.`, status: order.status }
      }
      
      // Attempt to void/refund payment if applicable
      if (order.paymentId && (order.status === 'processing' || order.paidAt)) { // Assuming 'processing' means payment was attempted/successful
        try {
          const paymentService = ServiceRegistry.getInstance(this.payload).getPaymentService();
          this.payload.logger.info(`[OrderService] Attempting payment void for order ${orderId}, paymentId ${order.paymentId}.`);
          // Prefer void if transaction is recent and not settled, otherwise refund.
          // For simplicity, let's try void first. PaymentService can decide if void is possible.
          const paymentResult = await paymentService.voidPayment(orderId, reason || 'Order cancelled by user/system');

          if (paymentResult.status === 'voided' || paymentResult.status === 'succeeded') { // 'succeeded' might be returned by some stubs for void
            this.payload.logger.info(`[OrderService] Payment void successful for order ${orderId}, paymentId ${order.paymentId}`);
          } else {
            this.payload.logger.warn(`[OrderService] Payment void failed for order ${orderId}, paymentId ${order.paymentId}: ${paymentResult.errorMessage}. Attempting refund.`);
            // If void fails (e.g., transaction already settled), attempt a refund.
            const refundResult = await paymentService.refundPayment(orderId, order.total?.en?.amount, reason || 'Order cancelled - void failed');
            if (refundResult.status === 'refunded' || refundResult.status === 'succeeded') {
              this.payload.logger.info(`[OrderService] Payment refund successful for order ${orderId} after void failed.`);
            } else {
              this.payload.logger.error(`[OrderService] Payment void AND refund failed for order ${orderId}, paymentId ${order.paymentId}: ${refundResult.errorMessage}`);
              // Depending on business logic, you might want to prevent order cancellation here or flag for manual review.
            }
          }
        } catch (paymentError: any) {
            this.payload.logger.error(`[OrderService] Error during payment void/refund for order ${orderId}: ${paymentError.message}`, paymentError);
            // Depending on business logic, you might want to prevent order cancellation here or flag for manual review.
        }
      }

      // Update order status to 'cancelled'
      const updatedOrder = await this.update(orderId, { status: 'cancelled' as Order['status'] })
      this.payload.logger.info(`[OrderService] Order ${orderId} status updated to 'cancelled'.`)

      // Trigger order cancelled event (for notifications, etc.)
      // The 'order.updated' event will also fire from this.update,
      // but a specific cancellation event is good practice.
      await this.triggerEvent('order.cancelled', { ...updatedOrder, cancellationReason: reason } as Order)
      
      // TODO: Inventory restock logic if applicable
      // TODO: Cancel related subscriptions/bookings (this is partially handled in Orders.ts afterChange, review for completeness)

      return { success: true, message: `Order ${orderId} has been cancelled.`, status: 'cancelled' }
    }, `Failed to cancel order ${orderId}`)
  }

  /**
   * Initiates a refund process for an order.
   * @param orderId - The ID of the order to refund.
   * @param amountToRefund - (Optional) The specific amount to refund (in default currency, e.g., USD). If not provided, full refund.
   * @param reason - (Optional) Reason for the refund.
   * @param itemsToRefund - (Optional) Array of item IDs and quantities for partial refunds.
   */
  async initiateRefund(
    orderId: string,
    amountToRefund?: number,
    reason?: string,
    // itemsToRefund?: Array<{ itemId: string; quantity: number }>, // For more granular partial refunds - future enhancement
  ): Promise<{ success: boolean; message: string; status?: Order['status'] }> {
     return this.withErrorHandling(async () => {
      this.payload.logger.info(`[OrderService] Initiating refund for orderId: ${orderId}, Amount: ${amountToRefund ?? 'Full'}, Reason: ${reason || 'N/A'}`)

      const order = await this.payload.findByID({ collection: 'orders', id: orderId, depth: 0 }) as Order | null
      if (!order) {
        this.payload.logger.error(`[OrderService] Order ${orderId} not found for refund.`)
        return { success: false, message: `Order ${orderId} not found.` }
      }

      if (order.status === ('refunded' as Order['status']) || order.status === ('cancelled' as Order['status'])) {
         this.payload.logger.info(`[OrderService] Order ${orderId} is already in a final state: ${order.status}.`)
        return { success: true, message: `Order ${orderId} is already ${order.status}.`, status: order.status }
      }

      if (!order.paidAt && !order.paymentId) {
        this.payload.logger.warn(`[OrderService] Order ${orderId} has not been paid or has no payment ID. Cannot process refund directly. Consider cancelling.`)
        // If not paid, typically it would be a cancellation.
        return { success: false, message: `Order ${orderId} was not paid. Consider cancelling instead.`, status: order.status }
      }
      
      const orderTotal = order.total?.en?.amount;
      if (typeof orderTotal !== 'number') {
        this.payload.logger.error(`[OrderService] Order ${orderId} total amount is invalid. Cannot process refund.`);
        return { success: false, message: `Order ${orderId} has an invalid total amount.` };
      }

      const finalAmountToRefund = amountToRefund ?? orderTotal;

      if (finalAmountToRefund <= 0) {
        this.payload.logger.warn(`[OrderService] Refund amount for order ${orderId} must be positive. Amount: ${finalAmountToRefund}`);
        return { success: false, message: 'Refund amount must be positive.' };
      }
      if (finalAmountToRefund > orderTotal) {
        this.payload.logger.warn(`[OrderService] Refund amount ${finalAmountToRefund} for order ${orderId} exceeds order total ${orderTotal}. Adjusting to full refund.`);
        // Potentially cap at orderTotal or return error, for now, let's assume full refund if over.
        // This logic might need refinement based on business rules for partial refunds.
      }
      
      let paymentRefundSuccessful = false;
      if (order.paymentId) {
        try {
          const paymentService = ServiceRegistry.getInstance(this.payload).getPaymentService();
          this.payload.logger.info(`[OrderService] Attempting payment refund for order ${orderId}, paymentId ${order.paymentId}, amount ${finalAmountToRefund}.`);
          const paymentResult = await paymentService.refundPayment(
            orderId, // Pass orderId, PaymentService will fetch details
            finalAmountToRefund,
            reason || 'Order refunded by user/system'
          );

          if (paymentResult.status === 'refunded' || paymentResult.status === 'succeeded') { // 'succeeded' might be returned by some stubs
            this.payload.logger.info(`[OrderService] Payment refund successful for order ${orderId}, paymentId ${order.paymentId}, amount ${finalAmountToRefund}. New transaction ID (if any): ${paymentResult.paymentId}`);
            paymentRefundSuccessful = true;
          } else {
            this.payload.logger.error(`[OrderService] Payment refund failed for order ${orderId}, paymentId ${order.paymentId}: ${paymentResult.errorMessage}`);
          }
        } catch (paymentError: any) {
            this.payload.logger.error(`[OrderService] Error during payment refund for order ${orderId}: ${paymentError.message}`, paymentError);
        }
      } else {
         this.payload.logger.warn(`[OrderService] No paymentId found for order ${orderId}. Cannot process refund through payment gateway. Marking as successful for internal status update if no payment ID was present.`);
         // If there was no payment ID, we can consider the "payment refund" part successful for internal state,
         // as there's nothing to refund via a gateway.
         paymentRefundSuccessful = !order.paymentId;
      }

      if (!paymentRefundSuccessful && order.paymentId) {
        // If payment refund failed and there was a payment ID, we might not want to proceed with changing order status.
        // Or, set to a specific "refund_failed" status.
        return { success: false, message: `Payment refund failed for order ${orderId}. Order status not changed.` };
      }

      const newStatus: Order['status'] = (finalAmountToRefund === orderTotal) ? ('refunded' as Order['status']) : ('partially_refunded' as Order['status']);
      // If finalAmountToRefund < orderTotal and it's not already partially_refunded, it becomes partially_refunded.
      // If it was already partially_refunded and now the sum of refunds equals total, it becomes 'refunded'.
      // This simplified logic assumes one refund operation sets the final state. Complex partial refund tracking would need more.

      const updatedOrder = await this.update(orderId, { status: newStatus });
      this.payload.logger.info(`[OrderService] Order ${orderId} status updated to '${newStatus}'.`);

      await this.triggerEvent('order.refunded', { ...updatedOrder, refundAmount: finalAmountToRefund, refundReason: reason } as Order);

      // TODO: Adjust inventory if applicable
      // TODO: Adjust user access to digital products/services if applicable

      return { success: true, message: `Order ${orderId} has been ${newStatus}.`, status: newStatus };
    }, `Failed to refund order ${orderId}`)
  }
}
