import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getLandingGeneratorService, LandingGeneratorOptions } from '@/services/landing/landingGeneratorService'

// Схема валидации запроса
const requestSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  target: z.enum(['leads', 'sales', 'info']).optional(),
  style: z.enum(['minimal', 'standard', 'premium']).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  includeHero: z.boolean().optional(),
  includeFeatures: z.boolean().optional(),
  includeFaq: z.boolean().optional(),
  includeTestimonials: z.boolean().optional(),
  includeCta: z.boolean().optional(),
  includeLeadForm: z.boolean().optional(),
  leadFormPosition: z.enum(['top', 'middle', 'bottom', 'multiple']).optional(),
  leadFormFields: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published']).optional(),
  locale: z.string().optional(),
})

/**
 * Обработчик POST запросов для генерации лендингов
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

    // Получаем сервис генерации лендингов
    const landingGeneratorService = await getLandingGeneratorService()

    // Генерируем лендинг
    const landing = await landingGeneratorService.generateLanding(
      validatedData.data as LandingGeneratorOptions,
    )

    return NextResponse.json({
      success: true,
      data: landing,
    })
  } catch (error) {
    console.error('Error generating landing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
