import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { TermsPage } from './components/TermsPage'

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

  return <TermsPage />
}
