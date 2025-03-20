import { NextResponse } from 'next/server'
import { getSiteConfig } from '@/utilities/get-site-config'

export async function GET() {
  try {
    const config = await getSiteConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}