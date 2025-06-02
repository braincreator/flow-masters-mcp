import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

/**
 * Обработчик POST запросов для сохранения form submissions
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { form, submissionData } = data

    if (!form) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 })
    }

    if (!submissionData || !Array.isArray(submissionData)) {
      return NextResponse.json({ error: 'Submission data is required and must be an array' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Verify that the form exists
    const formDoc = await payload.findByID({
      collection: 'forms',
      id: form,
    })

    if (!formDoc) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Create the form submission
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form,
        submissionData,
      },
    })

    return NextResponse.json({ 
      success: true, 
      submission,
      message: 'Form submitted successfully'
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

/**
 * Обработчик GET запросов для получения form submissions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const formId = searchParams.get('form')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10

    const payload = await getPayloadClient()

    const where: any = {}
    if (formId) {
      where.form = { equals: formId }
    }

    const result = await payload.find({
      collection: 'form-submissions',
      where,
      page,
      limit,
      sort: '-createdAt',
      depth: 2, // Include form data
    })

    return NextResponse.json({
      success: true,
      data: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    })
  } catch (error) {
    console.error('Form submissions fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
