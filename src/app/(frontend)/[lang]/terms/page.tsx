import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TermsPage } from './components/TermsPage'
import type { TermsPage as TermsPageType } from '@/payload-types'

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
  const termsPages = await payload.find({
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

  return <TermsPage termsPages={termsPages.docs as TermsPageType[]} />
}
