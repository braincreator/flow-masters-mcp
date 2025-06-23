#!/usr/bin/env tsx

/**
 * Script to create TermsPages collection data
 * Run with: npx tsx src/scripts/create-terms-pages.ts
 */

import { getPayload } from 'payload'
import config from '../../payload.config'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Terms pages data for both locales
const termsPages = [
  {
    title: {
      ru: 'Услуги',
      en: 'Services',
    },
    tabType: 'services',
    subtitle: {
      ru: 'Общие условия оказания услуг',
      en: 'General service terms',
    },
    badge: {
      ru: 'Основные',
      en: 'Core',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Условия предоставления услуг' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Данные условия регулируют предоставление услуг по разработке и внедрению ИИ-решений. Мы гарантируем высокое качество работ и соблюдение всех договоренностей.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Все услуги предоставляются в соответствии с техническим заданием и в установленные сроки.',
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
      en: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Service Terms and Conditions' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'These terms govern the provision of AI development and implementation services. We guarantee high quality work and compliance with all agreements.',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'All services are provided in accordance with technical specifications and within established deadlines.',
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
    },
    importantNote: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'При возникновении вопросов обращайтесь к нашим специалистам.',
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
      en: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'If you have any questions, please contact our specialists.',
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
    },
    order: 0,
    isActive: true,
    publishedAt: new Date().toISOString(),
  },
  {
    title: {
      ru: 'Консультации',
      en: 'Consulting',
    },
    tabType: 'consulting',
    subtitle: {
      ru: 'Условия консультационных услуг',
      en: 'Consulting service terms',
    },
    badge: {
      ru: 'Экспертиза',
      en: 'Expertise',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Консультационные услуги' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Наши эксперты предоставляют профессиональные консультации по внедрению ИИ в бизнес-процессы.',
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
      en: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Consulting Services' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Our experts provide professional consulting on AI implementation in business processes.',
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
    },
    order: 1,
    isActive: true,
    publishedAt: new Date().toISOString(),
  },
  {
    title: {
      ru: 'Сервисы',
      en: 'Systems',
    },
    tabType: 'systems',
    subtitle: {
      ru: 'Условия использования сервисов',
      en: 'System usage terms',
    },
    badge: {
      ru: 'Платформы',
      en: 'Platforms',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Использование сервисов' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Правила использования наших онлайн-платформ и SaaS-решений.',
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
      en: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'System Usage' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Rules for using our online platforms and SaaS solutions.',
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
    },
    order: 2,
    isActive: true,
    publishedAt: new Date().toISOString(),
  },
  {
    title: {
      ru: 'Продукты',
      en: 'Products',
    },
    tabType: 'products',
    subtitle: {
      ru: 'Условия продажи продуктов',
      en: 'Product sales terms',
    },
    badge: {
      ru: 'Цифровые',
      en: 'Digital',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Цифровые продукты' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Условия покупки и использования цифровых продуктов и решений.',
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
      en: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              children: [{ type: 'text', text: 'Digital Products' }],
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Terms for purchasing and using digital products and solutions.',
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
    },
    order: 3,
    isActive: true,
    publishedAt: new Date().toISOString(),
  },
]

async function createTermsPages() {
  logDebug('📄 Creating TermsPages collection data...')

  try {
    const payload = await getPayload({ config })
    logDebug('✅ Payload client initialized')

    // Create pages for each locale
    const locales = ['ru', 'en']

    for (const pageData of termsPages) {
      for (const locale of locales) {
        try {
          // Check if page with this tabType already exists for this locale
          const existing = await payload.find({
            collection: 'terms-pages',
            locale,
            where: {
              tabType: {
                equals: pageData.tabType,
              },
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            logDebug("Debug:",  `⚠️  Terms page "${pageData.tabType}" for locale "${locale}" already exists, skipping...`,
            )
            continue
          }

          // Prepare data for this locale
          const localizedData = {
            tabType: pageData.tabType,
            title: pageData.title[locale],
            subtitle: pageData.subtitle[locale],
            badge: pageData.badge[locale],
            content: pageData.content[locale],
            importantNote: pageData.importantNote?.[locale],
            order: pageData.order,
            isActive: pageData.isActive,
            publishedAt: pageData.publishedAt,
          }

          // Create the terms page for this locale
          const page = await payload.create({
            collection: 'terms-pages',
            locale,
            data: localizedData,
          })

          logDebug(`✅ Created terms page: ${pageData.tabType} for ${locale} (${page.id})`)
        } catch (error) {
          logError(
            `❌ Error creating terms page "${pageData.tabType}" for locale "${locale}":`,
            error,
          )
        }
      }
    }

    logDebug('🎉 TermsPages creation completed!')
  } catch (error) {
    logError('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
createTermsPages()
