import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProviderService } from '@/services/ai/providerService'

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
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
})

/**
 * GET эндпоинт для получения списка моделей для указанного провайдера
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider')
    const apiKey = searchParams.get('apiKey') || undefined
    const baseUrl = searchParams.get('baseUrl') || undefined

    // Валидируем параметры
    const validatedData = requestSchema.parse({
      provider,
      apiKey,
      baseUrl,
    })

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Получаем модели для указанного провайдера
    const options = validatedData.baseUrl ? { baseUrl: validatedData.baseUrl } : undefined
    const models = await providerService.getModels(
      validatedData.provider,
      validatedData.apiKey,
      options,
    )

    // Возвращаем список моделей
    return NextResponse.json({
      success: true,
      data: models,
    })
  } catch (error) {
    console.error('Error fetching AI models:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    )
  }
}
