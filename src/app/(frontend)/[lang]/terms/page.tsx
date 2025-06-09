import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TermsPage } from './components/TermsPage'
// We'll use the type from the component
interface TermsPageType {
  id: string
  title: string
  tabType: 'services' | 'consulting' | 'systems' | 'products'
  subtitle?: string
  badge?: string
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
  } catch (error) {
    console.log('Terms pages collection not found or empty, using fallback')
    // Fallback data for testing
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
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: lang === 'ru'
                      ? 'Здесь будет размещен контент из CMS. Пока используется заглушка.'
                      : 'Content from CMS will be placed here. Currently using placeholder.'
                  }
                ]
              }
            ]
          }
        },
        order: 0,
        isActive: true,
      }
    ]
  }

  return <TermsPage termsPages={termsPages} />
}
