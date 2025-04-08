import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import AccountSubscriptions from '../components/AccountSubscriptions'

interface Props {
  params: Promise<{
    lang: string
  }>
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise
  const t = await getTranslations({ locale: params.lang, namespace: 'Account' })

  return {
    title: t('subscriptions.title'),
    description: t('subscriptions.description'),
  }
}

export default async function AccountSubscriptionsPage({ params: paramsPromise }: Props) {
  const params = await paramsPromise
  setRequestLocale(params.lang)

  return (
    <div className="container py-10">
      <AccountSubscriptions locale={params.lang} />
    </div>
  )
}
