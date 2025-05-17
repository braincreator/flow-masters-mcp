import { NextRequest, NextResponse } from 'next/server'
import { revalidateContent } from '@/utilities/revalidation'

export async function POST(request: NextRequest) {
  // Check for secret to confirm this is a valid request
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const path = request.nextUrl.searchParams.get('path')
    const type = request.nextUrl.searchParams.get('type')

    if (!path || !type) {
      return NextResponse.json({ message: 'Missing path or type' }, { status: 400 })
    }

    // Revalidate the page
    await revalidateContent({ path, type: type as 'page' | 'layout' })

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
