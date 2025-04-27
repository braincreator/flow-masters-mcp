import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { SettingsPage } from './SettingsPage'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'Settings' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function Settings({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)

  // Get translations
  const t = await getTranslations({ locale: lang, namespace: 'Settings' })

  return (
    <div className="container max-w-screen-xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-600 mt-2">{t('description')}</p>
      </div>
      <SettingsPage locale={lang} />
    </div>
  )
}
