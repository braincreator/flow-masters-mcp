#!/usr/bin/env tsx

/**
 * Script to seed TermsPages collection with proper Lexical format
 * Run with: npx tsx src/scripts/seed-terms-pages-fixed.ts
 */

import { getPayloadClient } from '@/utilities/payload/index'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Helper function to create proper Lexical text node
function createTextNode(text: string) {
  return {
    type: 'text',
    version: 1,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
  }
}

// Helper function to create proper Lexical paragraph
function createParagraph(text: string) {
  return {
    type: 'paragraph',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: [createTextNode(text)],
  }
}

// Helper function to create proper Lexical heading
function createHeading(text: string, tag: string = 'h2') {
  return {
    type: 'heading',
    version: 1,
    tag,
    direction: null,
    format: '',
    indent: 0,
    children: [createTextNode(text)],
  }
}

// Helper function to create proper Lexical list
function createList(items: string[]) {
  return {
    type: 'list',
    version: 1,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    direction: null,
    format: '',
    indent: 0,
    children: items.map((item) => ({
      type: 'listitem',
      version: 1,
      value: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          children: [createTextNode(item)],
        },
      ],
    })),
  }
}

// Helper function to create proper Lexical root
function createLexicalRoot(children: any[]) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children,
    },
  }
}

// Terms pages data with proper Lexical structure
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
      ru: createLexicalRoot([
        createHeading('Условия оказания услуг', 'h2'),
        createParagraph(
          'Настоящие условия регулируют отношения между Flow Masters и клиентом при оказании услуг в области искусственного интеллекта, автоматизации бизнес-процессов и разработки программного обеспечения.',
        ),
        createHeading('Предмет договора', 'h3'),
        createList([
          'Консультации по внедрению ИИ-решений',
          'Разработка чат-ботов и автоматизированных систем',
          'Интеграция ИИ в существующие бизнес-процессы',
          'Техническая поддержка и сопровождение',
        ]),
        createHeading('Порядок оказания услуг', 'h3'),
        createParagraph(
          'Услуги оказываются на основании предварительного согласования технического задания и подписания договора. Сроки выполнения работ определяются индивидуально для каждого проекта.',
        ),
      ]),
      en: createLexicalRoot([
        createHeading('Service Terms and Conditions', 'h2'),
        createParagraph(
          'These terms govern the relationship between Flow Masters and the client when providing services in artificial intelligence, business process automation, and software development.',
        ),
        createHeading('Subject of Agreement', 'h3'),
        createList([
          'AI implementation consulting',
          'Chatbot and automation system development',
          'AI integration into existing business processes',
          'Technical support and maintenance',
        ]),
      ]),
    },
    importantNote: {
      ru: createLexicalRoot([
        createParagraph(
          'Все услуги оказываются в соответствии с действующим законодательством РФ. Стоимость услуг может изменяться в зависимости от сложности проекта.',
        ),
      ]),
      en: createLexicalRoot([
        createParagraph(
          'All services are provided in accordance with applicable law. Service costs may vary depending on project complexity.',
        ),
      ]),
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
      ru: createLexicalRoot([
        createHeading('Консультационные услуги', 'h2'),
        createParagraph(
          'Мы предоставляем экспертные консультации по внедрению ИИ-решений, анализу бизнес-процессов и выбору оптимальных технологических решений.',
        ),
        createHeading('Виды консультаций', 'h3'),
        createList([
          'Экспресс-консультации (30 минут)',
          'Углубленный анализ (1-2 часа)',
          'Комплексный аудит процессов',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('Consulting Services', 'h2'),
        createParagraph(
          'We provide expert consulting on AI solution implementation, business process analysis, and optimal technology selection.',
        ),
      ]),
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
      ru: createLexicalRoot([
        createHeading('Условия использования систем', 'h2'),
        createParagraph(
          'Настоящие условия регулируют использование наших технологических платформ, API и интегрированных систем.',
        ),
        createHeading('Доступные системы', 'h3'),
        createList([
          'API для интеграции ИИ-решений',
          'Платформа автоматизации процессов',
          'Система мониторинга и аналитики',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('System Usage Terms', 'h2'),
        createParagraph(
          'These terms govern the use of our technological platforms, APIs, and integrated systems.',
        ),
      ]),
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
      ru: createLexicalRoot([
        createHeading('Условия приобретения продуктов', 'h2'),
        createParagraph(
          'Настоящие условия применяются при приобретении готовых ИИ-решений, программного обеспечения и цифровых продуктов.',
        ),
        createHeading('Типы продуктов', 'h3'),
        createList([
          'Готовые чат-боты и ИИ-ассистенты',
          'Шаблоны автоматизации процессов',
          'Обучающие курсы и материалы',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('Product Purchase Terms', 'h2'),
        createParagraph(
          'These terms apply to the purchase of ready-made AI solutions, software, and digital products.',
        ),
      ]),
    },
    order: 3,
    isActive: true,
    publishedAt: new Date().toISOString(),
  },
]

async function seedTermsPages() {
  logDebug('📄 Seeding TermsPages collection with fixed Lexical format...')

  try {
    const payload = await getPayloadClient()
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

    logDebug('🎉 TermsPages seeding completed!')
  } catch (error) {
    logError('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
seedTermsPages()
