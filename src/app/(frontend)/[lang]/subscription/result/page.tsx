import { unstable_setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { SubscriptionResult } from './SubscriptionResult'

interface PageProps {
  params: Promise<{
    lang: string
  }>
  searchParams: {
    status?: string
    subscriptionId?: string
    error?: string
  }
}

export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const params = await paramsPromise
  const t = await getTranslations({ locale: params.lang, namespace: 'Subscription' })

  return {
    title: t('result.metadata.title'),
    description: t('result.metadata.description'),
  }
}

export default async function ResultPage({ params: paramsPromise, searchParams }: PageProps) {
  const params = await paramsPromise
  unstable_setRequestLocale(params.lang)

  const { status = 'unknown', subscriptionId, error } = searchParams

  return (
    <div className="container py-10">
      <SubscriptionResult
        locale={params.lang}
        status={status}
        subscriptionId={subscriptionId}
        error={error}
      />
    </div>
  )
}
