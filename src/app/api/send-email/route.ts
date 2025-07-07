import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Схема валидации запроса
const requestSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  data: z.record(z.any()),
})

/**
 * Обработчик POST запросов для отправки email
 */
export async function POST(req: NextRequest) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const validatedData = requestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validatedData.error.errors,
        },
        { status: 400 },
      )
    }

    const { to, subject, data } = validatedData.data

    // Проверяем наличие настроек SMTP
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || 'noreply@example.com'

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP configuration is missing',
        },
        { status: 500 },
      )
    }

    // Создаем транспорт для отправки email
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Формируем HTML для email
    const htmlContent = `
      <h2>Новый лид с сайта</h2>
      <p>Получены следующие данные:</p>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <tr>
          <th>Поле</th>
          <th>Значение</th>
        </tr>
        ${Object.entries(data)
          .map(
            ([key, value]) => `
          <tr>
            <td><strong>${key}</strong></td>
            <td>${value}</td>
          </tr>
        `,
          )
          .join('')}
      </table>
      <p>Дата и время: ${new Date().toLocaleString()}</p>
      <p>Источник: ${data.source || 'Не указан'}</p>
    `

    // Отправляем email
    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    })
  } catch (error) {
    logError('Error sending email:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
