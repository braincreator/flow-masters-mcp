import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST() {
  try {
    const payload = await getPayload({ config: await configPromise })
    
    // Reset the site config to empty state
    await payload.updateGlobal({
      slug: 'site-config',
      data: {},
    })

    // Revalidate the cache
    try {
      await fetch('/api/revalidate?tag=site-config', {
        method: 'POST',
      })
    } catch (err) {
      console.error('Error revalidating cache:', err)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site config:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
