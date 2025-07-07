import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProviderService } from '@/services/ai/providerService'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Схема валидации запроса
const requestSchema = z.object({
  provider: z.enum([
    'openai',
    'google',
    'deepseek',
    'anthropic',
    'openrouter',
    'requesty',
    'mistral',
    'openai-compatible',
  ]),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
})

/**
 * POST эндпоинт для проверки валидности API ключа
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем данные запроса
    const body = await request.json()

    // Валидируем данные
    const validatedData = requestSchema.parse(body)

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Проверяем валидность API ключа
    const options = validatedData.baseUrl ? { baseUrl: validatedData.baseUrl } : undefined

    const isValid = await providerService.validateApiKey(
      validatedData.provider,
      validatedData.apiKey,
      options,
    )

    // Если ключ валидный, сохраняем его
    if (isValid) {
      await providerService.saveApiKey(validatedData.provider, validatedData.apiKey, options)
    }

    // Возвращаем результат проверки
    return NextResponse.json({
      success: true,
      isValid,
    })
  } catch (error) {
    logError('Error validating API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isValid: false,
      },
      { status: 400 },
    )
  }
}
