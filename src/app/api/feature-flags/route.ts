import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

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
    // In a real implementation, you would fetch feature flags from your database
    const payload = await getPayloadClient()
    const featureFlagsResult = await payload.find({
      collection: 'feature-flags',
      limit: 100,
    })

    const flags = featureFlagsResult.docs.length > 0 ? featureFlagsResult.docs : defaultFeatureFlags

    return NextResponse.json({
      success: true,
      flags,
    })
  } catch (error) {
    console.error('Error fetching feature flags:', error)

    // Return default flags on error
    return NextResponse.json({
      success: true,
      flags: defaultFeatureFlags,
    })
  }
}
