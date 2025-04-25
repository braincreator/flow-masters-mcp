import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'
import { ENV } from '@/constants/env'
import { ServiceRegistry } from '@/services/service.registry'
import { CalendlyService, CalendlyWebhookPayload } from '@/services/calendly.service'

/**
 * Обработчик POST-запросов для вебхуков Calendly
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем заголовки для проверки подписи
    const signature = request.headers.get('Calendly-Webhook-Signature')
    const timestamp = request.headers.get('Calendly-Webhook-Timestamp')

    // Если заголовки отсутствуют, возвращаем ошибку
    if (!signature || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing signature headers' },
        { status: 401 },
      )
    }

    // Получаем тело запроса
    const body = await request.text()

    // Получаем секретный ключ из переменных окружения
    const webhookSecret = ENV.CALENDLY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('CALENDLY_WEBHOOK_SECRET is not defined in environment variables')
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 },
      )
    }

    // Инициализируем Payload CMS
    const payload = await getPayloadClient()

    // Получаем сервис Calendly
    const serviceRegistry = ServiceRegistry.getInstance(payload)
    const calendlyService = serviceRegistry.getCalendlyService()

    // Проверяем подпись
    const isValid = calendlyService.verifySignature(signature, timestamp, body, webhookSecret)

    if (!isValid) {
      console.error('Invalid Calendly webhook signature')
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    }

    // Парсим тело запроса
    const webhookData = JSON.parse(body) as CalendlyWebhookPayload

    // Обрабатываем вебхук
    const result = await calendlyService.processWebhook(webhookData)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Webhook processed successfully',
    })
  } catch (error) {
    console.error('Error processing Calendly webhook:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
