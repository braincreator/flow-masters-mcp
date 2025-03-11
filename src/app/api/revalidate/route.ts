import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get('tag')
    const path = request.nextUrl.searchParams.get('path')

    if (!tag && !path) {
      return NextResponse.json(
        { message: 'Missing tag or path parameter' },
        { status: 400 }
      )
    }

    if (tag) {
      await revalidateTag(tag)
    }

    if (path) {
      await revalidatePath(path)
    }

    return NextResponse.json(
      { 
        revalidated: true,
        now: Date.now(),
        tag: tag || undefined,
        path: path || undefined
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { message: 'Error revalidating', error },
      { status: 500 }
    )
  }
}
