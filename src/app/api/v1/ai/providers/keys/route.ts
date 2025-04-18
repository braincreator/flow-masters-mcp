import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProviderService, AIProvider } from '@/services/ai/providerService'

// Схема валидации запроса для сохранения ключа
const saveKeySchema = z.object({
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

// Схема валидации запроса для удаления ключа
const deleteKeySchema = z.object({
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
})

/**
 * POST эндпоинт для сохранения API ключа
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем данные запроса
    const body = await request.json()

    // Валидируем данные
    const validatedData = saveKeySchema.parse(body)

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Проверяем валидность API ключа перед сохранением
    const options = validatedData.baseUrl ? { baseUrl: validatedData.baseUrl } : undefined

    // Для OpenAI Compatible проверяем наличие baseUrl
    if (validatedData.provider === 'openai-compatible' && !validatedData.baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Base URL is required for OpenAI Compatible provider',
        },
        { status: 400 },
      )
    }

    const isValid = await providerService.validateApiKey(
      validatedData.provider,
      validatedData.apiKey,
      options,
    )

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key',
        },
        { status: 400 },
      )
    }

    // Сохраняем API ключ
    await providerService.saveApiKey(validatedData.provider, validatedData.apiKey, options)

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      message: `API key for ${validatedData.provider} saved successfully`,
    })
  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    )
  }
}

/**
 * DELETE эндпоинт для удаления API ключа
 */
export async function DELETE(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider') as AIProvider

    // Валидируем параметры
    const validatedData = deleteKeySchema.parse({ provider })

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Удаляем API ключ
    await providerService.deleteApiKey(validatedData.provider)

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      message: `API key for ${validatedData.provider} deleted successfully`,
    })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 },
    )
  }
}

/**
 * GET эндпоинт для проверки наличия сохраненного API ключа
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем параметры запроса
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get('provider') as AIProvider

    // Валидируем параметры
    const validatedData = deleteKeySchema.parse({ provider })

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Проверяем наличие API ключа
    const apiKey = await providerService.getApiKey(validatedData.provider)

    // Возвращаем результат
    return NextResponse.json({
      success: true,
      hasKey: !!apiKey,
    })
  } catch (error) {
    console.error('Error checking API key:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hasKey: false,
      },
      { status: 400 },
    )
  }
}
