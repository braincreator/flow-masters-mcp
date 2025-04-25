import { getPayloadClient } from '@/utilities/payload/index'
import { ServiceRegistry } from '@/services/service.registry'

/**
 * Job that checks for expiring rewards and sends notifications
 */
export const checkExpiringRewards = async () => {
  try {
    console.log('Running expiring rewards check job...')
    const payload = await getPayloadClient()
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const rewardService = serviceRegistry.getRewardService()

    // Check for expiring rewards
    await rewardService.checkExpiringRewards()

    console.log('Expiring rewards check completed')
  } catch (error) {
    console.error('Error checking expiring rewards:', error)
  }
}
