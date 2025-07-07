'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { SubscriptionPlan } from '@/types/subscription'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { PrivacyConsent } from '@/components/forms/PrivacyConsent'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SubscriptionCheckoutProps {
  locale: string
  planId: string
}

export default function SubscriptionCheckout({ locale, planId }: SubscriptionCheckoutProps) {
  const t = useTranslations('Subscription.checkout')
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<string>('yoomoney')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)

  // Fetch plan details
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return
      setIsLoading(true)
      try {
        const response = await fetch(`/api/subscription/plans/${planId}`)
        if (!response.ok) throw new Error('Plan not found')
        const data = await response.json()

        if (data.success && data.plan) {
          setPlan(data.plan)
        } else {
          throw new Error(data.error || t('errors.invalidPlan'))
        }
      } catch (error) {
        logError('Error fetching plan:', error)
        setError(error instanceof Error ? error.message : t('errors.unknown'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [planId, t])

  const handleSubscribe = async () => {
    if (!user || !plan) return

    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentProvider,
          paymentMethod: 'card',
          metadata: {
            checkoutLocale: locale,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('errors.subscriptionFailed'))
      }

      if (data.success) {
        setCheckoutComplete(true)
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/account/subscriptions`)
        }, 3000)
      } else {
        throw new Error(data.error || t('errors.unknown'))
      }
    } catch (error) {
      logError('Error creating subscription:', error)
      setError(error instanceof Error ? error.message : t('errors.unknown'))
    } finally {
      setIsProcessing(false)
    }
  }

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  // Format period text
  const formatPeriod = (period: string) => {
    if (locale === 'ru') {
      switch (period) {
        case 'daily':
          return 'день'
        case 'weekly':
          return 'неделю'
        case 'monthly':
          return 'месяц'
        case 'quarterly':
          return 'квартал'
        case 'annual':
          return 'год'
        default:
          return period
      }
    } else {
      switch (period) {
        case 'daily':
          return 'day'
        case 'weekly':
          return 'week'
        case 'monthly':
          return 'month'
        case 'quarterly':
          return 'quarter'
        case 'annual':
          return 'year'
        default:
          return period
      }
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notAuthenticated.title')}</CardTitle>
          <CardDescription>{t('notAuthenticated.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/subscription/checkout?planId=${planId}`)}`}
            variant="default"
          >
            {t('notAuthenticated.loginButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('errors.title')}</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="outline">
          {t('errors.backButton')}
        </Button>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('noPlan.title')}</h3>
        <p className="text-muted-foreground mb-6">{t('noPlan.description')}</p>
        <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="default">
          {t('noPlan.browseButton')}
        </Button>
      </div>
    )
  }

  if (checkoutComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('success.title')}</h2>
        <p className="text-lg mb-6">{t('success.description')}</p>
        <p className="text-muted-foreground mb-8">{t('success.redirectMessage')}</p>
        <Button onClick={() => router.push(`/${locale}/account/subscriptions`)} variant="default">
          {t('success.manageButton')}
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <span className="text-muted-foreground">{t('price')}</span>
            <span className="text-xl font-semibold">
              {formatPrice(plan.price, plan.currency)} / {formatPeriod(plan.period)}
            </span>
          </div>

          {plan.features && plan.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">{t('includedFeatures')}</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.trialDays && plan.trialDays > 0 && (
            <div className="p-3 bg-primary/10 rounded-md">
              <p className="font-medium">{t('trialPeriod', { days: plan.trialDays })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('paymentMethod.title')}</CardTitle>
          <CardDescription>{t('paymentMethod.description')}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-provider">{t('paymentMethod.provider')}</Label>
              <Select value={paymentProvider} onValueChange={setPaymentProvider}>
                <SelectTrigger id="payment-provider" className="w-full mt-1">
                  <SelectValue placeholder={t('paymentMethod.selectProvider')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yoomoney">YooMoney</SelectItem>
                  <SelectItem value="robokassa">Robokassa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('terms.agree')}
                </label>
                <p className="text-sm text-muted-foreground">{t('terms.description')}</p>
              </div>
            </div>

            {/* Согласие на обработку персональных данных */}
            <div className="pt-4">
              <PrivacyConsent
                id="subscription-privacy-consent"
                checked={privacyConsent}
                onCheckedChange={setPrivacyConsent}
                size="md"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            disabled={isProcessing || !agreedToTerms || !privacyConsent}
            onClick={handleSubscribe}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('buttons.processing')}
              </>
            ) : (
              t('buttons.subscribe')
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => router.push(`/${locale}/account/subscriptions`)}
          disabled={isProcessing}
        >
          {t('buttons.cancel')}
        </Button>
      </div>
    </div>
  )
}
