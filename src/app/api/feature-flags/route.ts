import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Default feature flags to use when no flags are found in the database
const defaultFeatureFlags = [
  {
    id: 'new_dashboard',
    name: 'New Dashboard UI',
    description: 'Enable the new dashboard user interface',
    enabled: true,
  },
  {
    id: 'advanced_search',
    name: 'Advanced Search',
    description: 'Enable advanced search functionality',
    enabled: true,
  },
  {
    id: 'beta_features',
    name: 'Beta Features',
    description: 'Enable access to beta features',
    enabled: false,
    userGroups: ['admin', 'beta_tester'],
  },
  {
    id: 'new_checkout',
    name: 'New Checkout Experience',
    description: 'Enable the new checkout flow',
    enabled: true,
    percentage: 50, // 50% rollout
  },
]

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    // Try to fetch feature flags from the database
    try {
      const featureFlagsResult = await payload.find({
        collection: 'feature-flags',
        limit: 100,
      })

      const flags =
        featureFlagsResult.docs.length > 0 ? featureFlagsResult.docs : defaultFeatureFlags

      return NextResponse.json({
        success: true,
        flags,
      })
    } catch (collectionError) {
      logWarn('Feature flags collection not found or error accessing it:', collectionError)

      // Return default flags if collection doesn't exist or has issues
      return NextResponse.json({
        success: true,
        flags: defaultFeatureFlags,
      })
    }
  } catch (error) {
    logError('Error initializing Payload client:', error)

    // Return default flags on any error
    return NextResponse.json({
      success: true,
      flags: defaultFeatureFlags,
    })
  }
}
