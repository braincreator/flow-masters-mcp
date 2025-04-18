import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateCourseStructure, CourseGenerationParams } from '@/services/ai/courseGenerator'
import { getProviderService, AIProvider } from '@/services/ai/providerService'

// Схема валидации запроса
const requestSchema = z.object({
  topic: z.string().min(3).max(200),
  targetAudience: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  includeQuizzes: z.boolean().optional(),
  includeLanding: z.boolean().optional(),
  includeFunnel: z.boolean().optional(),
  landingTemplate: z.string().optional(),
  funnelTemplate: z.string().optional(),
  language: z.enum(['en', 'ru']).default('ru'),
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
  model: z.string(), // Принимаем любую строку как ID модели
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  temperature: z.number().min(0).max(2).optional(),
  style: z.enum(['academic', 'conversational', 'professional']).optional(),
  focus: z.enum(['theory', 'practice', 'balanced']).optional(),
  industrySpecific: z.string().optional(),
  includeResources: z.boolean().optional(),
  includeAssignments: z.boolean().optional(),
  moduleCount: z.number().int().positive().optional(),
  lessonCount: z.number().int().positive().optional(),
})

export async function POST(req: Request) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const validatedData = requestSchema.parse(body)

    // Получаем сервис провайдеров
    const providerService = getProviderService()

    // Проверяем, есть ли сохраненный API ключ для выбранного провайдера
    let apiKey = validatedData.apiKey
    let baseUrl = validatedData.baseUrl

    // Если API ключ не предоставлен, пробуем получить сохраненный ключ
    if (!apiKey) {
      const storedApiKey = await providerService.getApiKey(validatedData.provider as AIProvider)
      if (storedApiKey) {
        apiKey = storedApiKey
      } else {
        // Если нет ни предоставленного, ни сохраненного ключа, используем ключ из переменных окружения
        switch (validatedData.provider) {
          case 'openai':
            apiKey = process.env.OPENAI_API_KEY || ''
            break
          case 'google':
            apiKey = process.env.GOOGLE_API_KEY || ''
            break
          case 'deepseek':
            apiKey = process.env.DEEPSEEK_API_KEY || ''
            break
          case 'anthropic':
            apiKey = process.env.ANTHROPIC_API_KEY || ''
            break
          case 'openrouter':
            apiKey = process.env.OPENROUTER_API_KEY || ''
            break
          case 'requesty':
            apiKey = process.env.REQUESTY_API_KEY || ''
            break
          case 'mistral':
            apiKey = process.env.MISTRAL_API_KEY || ''
            break
          case 'openai-compatible':
            apiKey = process.env.OPENAI_COMPATIBLE_API_KEY || ''
            break
        }
      }
    }

    // Если baseUrl не предоставлен, пробуем получить сохраненный baseUrl
    if (!baseUrl && validatedData.provider === 'openai-compatible') {
      const storedBaseUrl = await providerService.getBaseUrl(validatedData.provider as AIProvider)
      if (storedBaseUrl) {
        baseUrl = storedBaseUrl
      } else {
        // Если нет ни предоставленного, ни сохраненного baseUrl, используем из переменных окружения
        baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL || ''
      }
    }

    // Если API ключ все еще не найден, возвращаем ошибку
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: `API key for ${validatedData.provider} provider is required but not provided`,
        },
        { status: 400 },
      )
    }

    // Если baseUrl не найден для OpenAI Compatible, возвращаем ошибку
    if (validatedData.provider === 'openai-compatible' && !baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `Base URL for OpenAI Compatible provider is required but not provided`,
        },
        { status: 400 },
      )
    }

    // Генерируем структуру курса с помощью AI
    const courseParams = {
      ...validatedData,
      apiKey,
      baseUrl,
      // Приводим провайдера к типу, ожидаемому генератором
      provider: ['anthropic', 'openrouter', 'requesty', 'mistral', 'openai-compatible'].includes(
        validatedData.provider,
      )
        ? 'openai'
        : validatedData.provider,
    }

    const courseStructure = await generateCourseStructure(courseParams as CourseGenerationParams)

    // Возвращаем сгенерированную структуру
    return NextResponse.json({
      success: true,
      data: courseStructure,
      message: 'Course structure generated successfully',
    })
  } catch (error) {
    console.error('Error generating course:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
