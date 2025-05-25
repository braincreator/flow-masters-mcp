import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getAuth } from '../helpers/auth'
import config from '@/payload.config'

let cachedPayload = null

async function getPayloadInstance() {
  if (cachedPayload) {
    return cachedPayload
  }
  cachedPayload = await getPayload({ config })
  return cachedPayload
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Debug S3 configuration
    console.log('[Media Upload] S3 Configuration:', {
      bucket: process.env.S3_BUCKET,
      endpoint: process.env.S3_ENDPOINT,
      hasAccessKey: !!process.env.S3_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION,
    })

    const payload = await getPayloadInstance()
    const data = await req.formData()
    const file = data.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `[Media Upload] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    )

    // Convert file to buffer - Payload CMS v3 expects Buffer, not stream
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`[Media Upload] File converted to buffer, size: ${buffer.length}`)

    // Payload CMS handles file storage and processing
    const createdMedia = await payload.create({
      collection: 'media',
      data: {
        // Add any necessary metadata here, e.g., uploadedBy
        uploadedBy: user.id,
        alt: file.name, // Add alt text based on filename
      },
      file: {
        // Pass buffer data instead of stream
        data: buffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    })

    console.log(`[Media Upload] Successfully created media document with ID: ${createdMedia.id}`)
    return NextResponse.json(createdMedia)
  } catch (error) {
    console.error('[Media Upload] Error uploading media:', error)

    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('[Media Upload] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    return NextResponse.json(
      {
        error: 'Failed to upload media',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
