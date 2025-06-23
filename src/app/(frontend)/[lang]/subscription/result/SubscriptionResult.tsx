'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SubscriptionResultProps {
  locale: string
  status: string
  subscriptionId?: string
  error?: string
}

export function SubscriptionResult({
  locale,
  status,
  subscriptionId,
  error,
}: SubscriptionResultProps) {
  const t = useTranslations('Subscription.result')
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(subscriptionId ? true : false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Fetch subscription details if ID is provided
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId) return
      setLoading(true)
      try {
        const response = await fetch(`/api/v1/subscription/${subscriptionId}`)
        if (!response.ok) throw new Error('Subscription not found')
        const data = await response.json()

        if (data.success) {
          setSubscription(data.subscription)
        } else {
          throw new Error(data.error || t('errors.invalidSubscription'))
        }
      } catch (error) {
        logError('Error fetching subscription:', error)
        setLoadError(error instanceof Error ? error.message : t('errors.unknown'))
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionDetails()
  }, [subscriptionId, t])

  // Redirect to subscriptions page after delay
  useEffect(() => {
    if (status === 'success' || status === 'failed') {
      const timer = setTimeout(() => {
        router.push(`/${locale}/account/subscriptions`)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [status, locale, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    )
  }

  // Handle success case
  if (status === 'success') {
    return (
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <CardTitle>{t('success.title')}</CardTitle>
          <CardDescription>{t('success.description')}</CardDescription>
        </CardHeader>

        {subscription && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t('subscriptionDetails.id')}</div>
                <div className="text-sm font-medium">{subscription.id}</div>

                <div className="text-sm text-muted-foreground">
                  {t('subscriptionDetails.status')}
                </div>
                <div className="text-sm font-medium capitalize">{subscription.status}</div>

                <div className="text-sm text-muted-foreground">
                  {t('subscriptionDetails.startDate')}
                </div>
                <div className="text-sm font-medium">
                  {new Date(subscription.startDate).toLocaleDateString(
                    locale === 'ru' ? 'ru-RU' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {t('subscriptionDetails.nextPayment')}
                </div>
                <div className="text-sm font-medium">
                  {new Date(subscription.nextPaymentDate).toLocaleDateString(
                    locale === 'ru' ? 'ru-RU' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        )}

        <CardFooter className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm mb-4">{t('redirectMessage')}</p>
          <Button
            onClick={() => router.push(`/${locale}/account/subscriptions`)}
            className="w-full"
          >
            {t('buttons.viewSubscriptions')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Handle pending case
  if (status === 'pending') {
    return (
      <Card>
        <CardHeader className="text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-2 animate-spin" />
          <CardTitle>{t('pending.title')}</CardTitle>
          <CardDescription>{t('pending.description')}</CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="outline">
            {t('buttons.checkStatus')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Handle failed case
  if (status === 'failed') {
    return (
      <Card>
        <CardHeader className="text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
          <CardTitle>{t('failed.title')}</CardTitle>
          <CardDescription>{error ? error : t('failed.description')}</CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm mb-4">{t('redirectMessage')}</p>
          <Button
            onClick={() => router.push(`/${locale}/account/subscriptions`)}
            className="w-full"
          >
            {t('buttons.tryAgain')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Handle load error
  if (loadError) {
    return (
      <Card>
        <CardHeader className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
          <CardTitle>{t('errors.title')}</CardTitle>
          <CardDescription>{loadError}</CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="outline">
            {t('buttons.backToSubscriptions')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Handle unknown case
  return (
    <Card>
      <CardHeader className="text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
        <CardTitle>{t('unknown.title')}</CardTitle>
        <CardDescription>{t('unknown.description')}</CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-center">
        <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="outline">
          {t('buttons.backToSubscriptions')}
        </Button>
      </CardFooter>
    </Card>
  )
}
