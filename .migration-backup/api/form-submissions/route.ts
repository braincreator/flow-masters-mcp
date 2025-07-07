import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Обработчик POST запросов для сохранения form submissions с метаданными
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { form, submissionData, metadata, submissionStatus = 'success', errorMessage } = data

    // Валидация основных данных
    if (!submissionData || !Array.isArray(submissionData)) {
      return NextResponse.json({ error: 'Submission data is required and must be an array' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Проверяем форму, если ID предоставлен
    if (form) {
      try {
        const formDoc = await payload.findByID({
          collection: 'forms',
          id: form,
        })

        if (!formDoc) {
          return NextResponse.json({ error: 'Form not found' }, { status: 404 })
        }
      } catch (error) {
        logWarn('Form validation error:', error)
        // Продолжаем без проверки формы для совместимости
      }
    }

    // Получаем IP адрес
    const ipAddress = getClientIP(req)

    // Подготавливаем данные для сохранения
    const submissionPayload: any = {
      submissionData,
      submissionStatus,
      ipAddress,
      processedAt: new Date().toISOString(),
    }

    // Добавляем ID формы, если есть
    if (form) {
      submissionPayload.form = form
    }

    // Добавляем сообщение об ошибке, если есть
    if (errorMessage) {
      submissionPayload.errorMessage = errorMessage
    }

    // Обрабатываем метаданные, если предоставлены
    if (metadata) {
      submissionPayload.metadata = processMetadata(metadata)
    }

    // Создаем запись в базе данных
    const submission = await payload.create({
      collection: 'form-submissions',
      data: submissionPayload,
    })

    return NextResponse.json({
      success: true,
      submission,
      message: 'Form submitted successfully'
    })
  } catch (error) {
    logError('Form submission error:', error)
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
 * Получает IP адрес клиента
 */
function getClientIP(req: NextRequest): string {
  // Проверяем различные заголовки для получения реального IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback к IP из connection
  return req.ip || 'unknown'
}

/**
 * Обрабатывает и структурирует метаданные для сохранения
 */
function processMetadata(metadata: any): any {
  try {
    const processed: any = {}

    // UTM данные
    if (metadata.utm_data) {
      processed.utmData = metadata.utm_data
    }

    // Источник трафика
    if (metadata.traffic_source) {
      processed.trafficSource = metadata.traffic_source
    }

    // Информация об устройстве
    if (metadata.device_info) {
      processed.deviceInfo = metadata.device_info
    }

    // Поведенческие данные
    if (metadata.user_behavior) {
      const behavior = metadata.user_behavior
      processed.userBehavior = {
        session_id: behavior.session_id,
        time_on_page: behavior.time_on_page,
        time_on_site: behavior.time_on_site,
        scroll_depth: behavior.scroll_depth,
        max_scroll_depth: behavior.max_scroll_depth,
        page_views_count: behavior.page_views_count,
        is_returning_visitor: behavior.is_returning_visitor,
        visit_count: behavior.visit_count,
        mouse_movements: behavior.mouse_movements,
        clicks_count: behavior.clicks_count,
        pages_visited: behavior.pages_visited?.map((page: string) => ({ page })) || [],
      }
    }

    // Информация о сессии
    if (metadata.session_info) {
      processed.sessionInfo = metadata.session_info
    }

    // Контекст формы
    if (metadata.form_context) {
      processed.formContext = metadata.form_context
    }

    // Технические метаданные
    if (metadata.technical_metadata) {
      processed.technicalMetadata = metadata.technical_metadata
    }

    // Геолокация
    if (metadata.location_info) {
      processed.locationInfo = metadata.location_info
    }

    // Дополнительные данные
    if (metadata.custom_data) {
      processed.customData = metadata.custom_data
    }

    return processed
  } catch (error) {
    logWarn('Error processing metadata:', error)
    return {}
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
    logError('Form submissions fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
