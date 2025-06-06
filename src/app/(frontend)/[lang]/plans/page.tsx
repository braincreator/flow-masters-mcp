import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import PlansPageClient from './PlansPageClient'

interface Props {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const t = await getTranslations({ locale: lang, namespace: 'SubscriptionPlans' })

  return {
    title: t('defaultHeading'),
    description: t('defaultDescription'),
  }
}

export default async function PlansPage({ params }: Props) {
  const { lang } = await params
  setRequestLocale(lang)

  const t = await getTranslations('SubscriptionPlans')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('defaultHeading')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t('defaultDescription')}</p>
      </div>

      <PlansPageClient locale={lang} />
    </div>
  )
}
