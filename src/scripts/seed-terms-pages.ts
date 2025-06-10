#!/usr/bin/env tsx

/**
 * Script to seed TermsPages collection with initial data
 * Run with: npx tsx src/scripts/seed-terms-pages.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Условия оказания услуг' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Настоящие условия регулируют отношения между Flow Masters и клиентом при оказании услуг в области искусственного интеллекта, автоматизации бизнес-процессов и разработки программного обеспечения.',
                },
              ],
            },
            {
              type: 'heading',
              version: 1,
              tag: 'h3',
              children: [{ type: 'text', version: 1, text: 'Предмет договора' }],
            },
            {
              type: 'list',
              version: 1,
              listType: 'bullet',
              children: [
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    { type: 'text', version: 1, text: 'Консультации по внедрению ИИ-решений' },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: 'Разработка чат-ботов и автоматизированных систем',
                    },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: 'Интеграция ИИ в существующие бизнес-процессы',
                    },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    { type: 'text', version: 1, text: 'Техническая поддержка и сопровождение' },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              version: 1,
              tag: 'h3',
              children: [{ type: 'text', version: 1, text: 'Порядок оказания услуг' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Услуги оказываются на основании предварительного согласования технического задания и подписания договора. Сроки выполнения работ определяются индивидуально для каждого проекта.',
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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Service Terms and Conditions' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'These terms govern the relationship between Flow Masters and the client when providing services in artificial intelligence, business process automation, and software development.',
                },
              ],
            },
            {
              type: 'heading',
              version: 1,
              tag: 'h3',
              children: [{ type: 'text', version: 1, text: 'Subject of Agreement' }],
            },
            {
              type: 'list',
              version: 1,
              listType: 'bullet',
              children: [
                {
                  type: 'listitem',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: 'AI implementation consulting' }],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    { type: 'text', version: 1, text: 'Chatbot and automation system development' },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    {
                      type: 'text',
                      version: 1,
                      text: 'AI integration into existing business processes',
                    },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    { type: 'text', version: 1, text: 'Technical support and maintenance' },
                  ],
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
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Все услуги оказываются в соответствии с действующим законодательством РФ. Стоимость услуг может изменяться в зависимости от сложности проекта.',
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
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'All services are provided in accordance with applicable law. Service costs may vary depending on project complexity.',
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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Консультационные услуги' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Мы предоставляем экспертные консультации по внедрению ИИ-решений, анализу бизнес-процессов и выбору оптимальных технологических решений.',
                },
              ],
            },
            {
              type: 'heading',
              version: 1,
              tag: 'h3',
              children: [{ type: 'text', version: 1, text: 'Виды консультаций' }],
            },
            {
              type: 'list',
              version: 1,
              listType: 'bullet',
              children: [
                {
                  type: 'listitem',
                  version: 1,
                  children: [
                    { type: 'text', version: 1, text: 'Экспресс-консультации (30 минут)' },
                  ],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: 'Углубленный анализ (1-2 часа)' }],
                },
                {
                  type: 'listitem',
                  version: 1,
                  children: [{ type: 'text', version: 1, text: 'Комплексный аудит процессов' }],
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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Consulting Services' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'We provide expert consulting on AI solution implementation, business process analysis, and optimal technology selection.',
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
      ru: 'Условия использования систем и сервисов',
      en: 'System and service usage terms',
    },
    badge: {
      ru: 'Технологии',
      en: 'Technology',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Условия использования систем' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Настоящие условия регулируют использование наших технологических платформ, API и интегрированных систем.',
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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'System Usage Terms' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'These terms govern the use of our technological platforms, APIs, and integrated systems.',
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
      ru: 'Условия приобретения и использования продуктов',
      en: 'Product purchase and usage terms',
    },
    badge: {
      ru: 'Решения',
      en: 'Solutions',
    },
    content: {
      ru: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Условия приобретения продуктов' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'Настоящие условия применяются при приобретении готовых ИИ-решений, программного обеспечения и цифровых продуктов.',
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
              version: 1,
              tag: 'h2',
              children: [{ type: 'text', version: 1, text: 'Product Purchase Terms' }],
            },
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  version: 1,
                  text: 'These terms apply to the purchase of ready-made AI solutions, software, and digital products.',
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

async function seedTermsPages() {
  console.log('📄 Seeding TermsPages collection...')

  try {
    const payload = await getPayloadClient()
    console.log('✅ Payload client initialized')

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
            console.log(
              `⚠️  Terms page "${pageData.tabType}" for locale "${locale}" already exists, skipping...`,
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

          console.log(`✅ Created terms page: ${pageData.tabType} for ${locale} (${page.id})`)
        } catch (error) {
          console.error(
            `❌ Error creating terms page "${pageData.tabType}" for locale "${locale}":`,
            error,
          )
        }
      }
    }

    console.log('🎉 TermsPages seeding completed!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
seedTermsPages()
