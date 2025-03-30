import { unstable_setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import SubscriptionCheckout from './SubscriptionCheckout'

interface PageProps {
  params: {
    lang: string
  }
  searchParams: {
    planId?: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.lang, namespace: 'Subscription' })

  return {
    title: t('checkout.metadata.title'),
    description: t('checkout.metadata.description'),
  }
}

export default async function CheckoutPage({ params: { lang }, searchParams }: PageProps) {
  unstable_setRequestLocale(lang)

  const { planId } = searchParams

  if (!planId) {
    // Redirect to subscription plans page if no plan ID provided
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">No Plan Selected</h1>
        <p className="mb-4">Please select a subscription plan to continue.</p>
        <a href={`/${lang}/account/subscriptions`} className="text-primary hover:underline">
          Go to subscription plans
        </a>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <SubscriptionCheckout locale={lang} planId={planId} />
    </div>
  )
}
