import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params
    const { searchParams } = new URL(request.url)
    const depth = Number(searchParams.get('depth') || '1')
    const locale = searchParams.get('locale') || undefined

    const payload = await getPayload({ config: configPromise })

    const data = await payload.findGlobal({
      slug,
      depth,
      ...(locale && { locale }),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching global:', error)
    return NextResponse.json({ message: 'Error fetching global', error }, { status: 500 })
  }
}
