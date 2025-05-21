import { CollectionAfterChangeHook } from 'payload/types'
import { ServiceRegistry } from '@/services/service.registry'
import { NotificationStoredType } from '@/types/notifications'

/**
 * Hook that sends notifications when a service project's status changes
 */
export const notifyOnStatusChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Only run on update operations where status changes
  if (operation !== 'update' || doc.status === previousDoc.status) {
    return
  }

  const { payload } = req
  const logger = payload.logger || console

  try {
    // Get the customer ID
    const customerId = typeof doc.customer === 'object' ? doc.customer.id : doc.customer

    if (!customerId) {
      logger.error(`Project ${doc.id}: Customer ID missing for notification.`)
      return
    }

    // Get the customer details
    const customer = await payload.findByID({
      collection: 'users',
      id: customerId,
    })

    if (!customer) {
      logger.error(`Project ${doc.id}: Customer not found for notification.`)
      return
    }

    // Get the service registry and notification service
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const notificationService = serviceRegistry.getNotificationService()

    // Get the status label based on the status value
    const getStatusLabel = (status: string): string => {
      switch (status) {
        case 'new':
          return 'New'
        case 'in_progress':
          return 'In Progress'
        case 'on_review':
          return 'On Review'
        case 'completed':
          return 'Completed'
        case 'cancelled':
          return 'Cancelled'
        default:
          return status
      }
    }

    // Send notification to the customer
    await notificationService.sendNotification({
      userId: customerId,
      user: customer,
      title: 'Project Status Updated',
      messageKey: 'NotificationBodies.project_status_updated',
      messageParams: {
        projectName: doc.name,
        newStatus: getStatusLabel(doc.status),
      },
      type: NotificationStoredType.PROJECT_STATUS_UPDATED,
      link: `/dashboard/projects/${doc.id}`,
      locale: customer.locale || 'en',
      metadata: {
        projectId: doc.id,
        previousStatus: previousDoc.status,
        newStatus: doc.status,
      },
    })

    logger.info(`Notification sent to customer ${customerId} for project ${doc.id} status change.`)
  } catch (error) {
    logger.error(
      `Error sending notification for project ${doc.id} status change: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Export hooks for service-projects collection
 */
export const serviceProjectHooks = {
  afterChange: [notifyOnStatusChange],
}
