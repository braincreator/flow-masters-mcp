import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { TermsPage } from './components/TermsPage'
// We'll use the type from the component
interface TermsPageType {
  id: string
  title: string | { ru?: string; en?: string }
  tabType: 'services' | 'consulting' | 'systems' | 'products'
  subtitle?: string | { ru?: string; en?: string }
  badge?: string | { ru?: string; en?: string }
  content: any
  importantNote?: any
  order?: number
  isActive: boolean
  publishedAt?: string
}

interface Props {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: 'Terms.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function Terms({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const payload = await getPayload({ config })

  // Fetch terms pages from the collection
  let termsPages: TermsPageType[] = []

  try {
    const result = await payload.find({
      collection: 'terms-pages',
      locale: lang,
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: 'order',
      limit: 10,
    })
    termsPages = result.docs as TermsPageType[]
    console.log(`Found ${termsPages.length} terms pages for locale ${lang}`)
  } catch (error) {
    console.log('Terms pages collection not found or empty, using fallback:', error)
  }

  // Enhanced fallback data for testing with multiple tabs
  if (termsPages.length === 0) {
    console.log('Using fallback data for terms pages')
    termsPages = [
      {
        id: '1',
        title: lang === 'ru' ? 'Услуги' : 'Services',
        tabType: 'services',
        subtitle: lang === 'ru' ? 'Общие условия оказания услуг' : 'General service terms',
        badge: lang === 'ru' ? 'Основные' : 'Core',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                version: 1,
                tag: 'h2',
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Условия предоставления услуг'
                        : 'Service Terms and Conditions',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Данные условия регулируют предоставление услуг по разработке и внедрению ИИ-решений. Мы гарантируем высокое качество работ и соблюдение всех договоренностей.'
                        : 'These terms govern the provision of AI development and implementation services. We guarantee high quality work and compliance with all agreements.',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Все услуги предоставляются в соответствии с техническим заданием и в установленные сроки.'
                        : 'All services are provided in accordance with technical specifications and within established deadlines.',
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        importantNote: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'При возникновении вопросов обращайтесь к нашим специалистам.'
                        : 'If you have any questions, please contact our specialists.',
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        order: 0,
        isActive: true,
        publishedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: lang === 'ru' ? 'Консультации' : 'Consulting',
        tabType: 'consulting',
        subtitle: lang === 'ru' ? 'Условия консультационных услуг' : 'Consulting service terms',
        badge: lang === 'ru' ? 'Экспертиза' : 'Expertise',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                version: 1,
                tag: 'h2',
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: lang === 'ru' ? 'Консультационные услуги' : 'Consulting Services',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Наши эксперты предоставляют профессиональные консультации по внедрению ИИ в бизнес-процессы.'
                        : 'Our experts provide professional consulting on AI implementation in business processes.',
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        order: 1,
        isActive: true,
        publishedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: lang === 'ru' ? 'Сервисы' : 'Systems',
        tabType: 'systems',
        subtitle: lang === 'ru' ? 'Условия использования сервисов' : 'System usage terms',
        badge: lang === 'ru' ? 'Платформы' : 'Platforms',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                version: 1,
                tag: 'h2',
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: lang === 'ru' ? 'Использование сервисов' : 'System Usage',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Правила использования наших онлайн-платформ и SaaS-решений.'
                        : 'Rules for using our online platforms and SaaS solutions.',
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        order: 2,
        isActive: true,
        publishedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: lang === 'ru' ? 'Продукты' : 'Products',
        tabType: 'products',
        subtitle: lang === 'ru' ? 'Условия продажи продуктов' : 'Product sales terms',
        badge: lang === 'ru' ? 'Цифровые' : 'Digital',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                version: 1,
                tag: 'h2',
                direction: 'ltr',
                format: '',
                indent: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: lang === 'ru' ? 'Цифровые продукты' : 'Digital Products',
                    version: 1,
                  },
                ],
              },
              {
                type: 'paragraph',
                version: 1,
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text:
                      lang === 'ru'
                        ? 'Условия покупки и использования цифровых продуктов и решений.'
                        : 'Terms for purchasing and using digital products and solutions.',
                    version: 1,
                  },
                ],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        order: 3,
        isActive: true,
        publishedAt: new Date().toISOString(),
      },
    ]
  }

  return <TermsPage termsPages={termsPages} />
}
