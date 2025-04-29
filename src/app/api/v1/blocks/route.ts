import { NextRequest, NextResponse } from 'next/server'
import { blocks } from '@/blocks'
import { verifyApiKey } from '@/utilities/auth'
import { getPayloadClient } from '@/utilities/payload/index'

// Define block usage types for better MCP integration
type BlockUsage =
  | 'lead-generation'
  | 'content'
  | 'conversion'
  | 'social-proof'
  | 'navigation'
  | 'general'
type BlockComplexity = 'simple' | 'medium' | 'complex'
type BlockPriority = 'high' | 'medium' | 'low'

interface BlockMetadata {
  usage: BlockUsage[]
  complexity: BlockComplexity
  priority: BlockPriority
  conversionImpact?: 'high' | 'medium' | 'low'
  bestPractices?: string[]
}

/**
 * GET endpoint to retrieve all available blocks for page templates
 * This endpoint is used by MCP to get information about blocks for landing page generation
 */
/**
 * GET endpoint to retrieve all available blocks for page templates
 * This endpoint is used by MCP to get information about blocks for landing page generation
 *
 * Query parameters:
 * - category: Filter blocks by category (e.g. 'Functional', 'Basic')
 * - usage: Filter blocks by usage (e.g. 'lead-generation', 'conversion')
 * - format: Response format ('full' or 'minimal')
 */
export async function GET(req: NextRequest) {
  try {
    // Verify API key if not in development mode
    if (process.env.NODE_ENV !== 'development') {
      const apiKey = req.headers.get('x-api-key')
      if (!apiKey) {
        return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
      }

      // Check if the API key is valid
      const payload = await getPayloadClient()
      const apiKeyQuery = await payload.find({
        collection: 'apiKeys',
        where: {
          key: { equals: apiKey },
          isEnabled: { equals: true },
        },
        limit: 1,
        depth: 0,
      })

      if (apiKeyQuery.docs.length === 0) {
        return NextResponse.json({ error: 'Invalid or disabled API key' }, { status: 403 })
      }
    }

    // Get all blocks and transform them into a more useful format
    const blocksList = Object.entries(blocks).map(([slug, blockConfig]) => {
      // Extract fields information
      const fields =
        blockConfig.fields?.map((field) => {
          // Basic field info
          const fieldInfo: any = {
            name: field.name,
            type: field.type,
            required: field.required || false,
          }

          // Add options for select fields
          if (field.type === 'select' && field.options) {
            fieldInfo.options = field.options
          }

          // Add default value if present
          if ('defaultValue' in field) {
            fieldInfo.defaultValue = field.defaultValue
          }

          return fieldInfo
        }) || []

      // Get additional metadata for the block
      const metadata = getBlockMetadata(slug)

      // Return formatted block info with enhanced metadata
      return {
        slug,
        name: blockConfig.labels?.singular || slug,
        pluralName: blockConfig.labels?.plural || `${slug}s`,
        interfaceName: blockConfig.interfaceName || '',
        description: getBlockDescription(slug),
        category: getBlockCategory(slug),
        fields,
        example: getBlockExample(slug),
        metadata,
        usageScenarios: getBlockUsageScenarios(slug),
        leadGeneration: isLeadGenerationBlock(slug) ? getLeadGenerationInfo(slug) : null,
      }
    })

    // Return the blocks list
    return NextResponse.json({
      success: true,
      data: blocksList,
    })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Get a human-readable description for a block
 */
function getBlockDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    // Basic blocks
    content: 'Блок с текстовым содержимым, поддерживает разделение на колонки разной ширины',
    callToAction: 'Призыв к действию с заголовком, текстом и кнопками',
    urgencyCTA: 'Призыв к действию с элементами срочности (таймер, ограниченное предложение)',
    hero: 'Главный блок страницы с заголовком, подзаголовком, изображением и кнопками',
    features: 'Блок для отображения ключевых особенностей или преимуществ',
    divider: 'Горизонтальный разделитель для визуального разделения контента',
    steps: 'Пошаговая инструкция или процесс с нумерацией',
    accordion: 'Сворачиваемые секции для компактного отображения информации',
    card: 'Карточка с заголовком, изображением и текстом',

    // Media blocks
    media: 'Блок для отображения изображений с подписями',
    code: 'Блок для отображения программного кода с подсветкой синтаксиса',
    video: 'Блок для встраивания видео (YouTube, Vimeo или загруженного)',
    audio: 'Блок для встраивания аудио-плеера',
    carousel: 'Карусель изображений или контента с навигацией',
    gallery: 'Галерея изображений с различными вариантами отображения',
    videoLessons: 'Блок для отображения видео-уроков с дополнительной информацией',

    // Information blocks
    banner: 'Информационный баннер для уведомлений или объявлений',
    faq: 'Часто задаваемые вопросы в формате аккордеона',
    courseFAQ: 'Часто задаваемые вопросы специально для курсов',
    pricingTable: 'Таблица с ценами и сравнением тарифов',
    coursePricingComparison: 'Сравнение различных вариантов цен на курс',
    stats: 'Блок для отображения статистики или ключевых метрик',
    tabs: 'Вкладки для организации контента',
    timeline: 'Временная шкала для отображения событий в хронологическом порядке',
    tableOfContents: 'Оглавление для навигации по длинному контенту',
    roadmap: 'Дорожная карта развития продукта или курса',
    benefitsOutcomes: 'Блок для отображения преимуществ и результатов обучения',
    targetAudience: 'Блок для описания целевой аудитории',
    guarantee: 'Блок с описанием гарантии возврата средств или удовлетворенности',
    socialProofAdvanced: 'Расширенный блок социальных доказательств (отзывы, рейтинги, статистика)',

    // People blocks
    teamMembers: 'Блок для представления команды или преподавателей',
    testimonials: 'Отзывы клиентов или студентов',
    instructorProfile: 'Профиль преподавателя с биографией и квалификацией',

    // Structural blocks
    header: 'Шапка страницы с логотипом и навигацией',
    footer: 'Подвал страницы с контактами и ссылками',

    // Business blocks
    services: 'Блок для отображения предлагаемых услуг',
    caseStudies: 'Примеры успешных кейсов или проектов',
    techStack: 'Технологический стек или используемые инструменты',
    plansComparison: 'Сравнение различных планов или пакетов услуг',

    // Educational blocks
    course: 'Основной блок курса с описанием и структурой',
    curriculum: 'Учебный план или программа курса',
    userProgress: 'Отображение прогресса пользователя в курсе',
    certificates: 'Информация о сертификатах или дипломах',
    resourceLibrary: 'Библиотека ресурсов или дополнительных материалов',
    aiTools: 'Инструменты искусственного интеллекта для обучения',
    leaderboard: 'Таблица лидеров или рейтинг студентов',
    courseOverview: 'Обзор курса с ключевой информацией',
    quizAssessment: 'Тесты и оценки для проверки знаний',
    assignments: 'Задания для выполнения студентами',
    achievementsBlock: 'Достижения и награды в процессе обучения',
    projectShowcase: 'Демонстрация проектов студентов',
    funnelStep: 'Шаг в воронке продаж или конверсии',
    recommendations: 'Рекомендации похожих курсов или материалов',
    popupTriggerConfig: 'Настройка триггеров для всплывающих окон',

    // Product blocks
    productsFilter: 'Фильтр для поиска и сортировки продуктов',
    productsList: 'Список продуктов с карточками и информацией',

    // Functional blocks
    form: 'Форма для сбора данных от пользователей',
    newsletter: 'Форма подписки на рассылку',
    feedback: 'Форма для сбора обратной связи',
    poll: 'Опрос или голосование',
    aiAssistant: 'Блок с AI-ассистентом для помощи пользователям',
    leadMagnetOffer: 'Предложение лид-магнита для сбора контактов',
    discussionForum: 'Форум для обсуждений и вопросов',

    // Blog blocks
    articleHeader: 'Заголовок статьи с метаданными',
    authorBio: 'Информация об авторе',
    blockquote: 'Блок цитаты или выделенного текста',
    comments: 'Секция комментариев',
    relatedPosts: 'Связанные или рекомендуемые статьи',
    socialShare: 'Кнопки для шеринга в социальных сетях',

    // Special blocks
    interactiveDemo: 'Интерактивная демонстрация продукта или функции',
    calendar: 'Календарь событий или расписание',

    // Analytics blocks
    eventTracker: 'Отслеживание событий и действий пользователей',
    reportEmbed: 'Встраивание отчетов или аналитических данных',
  }

  return descriptions[slug] || `Блок типа ${slug}`
}

/**
 * Get the category for a block
 */
function getBlockCategory(slug: string): string {
  // Map of blocks to categories
  const categories: Record<string, string> = {
    // Basic blocks
    content: 'Basic',
    callToAction: 'Basic',
    urgencyCTA: 'Basic',
    hero: 'Basic',
    features: 'Basic',
    divider: 'Basic',
    steps: 'Basic',
    accordion: 'Basic',
    card: 'Basic',

    // Media blocks
    media: 'Media',
    code: 'Media',
    video: 'Media',
    audio: 'Media',
    carousel: 'Media',
    gallery: 'Media',
    videoLessons: 'Media',

    // Information blocks
    banner: 'Information',
    faq: 'Information',
    courseFAQ: 'Information',
    pricingTable: 'Information',
    coursePricingComparison: 'Information',
    stats: 'Information',
    tabs: 'Information',
    timeline: 'Information',
    tableOfContents: 'Information',
    roadmap: 'Information',
    benefitsOutcomes: 'Information',
    targetAudience: 'Information',
    guarantee: 'Information',
    socialProofAdvanced: 'Information',

    // People blocks
    teamMembers: 'People',
    testimonials: 'People',
    instructorProfile: 'People',

    // Structural blocks
    header: 'Structural',
    footer: 'Structural',

    // Business blocks
    services: 'Business',
    caseStudies: 'Business',
    techStack: 'Business',
    plansComparison: 'Business',

    // Educational blocks
    course: 'Educational',
    curriculum: 'Educational',
    userProgress: 'Educational',
    certificates: 'Educational',
    resourceLibrary: 'Educational',
    aiTools: 'Educational',
    leaderboard: 'Educational',
    courseOverview: 'Educational',
    quizAssessment: 'Educational',
    assignments: 'Educational',
    achievementsBlock: 'Educational',
    projectShowcase: 'Educational',
    funnelStep: 'Educational',
    recommendations: 'Educational',
    popupTriggerConfig: 'Educational',

    // Product blocks
    productsFilter: 'Product',
    productsList: 'Product',

    // Functional blocks
    form: 'Functional',
    newsletter: 'Functional',
    feedback: 'Functional',
    poll: 'Functional',
    aiAssistant: 'Functional',
    leadMagnetOffer: 'Functional',
    discussionForum: 'Functional',

    // Blog blocks
    articleHeader: 'Blog',
    authorBio: 'Blog',
    blockquote: 'Blog',
    comments: 'Blog',
    relatedPosts: 'Blog',
    socialShare: 'Blog',

    // Special blocks
    interactiveDemo: 'Special',
    calendar: 'Special',

    // Analytics blocks
    eventTracker: 'Analytics',
    reportEmbed: 'Analytics',
  }

  return categories[slug] || 'Other'
}

/**
 * Get an example usage of a block
 */
function getBlockExample(slug: string): Record<string, any> {
  // Basic examples for common blocks
  const examples: Record<string, any> = {
    hero: {
      blockType: 'hero',
      heading: 'Заголовок Hero блока',
      subheading: 'Подзаголовок с кратким описанием',
      media: {
        type: 'image',
        url: '/images/example-hero.jpg',
        alt: 'Описание изображения',
      },
      actions: [
        {
          label: 'Основная кнопка',
          href: '/action',
          variant: 'primary',
        },
        {
          label: 'Вторичная кнопка',
          href: '/learn-more',
          variant: 'secondary',
        },
      ],
    },
    content: {
      blockType: 'content',
      heading: 'Заголовок блока с контентом',
      subheading: 'Подзаголовок блока',
      columns: [
        {
          size: 'half',
          richText: {
            root: {
              children: [
                {
                  children: [
                    {
                      text: 'Пример текста в первой колонке',
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          size: 'half',
          richText: {
            root: {
              children: [
                {
                  children: [
                    {
                      text: 'Пример текста во второй колонке',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    features: {
      blockType: 'features',
      heading: 'Наши преимущества',
      subheading: 'Почему стоит выбрать нас',
      features: [
        {
          title: 'Первое преимущество',
          description: 'Описание первого преимущества',
          icon: 'star',
        },
        {
          title: 'Второе преимущество',
          description: 'Описание второго преимущества',
          icon: 'shield',
        },
      ],
    },
    callToAction: {
      blockType: 'callToAction',
      heading: 'Готовы начать?',
      content: 'Присоединяйтесь к нам сегодня и получите доступ ко всем возможностям.',
      actions: [
        {
          label: 'Начать сейчас',
          href: '/signup',
          variant: 'primary',
        },
      ],
      background: 'gradient',
    },
    faq: {
      blockType: 'faq',
      heading: 'Часто задаваемые вопросы',
      items: [
        {
          question: 'Первый вопрос?',
          answer: 'Ответ на первый вопрос.',
        },
        {
          question: 'Второй вопрос?',
          answer: 'Ответ на второй вопрос.',
        },
      ],
    },
    leadMagnetOffer: {
      blockType: 'leadMagnetOffer',
      blockName: 'Lead Form Top',
      heading: 'Получите бесплатный гайд по лидогенерации',
      subheading: 'Оставьте свои контактные данные, и мы отправим вам подробное руководство',
      description: {
        root: {
          children: [
            {
              children: [
                {
                  text: 'В нашем гайде вы найдете 10 проверенных стратегий для увеличения потока лидов, практические советы и примеры успешных кейсов.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'root',
        },
      },
      formFields: [
        {
          fieldName: 'name',
          label: 'Ваше имя',
          fieldType: 'text',
          placeholder: 'Введите ваше имя',
          required: true,
        },
        {
          fieldName: 'email',
          label: 'Email',
          fieldType: 'email',
          placeholder: 'Введите ваш email',
          required: true,
        },
        {
          fieldName: 'company',
          label: 'Компания',
          fieldType: 'text',
          placeholder: 'Название вашей компании',
          required: false,
        },
        {
          fieldName: 'consent',
          label: 'Я согласен на обработку персональных данных',
          fieldType: 'checkbox',
          required: true,
        },
      ],
      submitButtonLabel: 'Получить гайд',
      submissionTarget: 'collection',
      submissionSettings: {
        targetCollection: 'leads',
      },
      successAction: 'message',
      successMessage: {
        root: {
          children: [
            {
              children: [
                {
                  text: 'Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'root',
        },
      },
      layout: 'imageLeft',
    },
    newsletter: {
      blockType: 'newsletter',
      heading: 'Подпишитесь на нашу рассылку',
      subheading: 'Получайте последние новости и обновления',
      buttonText: 'Подписаться',
      placeholder: 'Введите ваш email',
      successMessage: 'Спасибо за подписку!',
      layout: 'centered',
    },
    testimonials: {
      blockType: 'testimonials',
      heading: 'Отзывы наших клиентов',
      testimonials: [
        {
          text: 'Отличный сервис, очень доволен результатом!',
          author: 'Иван Петров',
          role: 'CEO, Company Name',
          avatar: '/images/testimonial-1.jpg',
        },
        {
          text: 'Рекомендую всем, кто ценит качество и профессионализм.',
          author: 'Мария Иванова',
          role: 'Marketing Director',
          avatar: '/images/testimonial-2.jpg',
        },
      ],
      layout: 'grid',
    },
    urgencyCTA: {
      blockType: 'urgencyCTA',
      heading: 'Специальное предложение',
      subheading: 'Действует только до конца недели',
      timerEndDate: '2023-12-31T23:59:59',
      buttonText: 'Получить скидку',
      buttonLink: '/special-offer',
      backgroundColor: '#f8f9fa',
    },
  }

  return examples[slug] || {}
}

/**
 * Get metadata for a block
 */
function getBlockMetadata(slug: string): BlockMetadata {
  // Define metadata for blocks
  const metadata: Record<string, BlockMetadata> = {
    // Lead generation blocks
    leadMagnetOffer: {
      usage: ['lead-generation', 'conversion'],
      complexity: 'medium',
      priority: 'high',
      conversionImpact: 'high',
      bestPractices: [
        'Используйте привлекательный заголовок, который четко объясняет ценность предложения',
        'Минимизируйте количество полей формы для увеличения конверсии',
        'Добавьте элементы социального доказательства рядом с формой',
        'Четко объясните, что получит пользователь после заполнения формы',
      ],
    },
    newsletter: {
      usage: ['lead-generation'],
      complexity: 'simple',
      priority: 'medium',
      conversionImpact: 'medium',
      bestPractices: [
        'Размещайте форму подписки в заметном месте',
        'Объясните преимущества подписки',
        'Укажите частоту рассылки',
      ],
    },
    form: {
      usage: ['lead-generation', 'conversion'],
      complexity: 'medium',
      priority: 'high',
      conversionImpact: 'high',
      bestPractices: [
        'Используйте понятные метки полей',
        'Добавьте валидацию полей',
        'Минимизируйте количество обязательных полей',
      ],
    },
    hero: {
      usage: ['content', 'conversion'],
      complexity: 'medium',
      priority: 'high',
      conversionImpact: 'high',
      bestPractices: [
        'Используйте четкий и привлекательный заголовок',
        'Добавьте призыв к действию',
        'Используйте высококачественное изображение',
      ],
    },
    callToAction: {
      usage: ['conversion'],
      complexity: 'simple',
      priority: 'high',
      conversionImpact: 'high',
      bestPractices: [
        'Используйте яркие цвета для кнопок',
        'Создайте ощущение срочности',
        'Используйте глаголы действия в тексте кнопки',
      ],
    },
    urgencyCTA: {
      usage: ['conversion'],
      complexity: 'medium',
      priority: 'high',
      conversionImpact: 'high',
      bestPractices: [
        'Используйте таймер обратного отсчета',
        'Четко укажите ограничение по времени',
        'Подчеркните выгоду от немедленного действия',
      ],
    },
    testimonials: {
      usage: ['social-proof', 'conversion'],
      complexity: 'medium',
      priority: 'medium',
      conversionImpact: 'medium',
      bestPractices: [
        'Используйте реальные фотографии людей',
        'Включайте имя, должность и компанию',
        'Выбирайте конкретные и детальные отзывы',
      ],
    },
    features: {
      usage: ['content'],
      complexity: 'medium',
      priority: 'medium',
      conversionImpact: 'medium',
      bestPractices: [
        'Фокусируйтесь на преимуществах, а не на функциях',
        'Используйте иконки для визуального представления',
        'Группируйте связанные функции',
      ],
    },
    faq: {
      usage: ['content', 'conversion'],
      complexity: 'medium',
      priority: 'medium',
      conversionImpact: 'medium',
      bestPractices: [
        'Отвечайте на реальные вопросы клиентов',
        'Группируйте вопросы по темам',
        'Используйте простой и понятный язык',
      ],
    },
  }

  // Default metadata for blocks without specific metadata
  const defaultMetadata: BlockMetadata = {
    usage: ['general'],
    complexity: 'medium',
    priority: 'medium',
  }

  return metadata[slug] || defaultMetadata
}

/**
 * Get usage scenarios for a block
 */
function getBlockUsageScenarios(slug: string): string[] {
  // Define usage scenarios for blocks
  const scenarios: Record<string, string[]> = {
    leadMagnetOffer: [
      'Сбор контактов посетителей в обмен на ценный контент',
      'Генерация лидов для продаж и маркетинга',
      'Создание базы подписчиков для email-маркетинга',
      'Квалификация потенциальных клиентов',
    ],
    newsletter: [
      'Сбор email-адресов для рассылки новостей и обновлений',
      'Поддержание связи с аудиторией',
      'Информирование о новых продуктах или услугах',
    ],
    form: [
      'Сбор данных от пользователей',
      'Регистрация на мероприятия',
      'Запрос на обратный звонок или консультацию',
    ],
    hero: [
      'Привлечение внимания посетителей',
      'Представление основного предложения или ценности',
      'Направление посетителей к целевому действию',
    ],
    callToAction: [
      'Побуждение к конкретному действию',
      'Увеличение конверсии',
      'Направление пользователя по воронке продаж',
    ],
    urgencyCTA: [
      'Создание ощущения срочности',
      'Стимулирование немедленного действия',
      'Продвижение ограниченных по времени предложений',
    ],
    testimonials: [
      'Повышение доверия к бренду или продукту',
      'Демонстрация результатов и успешных кейсов',
      'Снижение сомнений потенциальных клиентов',
    ],
  }

  return scenarios[slug] || []
}

/**
 * Check if a block is used for lead generation
 */
function isLeadGenerationBlock(slug: string): boolean {
  const leadGenBlocks = ['leadMagnetOffer', 'newsletter', 'form', 'feedback', 'poll']
  return leadGenBlocks.includes(slug)
}

/**
 * Get lead generation specific information for a block
 */
function getLeadGenerationInfo(slug: string): Record<string, any> {
  const info: Record<string, Record<string, any>> = {
    leadMagnetOffer: {
      conversionRate: 'Высокая (10-20%)',
      bestOffers: [
        'Электронные книги и гайды',
        'Чек-листы и шаблоны',
        'Вебинары и мастер-классы',
        'Пробный период использования продукта',
      ],
      recommendedFields: ['Имя', 'Email', 'Компания'],
      followUpStrategy:
        'Email-серия с дополнительным ценным контентом и мягким продвижением продукта',
    },
    newsletter: {
      conversionRate: 'Средняя (2-5%)',
      contentTypes: [
        'Новости индустрии',
        'Советы и рекомендации',
        'Анонсы новых продуктов',
        'Истории успеха',
      ],
      recommendedFields: ['Email'],
      followUpStrategy: 'Регулярная рассылка с полезным контентом и периодическими предложениями',
    },
    form: {
      conversionRate: 'Варьируется в зависимости от типа формы (5-15%)',
      formTypes: [
        'Контактная форма',
        'Форма запроса демонстрации',
        'Форма регистрации на мероприятие',
        'Форма обратной связи',
      ],
      recommendedFields: ['Имя', 'Email', 'Телефон', 'Комментарий'],
      followUpStrategy: 'Быстрый ответ от отдела продаж или поддержки',
    },
  }

  return info[slug] || {}
}
