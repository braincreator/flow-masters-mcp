#!/usr/bin/env node

/**
 * Simple script to create AI Agency services using direct MongoDB connection
 * Run with: node src/scripts/simple-create-services.js
 */

const { MongoClient } = require('mongodb')

const MONGO_URL = 'mongodb://localhost:27017'
const DB_NAME = 'flow-masters'

// Русские услуги - консультации (3 уровня)
const consultationServices = [
  {
    title: 'Экспресс-консультация по ИИ',
    serviceType: 'consultation',
    shortDescription:
      'Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'За 30 минут определим наиболее перспективные направления для внедрения искусственного интеллекта в ваши бизнес-процессы. Получите четкое понимание возможностей и приоритетов автоматизации.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 3000,
    isPriceStartingFrom: false,
    duration: 30,
    status: 'published',
    slug: 'express-ai-consultation',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'Экспресс-анализ процессов',
        description: 'Быстрая оценка 2-3 ключевых бизнес-процессов на предмет автоматизации',
        included: true,
      },
      {
        name: 'Приоритизация возможностей',
        description: 'Определение наиболее перспективных направлений для внедрения ИИ',
        included: true,
      },
      {
        name: 'Предварительная оценка ROI',
        description: 'Ориентировочный расчет эффекта от автоматизации',
        included: true,
      },
      {
        name: 'Рекомендации по инструментам',
        description: 'Краткий обзор подходящих ИИ-решений',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'express-consulting',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: false,
      additionalInfoFields: [],
      additionalInfoRequired: false,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Экспресс-консультация по ИИ | Быстрая оценка потенциала автоматизации',
      description:
        'Быстрая 30-минутная консультация по возможностям ИИ. Выявление приоритетных точек автоматизации, предварительная оценка ROI, рекомендации по инструментам.',
    },
  },
  {
    title: 'Стандартная консультация по ИИ',
    serviceType: 'consultation',
    shortDescription: 'Углубленный 90-минутный анализ с детальным планом внедрения и ROI-расчетами',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Комплексная консультация с глубоким анализом бизнес-процессов, детальным планом внедрения ИИ и точными расчетами эффективности.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 8000,
    isPriceStartingFrom: false,
    duration: 90,
    status: 'published',
    slug: 'standard-ai-consultation',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'Глубокий анализ процессов',
        description: 'Детальное изучение всех бизнес-процессов компании',
        included: true,
      },
      {
        name: 'План внедрения ИИ',
        description: 'Пошаговый план реализации с временными рамками',
        included: true,
      },
      {
        name: 'ROI-расчеты',
        description: 'Точные расчеты окупаемости инвестиций',
        included: true,
      },
      {
        name: 'Техническое задание',
        description: 'Готовое ТЗ для разработчиков',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'standard-consulting',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: true,
      additionalInfoFields: [
        {
          fieldName: 'company_size',
          fieldLabel: 'Размер компании',
          fieldType: 'select',
          required: true,
          options: [
            { label: '1-10 сотрудников', value: 'small' },
            { label: '11-50 сотрудников', value: 'medium' },
            { label: '51+ сотрудников', value: 'large' },
          ],
        },
      ],
      additionalInfoRequired: true,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Стандартная консультация по ИИ | Детальный план внедрения',
      description:
        'Углубленная 90-минутная консультация с детальным планом внедрения ИИ, ROI-расчетами и готовым техническим заданием.',
    },
  },
  {
    title: 'Премиум консультация по ИИ',
    serviceType: 'consultation',
    shortDescription:
      'VIP-сессия 3 часа с экспертом, включая стратегию, техзадание и план реализации',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Эксклюзивная консультация с топ-экспертом по ИИ. Полная стратегия внедрения, готовое техническое задание и пошаговый план реализации.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 25000,
    isPriceStartingFrom: false,
    duration: 180,
    status: 'published',
    slug: 'premium-ai-consultation',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'VIP-консультация с экспертом',
        description: 'Персональная работа с топ-экспертом по ИИ',
        included: true,
      },
      {
        name: 'Полная стратегия внедрения',
        description: 'Комплексная стратегия с учетом специфики бизнеса',
        included: true,
      },
      {
        name: 'Готовое техзадание',
        description: 'Детальное ТЗ для немедленного старта разработки',
        included: true,
      },
      {
        name: 'План реализации',
        description: 'Пошаговый план с временными рамками и бюджетом',
        included: true,
      },
      {
        name: 'Поддержка 30 дней',
        description: 'Месяц консультационной поддержки после сессии',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'premium-consulting',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: true,
      additionalInfoFields: [
        {
          fieldName: 'company_info',
          fieldLabel: 'Информация о компании',
          fieldType: 'textarea',
          required: true,
          description: 'Расскажите о вашей компании, основных процессах и целях',
        },
        {
          fieldName: 'current_challenges',
          fieldLabel: 'Текущие вызовы',
          fieldType: 'textarea',
          required: true,
          description: 'Опишите основные проблемы, которые хотите решить с помощью ИИ',
        },
      ],
      additionalInfoRequired: true,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Премиум консультация по ИИ | VIP-сессия с экспертом',
      description:
        'Эксклюзивная 3-часовая консультация с топ-экспертом. Полная стратегия внедрения ИИ, готовое техзадание и план реализации.',
    },
  },
]

// Русские услуги - чат-боты (3 уровня)
const chatbotServices = [
  {
    title: 'Базовый ИИ-чатбот',
    serviceType: 'development',
    shortDescription: 'Простой чат-бот для одной платформы с базовым ИИ и готовыми сценариями',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Создаем умного чат-бота для Telegram, WhatsApp или веб-сайта с интеграцией нейросетей и готовыми сценариями общения.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 25000,
    isPriceStartingFrom: true,
    duration: 480,
    status: 'published',
    slug: 'basic-ai-chatbot',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Одна платформа',
        description: 'Telegram, WhatsApp или веб-сайт на выбор',
        included: true,
      },
      {
        name: 'Базовый ИИ',
        description: 'Интеграция с GPT-3.5 или аналогом',
        included: true,
      },
      {
        name: 'Готовые сценарии',
        description: '5-10 готовых диалоговых сценариев',
        included: true,
      },
      {
        name: 'Базовая настройка',
        description: 'Настройка и запуск бота',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 50,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Базовый ИИ-чатбот | Умный помощник для бизнеса',
      description:
        'Создание базового ИИ-чатбота для Telegram, WhatsApp или веб-сайта. Готовые сценарии, интеграция с нейросетями.',
    },
  },
  {
    title: 'Стандартный ИИ-чатбот',
    serviceType: 'development',
    shortDescription: 'Продвинутый чат-бот с интеграциями, аналитикой и мультиплатформенностью',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Многофункциональный чат-бот с интеграцией CRM, аналитикой, персонализацией и поддержкой нескольких платформ.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 45000,
    isPriceStartingFrom: true,
    duration: 720,
    status: 'published',
    slug: 'standard-ai-chatbot',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Мультиплатформенность',
        description: '2-3 платформы одновременно',
        included: true,
      },
      {
        name: 'Продвинутый ИИ',
        description: 'GPT-4 или аналог с тонкой настройкой',
        included: true,
      },
      {
        name: 'CRM интеграция',
        description: 'Подключение к вашей CRM-системе',
        included: true,
      },
      {
        name: 'Аналитика',
        description: 'Детальная статистика и отчеты',
        included: true,
      },
      {
        name: 'Персонализация',
        description: 'Адаптация под каждого пользователя',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 50,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Стандартный ИИ-чатбот | Мультиплатформенное решение',
      description:
        'Продвинутый ИИ-чатбот с CRM интеграцией, аналитикой и поддержкой нескольких платформ.',
    },
  },
  {
    title: 'Премиум ИИ-чатбот',
    serviceType: 'development',
    shortDescription:
      'Корпоративный чат-бот с продвинутым ИИ, интеграциями и полной автоматизацией',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Корпоративное решение с продвинутым ИИ, полной интеграцией с бизнес-системами, аналитикой и автоматизацией процессов.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 85000,
    isPriceStartingFrom: true,
    duration: 1440,
    status: 'published',
    slug: 'premium-ai-chatbot',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Все платформы',
        description: 'Telegram, WhatsApp, веб, мобильные приложения',
        included: true,
      },
      {
        name: 'Корпоративный ИИ',
        description: 'Собственная модель или fine-tuning',
        included: true,
      },
      {
        name: 'Полная интеграция',
        description: 'CRM, ERP, базы данных, API',
        included: true,
      },
      {
        name: 'Продвинутая аналитика',
        description: 'BI-дашборды и прогнозная аналитика',
        included: true,
      },
      {
        name: 'Автоматизация процессов',
        description: 'Полная автоматизация бизнес-процессов',
        included: true,
      },
      {
        name: 'Поддержка 6 месяцев',
        description: 'Техническая поддержка и доработки',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 30,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Премиум ИИ-чатбот | Корпоративное решение',
      description:
        'Корпоративный ИИ-чатбот с полной интеграцией, продвинутой аналитикой и автоматизацией процессов.',
    },
  },
]

// Русские услуги - ИИ-агенты
const aiAgentServices = [
  {
    title: 'ИИ-агенты под ключ',
    serviceType: 'automation',
    shortDescription: 'Умные помощники для автоматизации бизнес-процессов с полной интеграцией',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Создаем персональных ИИ-агентов для автоматизации рутинных задач в вашем бизнесе. Полная интеграция с существующими системами.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 120000,
    isPriceStartingFrom: true,
    duration: 2160,
    status: 'published',
    slug: 'ai-agents-turnkey',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Персональные ИИ-агенты',
        description: 'Создание специализированных агентов под ваши задачи',
        included: true,
      },
      {
        name: 'Полная автоматизация',
        description: 'Автоматизация рутинных бизнес-процессов',
        included: true,
      },
      {
        name: 'Интеграция с системами',
        description: 'Подключение к CRM, ERP, базам данных',
        included: true,
      },
      {
        name: 'Обучение и настройка',
        description: 'Обучение команды работе с ИИ-агентами',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 30,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'ИИ-агенты под ключ | Автоматизация бизнес-процессов',
      description:
        'Создание персональных ИИ-агентов для автоматизации рутинных задач. Полная интеграция с существующими системами.',
    },
  },
]

// Русские услуги - интеграции
const integrationServices = [
  {
    title: 'Интеграция ИИ в процессы',
    serviceType: 'integration',
    shortDescription: 'Консалтинг и внедрение ИИ в существующие бизнес-системы',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Интегрируем ИИ-решения в ваши существующие бизнес-процессы и системы без нарушения текущей работы.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 80000,
    isPriceStartingFrom: true,
    duration: 1920,
    status: 'published',
    slug: 'ai-integration',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Анализ существующих систем',
        description: 'Детальный анализ текущей IT-инфраструктуры',
        included: true,
      },
      {
        name: 'План интеграции',
        description: 'Пошаговый план внедрения ИИ-решений',
        included: true,
      },
      {
        name: 'Безопасная интеграция',
        description: 'Внедрение без нарушения работы систем',
        included: true,
      },
      {
        name: 'Тестирование и оптимизация',
        description: 'Полное тестирование и настройка производительности',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 40,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Интеграция ИИ в процессы | Внедрение в существующие системы',
      description:
        'Интеграция ИИ-решений в существующие бизнес-процессы и системы. Безопасное внедрение без нарушения работы.',
    },
  },
]

// Русские услуги - автоворонки
const funnelServices = [
  {
    title: 'Автоворонки и персонализация',
    serviceType: 'automation',
    shortDescription: 'Умные воронки продаж и персональные рекомендации с ИИ',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Создаем автоматизированные воронки продаж с ИИ-персонализацией для максимальной конверсии.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 95000,
    isPriceStartingFrom: true,
    duration: 1440,
    status: 'published',
    slug: 'ai-sales-funnels',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Умные воронки продаж',
        description: 'Автоматизированные воронки с ИИ-логикой',
        included: true,
      },
      {
        name: 'Персонализация контента',
        description: 'Индивидуальный контент для каждого клиента',
        included: true,
      },
      {
        name: 'Прогнозная аналитика',
        description: 'Предсказание поведения клиентов',
        included: true,
      },
      {
        name: 'A/B тестирование',
        description: 'Автоматическое тестирование и оптимизация',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 40,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Автоворонки и персонализация | Умные воронки продаж с ИИ',
      description:
        'Создание автоматизированных воронок продаж с ИИ-персонализацией для максимальной конверсии.',
    },
  },
]

// Английские услуги - консультации
const englishConsultationServices = [
  {
    title: 'Express AI Consultation',
    serviceType: 'consultation',
    shortDescription:
      'Quick 30-minute AI potential assessment with priority automation points identification',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'In 30 minutes, we will identify the most promising areas for implementing artificial intelligence in your business processes. Get a clear understanding of automation opportunities and priorities.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 33,
    isPriceStartingFrom: false,
    duration: 30,
    status: 'published',
    slug: 'express-ai-consultation-en',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'Express Process Analysis',
        description: 'Quick assessment of 2-3 key business processes for automation',
        included: true,
      },
      {
        name: 'Opportunity Prioritization',
        description: 'Identification of the most promising areas for AI implementation',
        included: true,
      },
      {
        name: 'Preliminary ROI Assessment',
        description: 'Approximate calculation of automation benefits',
        included: true,
      },
      {
        name: 'Tool Recommendations',
        description: 'Brief overview of suitable AI solutions',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'express-consulting-en',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: false,
      additionalInfoFields: [],
      additionalInfoRequired: false,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Express AI Consultation | Quick Automation Potential Assessment',
      description:
        'Quick 30-minute AI consultation. Identify priority automation points, preliminary ROI assessment, tool recommendations.',
    },
  },
  {
    title: 'Standard AI Consultation',
    serviceType: 'consultation',
    shortDescription:
      'In-depth 90-minute analysis with detailed implementation plan and ROI calculations',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Comprehensive consultation with deep business process analysis, detailed AI implementation plan and accurate efficiency calculations.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 89,
    isPriceStartingFrom: false,
    duration: 90,
    status: 'published',
    slug: 'standard-ai-consultation-en',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'Deep Process Analysis',
        description: 'Detailed study of all company business processes',
        included: true,
      },
      {
        name: 'AI Implementation Plan',
        description: 'Step-by-step implementation plan with timelines',
        included: true,
      },
      {
        name: 'ROI Calculations',
        description: 'Accurate return on investment calculations',
        included: true,
      },
      {
        name: 'Technical Specifications',
        description: 'Ready technical specifications for developers',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'standard-consulting-en',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: true,
      additionalInfoFields: [
        {
          fieldName: 'company_size',
          fieldLabel: 'Company Size',
          fieldType: 'select',
          required: true,
          options: [
            { label: '1-10 employees', value: 'small' },
            { label: '11-50 employees', value: 'medium' },
            { label: '51+ employees', value: 'large' },
          ],
        },
      ],
      additionalInfoRequired: true,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Standard AI Consultation | Detailed Implementation Plan',
      description:
        'In-depth 90-minute consultation with detailed AI implementation plan, ROI calculations and ready technical specifications.',
    },
  },
  {
    title: 'Premium AI Consultation',
    serviceType: 'consultation',
    shortDescription:
      'VIP 3-hour session with expert, including strategy, technical specifications and implementation plan',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Exclusive consultation with top AI expert. Complete implementation strategy, ready technical specifications and step-by-step implementation plan.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 278,
    isPriceStartingFrom: false,
    duration: 180,
    status: 'published',
    slug: 'premium-ai-consultation-en',
    requiresBooking: true,
    requiresPayment: true,
    features: [
      {
        name: 'VIP Expert Consultation',
        description: 'Personal work with top AI expert',
        included: true,
      },
      {
        name: 'Complete Implementation Strategy',
        description: 'Comprehensive strategy tailored to your business',
        included: true,
      },
      {
        name: 'Ready Technical Specifications',
        description: 'Detailed specs for immediate development start',
        included: true,
      },
      {
        name: 'Implementation Plan',
        description: 'Step-by-step plan with timelines and budget',
        included: true,
      },
      {
        name: '30-Day Support',
        description: 'Month of consultation support after session',
        included: true,
      },
    ],
    bookingSettings: {
      provider: 'calendly',
      calendlyUsername: 'flow-masters',
      calendlyEventType: 'premium-consulting-en',
      hideEventTypeDetails: true,
      hideGdprBanner: true,
      enableAdditionalInfo: true,
      additionalInfoFields: [
        {
          fieldName: 'company_info',
          fieldLabel: 'Company Information',
          fieldType: 'textarea',
          required: true,
          description: 'Tell us about your company, main processes and goals',
        },
        {
          fieldName: 'current_challenges',
          fieldLabel: 'Current Challenges',
          fieldType: 'textarea',
          required: true,
          description: 'Describe main problems you want to solve with AI',
        },
      ],
      additionalInfoRequired: true,
    },
    paymentSettings: {
      paymentType: 'full_prepayment',
      prepaymentPercentage: 100,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Premium AI Consultation | VIP Expert Session',
      description:
        'Exclusive 3-hour consultation with top expert. Complete AI implementation strategy, ready specifications and implementation plan.',
    },
  },
]

// Английские услуги - чат-боты
const englishChatbotServices = [
  {
    title: 'Basic AI Chatbot',
    serviceType: 'development',
    shortDescription: 'Simple chatbot for one platform with basic AI and ready-made scenarios',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'We create smart chatbots for Telegram, WhatsApp or website with neural network integration and ready-made conversation scenarios.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 278,
    isPriceStartingFrom: true,
    duration: 480,
    status: 'published',
    slug: 'basic-ai-chatbot-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Single Platform',
        description: 'Telegram, WhatsApp or website of your choice',
        included: true,
      },
      {
        name: 'Basic AI',
        description: 'Integration with GPT-3.5 or equivalent',
        included: true,
      },
      {
        name: 'Ready Scenarios',
        description: '5-10 ready-made dialogue scenarios',
        included: true,
      },
      {
        name: 'Basic Setup',
        description: 'Bot configuration and launch',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 50,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Basic AI Chatbot | Smart Business Assistant',
      description:
        'Creating basic AI chatbot for Telegram, WhatsApp or website. Ready scenarios, neural network integration.',
    },
  },
  {
    title: 'Standard AI Chatbot',
    serviceType: 'development',
    shortDescription: 'Advanced chatbot with integrations, analytics and multi-platform support',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Multi-functional chatbot with CRM integration, analytics, personalization and support for multiple platforms.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 500,
    isPriceStartingFrom: true,
    duration: 720,
    status: 'published',
    slug: 'standard-ai-chatbot-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Multi-Platform',
        description: '2-3 platforms simultaneously',
        included: true,
      },
      {
        name: 'Advanced AI',
        description: 'GPT-4 or equivalent with fine-tuning',
        included: true,
      },
      {
        name: 'CRM Integration',
        description: 'Connection to your CRM system',
        included: true,
      },
      {
        name: 'Analytics',
        description: 'Detailed statistics and reports',
        included: true,
      },
      {
        name: 'Personalization',
        description: 'Adaptation for each user',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 50,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Standard AI Chatbot | Multi-Platform Solution',
      description:
        'Advanced AI chatbot with CRM integration, analytics and support for multiple platforms.',
    },
  },
  {
    title: 'Premium AI Chatbot',
    serviceType: 'development',
    shortDescription: 'Enterprise chatbot with advanced AI, integrations and full automation',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'Enterprise solution with advanced AI, full integration with business systems, analytics and process automation.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 944,
    isPriceStartingFrom: true,
    duration: 1440,
    status: 'published',
    slug: 'premium-ai-chatbot-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'All Platforms',
        description: 'Telegram, WhatsApp, web, mobile apps',
        included: true,
      },
      {
        name: 'Enterprise AI',
        description: 'Custom model or fine-tuning',
        included: true,
      },
      {
        name: 'Full Integration',
        description: 'CRM, ERP, databases, APIs',
        included: true,
      },
      {
        name: 'Advanced Analytics',
        description: 'BI dashboards and predictive analytics',
        included: true,
      },
      {
        name: 'Process Automation',
        description: 'Full business process automation',
        included: true,
      },
      {
        name: '6-Month Support',
        description: 'Technical support and improvements',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 30,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'Premium AI Chatbot | Enterprise Solution',
      description:
        'Enterprise AI chatbot with full integration, advanced analytics and process automation.',
    },
  },
]

// Английские услуги - ИИ-агенты
const englishAiAgentServices = [
  {
    title: 'AI Agents Turnkey',
    serviceType: 'automation',
    shortDescription: 'Smart assistants for business process automation with full integration',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'We create personal AI agents to automate routine tasks in your business. Full integration with existing systems.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 1333,
    isPriceStartingFrom: true,
    duration: 2160,
    status: 'published',
    slug: 'ai-agents-turnkey-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Personal AI Agents',
        description: 'Creating specialized agents for your tasks',
        included: true,
      },
      {
        name: 'Full Automation',
        description: 'Automation of routine business processes',
        included: true,
      },
      {
        name: 'System Integration',
        description: 'Connection to CRM, ERP, databases',
        included: true,
      },
      {
        name: 'Training & Setup',
        description: 'Team training on working with AI agents',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 30,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'AI Agents Turnkey | Business Process Automation',
      description:
        'Creating personal AI agents for routine task automation. Full integration with existing systems.',
    },
  },
]

// Английские услуги - интеграции
const englishIntegrationServices = [
  {
    title: 'AI Integration into Processes',
    serviceType: 'integration',
    shortDescription: 'Consulting and AI implementation into existing business systems',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'We integrate AI solutions into your existing business processes and systems without disrupting current operations.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 889,
    isPriceStartingFrom: true,
    duration: 1920,
    status: 'published',
    slug: 'ai-integration-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Existing Systems Analysis',
        description: 'Detailed analysis of current IT infrastructure',
        included: true,
      },
      {
        name: 'Integration Plan',
        description: 'Step-by-step AI solution implementation plan',
        included: true,
      },
      {
        name: 'Safe Integration',
        description: 'Implementation without disrupting system operations',
        included: true,
      },
      {
        name: 'Testing & Optimization',
        description: 'Complete testing and performance tuning',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 40,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'AI Integration into Processes | Implementation into Existing Systems',
      description:
        'AI solution integration into existing business processes and systems. Safe implementation without disrupting operations.',
    },
  },
]

// Английские услуги - автоворонки
const englishFunnelServices = [
  {
    title: 'AI Sales Funnels & Personalization',
    serviceType: 'automation',
    shortDescription: 'Smart sales funnels and personal recommendations with AI',
    description: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: 'We create automated sales funnels with AI personalization for maximum conversion.',
              },
            ],
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        version: 1,
      },
    },
    price: 1056,
    isPriceStartingFrom: true,
    duration: 1440,
    status: 'published',
    slug: 'ai-sales-funnels-en',
    requiresBooking: false,
    requiresPayment: true,
    features: [
      {
        name: 'Smart Sales Funnels',
        description: 'Automated funnels with AI logic',
        included: true,
      },
      {
        name: 'Content Personalization',
        description: 'Individual content for each client',
        included: true,
      },
      {
        name: 'Predictive Analytics',
        description: 'Customer behavior prediction',
        included: true,
      },
      {
        name: 'A/B Testing',
        description: 'Automatic testing and optimization',
        included: true,
      },
    ],
    paymentSettings: {
      paymentType: 'partial_prepayment',
      prepaymentPercentage: 40,
    },
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: 'AI Sales Funnels & Personalization | Smart Sales Funnels with AI',
      description:
        'Creating automated sales funnels with AI personalization for maximum conversion.',
    },
  },
]

// Объединяем все услуги
const allServices = [
  ...consultationServices,
  ...chatbotServices,
  ...aiAgentServices,
  ...integrationServices,
  ...funnelServices,
  ...englishConsultationServices,
  ...englishChatbotServices,
  ...englishAiAgentServices,
  ...englishIntegrationServices,
  ...englishFunnelServices,
]

async function createServices() {
  console.log('🚀 Creating AI Agency services...')

  const client = new MongoClient(MONGO_URL)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db(DB_NAME)
    const collection = db.collection('services')

    // Удаляем существующие услуги
    await collection.deleteMany({})
    console.log('🗑️ Cleared existing services')

    // Создаем новые услуги
    for (const service of allServices) {
      try {
        const result = await collection.insertOne(service)
        console.log(`✅ Created service: ${service.title} (${result.insertedId})`)
      } catch (error) {
        console.error(`❌ Error creating service "${service.title}":`, error.message)
      }
    }

    console.log('🎉 Services creation completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
  }
}

// Запускаем скрипт
createServices()
