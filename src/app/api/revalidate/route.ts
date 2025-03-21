import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('Revalidate API route hit')
  try {
    const body = await request.json()
    console.log('Revalidate API request body:', JSON.stringify(body, null, 2))
    const { tag, path, collection, slug, data } = body

    // Always revalidate the header-related paths and tags
    await revalidateTag('global_header')
    await revalidateTag('header')
    await revalidatePath('/', 'layout') // Revalidate root layout
    await revalidatePath('/', 'page')   // Revalidate homepage

    // If this is a header update, revalidate all pages since header is global
    if (collection === 'globals' && slug === 'header') {
      console.log('Revalidating header on all pages')
      await revalidatePath('/', 'layout')
      await revalidatePath('/', 'page')
    }

    // Revalidate specific paths if provided
    if (path) {
      console.log('Revalidating path:', path)
      await revalidatePath(path, 'layout')
      await revalidatePath(path, 'page')
    }

    // Revalidate specific collection paths if provided
    if (collection && slug) {
      const collectionPath = `/${collection}/${slug}`
      console.log('Revalidating collection path:', collectionPath)
      await revalidatePath(collectionPath, 'layout')
      await revalidatePath(collectionPath, 'page')
    }

    // Revalidate specific tags if provided
    if (tag) {
      console.log('Revalidating tag:', tag)
      await revalidateTag(tag)
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    console.error('Error in revalidate route:', error)
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
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
