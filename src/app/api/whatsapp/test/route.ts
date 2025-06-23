import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload'

/**
 * API для тестирования WhatsApp уведомлений
 * POST /api/whatsapp/test - отправить тестовое сообщение
 */

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { phoneNumber, message, type = 'text', templateName, templateParams } = data

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const whatsappService = payload.services?.getWhatsAppService()

    if (!whatsappService) {
      return NextResponse.json(
        { error: 'WhatsApp service not available' },
        { status: 500 }
      )
    }

    let result

    if (type === 'template' && templateName) {
      // Отправка шаблонного сообщения
      result = await whatsappService.sendTemplate(
        phoneNumber,
        templateName,
        'ru',
        templateParams || []
      )
    } else {
      // Отправка обычного текстового сообщения
      const testMessage = message || `🧪 Тестовое сообщение от FlowMasters

Это тестовое уведомление для проверки интеграции WhatsApp.

Время отправки: ${new Date().toLocaleString('ru-RU')}

Если вы получили это сообщение, значит интеграция работает корректно! ✅`

      result = await whatsappService.sendMessage(phoneNumber, testMessage)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp test message sent successfully',
        messageId: result.messageId,
        phoneNumber,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send WhatsApp message',
          phoneNumber,
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error sending WhatsApp test message:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * API для получения доступных шаблонов WhatsApp
 * GET /api/whatsapp/test - получить список шаблонов
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const whatsappService = payload.services?.getWhatsAppService()

    if (!whatsappService) {
      return NextResponse.json(
        { error: 'WhatsApp service not available' },
        { status: 500 }
      )
    }

    const templates = await whatsappService.getTemplates()

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    })

  } catch (error) {
    console.error('Error getting WhatsApp templates:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
