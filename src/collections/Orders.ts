import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  PayloadRequest,
  FieldHookArgs,
} from 'payload'
import type {
  Order as GeneratedOrderType,
  User as UserType,
  Product as ProductType,
  Service as ServiceType,
  Subscription as SubscriptionType,
  Booking as BookingType,
  Media as MediaType,
} from '../payload-types'
import { IntegrationEvents } from '../types/events'
import { IntegrationService } from '../services/integration.service'
import { NotificationService } from '../services/notification.service'

import { generateOrderNumber, ORDER_PREFIXES } from '@/utilities/orderNumber'

// Добавляем объявление типов для локализованного текста спецификации
interface LocalizedSpecificationText {
  en?: string | null
  ru?: string | null
}

// Определяем тип для локализованного заголовка услуги
interface LocalizedTitle {
  en?: string | null
  ru?: string | null
}

// Interim type for the Order data within the hook, including new fields
// This helps bridge the gap until payload-types.ts is regenerated with the new fields.
interface OrderWithCalculatedFields
  extends Omit<
    Partial<GeneratedOrderType>,
    | 'items'
    | 'taxes'
    | 'discounts'
    | 'subtotal'
    | 'total'
    | 'status'
    | 'serviceData'
    | 'id'
    | 'cancellationDetails'
    | 'specificationText'
  > {
  id: string // Hooks expect a non-optional ID
  orderNumber?: string
  customer?: string | UserType
  status?:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'partially_refunded'
    | 'pending_manual_review'
    | 'paid' // Добавляем статус paid для createServiceProjectHook
  items?: Array<{
    product?: string | ProductType
    service?: string | ServiceType
    quantity?: number | null
    price?: number | null
    // Conceptual: Add a status field here for partial cancellation of line items
    // itemStatus?: 'active' | 'cancelled';
    id?: string | null
  }> | null
  subtotal?: {
    en?: { amount?: number | null; currency?: string | null }
    ru?: { amount?: number | null; currency?: string | null }
  }
  taxes?: Array<{
    name?: string | null
    rate?: number | null
    amount?: {
      en?: { amount?: number | null; currency?: string | null }
      ru?: { amount?: number | null; currency?: string | null }
    }
    id?: string | null
  }> | null
  discounts?: Array<{
    code?: string | null
    description?: string | null
    amount?: {
      en?: { amount?: number | null; currency?: string | null }
      ru?: { amount?: number | null; currency?: string | null }
    }
    id?: string | null
  }> | null
  total?: {
    en?: { amount?: number | null; currency?: string | null }
    ru?: { amount?: number | null; currency?: string | null }
  }
  paymentId?: string | null
  paymentProvider?: string | null
  paymentData?: GeneratedOrderType['paymentData']
  paidAt?: string | null
  orderType?: 'product' | 'service' | 'subscription'
  serviceData?: {
    // Define serviceData explicitly to match usage
    serviceId?: string | null
    serviceType?: string | null
    requiresBooking?: boolean | null
  } | null
  // Исправляем тип для поля specificationText - используем правильный тип
  specificationText?: LocalizedSpecificationText | null
  // Исправляем тип для поля specificationFiles - используем MediaType вместо Record
  specificationFiles?: Array<string | MediaType> | null
  subscriptionProcessedToken?: boolean | null
  renewalForSubscription?: string | SubscriptionType | null
  cancellationDetails?: {
    cancelledAt?: string | null
    reason?: string | null
    // Conceptual: For partial cancellations, this might include an array of cancelledItemIds
    // cancelledItemIds?: string[];
  } | null
  paymentVerificationFailed?: boolean | null
}

const validateOrderItemsHook: CollectionBeforeValidateHook<OrderWithCalculatedFields> = async ({
  data,
  operation,
}) => {
  if (!data) {
    // Add null check for data
    return data
  }

  if (operation === 'create' || operation === 'update') {
    const { orderType, items } = data

    if (orderType === 'service') {
      const hasServiceItem = items?.some(
        (item: NonNullable<OrderWithCalculatedFields['items']>[number]) =>
          item.service && (typeof item.service === 'string' || typeof item.service === 'object'),
      )
      if (!hasServiceItem) {
        throw new Error('For "service" orderType, at least one item must be a service.')
      }
    } else if (orderType === 'product') {
      const hasProductItem = items?.some(
        (item: NonNullable<OrderWithCalculatedFields['items']>[number]) =>
          item.product && (typeof item.product === 'string' || typeof item.product === 'object'),
      )
      if (!hasProductItem) {
        throw new Error('For "product" orderType, at least one item must be a product.')
      }
    }
    // No specific validation for 'subscription' orderType items mentioned in the task.
    // If 'subscription' orders should also validate items as products/services, that logic would go here.
  }
  return data
}

const calculateOrderTotalsHook: CollectionBeforeChangeHook<OrderWithCalculatedFields> = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) {
    return data
  }

  if (operation === 'update') {
    if (!originalDoc) {
      // Should not happen in an update operation, but good to guard
      throw new Error('Original document not found during order update.')
    }
    const modifiableStatuses: Array<OrderWithCalculatedFields['status']> = ['pending', 'processing']
    if (!modifiableStatuses.includes(originalDoc.status)) {
      throw new Error(
        `Orders can only be modified if their status is 'pending' or 'processing'. Current status: ${originalDoc.status}.`,
      )
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Order items cannot be empty when modifying an order.')
    }
    // Further validation: ensure each item has a product or service and quantity
    for (const item of data.items) {
      if (!item || (!item.product && !item.service)) {
        throw new Error('Each order item must have a product or a service specified.')
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Each order item must have a valid quantity (at least 1).')
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        // Price can be 0 for free items, but not negative.
        throw new Error('Each order item must have a valid price (non-negative).')
      }
    }
  }

  // Generate order number if not provided
  if (!data.orderNumber && operation === 'create') {
    // Generate order number based on order type
    const prefix = data.orderType
      ? ORDER_PREFIXES[data.orderType.toUpperCase() as keyof typeof ORDER_PREFIXES] ||
        ORDER_PREFIXES.DEFAULT
      : ORDER_PREFIXES.DEFAULT
    data.orderNumber = generateOrderNumber(prefix)
  }

  let subtotalEn = 0
  let subtotalRu = 0

  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      const itemPriceUsd = typeof item.price === 'number' ? item.price : 0
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1
      subtotalEn += itemPriceUsd * quantity
      // Simple conversion for RUB (using approximate rate)
      subtotalRu += itemPriceUsd * 75 * quantity // Approximate USD to RUB conversion
    }
  }

  data.subtotal = {
    en: { amount: parseFloat(subtotalEn.toFixed(2)), currency: 'USD' },
    ru: { amount: parseFloat(subtotalRu.toFixed(2)), currency: 'RUB' },
  }

  let totalTaxEn = 0
  let totalTaxRu = 0
  const calculatedTaxes: NonNullable<OrderWithCalculatedFields['taxes']> = []

  if (data.taxes && Array.isArray(data.taxes)) {
    for (const tax of data.taxes) {
      const taxRate = typeof tax.rate === 'number' ? tax.rate : 0
      const taxAmountEn = subtotalEn * taxRate
      const taxAmountRu = subtotalRu * taxRate
      totalTaxEn += taxAmountEn
      totalTaxRu += taxAmountRu
      calculatedTaxes.push({
        name: tax.name,
        rate: tax.rate,
        id: tax.id,
        amount: {
          en: { amount: parseFloat(taxAmountEn.toFixed(2)), currency: 'USD' },
          ru: { amount: parseFloat(taxAmountRu.toFixed(2)), currency: 'RUB' },
        },
      })
    }
  }
  data.taxes = calculatedTaxes

  let totalDiscountEn = 0
  let totalDiscountRu = 0

  const processedDiscounts: NonNullable<OrderWithCalculatedFields['discounts']> = (
    data.discounts || []
  ).map((d: NonNullable<OrderWithCalculatedFields['discounts']>[number]) => {
    const discountEnAmount = d.amount?.en?.amount
      ? d.amount.en.amount > 0
        ? -d.amount.en.amount
        : d.amount.en.amount
      : 0
    const discountRuAmount = d.amount?.ru?.amount
      ? d.amount.ru.amount > 0
        ? -d.amount.ru.amount
        : d.amount.ru.amount
      : 0

    totalDiscountEn += discountEnAmount
    totalDiscountRu += discountRuAmount

    return {
      code: d.code,
      description: d.description,
      id: d.id,
      amount: {
        en: {
          amount: parseFloat(discountEnAmount.toFixed(2)),
          currency: d.amount?.en?.currency || 'USD',
        },
        ru: {
          amount: parseFloat(discountRuAmount.toFixed(2)),
          currency: d.amount?.ru?.currency || 'RUB',
        },
      },
    }
  })
  data.discounts = processedDiscounts

  const finalTotalEn = subtotalEn + totalTaxEn + totalDiscountEn
  const finalTotalRu = subtotalRu + totalTaxRu + totalDiscountRu

  data.total = {
    en: { amount: parseFloat(Math.max(0, finalTotalEn).toFixed(2)), currency: 'USD' },
    ru: { amount: parseFloat(Math.max(0, finalTotalRu).toFixed(2)), currency: 'RUB' },
  }

  return data
}

// Helper function to compare relevant parts of order items
const itemsHaveChanged = (
  currentItems?: OrderWithCalculatedFields['items'],
  previousItems?: OrderWithCalculatedFields['items'],
): boolean => {
  if (!currentItems && !previousItems) return false // Both null or undefined
  if (!currentItems || !previousItems) return true // One is null/undefined, the other isn't
  if (currentItems.length !== previousItems.length) return true

  // Create comparable representations of items (product/service ID and quantity)
  const mapItem = (item: NonNullable<OrderWithCalculatedFields['items']>[number]) => {
    const productId =
      typeof item.product === 'string' ? item.product : (item.product as ProductType)?.id
    const serviceId =
      typeof item.service === 'string' ? item.service : (item.service as ServiceType)?.id
    return { p: productId, s: serviceId, q: item.quantity }
  }

  const currentMapped = currentItems
    .map(mapItem)
    .sort((a, b) => (a.p || a.s || '').localeCompare(b.p || b.s || ''))
  const previousMapped = previousItems
    .map(mapItem)
    .sort((a, b) => (a.p || a.s || '').localeCompare(b.p || b.s || ''))

  return JSON.stringify(currentMapped) !== JSON.stringify(previousMapped)
}

// Helper function to calculate next payment date based on period
const calculateNextPaymentDate = (startDate: Date, period: string): Date => {
  const date = new Date(startDate)
  switch (period) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
    case 'annual': // Treat 'annual' same as 'yearly'
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      // Fallback or throw error for unsupported period
      console.error(`Unsupported subscription period: ${period}`)
      date.setMonth(date.getMonth() + 1) // Default to monthly as a fallback
  }
  return date
}

const afterChangeHook: CollectionAfterChangeHook<OrderWithCalculatedFields> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req as PayloadRequest // Assert req to PayloadRequest
  const logger = payload.logger || console
  const notificationService = NotificationService.getInstance(payload)

  // --- Integration Service Event ---
  try {
    const integrationService = IntegrationService.getInstance(payload)
    if (operation === 'create') {
      await integrationService.processEvent(
        IntegrationEvents.ORDER_CREATED,
        doc as GeneratedOrderType,
      )
    } else if (operation === 'update') {
      await integrationService.processEvent(
        IntegrationEvents.ORDER_UPDATED,
        doc as GeneratedOrderType,
      )
    }
  } catch (error: any) {
    logger.error(
      `Error processing integration for order ${doc.id}: ${error?.message || String(error)}`,
    )
  }

  const customerId =
    doc.customer && typeof doc.customer === 'object'
      ? (doc.customer as UserType).id
      : (doc.customer as string)

  // --- Subscription Creation/Activation Logic ---
  if (doc.orderType === 'subscription') {
    const isPaid = doc.paidAt || doc.status === 'completed' // Define when an order is considered paid
    const shouldActivate =
      doc.subscriptionProcessedToken === true && previousDoc?.subscriptionProcessedToken !== true
    const shouldCreateOrUpdate = isPaid || shouldActivate // Trigger on payment or token processing

    if (shouldCreateOrUpdate && customerId) {
      logger.info(
        `Order ${doc.id} (subscription) is paid or token processed. Ensuring subscription exists/is active.`,
      )

      try {
        // Find existing subscription for this order
        const { docs: existingSubscriptions } = await payload.find({
          collection: 'subscriptions',
          where: { order: { equals: doc.id } },
          limit: 1,
          req: req as PayloadRequest,
        })
        const existingSubscription = existingSubscriptions?.[0] as SubscriptionType | undefined

        // Extract product details (assuming first item is the subscription product)
        const subscriptionItem = doc.items?.[0]
        const productId = subscriptionItem?.product
          ? typeof subscriptionItem.product === 'string'
            ? subscriptionItem.product
            : (subscriptionItem.product as ProductType).id
          : null

        if (!productId) {
          logger.error(`Order ${doc.id}: Cannot find product ID in items for subscription.`)
          throw new Error('Subscription product ID not found in order items.')
        }

        // Fetch the product details to get subscription specifics
        const product = (await payload.findByID({
          collection: 'products',
          id: productId,
          req: req as PayloadRequest,
        })) as ProductType | null

        if (!product || product.productType !== 'subscription' || !product.subscriptionDetails) {
          logger.error(
            `Order ${doc.id}: Product ${productId} is not a valid subscription product or lacks details.`,
          )
          throw new Error('Invalid subscription product details.')
        }

        const startDate = doc.paidAt ? new Date(doc.paidAt) : new Date()
        const period = product.subscriptionDetails.billingInterval || 'monthly' // Default if missing
        const nextPaymentDate = calculateNextPaymentDate(startDate, period)

        const subscriptionData = {
          userId: customerId,
          order: doc.id,
          // --- Limitation: Using Product ID as Plan ID ---
          // The 'subscriptions' collection expects a relationship to 'subscription-plans'.
          // However, the 'products' collection does not link to 'subscription-plans'.
          // Using the Product ID as a placeholder. This needs schema alignment.
          planId: productId,
          // ---------------------------------------------
          status: shouldActivate ? 'active' : existingSubscription?.status || 'pending', // Activate if token processed, else keep existing or pending
          amount: product.subscriptionDetails.recurringPrice,
          currency: 'RUB', // Default currency for subscriptions
          period: period,
          startDate: startDate.toISOString(),
          nextPaymentDate: nextPaymentDate.toISOString(),
          paymentProvider: doc.paymentProvider || 'unknown',
          // paymentToken: doc.paymentData?.token || null, // Extract token if available in paymentData structure
          renewedAt: shouldActivate // Corrected field
            ? new Date().toISOString()
            : existingSubscription?.renewedAt, // Corrected field
          paymentRetryAttempt: 0, // Reset retries on activation/creation
        }

        if (existingSubscription) {
          // Update existing subscription
          if (shouldActivate && existingSubscription.status !== 'active') {
            logger.info(
              `Activating existing subscription ${existingSubscription.id} for order ${doc.id}.`,
            )
            await payload.update({
              collection: 'subscriptions',
              id: existingSubscription.id,
              data: {
                status: 'active',
                renewedAt: new Date().toISOString(), // Corrected field
                // Optionally update other fields if they can change post-creation
                // amount: subscriptionData.amount,
                // currency: subscriptionData.currency,
                // period: subscriptionData.period,
                // nextPaymentDate: subscriptionData.nextPaymentDate,
                paymentRetryAttempt: 0,
              },
              req: req as PayloadRequest,
            })
          } else {
            logger.info(
              `Subscription ${existingSubscription.id} already exists for order ${doc.id}. No status change needed or already active.`,
            )
          }
        } else {
          // Create new subscription
          logger.info(`Creating new subscription for order ${doc.id}.`)
          await payload.create({
            collection: 'subscriptions',
            data: subscriptionData as any, // Use 'as any' carefully due to planId workaround
            req: req as PayloadRequest,
          })
          logger.info(
            `Subscription created for order ${doc.id}. Status: ${subscriptionData.status}`,
          )
        }
      } catch (error: any) {
        logger.error(
          `Error processing subscription creation/activation for order ${doc.id}: ${error?.message || String(error)}`,
        )
      }
    }
  }

  // --- Order Status Synchronization (Cancellation/Refund) ---
  if (operation === 'update') {
    const isCancelled = doc.status === 'cancelled' && previousDoc?.status !== 'cancelled'
    const isRefunded =
      (doc.status === 'refunded' || doc.status === 'partially_refunded') &&
      previousDoc?.status !== 'refunded' &&
      previousDoc?.status !== 'partially_refunded'
    const isShippedOrDelivered =
      (doc.status === 'shipped' || doc.status === 'delivered') &&
      previousDoc?.status !== 'shipped' &&
      previousDoc?.status !== 'delivered'

    // Handle Order Shipped/Delivered Notification for physical products
    if (isShippedOrDelivered && doc.orderType === 'product') {
      logger.info(
        `Order ${doc.id} status changed to '${doc.status}'. Sending shipped/fulfilled notification.`,
      )
      try {
        // TODO: Populate shipmentDetails if available from doc (e.g., doc.shipmentData)
        await notificationService.sendOrderShippedFulfilledNotification(doc.id)
      } catch (e: any) {
        logger.error(
          `Error sending order shipped/fulfilled notification for order ${doc.id}: ${e.message}`,
        )
      }
    }

    if (isCancelled) {
      logger.info(
        `Order ${doc.id} status changed to 'cancelled'. Processing related actions and sending notification.`,
      )
      try {
        await notificationService.sendOrderCancelledNotification(
          doc.id,
          doc.cancellationDetails?.reason || undefined,
        )
      } catch (e: any) {
        logger.error(`Error sending order cancelled notification for order ${doc.id}: ${e.message}`)
      }

      // Existing logic for subscription cancellation due to order cancellation
      if (doc.orderType === 'subscription') {
        const reason = 'cancelled'
        logger.info(
          `Order ${doc.id} (subscription) status changed to '${doc.status}'. Processing related subscription cancellation.`,
        )
        const cancellationTimestamp = new Date().toISOString()

        try {
          const { docs: subscriptionsToCancel } = await payload.find({
            collection: 'subscriptions',
            where: { order: { equals: doc.id } },
            req: req as PayloadRequest,
          })

          for (const sub of (subscriptionsToCancel || []) as SubscriptionType[]) {
            if (sub && sub.id && sub.status !== 'canceled') {
              await payload.update({
                collection: 'subscriptions',
                id: sub.id,
                data: {
                  status: 'canceled',
                  canceledAt: cancellationTimestamp,
                },
                req: req as PayloadRequest,
              })
              logger.info(
                `Subscription ${sub.id} marked as 'canceled' due to order ${doc.id} being ${reason}.`,
              )
            } else if (sub && sub.status === 'canceled') {
              logger.info(`Subscription ${sub.id} for order ${doc.id} was already cancelled.`)
            } else if (!sub) {
              logger.warn(`No valid subscription found to cancel for order ${doc.id}.`)
            }
          }
        } catch (error: any) {
          logger.error(
            `Error cancelling subscription related to order ${doc.id}: ${error?.message || String(error)}`,
          )
        }

        // Update cancellation details on the order itself
        if (!doc.cancellationDetails?.cancelledAt) {
          try {
            await payload.update({
              collection: 'orders',
              id: doc.id,
              data: {
                cancellationDetails: {
                  ...(doc.cancellationDetails || {}),
                  cancelledAt: cancellationTimestamp,
                  reason: doc.cancellationDetails?.reason || `Order cancelled via status change`,
                },
              } as any,
              req: req as PayloadRequest,
              overrideAccess: true,
              depth: 0,
            })
          } catch (orderUpdateError: any) {
            logger.error(
              `Error updating order ${doc.id} cancellation details: ${orderUpdateError?.message || String(orderUpdateError)}`,
            )
          }
        }
      }
    }

    // Existing logic for subscription cancellation due to order refund
    if (isRefunded && doc.orderType === 'subscription') {
      const reason = 'refunded'
      logger.info(
        `Order ${doc.id} (subscription) status changed to '${doc.status}'. Processing related subscription cancellation.`,
      )
      const cancellationTimestamp = new Date().toISOString()

      try {
        const { docs: subscriptionsToCancel } = await payload.find({
          collection: 'subscriptions',
          where: { order: { equals: doc.id } },
          req: req as PayloadRequest,
        })

        for (const sub of (subscriptionsToCancel || []) as SubscriptionType[]) {
          if (sub && sub.id && sub.status !== 'canceled') {
            await payload.update({
              collection: 'subscriptions',
              id: sub.id,
              data: {
                status: 'canceled',
                canceledAt: cancellationTimestamp,
              },
              req: req as PayloadRequest,
            })
            logger.info(
              `Subscription ${sub.id} marked as 'canceled' due to order ${doc.id} being ${reason}.`,
            )
          } else if (sub && sub.status === 'canceled') {
            logger.info(`Subscription ${sub.id} for order ${doc.id} was already cancelled.`)
          } else if (!sub) {
            logger.warn(`No valid subscription found to cancel for order ${doc.id}.`)
          }
        }
      } catch (error: any) {
        logger.error(
          `Error cancelling subscription related to order ${doc.id} (refund): ${error?.message || String(error)}`,
        )
      }
    }
  }

  // --- Other Existing Logic (Bookings, Product Fulfillment, etc.) ---
  // Keep the existing logic for other order types and statuses below this point.

  if (operation === 'update') {
    // --- Order Modification Logic (Recalculation Impact) ---
    // This section remains largely the same, handling impacts of item changes on totals/payments.
    const modifiableStatuses: Array<OrderWithCalculatedFields['status']> = ['pending', 'processing']
    if (modifiableStatuses.includes(doc.status) && itemsHaveChanged(doc.items, previousDoc.items)) {
      logger.info(
        `Order ${doc.id} items/quantities modified. Totals recalculated in beforeChange hook.`,
      )

      // Conceptual: Impact on Related Entities due to Item/Quantity Modification
      // (Subscription impact check might be less relevant now handled above, but keep for logging/future)
      if (doc.orderType === 'subscription') {
        logger.info(
          `Order ${doc.id} (subscription type) items modified. Subscription impact handled earlier.`,
        )
      }

      // Bookings Impact
      if (doc.orderType === 'service' && doc.serviceData?.requiresBooking) {
        logger.info(
          `Order ${doc.id} (bookable service type) items modified. Checking impact on bookings.`,
        )
        // Placeholder: Logic to find related booking and assess changes.
      }

      // Payments Impact
      const previousTotalEn = previousDoc.total?.en?.amount ?? 0
      const currentTotalEn = doc.total?.en?.amount ?? 0
      if (previousTotalEn !== currentTotalEn) {
        logger.info(
          `Order ${doc.id} total changed from ${previousTotalEn} to ${currentTotalEn} due to item modification.`,
        )
        if (doc.paidAt) {
          // Order was already paid
          logger.info(`Order ${doc.id} was paid. Payment adjustment needed.`)
          if (currentTotalEn > previousTotalEn) {
            // Placeholder: Request additional payment
            logger.info(`Order ${doc.id}: Additional payment required.`)
          } else if (currentTotalEn < previousTotalEn) {
            // Placeholder: Process partial refund
            logger.info(`Order ${doc.id}: Partial refund due.`)
          }
        } else {
          // Order not yet paid
          logger.info(`Order ${doc.id} is not yet paid. Updated total will be used.`)
        }
      }
    }
    // --- End of Order Modification Logic ---

    // --- Existing Status Change Logic (Bookings, Products) ---
    // This section needs to be reviewed to ensure it doesn't conflict with the new subscription logic above.
    // The original subscription creation/activation blocks are now replaced/handled above.
    // The cancellation block for subscriptions is also handled above.
    try {
      // --- Booking Creation ---
      if (
        doc.status === 'processing' &&
        previousDoc.status !== 'processing' &&
        doc.orderType === 'service' &&
        doc.serviceData?.requiresBooking === true
      ) {
        // ... (keep existing booking creation logic)
        const serviceItem = doc.items?.find((item: any) => item.service)
        const serviceId = serviceItem?.service
          ? typeof serviceItem.service === 'object'
            ? (serviceItem.service as ServiceType).id
            : serviceItem.service
          : undefined
        if (!customerId) {
          logger.error(`Order ${doc.id}: Customer ID missing for booking.`)
        } else if (!serviceId) {
          logger.error(`Order ${doc.id}: Service ID missing for booking.`)
        } else {
          logger.info(`Order ${doc.id} processing for bookable service. Creating Booking.`)
          await payload.create({
            collection: 'bookings',
            data: {
              order: doc.id,
              customer: customerId,
              service: serviceId,
              status: 'confirmed',
            } as any,
            req: req as PayloadRequest,
          })
          logger.info(`Booking created for order ${doc.id}.`)
        }
      }

      // --- Booking Cancellation (due to Order Cancel) ---
      // Note: Subscription cancellation is handled earlier now.
      if (doc.status === 'cancelled' && previousDoc.status !== 'cancelled') {
        // ... (keep existing booking cancellation logic for service orders)
        if (doc.orderType === 'service' && doc.serviceData?.requiresBooking === true) {
          logger.info(
            `Order ${doc.id} (type: service with booking) cancelled. Cancelling related Booking(s).`,
          )
          const { docs: bookingsToCancel } = await payload.find({
            collection: 'bookings',
            where: { order: { equals: doc.id } },
            req: req as PayloadRequest,
          })
          for (const booking of (bookingsToCancel || []) as BookingType[]) {
            if (booking && booking.id && booking.status !== 'canceled') {
              await payload.update({
                collection: 'bookings',
                id: booking.id,
                data: { status: 'canceled' },
                req: req as PayloadRequest,
              })
              logger.info(`Booking ${booking.id} cancelled for order ${doc.id}.`)
            } else if (booking && booking.status === 'canceled') {
              logger.info(`Booking ${booking.id} for order ${doc.id} was already cancelled.`)
            }
          }
        } else if (doc.orderType === 'service') {
          logger.info(
            `Order ${doc.id} (type: service, no booking) cancelled. No specific related entities to cancel.`,
          )
        } else if (doc.orderType === 'product') {
          logger.info(
            `Order ${doc.id} (type: product) cancelled. No specific related entity cancellation logic defined.`,
          )
        }
      }
      // --- Booking Completion (due to Order Complete) ---
      if (
        doc.status === 'completed' &&
        previousDoc.status !== 'completed' &&
        doc.orderType === 'service' &&
        doc.serviceData?.requiresBooking === true
      ) {
        // ... (keep existing booking completion logic)
        logger.info(`Order ${doc.id} completed. Updating related Booking(s) to 'completed'.`)
        const { docs: bookingsToComplete } = await payload.find({
          collection: 'bookings',
          where: { order: { equals: doc.id } },
          req: req as PayloadRequest,
        })
        for (const booking of (bookingsToComplete || []) as BookingType[]) {
          if (booking && booking.id && booking.status !== 'completed') {
            await payload.update({
              collection: 'bookings',
              id: booking.id,
              data: { status: 'completed' },
              req: req as PayloadRequest,
            })
            logger.info(`Booking ${booking.id} updated to 'completed' for order ${doc.id}.`)
          }
        }
      }

      // --- Product Fulfillment Logic ---
      if (doc.orderType === 'product') {
        // ... (keep existing product fulfillment logic)
        if (doc.status === 'processing' && previousDoc.status !== 'processing') {
          logger.info(`[Product Order ${doc.id}] Status 'processing'. Initiating fulfillment.`)
          // Conceptual steps...
        }
        if (doc.status === 'shipped' && previousDoc.status === 'processing') {
          logger.info(`[Product Order ${doc.id}] Status 'shipped'.`)
          // Conceptual steps...
        }
      }
    } catch (error: any) {
      logger.error(
        `Error in Order afterChange secondary status propagation (update) for order ${doc.id}: ${
          error?.message || String(error)
        }`,
      )
    }
  }

  // --- Logic for 'create' operation ---
  // This needs review - the original subscription creation here is now handled above.
  if (operation === 'create' && (doc.status === 'processing' || doc.status === 'completed')) {
    // Consider 'completed' status on create too
    try {
      // --- Subscription Creation (Handled Above) ---
      // The logic for creating subscriptions on 'create' operation (if status is processing/completed)
      // is now integrated into the main subscription block at the beginning of the hook.
      // This section can be removed or commented out if fully replaced.
      // if (doc.orderType === 'subscription') {
      //    logger.info(`Order ${doc.id} created with status '${doc.status}'. Subscription creation handled earlier.`);
      // }

      // --- Booking Creation (Keep) ---
      if (doc.orderType === 'service' && doc.serviceData?.requiresBooking === true) {
        // ... (keep existing booking creation logic)
        const serviceItem = doc.items?.find((item: any) => item.service)
        const serviceId = serviceItem?.service
          ? typeof serviceItem.service === 'object'
            ? (serviceItem.service as ServiceType).id
            : serviceItem.service
          : undefined
        if (!customerId) {
          logger.error(`Order ${doc.id} (create): Customer ID missing for booking.`)
        } else if (!serviceId) {
          logger.error(`Order ${doc.id} (create): Service ID missing for booking.`)
        } else {
          logger.info(
            `Order ${doc.id} created with status '${doc.status}' for bookable service. Creating Booking.`,
          )
          await payload.create({
            collection: 'bookings',
            data: {
              order: doc.id,
              customer: customerId,
              service: serviceId,
              status: 'confirmed',
            } as any,
            req: req as PayloadRequest,
          })
          logger.info(`Booking created for newly created order ${doc.id}.`)
        }
      }

      // --- Product Fulfillment (Keep) ---
      if (doc.orderType === 'product') {
        // ... (keep existing product fulfillment logic for create)
        logger.info(
          `[Product Order ${doc.id}] Created with status '${doc.status}'. Initiating fulfillment.`,
        )
        // Conceptual steps...
      }
    } catch (error: any) {
      logger.error(
        `Error in Order afterChange status propagation (create) for order ${doc.id}: ${
          error?.message || String(error)
        }`,
      )
    }
  }
}

const createServiceProjectHook: CollectionAfterChangeHook<OrderWithCalculatedFields> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  const { payload } = req

  // Проверяем, что это заказ услуги и его статус изменился
  if (
    operation === 'update' &&
    doc.orderType === 'service' &&
    previousDoc?.status !== doc.status &&
    (doc.status === 'processing' || doc.status === 'paid')
  ) {
    // Проверяем, не создан ли уже проект для этого заказа
    const existingProjects = await payload.find({
      collection: 'service-projects' as any,
      where: {
        sourceOrder: {
          equals: doc.id,
        },
      },
    })

    if (existingProjects.totalDocs > 0) {
      // Проект уже существует
      return
    }

    // Получаем данные об услуге
    let serviceName = 'Unknown Service'
    let serviceType = ''
    let serviceId = null

    if (doc.items && Array.isArray(doc.items)) {
      for (const item of doc.items) {
        if (item.service) {
          try {
            if (typeof item.service === 'string') {
              // Получаем данные услуги по ID
              const service = await payload.findByID({
                collection: 'services',
                id: item.service,
              })

              // Проверяем наличие полей перед обращением к ним
              if (service.title) {
                if (typeof service.title === 'object' && service.title !== null) {
                  // Исправляем обработку локализованного заголовка
                  const titleObj = service.title as LocalizedTitle
                  serviceName = titleObj.ru || titleObj.en || 'Услуга'
                } else {
                  serviceName = service.title.toString()
                }
              }
              serviceType = service.serviceType || ''
              serviceId = service.id

              // Прерываем после нахождения первой услуги
              break
            } else if (typeof item.service === 'object') {
              // Данные услуги уже в объекте
              if (item.service.title) {
                if (typeof item.service.title === 'object' && item.service.title !== null) {
                  // Исправляем обработку локализованного заголовка
                  const titleObj = item.service.title as LocalizedTitle
                  serviceName = titleObj.ru || titleObj.en || 'Услуга'
                } else {
                  serviceName = item.service.title.toString()
                }
              }
              serviceType = item.service.serviceType || ''
              serviceId = item.service.id

              // Прерываем после нахождения первой услуги
              break
            }
          } catch (error: unknown) {
            // Ошибка получения данных услуги
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
            req.payload.logger.error(`Ошибка при получении данных услуги: ${errorMessage}`)
          }
        }
      }
    }

    // Создаем имя проекта
    const projectName = `${doc.orderNumber}`

    // Создаем проект
    try {
      const createdProject = await payload.create({
        collection: 'service-projects' as any,
        data: {
          name: projectName,
          sourceOrder: doc.id,
          customer: typeof doc.customer === 'string' ? doc.customer : doc.customer?.id || '',
          serviceDetails: {
            serviceName,
            serviceType,
          },
          specificationText: doc.specificationText,
          specificationFiles: doc.specificationFiles,
          status: 'new',
          // Назначаем администратора - в реальной системе можно назначить конкретного исполнителя
          // или оставить это поле пустым для назначения вручную
        },
      })

      // Создаем системное сообщение в проекте
      if (createdProject.id) {
        try {
          // Находим первого администратора для системного сообщения
          const adminUsers = await payload.find({
            collection: 'users',
            where: {
              roles: {
                contains: 'admin',
              },
            },
            limit: 1,
          })

          const adminUser = adminUsers.docs[0]

          if (adminUser) {
            // Создаем системное сообщение
            await payload.create({
              collection: 'project-messages' as any,
              data: {
                project: createdProject.id,
                author: adminUser.id,
                content: [
                  {
                    children: [
                      {
                        text: `Проект создан автоматически на основе заказа #${doc.orderNumber}.`,
                      },
                    ],
                  },
                  {
                    children: [
                      {
                        text: 'Пожалуйста, ознакомьтесь с техническим заданием и ожидайте дальнейших действий от нашей команды.',
                      },
                    ],
                  },
                ],
                isSystemMessage: true,
              },
            })
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
          req.payload.logger.error(`Ошибка при создании системного сообщения: ${errorMessage}`)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      req.payload.logger.error(`Ошибка при создании проекта по услуге: ${errorMessage}`)
    }
  }
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'],
    group: 'E-commerce',
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true, // Usually set by hooks
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
        { label: 'Pending Manual Review', value: 'pending_manual_review' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          // required: true, // Not required if 'service' is provided
        },
        {
          name: 'service',
          label: 'Service (if orderType is service)',
          type: 'relationship',
          relationTo: 'services',
          // required: true, // Not required if 'product' is provided
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'price', // Price per unit at the time of order
          type: 'number',
          required: true,
          admin: {
            description:
              'Price per unit at the time of order. Should be pre-filled or validated based on selected product/service.',
          },
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'group',
      admin: {
        description: 'The total amount before taxes and discounts. Calculated automatically.',
        readOnly: true,
      },
      fields: [
        {
          name: 'en',
          type: 'group',
          fields: [
            { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'USD',
              admin: { readOnly: true },
            },
          ],
        },
        {
          name: 'ru',
          type: 'group',
          fields: [
            { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'RUB',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'taxes',
      type: 'array',
      admin: {
        description:
          'Applied taxes. Amounts are calculated automatically based on rate and subtotal.',
      },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Tax Name (e.g., VAT, Sales Tax)' },
        {
          name: 'rate',
          type: 'number',
          required: true,
          label: 'Tax Rate (e.g., 0.2 for 20%)',
          min: 0,
          max: 1,
        },
        {
          name: 'amount',
          label: 'Tax Amount (Calculated)',
          type: 'group',
          admin: { readOnly: true },
          fields: [
            {
              name: 'en',
              type: 'group',
              fields: [
                { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
                {
                  name: 'currency',
                  type: 'text',
                  required: true,
                  defaultValue: 'USD',
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'ru',
              type: 'group',
              fields: [
                { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
                {
                  name: 'currency',
                  type: 'text',
                  required: true,
                  defaultValue: 'RUB',
                  admin: { readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'discounts',
      type: 'array',
      admin: {
        description: 'Applied discounts. Amounts are calculated automatically.',
      },
      fields: [
        { name: 'code', type: 'text', label: 'Discount Code (if applicable)' },
        { name: 'description', type: 'text', required: true, label: 'Discount Description' },
        {
          name: 'amount', // This is the discount value, should be positive, will be subtracted.
          label: 'Discount Value (Positive Number)',
          type: 'group',
          fields: [
            {
              name: 'en',
              type: 'group',
              fields: [
                {
                  name: 'amount',
                  type: 'number',
                  required: true,
                  admin: { description: 'Enter a positive value for the discount.' },
                },
                { name: 'currency', type: 'text', required: true, defaultValue: 'USD' },
              ],
            },
            {
              name: 'ru',
              type: 'group',
              fields: [
                {
                  name: 'amount',
                  type: 'number',
                  required: true,
                  admin: { description: 'Enter a positive value for the discount.' },
                },
                { name: 'currency', type: 'text', required: true, defaultValue: 'RUB' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'total',
      type: 'group',
      admin: {
        description: 'The final total amount to be paid. Calculated automatically.',
        readOnly: true,
      },
      fields: [
        {
          name: 'en',
          type: 'group',
          fields: [
            { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'USD',
              admin: { readOnly: true },
            },
          ],
        },
        {
          name: 'ru',
          type: 'group',
          fields: [
            { name: 'amount', type: 'number', required: true, admin: { readOnly: true } },
            {
              name: 'currency',
              type: 'text',
              required: true,
              defaultValue: 'RUB',
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'paymentId',
      type: 'text',
      label: 'Payment ID (from Provider)',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'paymentProvider',
      type: 'text',
      label: 'Payment Provider',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'paymentData',
      type: 'json',
      label: 'Payment Data (Raw)',
      admin: { readOnly: true },
    },
    {
      name: 'paidAt',
      type: 'date',
      label: 'Paid At',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'paymentVerificationFailed',
      label: 'Payment Verification Failed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Истинно, если автоматическая верификация платежа (например, расхождение суммы/валюты) завершилась ошибкой.',
        readOnly: true,
      },
    },
    {
      name: 'orderType',
      type: 'select',
      options: [
        {
          label: 'Product Order',
          value: 'product',
        },
        {
          label: 'Service Order',
          value: 'service',
        },
        {
          label: 'Subscription',
          value: 'subscription',
        },
      ],
      required: true,
      admin: {
        description: 'Type of the order',
      },
    },
    {
      name: 'serviceData',
      type: 'group',
      admin: {
        description: 'Additional data for service orders',
        condition: (data: Partial<OrderWithCalculatedFields>) => data.orderType === 'service',
      },
      fields: [
        {
          name: 'serviceId',
          type: 'text',
          admin: {
            description: 'ID of the service (if applicable, usually populated from items)',
          },
        },
        {
          name: 'serviceType',
          type: 'text',
          admin: {
            description: 'Type of service (if applicable)',
          },
        },
        {
          name: 'requiresBooking',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Whether this service requires booking (usually determined by the service itself)',
          },
        },
      ],
    },
    {
      name: 'subscriptionProcessedToken',
      label: 'Subscription Token Processed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Indicates if a payment token has been stored for this subscription order.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'renewalForSubscription',
      label: 'Renewal for Subscription',
      type: 'relationship',
      relationTo: 'subscriptions',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Link to the subscription if this order is a renewal.',
      },
    },
    {
      name: 'cancellationDetails',
      type: 'group',
      label: 'Cancellation Details',
      admin: {
        condition: (data: Partial<OrderWithCalculatedFields>) =>
          data.status === 'cancelled' || data.status === 'partially_refunded',
        readOnly: true, // Typically set by hooks or system processes
      },
      fields: [
        {
          name: 'cancelledAt',
          type: 'date',
          label: 'Cancelled At',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'reason',
          type: 'textarea',
          label: 'Reason for Cancellation',
        },
        // Conceptual for partial cancellation:
        // {
        //   name: 'cancelledItemIds',
        //   type: 'array',
        //   label: 'Cancelled Item IDs',
        //   fields: [
        //     { name: 'itemId', type: 'text' }
        //   ]
        // }
      ],
    },
    {
      name: 'specificationText',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Текстовое описание ТЗ от клиента',
        condition: (data) => data.orderType === 'service',
      },
    },
    {
      name: 'specificationFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Файлы ТЗ, прикрепленные клиентом',
        condition: (data) => data.orderType === 'service',
      },
    },
  ],
  hooks: {
    beforeValidate: [validateOrderItemsHook],
    beforeChange: [calculateOrderTotalsHook],
    afterChange: [afterChangeHook, createServiceProjectHook],
  },
}
