import { NextRequest, NextResponse } from 'next/server'
import { revalidateContent } from '@/utilities/revalidation'
import { createCorsResponse, createCorsPreflightResponse } from '@/utilities/cors'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  // Check for secret to confirm this is a valid request
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_TOKEN) {
    return createCorsResponse({ message: 'Invalid token' }, { status: 401, origin })
  }

  try {
    const path = request.nextUrl.searchParams.get('path')
    const type = request.nextUrl.searchParams.get('type')

    if (!path || !type) {
      return createCorsResponse({ message: 'Missing path or type' }, { status: 400, origin })
    }

    // Revalidate the page
    await revalidateContent({ path, type: type as 'page' | 'layout' })

    return createCorsResponse({ revalidated: true, now: Date.now() }, { origin })
  } catch (err) {
    return createCorsResponse({ message: 'Error revalidating' }, { status: 500, origin })
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return createCorsPreflightResponse(origin)
}
