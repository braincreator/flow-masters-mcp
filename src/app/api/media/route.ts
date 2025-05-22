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

    const payload = await getPayloadInstance()
    const data = await req.formData()
    const file = data.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Payload CMS handles file storage and processing
    const createdMedia = await payload.create({
      collection: 'media',
      data: {
        // Add any necessary metadata here, e.g., uploadedBy
        uploadedBy: user.id,
      },
      file: {
        // Pass an object for the file
        data: file.stream(), // Get the file data as a stream
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
    })

    return NextResponse.json(createdMedia)
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
