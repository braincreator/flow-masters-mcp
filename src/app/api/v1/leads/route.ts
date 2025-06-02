import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
// import { z } from 'zod';
import payload from 'payload'

// // Схема валидации запроса
// const requestSchema = z.object({
//   collection: z.string().min(1),
//   data: z.record(z.any()),
// });

/**
 * Обработчик POST запросов для сохранения лидов (legacy endpoint)
 * Теперь перенаправляет на новый API form-submissions
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, phone, email, comment, actionType, formId } = data

    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }

    const payloadClient = await getPayloadClient()

    // If formId is not provided, try to find AI Agency form
    let targetFormId = formId
    if (!targetFormId) {
      const aiAgencyForms = await payloadClient.find({
        collection: 'forms',
        where: {
          title: {
            contains: 'AI Agency',
          },
        },
        limit: 1,
      })

      if (aiAgencyForms.docs.length === 0) {
        return NextResponse.json({ error: 'AI Agency form not found' }, { status: 404 })
      }

      targetFormId = aiAgencyForms.docs[0].id
    }

    const submissionDataArray = Object.entries({
      name,
      phone,
      email,
      comment,
      actionType,
    })
      .filter(([_, value]) => value) // Remove empty values
      .map(([fieldName, value]) => ({
        field: fieldName,
        value: String(value),
      }))

    const lead = await payloadClient.create({
      collection: 'form-submissions',
      data: {
        form: targetFormId,
        submissionData: submissionDataArray,
      },
    })

    return NextResponse.json({ success: true, lead })
  } catch (e) {
    console.error('Lead form error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
