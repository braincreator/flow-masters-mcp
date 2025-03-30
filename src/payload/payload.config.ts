// Import new collections
import { SubscriptionPlans } from './collections/subscription-plans'
import { Subscriptions } from './collections/subscriptions'
import { SubscriptionPayments } from './collections/subscription-payments'

// Add collections to the config
const config = buildConfig({
  collections: [SubscriptionPlans, Subscriptions, SubscriptionPayments],
})
