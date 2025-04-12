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
  heading = 'Выберите подходящий план',
  description = 'Подпишитесь на план, который подходит вашим потребностям',
}: SubscriptionPlansProps) {
  const router = useRouter()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/v1/subscription/plans')
        if (!response.ok) throw new Error('Failed to fetch plans')
        const data = await response.json()

        if (data.success && data.plans) {
          setPlans(data.plans)
        } else {
          throw new Error(data.error || 'Ошибка загрузки планов подписок')
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error)
        setError(error instanceof Error ? error.message : 'Произошла ошибка')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId)
    if (onSelectPlan) {
      onSelectPlan(planId)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setProcessingPlanId(planId)

      // Получаем план
      const plan = plans.find((p) => p.id === planId)
      if (!plan) {
        throw new Error('План не найден')
      }

      // Здесь обычно был бы перенаправление на страницу оформления
      // или вызов модального окна с выбором способа оплаты

      // Для демонстрации просто перенаправляем на страницу создания подписки
      router.push(`/${locale}/subscription/checkout?planId=${planId}&userId=${userId}`)
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при подписке')
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
        <h3 className="text-xl font-semibold mb-2">Не удалось загрузить планы подписок</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Планы подписок не найдены</h3>
        <p className="text-muted-foreground">В настоящее время нет доступных планов подписок</p>
      </div>
    )
  }

  // Функция форматирования периода для отображения
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

  // Форматирование цены
  const formatPrice = (price: number, currency: string, period: string) => {
    const formatter = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    return `${formatter.format(price)}/${locale === 'ru' ? formatPeriod(period) : formatPeriod(period)}`
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
            className={`flex flex-col ${selectedPlanId === plan.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
          >
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
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm italic">Нет описания функций</p>
              )}

              {plan.trialPeriodDays && plan.trialPeriodDays > 0 && (
                <div className="mt-4 p-2 bg-primary/10 rounded text-sm">
                  {locale === 'ru'
                    ? `Включает бесплатный пробный период: ${plan.trialPeriodDays} дней`
                    : `Includes free trial: ${plan.trialPeriodDays} days`}
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
                    {locale === 'ru' ? 'Обработка...' : 'Processing...'}
                  </>
                ) : locale === 'ru' ? (
                  'Подписаться'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
