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
  price?: number
  audienceType?: string
  keyThemes?: string[]
}

/**
 * Генерирует структуру курса с помощью OpenAI
 */
export async function generateCourseStructure(params: CourseGenerationParams): Promise<any> {
  try {
    const validationErrors: string[] = []

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

    // Объединяем все дополнительные инструкции
    const additionalInstructions = [
      resourcesInstructions,
      assignmentsInstructions,
      industryInstructions,
    ]
      .filter(Boolean)
      .join('')

    const systemPrompt = `Ты - Chief Learning Officer премиум-образовательной платформы. Создай курс уровня MasterClass с маркетинговой инфраструктурой Enterprise-уровня.

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

    // Валидация адаптации воронки
    const funnelRules = [
      {
        condition: (course: CourseGenerationParams) =>
          (course.moduleCount || 0) > 5 && (course.lessonCount || 0) > 15,
        required: 'FS-1',
      },
      {
        condition: (course: CourseGenerationParams) => (course.price || 0) > 500,
        required: 'FS-2',
      },
      {
        condition: (course: CourseGenerationParams) => course.audienceType === 'B2B',
        required: 'FS-3',
      },
    ]

    funnelRules.forEach(({ condition, required }) => {
      if (condition(params) && !content.includes(required)) {
        validationErrors.push(`Требуется воронка ${required} для текущих параметров курса`)
      }
    })

    // Проверка интеграции контента
    const requiredCourseTerms = [
      params.topic,
      ...(params.keyThemes || []),
      params.targetAudience,
    ].filter(Boolean)

    requiredCourseTerms.forEach((term) => {
      if (term && !content.toLowerCase().includes(term.toLowerCase())) {
        validationErrors.push(`Отсутствует ключевой термин курса "${term}" в контенте`)
      }
    })

    // Чекер 3: SEO-параметры
    const keywordDensity =
      (content.match(new RegExp(params.topic, 'gi')) || []).length /
      (content.split(' ').length || 1)
    if (keywordDensity < 0.015 || keywordDensity > 0.025) {
      validationErrors.push(
        `Плотность ключевых слов (${(keywordDensity * 100).toFixed(2)}%) вне диапазона 1.5-2.5%`,
      )
    }

    if (validationErrors.length > 0) {
      throw new Error(`Ошибки валидации контента:\n${validationErrors.join('\n')}`)
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error generating course with OpenAI:', error)
    throw error
  }
}
