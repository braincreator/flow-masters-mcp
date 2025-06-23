import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Job that checks for expiring rewards and sends notifications
 */
export const checkExpiringRewards = async () => {
  try {
    logDebug('Running expiring rewards check job...')
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const rewardService = serviceRegistry.getRewardService()

    // Check for expiring rewards
    await rewardService.checkExpiringRewards()

    logDebug('Expiring rewards check completed')
  } catch (error) {
    logError('Error checking expiring rewards:', error)
  }
}
