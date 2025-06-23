import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCourseService } from '@/services/courses/courseService'
import { getLandingService } from '@/services/landing/landingService'
import { getFunnelService } from '@/services/funnel/funnelService'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Схема для урока
const lessonSchema = z.object({
  id: z.string().optional(), // ID существующего урока, если обновляем
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  type: z.enum(['video', 'text', 'quiz', 'assignment']).optional(),
  order: z.number().optional(),
})

// Схема для модуля
const moduleSchema = z.object({
  id: z.string().optional(), // ID существующего модуля, если обновляем
  title: z.string().min(1),
  description: z.string().optional(),
  lessons: z.array(lessonSchema).min(1),
  order: z.number().optional(),
})

// Схема для курса
const courseSchema = z.object({
  id: z.string(), // ID существующего курса (обязательно для обновления)
  title: z.string().min(1),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedDuration: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  learningOutcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  modules: z.array(moduleSchema).min(1),
  featuredImage: z.string().optional(), // ID медиа-файла
  author: z.string().optional(), // ID автора
})

// Схема для лендинга
const landingSchema = z.object({
  id: z.string().optional(), // ID существующего лендинга, если обновляем
  title: z.string().optional(),
  slug: z.string().optional(),
  hero: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    ctaText: z.string().optional(),
    backgroundImage: z.string().optional(),
  }).optional(),
  sections: z.array(
    z.object({
      type: z.string(),
      content: z.any(),
    })
  ).optional(),
}).optional()

// Схема для воронки
const funnelSchema = z.object({
  id: z.string().optional(), // ID существующей воронки, если обновляем
  name: z.string().optional(),
  steps: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
      triggerType: z.string().optional(),
      content: z.any().optional(),
    })
  ).optional(),
  emailSequence: z.array(
    z.object({
      id: z.string().optional(), // ID существующего email-шаблона, если обновляем
      subject: z.string(),
      content: z.string(),
      delay: z.number().optional(),
      triggerEvent: z.string().optional(),
    })
  ).optional(),
}).optional()

// Общая схема запроса
const requestSchema = z.object({
  course: courseSchema,
  landing: landingSchema,
  funnel: funnelSchema,
  language: z.enum(['en', 'ru']).default('ru'),
})

export async function PUT(req: Request) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const { course, landing, funnel, language } = requestSchema.parse(body)
    
    // Получаем сервисы
    const courseService = await getCourseService()
    
    // Обновляем курс в CMS
    const { course: updatedCourse, modules: updatedModules } = await courseService.updateCourse(course, language)
    
    // Обновляем лендинг, если он предоставлен
    let updatedLanding = null
    if (landing) {
      const landingService = await getLandingService()
      
      updatedLanding = await landingService.updateLanding(
        {
          ...landing,
          courseId: course.id
        },
        course.title,
        language
      )
    }
    
    // Обновляем воронку, если она предоставлена
    let updatedFunnel = null
    if (funnel) {
      const funnelService = await getFunnelService()
      
      updatedFunnel = await funnelService.updateFunnel(
        {
          ...funnel,
          courseId: course.id
        },
        course.title,
        language
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        course: updatedCourse,
        modules: updatedModules,
        landing: updatedLanding,
        funnel: updatedFunnel,
      },
      message: 'Course updated successfully from provided content',
    })
    
  } catch (error) {
    logError('Error updating course from content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
