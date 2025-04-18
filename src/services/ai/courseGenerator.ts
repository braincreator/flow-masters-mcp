import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import JSON5 from 'json5'
// We'll use OpenAI client for DeepSeek as they have compatible APIs

export interface AIProvider {
  generate(prompt: string, model: string, temperature: number): Promise<string>
}

// Доступные CMS-блоки из системы (обновлено согласно текущей реализации)
const CMS_BLOCKS = {
  landing: {
    hero: ['DynamicVideoHero', 'InteractiveCalculatorHero', 'GradientTextHero'],
    features: ['ThreeColumnFeatures', 'ComparisonTable', 'ProgressBarsGrid'],
    testimonials: ['VideoTestimonialsSlider', 'LogoCloud', 'CaseStudyCards'],
    cta: ['CountdownTimerCTA', 'QuizLeadGen', 'ConsultationBooking'],
  },
  course: {
    content: [
      'VideoLectureBlock',
      'InteractiveSimulation',
      'PeerReviewAssignment',
      'LiveWorkshopEmbed',
      'ResourceLibrary',
    ],
    pricing: ['TieredPricingTable', 'MoneyBackGuarantee', 'BonusPackages', 'PaymentPlanCalculator'],
  },
  funnel: {
    steps: [
      'LeadMagnetForm',
      'NurtureEmailSequence',
      'WebinarRegistration',
      'UpsellSequencer',
      'AlumniPortal',
    ],
  },
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
  provider?:
    | 'openai'
    | 'google'
    | 'deepseek'
    | 'anthropic'
    | 'openrouter'
    | 'requesty'
    | 'mistral'
    | 'openai-compatible'
  model?: string // Принимаем любую строку как ID модели
  apiKey?: string
  baseUrl?: string
  temperature?: number
  style?: 'academic' | 'conversational' | 'professional'
  focus?: 'theory' | 'practice' | 'balanced'
  industrySpecific?: string
  includeResources?: boolean
  includeAssignments?: boolean
  price?: number
  audienceType?: string
  keyThemes?: string[]
}

// Тип для возвращаемого значения
export interface CourseStructure {
  course: {
    title: string
    excerpt: string
    description: string
    difficulty: string
    estimatedDuration: string
    learningOutcomes: string[]
    requirements: string[]
    targetAudience: string[]
    modules: {
      title: string
      description: string
      lessons: {
        title: string
        description: string
        duration: string
        type: string
      }[]
    }[]
  }
  landing?: {
    hero: {
      heading: string
      subheading: string
      ctaText: string
    }
    sections: {
      type: string
      content: {
        heading: string
        features?: {
          title: string
          description: string
          icon: string
        }[]
        [key: string]: any
      }
    }[]
  }
  funnel?: {
    name: string
    steps: {
      name: string
      id: string
      triggerType: string
    }[]
    emailSequence: {
      subject: string
      content: string
      delay: number
      triggerEvent: string
    }[]
  }
}

/**
 * Генерирует структуру курса с помощью различных AI провайдеров
 */
export async function generateCourseStructure(
  params: CourseGenerationParams,
): Promise<CourseStructure> {
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
    } else if (provider === 'anthropic') {
      // Для Anthropic используем OpenAI клиент с базовым URL для Claude API
      // В реальном приложении лучше использовать официальный SDK Anthropic
      client = new OpenAI({ apiKey })
    } else {
      // Default to OpenAI
      client = new OpenAI({ apiKey })
    }

    // Используем параметры из запроса или значения по умолчанию
    const _moduleCount = params.moduleCount || 3
    const _lessonCount = params.lessonCount || 3
    const model = params.model || 'gpt-4-turbo'
    const temperature = params.temperature || 0.7
    const style = params.style || 'professional'
    const focus = params.focus || 'balanced'

    // Формируем системный промпт

    // Создаем стилистические инструкции
    let styleInstructions = ''
    if (style === 'academic') {
      styleInstructions = `
        Используй академический стиль изложения с формальным языком и строгой структурой.
        Включай ссылки на исследования, научные работы и авторитетные источники.
        Используй профессиональную терминологию с пояснениями для сложных концепций.
        Структурируй материал логически, от фундаментальных концепций к более сложным идеям.
      `
    } else if (style === 'conversational') {
      styleInstructions = `
        Используй разговорный стиль изложения с простым языком и прямым обращением к ученику.
        Добавляй истории, примеры из жизни и аналогии для лучшего понимания.
        Задавай риторические вопросы, чтобы стимулировать размышления.
        Используй дружелюбный, вовлекающий тон, как будто ведешь диалог с учеником.
        Избегай сложных терминов без объяснений, делай материал доступным для понимания.
      `
    } else {
      styleInstructions = `
        Используй профессиональный стиль изложения с четким и понятным языком.
        Сочетай экспертность с доступностью - объясняй сложные концепции простыми словами.
        Включай примеры из реальной практики и кейсы из индустрии.
        Используй точные формулировки и конкретные рекомендации.
        Структурируй информацию в виде пошаговых инструкций, где это уместно.
      `
    }

    // Создаем инструкции по фокусу
    let focusInstructions = ''
    if (focus === 'theory') {
      focusInstructions = `
        Сделай акцент на теоретических знаниях и концепциях.
        Глубоко раскрывай фундаментальные принципы и методологии.
        Объясняй причинно-следственные связи и теоретические основы.
        Включай исторический контекст и эволюцию идей в данной области.
        Рассматривай различные теоретические подходы и школы мысли.
      `
    } else if (focus === 'practice') {
      focusInstructions = `
        Сделай акцент на практических навыках и применении знаний.
        Включай пошаговые руководства, инструкции и алгоритмы действий.
        Добавляй реальные примеры использования и сценарии применения.
        Фокусируйся на развитии конкретных умений и компетенций.
        Предлагай практические задания с разбором решений.
        Включай советы по преодолению типичных трудностей и ошибок.
      `
    } else {
      focusInstructions = `
        Сбалансируй теоретические знания и практические навыки.
        Сначала объясняй теоретические концепции, затем показывай их практическое применение.
        Связывай теорию с практикой через примеры и кейсы.
        Предлагай упражнения для закрепления теоретического материала.
        Включай как фундаментальные знания, так и прикладные аспекты.
      `
    }

    // Дополнительные инструкции по ресурсам
    let resourcesInstructions = ''
    if (params.includeResources) {
      resourcesInstructions = `
        Добавь список полезных ресурсов для каждого модуля, включая:
        - Книги и учебные пособия (с авторами и годами издания)
        - Онлайн-курсы и образовательные платформы
        - Статьи, исследования и научные работы
        - Инструменты, программное обеспечение и сервисы
        - Сообщества, форумы и группы для дальнейшего обучения
        - Видеоматериалы, подкасты и другие медиа-ресурсы
        Для каждого ресурса добавь краткое описание его ценности и применимости.
      `
    }

    // Дополнительные инструкции по заданиям
    let assignmentsInstructions = ''
    if (params.includeAssignments) {
      assignmentsInstructions = `
        Добавь практические задания для каждого модуля, включая:
        - Задания разного уровня сложности (от базовых до продвинутых)
        - Проекты, кейсы и сценарии из реальной практики
        - Задачи на применение полученных знаний в новых контекстах
        - Творческие задания для развития критического мышления
        - Групповые проекты и индивидуальные задания
        - Критерии оценки и рубрики для самопроверки
        - Подсказки и направляющие вопросы для выполнения сложных заданий
      `
    }

    // Инструкции по отраслевой специфике
    let industryInstructions = ''
    if (params.industrySpecific) {
      industryInstructions = `
        Сделай курс специфичным для отрасли: ${params.industrySpecific}.
        Используй терминологию, примеры и кейсы из этой отрасли.
        Адаптируй содержание к актуальным трендам и вызовам в данной сфере.
        Включай отраслевые стандарты, лучшие практики и регуляторные аспекты.
        Рассматривай типичные рабочие процессы и должностные обязанности специалистов в этой области.
      `
    }

    // Создаем инструкции по языку
    let languageInstructions = ''
    if (params.language === 'en') {
      languageInstructions = `
        Generate all content in English.
        Use English terminology, examples, and cultural references.
        Ensure proper English grammar, spelling, and punctuation.
        Adapt all examples and case studies to be relevant for English-speaking audiences.
      `
    } else {
      // По умолчанию используем русский язык
      languageInstructions = `
        Генерируй весь контент на русском языке.
        Используй русскую терминологию, примеры и культурные референсы.
        Следи за правильной русской грамматикой, орфографией и пунктуацией.
        Адаптируй все примеры и кейсы так, чтобы они были актуальны для русскоязычной аудитории.
      `
    }

    // Объединяем все дополнительные инструкции
    const additionalInstructions = [
      languageInstructions,
      resourcesInstructions,
      assignmentsInstructions,
      industryInstructions,
    ]
      .filter(Boolean)
      .join('')

    // Определяем базовый промпт в зависимости от языка
    const basePrompt =
      params.language === 'en'
        ? `You are the Chief Learning Officer of a premium educational platform. Create a MasterClass-level course with Enterprise-level marketing infrastructure.`
        : `Ты - Chief Learning Officer премиум-образовательной платформы. Создай курс уровня MasterClass с маркетинговой инфраструктурой Enterprise-уровня.`

    const systemPrompt = `${basePrompt}

# Педагогический дизайн (Educational Design):
1. Методологическая основа:
• Модель обучения: Bloom's Taxonomy (Revised) + Kirkpatrick's Four Levels
• Формат: Adaptive Learning Paths с AI-трекингом прогресса
• Контент-микс на модуль (9 типов):
  - Видео-лекции (HDR, 4K, multi-angle)
  - Кейс-лаборатории (Real-World Simulations)
  - Экспертные AMA-сессии
  - Интерактивные чеклисты с автоматической проверкой
  - Шаблоны документов с AI-аналитикой
  - Peer Review задания с калибровкой оценок
  - Живые мастермайнды (Live Event Framework)
  - VR-симуляции рабочих сценариев
  - Мини-проекты с портфолио-выходом

2. Система оценивания:
• Диагностика: Pre-Assessment + Gap Analysis
• Формирующее оценивание: AI-powered Feedback Loop
• Итоговый экзамен: Proctored Exam + Практический кейс
• Predictive Analytics: Оценка карьерного потенциала

# Маркетинговая архитектура (Growth Engine):
1. Лендинг-конструктор (Landing Page Architect):
• Hero-блоки премиум-класса:
  [LS-ULTRA] 3D-конфигуратор программы
  [LS-HYPER] AR-превью результатов
  [LS-NEURO] Neuro-оптимизированный заголовок

• USP-формулировки:
  - Data-Driven: "87% выпускников повышают доход в 3x за 6 мес (internal data)"
  - Outcome-Based: "Гарантированный переход на позицию Senior Level"
  - FOMO-механика: "Доступ только для топ 5% специалистов"

2. Продающая воронка (Revenue Funnel):
• Многоуровневая архитектура:
  1. AI-Powered Lead Scoring
  2. Personalized Nurture Sequence (7 touchpoints)
  3. Executive Webinar с live демо-решением
  4. VIP-стратегическая сессия
  5. Ценностно-ориентированное предложение
  6. Dynamic Upsell Engine
  7. Alumni Success Program

• Персонализация:
  - Интеграция с CRM/Marketing Automation
  - Predictive Lead Routing
  - Real-Time Offer Customization

3. Нейромаркетинг (Neuro-Marketing Triggers):
• Принципы:
  - Визуальный приоритет (F-паттерн)
  - Эмоциональный якорь (Peak-End Rule)
  - Когнитивная легкость (Cognitive Fluency)
• Механики:
  - Scarcity 2.0: Динамическое ограничение мест
  - Social Proof 2.0: Видео-отзывы с верифицированными результатами
  - Authority Stack: Партнерские сертификаты

# Система контроля качества (QMS):
1. Международные стандарты:
• Аккредитация: AACSB, EQUIS, AMBA
• Соответствие: ISO 21001, QAA Benchmark
• Сертификация: Coursera Level5, Udemy Pro

2. Технические требования:
• Производительность: <2s TTI, 100k RPS
• Безопасность: GDPR, CCPA, ISO 27001
• Доступность: WCAG 2.1 AAA, ADA Compliance

3. Контент-аудит:
• Стилистика: AP Style + Academic Tone
• Визуал: Brand Guidelines + Motion Design
• Интерактивность: 85+ баллов Lighthouse

Генерируй контент уровня Fortune 500 Corporate Academy. Форматы нового поколения:
• Nano-Learning: 5-7 минутные микро-модули
• AI-Coaching: Персональный цифровой наставник
• Metaverse Classrooms: Immersive Learning Experience
• Blockchain Certification: NFT-сертификаты с верификацией

# Форматы контента:
- Bite-sized learning: модули ≤30 мин
- Gamification: бейджи/рейтинги
- AI-персонализация
- Interactive storytelling

# Основные требования к курсу:
1. Глубина проработки:
- Использовать модель обучения Bloom's Taxonomy для структурирования целей
- Внедрить 7 типов контента на модуль: видео, кейсы, чеклисты, шаблоны, интервью, интерактивные симуляции, peer-review задания
- Реализовать прогрессивную сложность: Basic → Advanced → Expert уровни в каждом модуле

2. Методология подачи:
- Применить подход 70/20/10 (70% практики, 20% обратной связи, 10% теории)
- Встроить микрообучение с уроками до 15 минут
- Добавить ветвление сценариев обучения по результатам тестов

3. Маркетинговая инфраструктура:
// Лендинг-пейдж //
▸ Применить многослойную структуру AIDA:
[Attention] - Заголовок с цифрами и power words ("Освойте ${params.topic} за 21 день: 92% выпускников увеличили доход на 200%+")
[Interest] - 3 ключевые боли аудитории + агентация
[Desire] - USP в формате "Как [${params.topic}] поможет [конкретный результат] за [срок]"
[Action] - CTA с двойным отрицанием ("Не упустите шанс изменить карьеру - начать сейчас")

▸ Обязательные секции:
- Social Proof: 5+ видео-отзывов с транскриптами, логотипы компаний клиентов
- Risk Reversal: 365-дневная гарантия возврата + бонусная консультация
- Scarcity Elements: ограничение по количеству участников/времени
- Value Stack: визуализация ценности пакета (стоимость материалов ≥ $XXXX)

// Продающая воронка //
▸ 7-этапная последовательность:
1. Lead Magnet (чек-лист/диагностика с мгновенной персонализацией)
2. 5-дневная nurture-серия писем с кейс-стори
3. Вебинар с deep-dive анализом индустрии
4. Ограниченное предложение с таймером
5. Страница оплаты с 3-step upsell
6. Onboarding последовательность с gamification
7. Алгоритм удержания через еженедельные мастермайнды

4. Психологические триггеры:
- Эффект IKEA: интерактивная сборка программы
- Теория потерь: "Что вы теряете, откладывая обучение"
- Социальное доказательство: кейсы выпускников с метриками
- Авторитет: экспертная коллаборация с лидерами индустрии

5. Система контроля качества:
▸ Для каждого элемента курса:
- Проверка на соответствие SMART-целям
- А/В тестирование 3 вариантов заголовков
- SEO-оптимизация: плотность ключевых слов 1.5-2.5%
- Accessibility: соответствие WCAG 2.1 AA стандарту

Генерируй контент уровня топовых платформ (Coursera, Udemy, MasterClass). Используй форматы:
- Bite-sized learning: модули ≤30 мин
- Gamification: бейджи, прогресс-бары, рейтинги
- AI-персонализация: адаптивные траектории обучения
- Interactive storytelling: сценарии с ветвлением

Структурируй ответ в JSON с детализацией до уровня подпунктов. Для маркетинг-элементов предусмотри:
- 3 варианта заголовков
- 2 сценария CTA
- Вариации для разных каналов (соцсети, email, PPC)

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

Создай качественный, профессиональный курс с логичной структурой и последовательностью обучения. Ответ должен содержать только корректный JSON, без дополнительных комментариев.`

    let response
    if (provider === 'google') {
      const genAI = client as GoogleGenerativeAI
      const genModel = genAI.getGenerativeModel({ model })
      const result = await genModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text:
                  systemPrompt +
                  '\n\n' +
                  (params.language === 'en'
                    ? `Create a course on the topic "${params.topic}".`
                    : `Создай курс по теме "${params.topic}".`),
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: 8192*2,
        },
      })

      // Получаем текст ответа
      let responseText = result.response.text()

      // Для Google API делаем специальную обработку
      console.log('Raw Google API response:', responseText)

      // Ищем JSON в ответе с помощью регулярного выражения
      const jsonRegex = /\{[\s\S]*\}/
      const jsonMatch = responseText.match(jsonRegex)

      if (jsonMatch) {
        // Если нашли JSON, используем только его
        responseText = jsonMatch[0]
        console.log('Extracted JSON from Google API response:', responseText)
      }

      response = { choices: [{ message: { content: responseText } }] }
    } else if (provider === 'deepseek') {
      const deepseek = client as OpenAI
      response = await deepseek.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              params.language === 'en'
                ? `Create a course on the topic "${params.topic}".`
                : `Создай курс по теме "${params.topic}".`,
          },
        ],
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    } else if (provider === 'anthropic') {
      // Для Anthropic используем тот же формат, что и для OpenAI
      // В реальном приложении нужно использовать официальный SDK Anthropic
      const anthropic = client as OpenAI
      response = await anthropic.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              params.language === 'en'
                ? `Create a course on the topic "${params.topic}".`
                : `Создай курс по теме "${params.topic}".`,
          },
        ],
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    } else {
      // Default to OpenAI
      const openai = client as OpenAI
      response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              params.language === 'en'
                ? `Create a course on the topic "${params.topic}".`
                : `Создай курс по теме "${params.topic}".`,
          },
        ],
        temperature,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      })
    }

    // Получаем ответ и парсим JSON
    let content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error(`Не удалось получить ответ от ${provider}`)
    }

    // Обрабатываем ответ для всех провайдеров
    console.log('Raw content:', content)

    // Ищем JSON в ответе с помощью регулярного выражения
    const jsonRegex = /\{[\s\S]*?\}/g
    const jsonMatches = content.match(jsonRegex)

    if (jsonMatches && jsonMatches.length > 0) {
      // Если нашли несколько JSON-объектов, выбираем самый большой
      let largestJson = jsonMatches[0]
      for (const match of jsonMatches) {
        if (match.length > largestJson.length) {
          largestJson = match
        }
      }

      console.log('Found JSON objects:', jsonMatches.length)
      console.log('Using largest JSON:', largestJson.substring(0, 100) + '...')

      // Используем самый большой JSON-объект
      // content = largestJson
    }

    // // Удаляем маркдаун-разметку для блоков кода, если она есть
    // if (content.includes('```json') || content.includes('```')) {
    //   content = content.replace(/```json\n?/g, '').replace(/```/g, '')
    // }

    // // Удаляем любые символы перед началом JSON
    // const jsonStartIndex = content.indexOf('{')
    // if (jsonStartIndex > 0) {
    //   content = content.substring(jsonStartIndex)
    // }

    // // Удаляем любые символы после конца JSON
    // const lastBraceIndex = content.lastIndexOf('}')
    // if (lastBraceIndex !== -1 && lastBraceIndex < content.length - 1) {
    //   content = content.substring(0, lastBraceIndex + 1)
    // }

    // // Исправляем распространенные ошибки в JSON
    // // 1. Заменяем одиночные кавычки на двойные
    // content = content.replace(/([{,]\s*)(')(.*?)('\s*:)/g, '$1"$3"$4')
    // content = content.replace(/(:\s*)'([^']*)'/g, ':"$2"')

    // // 2. Удаляем запятые после последнего элемента в массивах и объектах
    // content = content.replace(/,\s*([\]\}])/g, '$1')

    // // 3. Добавляем запятые между элементами, где их не хватает
    // content = content.replace(/"\s*\}\s*"\s*:/g, '",":')
    // content = content.replace(/"\s*\]\s*"\s*:/g, '",":')

    // // 4. Исправляем некорректные экранирования в строках
    // content = content.replace(/\\\\n/g, '\\n')

    // // 5. Исправляем незакрытые строки
    // content = content.replace(/([^\\])"([^"]*)(\n)/g, '$1"$2"$3')

    // // 6. Исправляем проблему с переносом строки и кавычкой
    // content = content.replace(/"\n/g, '')
    // content = content.replace(/\n"/g, '')

    // // 7. Заменяем все неэкранированные переносы строк на пробелы
    // content = content.replace(/([^\\])\n/g, '$1 ')

    // // 8. Исправляем отсутствующие закрывающие кавычки перед закрывающей скобкой массива
    // content = content.replace(/([^"\s])\s*\]/g, '$1"\]')

    // // 9. Исправляем отсутствующие закрывающие кавычки перед запятыми в массивах
    // content = content.replace(/([^"\s])\s*,\s*/g, '$1",\n      "')

    // // 10. Удаляем непечатаемые символы и управляющие последовательности
    // content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

    // // 11. Исправляем некорректные символы в строках
    // content = content.replace(/"([^"]*)\t([^"]*)"/, '"$1 $2"')

    // // 12. Исправляем лишние кавычки до и после запятой в строковых значениях
    // // Например: "title": "ABC",      "DEF" -> "title": "ABC, DEF"
    // content = content.replace(/"([^"]+)"\s*,\s*"([^"]+)"/g, '"$1, $2"')

    // // 13. Исправляем несколько раз для случаев с несколькими запятыми
    // for (let i = 0; i < 5; i++) {
    //   content = content.replace(/"([^"]+)"\s*,\s*"([^"]+)"/g, '"$1, $2"')
    // }

    // // 14. Исправляем лишние кавычки внутри объекта
    // // Например: "title": "ABC", "DEF" -> "title": "ABC, DEF"
    // content = content.replace(/("[^"]+")\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,/g, '$1: "$2, $3",')
    // content = content.replace(/("[^"]+")\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*}/g, '$1: "$2, $3"}')

    // // 15. Исправляем специфический случай с title и excerpt
    // content = content.replace(
    //   /"title"\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"excerpt"\s*:/g,
    //   '"title": "$1, $2", "excerpt":',
    // )
    // content = content.replace(
    //   /"excerpt"\s*:\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"description"\s*:/g,
    //   '"excerpt": "$1, $2", "description":',
    // )

    // // 16. Исправляем случай, когда отсутствует закрывающая кавычка и следующее поле включено в значение
    // // Например: "title": "ABC, excerpt": -> "title": "ABC", "excerpt":
    // content = content.replace(/"([^"]+)"\s*:\s*"([^"]+),\s*([^"]+)"\s*:/g, '"$1": "$2", "$3":')

    // // 17. Исправляем специфический случай с title и excerpt
    // content = content.replace(
    //   /"title"\s*:\s*"([^"]+),\s*excerpt"\s*:/g,
    //   '"title": "$1", "excerpt":',
    // )

    // Удаляем все переносы строк
    // content = content.replace(/"\n/g, '')
    // content = content.replace(/\n/g, '')

    // Исправляем случай, когда отсутствует закрывающая кавычка перед закрывающей скобкой
    // Например: "type": "video} -> "type": "video"}
    // content = content.replace(/"([^"]+)"\s*:\s*"([^"]+)\s*\}/g, '"$1": "$2"}')

    // Исправляем случай, когда отсутствует закрывающая кавычка перед закрывающей скобкой массива
    // Например: "type": "video] -> "type": "video"]
    // content = content.replace(/"([^"]+)"\s*:\s*"([^"]+)\s*\]/g, '"$1": "$2"]')

    console.log('Processed content:', content)

    // Парсим JSON и проверяем структуру
    try {
      let parsedContent: CourseStructure

      try {
        // Сначала пробуем стандартный JSON.parse
        parsedContent = JSON.parse(content) as CourseStructure
      } catch (jsonError) {
        console.warn('Standard JSON parsing failed, trying JSON5:', jsonError)
        // Если стандартный парсинг не удался, используем JSON5
        try {
          parsedContent = JSON5.parse(content) as CourseStructure
        } catch (json5Error) {
          console.error('JSON5 parsing also failed:', json5Error)
          // Если и JSON5 не смог парсить, пробуем исправить еще некоторые распространенные ошибки

          // Исправляем некорректные символы переноса строки в строках
          content = content.replace(/([^\\])"([^"]*)\n([^"]*)"/g, '$1"$2\\n$3"')

          // Исправляем некорректные запятые в массивах
          content = content.replace(/\[\s*,/g, '[')
          content = content.replace(/,\s*,/g, ',')

          // Еще одна попытка с JSON5
          try {
            parsedContent = JSON5.parse(content) as CourseStructure
          } catch (finalError) {
            console.error('All parsing attempts failed. Final content:', content)
            throw finalError
          }
        }
      }

      // Проверяем, что есть обязательные поля
      if (!parsedContent.course) {
        throw new Error('Отсутствует обязательное поле "course" в ответе')
      }

      return parsedContent
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw new Error(
        `Не удалось парсить JSON ответ от ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  } catch (error) {
    console.error('Error generating course:', error)
    throw error
  }
}
