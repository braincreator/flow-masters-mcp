import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCourseService } from '@/services/courses/courseService'
import { getLandingService } from '@/services/landing/landingService'
import { getFunnelService } from '@/services/funnel/funnelService'

// Схема для урока
const lessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  type: z.enum(['video', 'text', 'quiz', 'assignment']).optional(),
  order: z.number().optional(),
})

// Схема для модуля
const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  lessons: z.array(lessonSchema).min(1),
  order: z.number().optional(),
})

// Схема для курса
const courseSchema = z.object({
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
  author: z.string().optional(), // ID автора
  featuredImage: z.string().optional(), // ID медиа-файла
  layout: z.array(z.any()).optional(), // Содержимое страницы курса
})

// Схема для лендинга
const landingSchema = z
  .object({
    title: z.string().optional(),
    hero: z
      .object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        ctaText: z.string().optional(),
      })
      .optional(),
    sections: z
      .array(
        z.object({
          type: z.string(),
          content: z.any(),
        }),
      )
      .optional(),
  })
  .optional()

// Схема для воронки
const funnelSchema = z
  .object({
    name: z.string().optional(),
    steps: z
      .array(
        z.object({
          name: z.string(),
          id: z.string(),
          triggerType: z.string().optional(),
          content: z.any().optional(),
        }),
      )
      .optional(),
    emailSequence: z
      .array(
        z.object({
          subject: z.string(),
          content: z.string(),
          delay: z.number().optional(),
          triggerEvent: z.string().optional(),
        }),
      )
      .optional(),
  })
  .optional()

// Общая схема запроса
const requestSchema = z.object({
  course: courseSchema,
  landing: landingSchema,
  funnel: funnelSchema,
  language: z.enum(['en', 'ru']).default('ru'),
})

export async function POST(req: Request) {
  try {
    // Парсим и валидируем запрос
    const body = await req.json()
    const { course, landing, funnel, language } = requestSchema.parse(body)

    // Получаем сервисы
    const courseService = await getCourseService()

    // Создаем курс в CMS
    const { course: createdCourse, modules: createdModules } = await courseService.createCourse(
      course,
      language,
    )

    // Создаем лендинг, если он предоставлен
    let createdLanding = null

    if (landing) {
      const landingService = await getLandingService()

      createdLanding = await landingService.createLanding(
        {
          ...landing,
          courseId: createdCourse.id,
        },
        course.title,
        language,
      )
    }

    // Настраиваем воронку, если она предоставлена
    let createdFunnel = null
    if (funnel) {
      const funnelService = await getFunnelService()

      createdFunnel = await funnelService.createFunnel(
        {
          name: funnel.name || `${course.title} Funnel`,
          courseId: createdCourse.id,
          steps: funnel.steps,
          emailSequence: funnel.emailSequence,
        },
        course.title,
        language,
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        course: createdCourse,
        modules: createdModules,
        landing: createdLanding,
        funnel: createdFunnel,
      },
      message: 'Course created successfully from provided content',
    })
  } catch (error) {
    console.error('Error creating course from content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
