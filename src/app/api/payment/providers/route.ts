import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

export async function GET() {
  try {
    const payload = await getPayloadClient()

    // Get global settings
    const settings = await payload.findGlobal({
      slug: 'settings',
    })

    // Extract payment providers
    const availableProviders = settings?.paymentSettings?.availableProviders || []

    // Filter enabled providers and format response
    const providers = availableProviders
      .filter((provider) => provider.enabled)
      .map((provider) => ({
        id: provider.provider,
        name: provider.displayName,
      }))

    return NextResponse.json({
      providers,
      defaultProvider: settings?.paymentSettings?.defaultProvider,
    })
  } catch (error) {
    console.error('Error fetching payment providers:', error)
    return NextResponse.json({ error: 'Failed to fetch payment providers' }, { status: 500 })
  }
}
