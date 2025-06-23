'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SubscriptionPlansProps {
  userId: string
  locale?: string
  onSelectPlan?: (planId: string) => void
  heading?: string
  description?: string
}

export default function SubscriptionPlans({
  userId,
  locale = 'ru',
  onSelectPlan,
  heading: initialHeading,
  description: initialDescription,
}: SubscriptionPlansProps) {
  const t = useTranslations('SubscriptionPlans')
  const subT = useTranslations('Subscription.checkout')
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)

  const heading = initialHeading || t('defaultHeading')
  const description = initialDescription || t('defaultDescription')

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/v1/subscription/plans?locale=${locale}&status=active`)
        if (!response.ok) throw new Error(t('errorFetchPlans'))
        const data = await response.json()

        if (data.success && data.plans) {
          setPlans(data.plans)
        } else {
          throw new Error(data.error || t('errorLoadingPlans'))
        }
      } catch (error) {
        logError('Error fetching subscription plans:', error)
        setError(error instanceof Error ? error.message : t('errorGeneric'))
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [t, locale])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    if (onSelectPlan) {
      onSelectPlan(planId)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPlanId(planId)

      const plan = plans.find((p) => p.id === planId)
      if (!plan) {
        throw new Error(t('errorPlanNotFound'))
      }

      router.push(`/${locale}/subscription/checkout?planId=${planId}&userId=${userId}`)
    } catch (error) {
      logError('Error subscribing to plan:', error)
      setError(error instanceof Error ? error.message : t('errorSubscribing'))
    } finally {
      setProcessingPlanId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('errorLoading')}</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('notFoundTitle')}</h3>
        <p className="text-muted-foreground">{t('notFoundDescription')}</p>
      </div>
    )
  }

  const formatPeriod = (period: string) => {
    switch (period) {
      case 'daily':
        return t('periods.daily')
      case 'weekly':
        return t('periods.weekly')
      case 'monthly':
        return t('periods.monthly')
      case 'quarterly':
        return t('periods.quarterly')
      case 'annual':
        return t('periods.annual')
      default:
        return period
    }
  }

  const formatPrice = (price: number, currency: string, period: string) => {
    const formatter = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return t('priceFormat', { price: formatter.format(price), period: formatPeriod(period) })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative ${selectedPlanId === plan.id ? 'border-primary ring-2 ring-primary/20' : ''} ${
              plan.isPopular ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {t('popularBadge')}
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {formatPrice(plan.price, plan.currency, plan.period)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-grow">
              {plan.features && plan.features.length > 0 ? (
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span>{typeof feature === 'string' ? feature : feature.feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm italic">{t('noFeaturesDescription')}</p>
              )}

              {plan.trialPeriodDays && plan.trialPeriodDays > 0 && (
                <div className="mt-4 p-2 bg-primary/10 rounded text-sm">
                  {t('trialPeriod', { count: plan.trialPeriodDays })}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                disabled={processingPlanId === plan.id}
              >
                {processingPlanId === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {subT('buttons.processing')}
                  </>
                ) : (
                  subT('buttons.subscribeLabel')
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
