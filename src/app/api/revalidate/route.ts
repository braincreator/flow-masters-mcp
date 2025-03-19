import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Explicitly handle the request body
    const text = await request.text()
    console.log('Received raw body:', text)

    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    console.log('Parsed body:', body)

    const { tag, path } = body

    if (!tag && !path) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (tag) await revalidateTag(tag)
    if (path) await revalidatePath(path)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

// Add OPTIONS method to handle CORS preflight requests
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
