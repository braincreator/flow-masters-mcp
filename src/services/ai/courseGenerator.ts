import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
// We'll use OpenAI client for DeepSeek as they have compatible APIs

interface AIProvider {
  generate(prompt: string, model: string, temperature: number): Promise<string>
}

// No need for a separate DeepSeek interface as we'll use OpenAI client

// Типы для параметров генерации курса
export interface CourseGenerationParams {
  topic: string
  targetAudience?: string
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced'
  includeQuizzes?: boolean
  includeLanding?: boolean
  includeFunnel?: boolean
  landingTemplate?: string
  funnelTemplate?: string
  language?: 'en' | 'ru'
  moduleCount?: number
  lessonCount?: number
  provider?: 'openai' | 'google' | 'deepseek'
  model?: 'gpt-4-turbo' | 'gpt-4o' | 'gpt-3.5-turbo' | 'gemini-pro' | 'deepseek-chat'
  apiKey?: string
  temperature?: number
  style?: 'academic' | 'conversational' | 'professional'
  focus?: 'theory' | 'practice' | 'balanced'
  industrySpecific?: string
  includeResources?: boolean
  includeAssignments?: boolean
}

/**
 * Генерирует структуру курса с помощью OpenAI
 */
export async function generateCourseStructure(params: CourseGenerationParams): Promise<any> {
  try {
    const provider = params.provider || 'openai'
    const apiKey = params.apiKey || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('API key is required')
    }

    let client
    if (provider === 'google') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      client = new GoogleGenerativeAI(apiKey)
    } else if (provider === 'deepseek') {
      // Use OpenAI client for DeepSeek with base URL for DeepSeek API
      client = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com/v1', // DeepSeek API endpoint
      })
    } else {
      // Default to OpenAI
      client = new OpenAI({ apiKey })
    }

    // Формируем системный промпт
    const moduleCount = params.moduleCount || 3
    const lessonCount = params.lessonCount || 3
    const model = params.model || 'gpt-4-turbo'
    const temperature = params.temperature || 0.7
    const style = params.style || 'professional'
    const focus = params.focus || 'balanced'

    // Создаем стилистические инструкции
    let styleInstructions = ''
    if (style === 'academic') {
      styleInstructions =
        'Используй академический стиль изложения, с формальным языком и строгой структурой.'
    } else if (style === 'conversational') {
      styleInstructions =
        'Используй разговорный стиль изложения, с простым языком и прямым обращением к ученику.'
    } else {
      styleInstructions = 'Используй профессиональный стиль изложения, с четким и понятным языком.'
    }

    // Создаем инструкции по фокусу
    let focusInstructions = ''
    if (focus === 'theory') {
      focusInstructions = 'Сделай акцент на теоретических знаниях и концепциях.'
    } else if (focus === 'practice') {
      focusInstructions = 'Сделай акцент на практических навыках и применении знаний.'
    } else {
      focusInstructions = 'Сбалансируй теоретические знания и практические навыки.'
    }

    // Дополнительные инструкции
    const additionalInstructions = [
      params.includeResources ? 'Добавь список полезных ресурсов для каждого модуля.' : '',
      params.includeAssignments ? 'Добавь практические задания для каждого модуля.' : '',
      params.industrySpecific
        ? `Сделай курс специфичным для отрасли: ${params.industrySpecific}.`
        : '',
    ]
      .filter(Boolean)
      .join(' ')

    const systemPrompt = `Ты - эксперт по созданию образовательных курсов.
Твоя задача - создать структуру курса по теме "${params.topic}" на ${params.language === 'ru' ? 'русском' : 'английском'} языке.
Курс должен содержать ${moduleCount} модулей, каждый с примерно ${lessonCount} уроками.
${params.difficultyLevel ? `Уровень сложности: ${params.difficultyLevel}` : ''}
${params.targetAudience ? `Целевая аудитория: ${params.targetAudience}` : ''}
${params.includeQuizzes ? 'Включи тесты и задания для проверки знаний.' : ''}
${params.includeLanding ? 'Также создай лендинг для продажи этого курса.' : ''}
${params.includeFunnel ? 'Также создай email-воронку для продвижения этого курса.' : ''}

${styleInstructions}
${focusInstructions}
${additionalInstructions}

Ответ должен быть в формате JSON, соответствующем следующей структуре:
{
  "course": {
    "title": "Название курса",
    "excerpt": "Краткое описание курса",
    "description": "Полное описание курса",
    "difficulty": "beginner/intermediate/advanced",
    "estimatedDuration": "Примерная продолжительность курса",
    "learningOutcomes": ["Что изучат студенты 1", "Что изучат студенты 2", ...],
    "requirements": ["Требование 1", "Требование 2", ...],
    "targetAudience": ["Целевая аудитория 1", "Целевая аудитория 2", ...],
    "modules": [
      {
        "title": "Название модуля 1",
        "description": "Описание модуля 1",
        "lessons": [
          {
            "title": "Название урока 1.1",
            "description": "Описание урока 1.1",
            "duration": "Продолжительность урока",
            "type": "video/text/quiz/assignment"
          },
          ...
        ]
      },
      ...
    ]
  }${
    params.includeLanding
      ? `,
  "landing": {
    "hero": {
      "heading": "Заголовок героя",
      "subheading": "Подзаголовок героя",
      "ctaText": "Текст кнопки"
    },
    "sections": [
      {
        "type": "features",
        "content": {
          "heading": "Заголовок секции",
          "features": [
            {
              "title": "Название фичи",
              "description": "Описание фичи",
              "icon": "icon_name"
            },
            ...
          ]
        }
      },
      ...
    ]
  }`
      : ''
  }${
    params.includeFunnel
      ? `,
  "funnel": {
    "name": "Название воронки",
    "steps": [
      {
        "name": "Название шага",
        "id": "step_id",
        "triggerType": "pageview/form_submit/etc"
      },
      ...
    ],
    "emailSequence": [
      {
        "subject": "Тема письма",
        "content": "Содержимое письма",
        "delay": 0,
        "triggerEvent": "signup"
      },
      ...
    ]
  }`
      : ''
  }
}

Создай качественный, профессиональный курс с логичной структурой и последовательностью обучения.`

    let response
    if (provider === 'google') {
      const genAI = client as GoogleGenerativeAI
      const genModel = genAI.getGenerativeModel({ model })
      const result = await genModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
        ],
      })
      response = { choices: [{ message: { content: result.response.text() } }] }
    } else if (provider === 'deepseek') {
      const deepseek = client as OpenAI
      response = await deepseek.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Создай курс по теме "${params.topic}".` },
        ],
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    } else {
      const openai = client as OpenAI
      response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Создай курс по теме "${params.topic}".` },
        ],
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    }

    // Получаем ответ и парсим JSON
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('Не удалось получить ответ от OpenAI')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating course with OpenAI:', error)
    throw error
  }
}
