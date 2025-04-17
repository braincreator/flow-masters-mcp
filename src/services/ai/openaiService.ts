import OpenAI from 'openai'

// Типы для запросов к OpenAI
export interface GenerateCourseParams {
  topic: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: 'ru' | 'en'
  includeLanding?: boolean
  includeFunnel?: boolean
  moduleCount?: number
  lessonCount?: number
}

export class OpenAIService {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    })
  }

  /**
   * Генерирует структуру курса на основе заданной темы
   */
  async generateCourse(params: GenerateCourseParams): Promise<any> {
    try {
      const { topic, difficulty, language, includeLanding, includeFunnel, moduleCount = 3, lessonCount = 3 } = params

      // Создаем системный промпт
      const systemPrompt = `Ты - эксперт по созданию образовательных курсов. 
Твоя задача - создать структуру курса по теме "${topic}" уровня "${difficulty}" на ${language === 'ru' ? 'русском' : 'английском'} языке.
Курс должен содержать ${moduleCount} модулей, каждый с примерно ${lessonCount} уроками.
${includeLanding ? 'Также создай лендинг для продажи этого курса.' : ''}
${includeFunnel ? 'Также создай email-воронку для продвижения этого курса.' : ''}

Ответ должен быть в формате JSON, соответствующем следующей структуре:
{
  "course": {
    "title": "Название курса",
    "excerpt": "Краткое описание курса",
    "description": "Полное описание курса",
    "difficulty": "${difficulty}",
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
  }${includeLanding ? `,
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
  }` : ''}${includeFunnel ? `,
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
  }` : ''}
}

Создай качественный, профессиональный курс с логичной структурой и последовательностью обучения.`

      // Отправляем запрос к OpenAI
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Создай курс по теме "${topic}" уровня "${difficulty}" на ${language === 'ru' ? 'русском' : 'английском'} языке.` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      })

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
}

// Создаем экземпляр сервиса
export function getOpenAIService(): OpenAIService {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined in environment variables')
  }
  return new OpenAIService(apiKey)
}
