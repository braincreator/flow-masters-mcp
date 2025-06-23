#!/usr/bin/env tsx

/**
 * Script to force update all TermsPages with proper Lexical format
 * Run with: npx tsx src/scripts/update-terms-pages.ts
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

// Helper function to create proper Lexical unordered list
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

// Updated terms pages data
const termsUpdates = {
  services: {
    title: {
      ru: 'Услуги',
      en: 'Services',
    },
    content: {
      ru: createLexicalRoot([
        createHeading('Условия оказания услуг', 'h2'),
        createParagraph('Настоящие условия регулируют отношения между Flow Masters и клиентом при оказании услуг в области искусственного интеллекта, автоматизации бизнес-процессов и разработки программного обеспечения.'),
        createHeading('Предмет договора', 'h3'),
        createList([
          'Консультации по внедрению ИИ-решений',
          'Разработка чат-ботов и автоматизированных систем',
          'Интеграция ИИ в существующие бизнес-процессы',
          'Техническая поддержка и сопровождение',
        ]),
        createHeading('Порядок оказания услуг', 'h3'),
        createParagraph('Услуги оказываются на основании предварительного согласования технического задания и подписания договора. Сроки выполнения работ определяются индивидуально для каждого проекта.'),
      ]),
      en: createLexicalRoot([
        createHeading('Service Terms and Conditions', 'h2'),
        createParagraph('These terms govern the relationship between Flow Masters and the client when providing services in artificial intelligence, business process automation, and software development.'),
        createHeading('Subject of Agreement', 'h3'),
        createList([
          'AI implementation consulting',
          'Chatbot and automation system development',
          'AI integration into existing business processes',
          'Technical support and maintenance',
        ]),
      ]),
    },
  },
  consulting: {
    title: {
      ru: 'Консультации',
      en: 'Consulting',
    },
    content: {
      ru: createLexicalRoot([
        createHeading('Консультационные услуги', 'h2'),
        createParagraph('Мы предоставляем экспертные консультации по внедрению ИИ-решений, анализу бизнес-процессов и выбору оптимальных технологических решений.'),
        createHeading('Виды консультаций', 'h3'),
        createList([
          'Экспресс-консультации (30 минут)',
          'Углубленный анализ (1-2 часа)',
          'Комплексный аудит процессов',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('Consulting Services', 'h2'),
        createParagraph('We provide expert consulting on AI solution implementation, business process analysis, and optimal technology selection.'),
        createHeading('Types of Consulting', 'h3'),
        createList([
          'Express consultations (30 minutes)',
          'In-depth analysis (1-2 hours)',
          'Comprehensive process audit',
        ]),
      ]),
    },
  },
  systems: {
    title: {
      ru: 'Сервисы',
      en: 'Systems',
    },
    content: {
      ru: createLexicalRoot([
        createHeading('Условия использования систем', 'h2'),
        createParagraph('Настоящие условия регулируют использование наших технологических платформ, API и интегрированных систем.'),
        createHeading('Доступные системы', 'h3'),
        createList([
          'API для интеграции ИИ-решений',
          'Платформа автоматизации процессов',
          'Система мониторинга и аналитики',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('System Usage Terms', 'h2'),
        createParagraph('These terms govern the use of our technological platforms, APIs, and integrated systems.'),
        createHeading('Available Systems', 'h3'),
        createList([
          'AI integration APIs',
          'Process automation platform',
          'Monitoring and analytics system',
        ]),
      ]),
    },
  },
  products: {
    title: {
      ru: 'Продукты',
      en: 'Products',
    },
    content: {
      ru: createLexicalRoot([
        createHeading('Условия приобретения продуктов', 'h2'),
        createParagraph('Настоящие условия применяются при приобретении готовых ИИ-решений, программного обеспечения и цифровых продуктов.'),
        createHeading('Типы продуктов', 'h3'),
        createList([
          'Готовые чат-боты и ИИ-ассистенты',
          'Шаблоны автоматизации процессов',
          'Обучающие курсы и материалы',
        ]),
      ]),
      en: createLexicalRoot([
        createHeading('Product Purchase Terms', 'h2'),
        createParagraph('These terms apply to the purchase of ready-made AI solutions, software, and digital products.'),
        createHeading('Product Types', 'h3'),
        createList([
          'Ready-made chatbots and AI assistants',
          'Process automation templates',
          'Training courses and materials',
        ]),
      ]),
    },
  },
}

async function updateTermsPages() {
  logDebug('🔄 Updating TermsPages collection with proper Lexical format...')

  try {
    const payload = await getPayloadClient()
    logDebug('✅ Payload client initialized')

    const locales = ['ru', 'en']

    for (const [tabType, updateData] of Object.entries(termsUpdates)) {
      for (const locale of locales) {
        try {
          // Find existing page
          const existing = await payload.find({
            collection: 'terms-pages',
            locale,
            where: {
              tabType: {
                equals: tabType,
              },
            },
            limit: 1,
          })

          if (existing.docs.length === 0) {
            console.log(`⚠️  Terms page "${tabType}" for locale "${locale}" not found, skipping...`)
            continue
          }

          const doc = existing.docs[0]

          // Update with new content
          const updated = await payload.update({
            collection: 'terms-pages',
            id: doc.id,
            locale,
            data: {
              title: updateData.title[locale],
              content: updateData.content[locale],
            },
          })

          logDebug(`✅ Updated terms page: ${tabType} for ${locale} (${updated.id})`)
        } catch (error) {
          logError(`❌ Error updating terms page "${tabType}" for locale "${locale}":`, error)
        }
      }
    }

    logDebug('🎉 TermsPages update completed!')
  } catch (error) {
    logError('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
updateTermsPages()
