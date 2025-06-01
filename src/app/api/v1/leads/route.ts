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
 * Обработчик POST запросов для сохранения лидов
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, phone, email, comment, actionType } = data
    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }
    const payloadClient = await getPayloadClient() // Corrected variable name from 'payload' to 'payloadClient' for clarity

    // TODO: Убедитесь, что formId корректно передается с фронтенда. Этот ID должен соответствовать форме в коллекции 'forms'.
    const formId = data.formId // Предполагается, что formId будет передан в запросе
    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 })
    }

    const submissionDataArray = Object.entries({
      name,
      phone,
      email,
      comment,
      actionType,
    }).map(([fieldName, value]) => ({
      field: fieldName, // Используем имя поля из объекта
      value: String(value), // Убедимся, что значение является строкой
    }))

    const lead = await payloadClient.create({
      // Use payloadClient
      collection: 'form-submissions',
      data: {
        form: formId, // ID формы, на которую пришел ответ. Требуется передача с фронтенда.
        submissionData: submissionDataArray,
      },
    })
    return NextResponse.json({ success: true, lead })
  } catch (e) {
    console.error('Lead form error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
