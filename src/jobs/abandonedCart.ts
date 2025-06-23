import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Job that processes abandoned carts and sends reminder emails
 */
export const processAbandonedCarts = async () => {
  try {
    logDebug('Running abandoned cart job...')
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()

    // Get global settings
    const settings = await payload.findGlobal({
      slug: 'settings',
    })

    // Check if abandoned cart notifications are enabled
    if (!settings?.notificationSettings?.email?.enableAbandonedCartReminders) {
      logDebug('Abandoned cart reminders are disabled in settings')
      return
    }

    const delayHours = settings.notificationSettings.email.abandonedCartDelay || 24

    // Calculate the threshold time (now - delay hours)
    const now = new Date()
    const thresholdTime = new Date(now.getTime() - delayHours * 60 * 60 * 1000)

    // Find abandoned carts in the database
    const abandonedCarts = await payload.find({
      collection: 'cart-sessions',
      where: {
        and: [
          {
            updatedAt: {
              less_than: thresholdTime.toISOString(),
            },
          },
          {
            reminderSent: {
              equals: false,
            },
          },
          {
            items: {
              exists: true,
            },
          },
        ],
      },
      depth: 2, // Load related entities
    })

    logDebug(`Found ${abandonedCarts.docs.length} abandoned carts to process`)

    // Process each abandoned cart
    for (const cart of abandonedCarts.docs) {
      // Skip carts with no items or no user
      if (!cart.items || cart.items.length === 0 || !cart.user) {
        continue
      }

      try {
        // Load user data
        const user = await payload.findByID({
          collection: 'users',
          id: cart.user,
        })

        // Send notification
        await notificationService.sendAbandonedCartReminder({
          user,
          items: cart.items,
          total: cart.total,
          currency: cart.currency,
          lastUpdated: new Date(cart.updatedAt),
        })

        // Mark as reminder sent
        await payload.update({
          collection: 'cart-sessions',
          id: cart.id,
          data: {
            reminderSent: true,
            reminderSentAt: new Date().toISOString(),
          },
        })

        logDebug(`Sent abandoned cart reminder for cart ${cart.id} to user ${user.email}`)
      } catch (error) {
        logError(`Error processing abandoned cart ${cart.id}:`, error)
      }
    }

    logDebug('Abandoned cart job completed')
  } catch (error) {
    logError('Failed to process abandoned carts:', error)
  }
}

export default processAbandonedCarts
