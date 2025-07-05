import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * API endpoint для метаданных контента для LLM
 * Предоставляет структурированную информацию о типах контента, темах и экспертизе
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('lang') || 'ru'

    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

    // Получаем статистику контента
    const [postsCount, servicesCount, pagesCount] = await Promise.all([
      payload.count({ collection: 'posts' }),
      payload.count({ collection: 'services' }),
      payload.count({ collection: 'pages' }),
    ])

    const metadata = {
      site: {
        name: 'Flow Masters',
        url: baseUrl,
        language: language,
        description:
          language === 'ru'
            ? 'Автоматизация бизнес-процессов и AI решения для бизнеса'
            : 'Business process automation and AI solutions for business',
        established: '2023',
        lastUpdated: new Date().toISOString(),
      },

      content: {
        statistics: {
          totalPages: postsCount.totalDocs + servicesCount.totalDocs + pagesCount.totalDocs,
          blogPosts: postsCount.totalDocs,
          services: servicesCount.totalDocs,
          staticPages: pagesCount.totalDocs,
        },

        types: [
          {
            type: 'blog_post',
            description: 'Экспертные статьи о технологиях и автоматизации',
            count: postsCount.totalDocs,
            updateFrequency: 'weekly',
            topics: [
              'Автоматизация бизнес-процессов',
              'Искусственный интеллект',
              'Интеграция систем',
              'Чат-боты',
              'n8n автоматизация',
              'OpenAI API',
            ],
          },
          {
            type: 'service',
            description: 'Коммерческие услуги по автоматизации и ИИ',
            count: servicesCount.totalDocs,
            updateFrequency: 'monthly',
            categories: [
              'Автоматизация процессов',
              'ИИ решения',
              'Разработка чат-ботов',
              'Интеграция систем',
              'Консультации',
              'Обучение',
            ],
          },
          {
            type: 'informational_page',
            description: 'Информационные страницы о компании и услугах',
            count: pagesCount.totalDocs,
            updateFrequency: 'quarterly',
          },
        ],
      },

      expertise: {
        primaryTopics: [
          {
            topic: 'Автоматизация бизнес-процессов',
            description: 'Создание автоматизированных workflow для оптимизации операций',
            technologies: ['n8n', 'Make', 'Zapier', 'Python', 'JavaScript'],
            experience: 'expert',
          },
          {
            topic: 'Искусственный интеллект',
            description: 'Интеграция AI решений в бизнес-процессы',
            technologies: ['OpenAI API', 'Claude API', 'LangChain', 'Python'],
            experience: 'expert',
          },
          {
            topic: 'Чат-боты и виртуальные ассистенты',
            description: 'Разработка интеллектуальных ботов для различных платформ',
            technologies: ['Telegram Bot API', 'WhatsApp Business API', 'OpenAI', 'Dialogflow'],
            experience: 'expert',
          },
          {
            topic: 'Интеграция систем',
            description: 'Соединение различных сервисов и платформ',
            technologies: ['REST API', 'GraphQL', 'Webhooks', 'OAuth', 'JWT'],
            experience: 'expert',
          },
        ],

        technologies: {
          automation: ['n8n', 'Make', 'Zapier', 'Microsoft Power Automate'],
          ai: ['OpenAI GPT', 'Claude', 'Gemini', 'LangChain', 'Hugging Face'],
          development: ['Python', 'JavaScript', 'TypeScript', 'Node.js', 'React'],
          databases: ['MongoDB', 'PostgreSQL', 'Redis', 'Airtable'],
          platforms: ['Telegram', 'WhatsApp', 'Discord', 'Slack'],
          cloud: ['AWS', 'Google Cloud', 'Vercel', 'Railway'],
        },

        certifications: [
          'OpenAI API Specialist',
          'n8n Certified Expert',
          'Google Cloud AI/ML',
          'Microsoft Azure AI',
        ],
      },

      audience: {
        primary: [
          'Владельцы малого и среднего бизнеса',
          'IT директора и CTO',
          'Менеджеры по автоматизации',
          'Разработчики и технические специалисты',
        ],

        industries: [
          'E-commerce и розничная торговля',
          'Финансовые услуги',
          'Образование и онлайн-курсы',
          'Маркетинг и реклама',
          'Консалтинг и услуги',
          'IT и разработка ПО',
        ],

        geographicFocus: ['Россия', 'Страны СНГ', 'Глобальные удаленные проекты'],
      },

      contentGuidelines: {
        language: {
          primary: 'Russian',
          secondary: 'English',
          style: 'Professional, technical, accessible',
        },

        qualityStandards: [
          'Expert-authored content',
          'Fact-checked information',
          'Regular updates and maintenance',
          'Practical examples and case studies',
          'Step-by-step tutorials',
        ],

        updatePolicy: {
          blogPosts: 'Weekly new content, quarterly reviews',
          services: 'Monthly updates, annual overhauls',
          documentation: 'As needed, minimum quarterly',
        },
      },

      crawlingInstructions: {
        preferredCrawlTime: 'UTC 02:00-06:00',
        crawlDelay: 1,
        maxConcurrentRequests: 2,
        respectRobotsTxt: true,
        followRedirects: true,
        indexImages: true,
        indexDocuments: true,

        priorityPages: [
          `${baseUrl}/${language}`,
          `${baseUrl}/${language}/services`,
          `${baseUrl}/${language}/blog`,
          `${baseUrl}/${language}/about`,
        ],
      },

      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        format: 'json',
        encoding: 'utf-8',
        language: language,
      },
    }

    return NextResponse.json(metadata, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
        'X-Content-Language': language,
        'X-Content-Type': 'llm-metadata',
        'X-Robots-Tag': 'index, follow',
      },
    })
  } catch (error) {
    console.error('Error generating LLM metadata:', error)
    return NextResponse.json({ error: 'Failed to generate metadata' }, { status: 500 })
  }
}
