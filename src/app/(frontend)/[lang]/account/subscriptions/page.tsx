import { unstable_setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import AccountSubscriptions from '../components/AccountSubscriptions'

interface PageProps {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'Account.subscriptions' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function SubscriptionsPage({ params: { lang } }: PageProps) {
  unstable_setRequestLocale(lang)

  return (
    <div className="container py-10">
      <AccountSubscriptions locale={lang} />
    </div>
  )
}
