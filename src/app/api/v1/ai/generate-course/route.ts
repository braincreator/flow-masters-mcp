import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayloadClient } from '@/utilities/payload'
import { generateCourseStructure } from '@/services/ai/courseGenerator'

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
  provider: z.enum(['openai', 'google', 'deepseek']),
  model: z.enum(['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo', 'gemini-pro', 'deepseek-chat']),
  apiKey: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const validatedData = requestSchema.parse(body)
    
    // Генерируем структуру курса с помощью AI
    const courseStructure = await generateCourseStructure(validatedData)
    
    // Возвращаем сгенерированную структуру
    return NextResponse.json({
      success: true,
      data: courseStructure,
      message: 'Course structure generated successfully'
    })
    
  } catch (error) {
    console.error('Error generating course:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
