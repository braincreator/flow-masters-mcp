'use client'

import { useState, useEffect } from 'react'
import { Subscription, SubscriptionPlan } from '@/types/subscription'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, PauseCircle, PlayCircle, XCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ManageSubscriptionsProps {
  userId: string
  locale?: string
}

// Статус подписки с цветом и локализованным названием
type StatusInfo = {
  label: string
  color: string
}

export default function ManageSubscriptions({ userId, locale = 'ru' }: ManageSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<
    Array<Subscription & { plan?: SubscriptionPlan }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingSubscriptionId, setProcessingSubscriptionId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'cancel' | 'pause' | 'resume' | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  // Загрузка подписок
  useEffect(() => {
    async function fetchUserSubscriptions() {
      try {
        setLoading(true)

        const response = await fetch(`/api/v1/subscription/user/${userId}`)

        if (!response.ok) {
          throw new Error('Не удалось загрузить подписки пользователя')
        }

        const data = await response.json()

        if (data.success && data.subscriptions) {
          // Загружаем информацию о планах подписок
          const subscriptionsWithPlans = await Promise.all(
            data.subscriptions.map(async (subscription: Subscription) => {
              try {
                // Это может быть уже relationTo в Payload, но для демонстрации делаем отдельный запрос
                const planResponse = await fetch(
                  `/api/v1/subscription/plans/${subscription.planId}`,
                )
                if (planResponse.ok) {
                  const planData = await planResponse.json()
                  return {
                    ...subscription,
                    plan: planData.plan,
                  }
                }
              } catch (error) {
                console.error(`Error fetching plan for subscription ${subscription.id}:`, error)
              }
              return subscription
            }),
          )

          setSubscriptions(subscriptionsWithPlans)
        } else {
          throw new Error(data.error || 'Ошибка загрузки подписок')
        }
      } catch (error) {
        console.error('Error fetching user subscriptions:', error)
        setError(error instanceof Error ? error.message : 'Произошла ошибка')
      } finally {
        setLoading(false)
      }
    }

    fetchUserSubscriptions()
  }, [userId])

  // Локализованные статусы подписок
  const getStatusInfo = (status: string): StatusInfo => {
    if (locale === 'ru') {
      switch (status) {
        case 'active':
          return { label: 'Активна', color: 'bg-green-500' }
        case 'paused':
          return { label: 'Приостановлена', color: 'bg-amber-500' }
        case 'canceled':
          return { label: 'Отменена', color: 'bg-red-500' }
        case 'expired':
          return { label: 'Истекла', color: 'bg-gray-500' }
        case 'failed':
          return { label: 'Ошибка оплаты', color: 'bg-red-500' }
        case 'pending':
          return { label: 'Ожидает оплаты', color: 'bg-blue-500' }
        default:
          return { label: status, color: 'bg-gray-500' }
      }
    } else {
      switch (status) {
        case 'active':
          return { label: 'Active', color: 'bg-green-500' }
        case 'paused':
          return { label: 'Paused', color: 'bg-amber-500' }
        case 'canceled':
          return { label: 'Canceled', color: 'bg-red-500' }
        case 'expired':
          return { label: 'Expired', color: 'bg-gray-500' }
        case 'failed':
          return { label: 'Payment Failed', color: 'bg-red-500' }
        case 'pending':
          return { label: 'Pending', color: 'bg-blue-500' }
        default:
          return { label: status, color: 'bg-gray-500' }
      }
    }
  }

  // Форматирование периода
  const formatPeriod = (period: string): string => {
    if (locale === 'ru') {
      switch (period) {
        case 'daily':
          return 'Ежедневно'
        case 'weekly':
          return 'Еженедельно'
        case 'monthly':
          return 'Ежемесячно'
        case 'quarterly':
          return 'Ежеквартально'
        case 'annual':
          return 'Ежегодно'
        default:
          return period
      }
    } else {
      switch (period) {
        case 'daily':
          return 'Daily'
        case 'weekly':
          return 'Weekly'
        case 'monthly':
          return 'Monthly'
        case 'quarterly':
          return 'Quarterly'
        case 'annual':
          return 'Annual'
        default:
          return period
      }
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  // Обработка действий с подпиской
  const handleAction = async () => {
    if (!selectedSubscription || !actionType) return

    setConfirmDialogOpen(false)
    setProcessingSubscriptionId(selectedSubscription.id)

    try {
      let endpoint = ''
      let method = 'POST'

      switch (actionType) {
        case 'cancel':
          endpoint = `/api/v1/subscription/${selectedSubscription.id}?immediate=${false}`
          method = 'DELETE'
          break
        case 'pause':
          endpoint = `/api/v1/subscription/${selectedSubscription.id}/pause`
          method = 'POST'
          break
        case 'resume':
          endpoint = `/api/v1/subscription/${selectedSubscription.id}/resume`
          method = 'POST'
          break
      }

      const response = await fetch(endpoint, { method })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при выполнении действия')
      }

      // Обновляем список подписок
      const updatedSubscriptions = subscriptions.map((sub) => {
        if (sub.id === selectedSubscription.id) {
          let newStatus: string

          switch (actionType) {
            case 'cancel':
              newStatus = 'canceled'
              break
            case 'pause':
              newStatus = 'paused'
              break
            case 'resume':
              newStatus = 'active'
              break
            default:
              newStatus = sub.status
          }

          return { ...sub, status: newStatus }
        }
        return sub
      })

      setSubscriptions(updatedSubscriptions)
    } catch (error) {
      console.error(`Error ${actionType} subscription:`, error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setProcessingSubscriptionId(null)
      setSelectedSubscription(null)
      setActionType(null)
    }
  }

  // Показ диалога подтверждения
  const showConfirmation = (subscription: Subscription, action: 'cancel' | 'pause' | 'resume') => {
    setSelectedSubscription(subscription)
    setActionType(action)
    setConfirmDialogOpen(true)
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
        <h3 className="text-xl font-semibold mb-2">
          {locale === 'ru' ? 'Не удалось загрузить подписки' : 'Failed to load subscriptions'}
        </h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          {locale === 'ru' ? 'У вас нет активных подписок' : 'You have no subscriptions'}
        </h3>
        <p className="text-muted-foreground">
          {locale === 'ru'
            ? 'Выберите план подписки, чтобы начать пользоваться всеми возможностями'
            : 'Choose a subscription plan to start using all features'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {locale === 'ru' ? 'Ваши подписки' : 'Your Subscriptions'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {locale === 'ru'
            ? 'Управляйте своими подписками - приостанавливайте, возобновляйте или отменяйте их'
            : 'Manage your subscriptions - pause, resume or cancel them'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {subscriptions.map((subscription) => {
          const statusInfo = getStatusInfo(subscription.status)

          return (
            <Card key={subscription.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{subscription.plan?.name || 'Подписка'}</CardTitle>
                  <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                </div>
                <div className="mt-2">
                  <span className="text-lg font-medium">
                    {new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
                      style: 'currency',
                      currency: subscription.currency,
                    }).format(subscription.amount)}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    / {formatPeriod(subscription.period).toLowerCase()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {locale === 'ru' ? 'Дата начала:' : 'Start date:'}
                    </span>
                    <span className="text-sm ml-2">{formatDate(subscription.startDate)}</span>
                  </div>

                  {subscription.status === 'active' && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {locale === 'ru' ? 'Следующий платеж:' : 'Next payment:'}
                      </span>
                      <span className="text-sm ml-2">
                        {formatDate(subscription.nextPaymentDate)}
                      </span>
                    </div>
                  )}

                  {subscription.endDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {locale === 'ru' ? 'Дата окончания:' : 'End date:'}
                      </span>
                      <span className="text-sm ml-2">{formatDate(subscription.endDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                {subscription.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => showConfirmation(subscription, 'pause')}
                      disabled={processingSubscriptionId === subscription.id}
                    >
                      {processingSubscriptionId === subscription.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <PauseCircle className="h-4 w-4 mr-2" />
                      )}
                      {locale === 'ru' ? 'Приостановить' : 'Pause'}
                    </Button>

                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => showConfirmation(subscription, 'cancel')}
                      disabled={processingSubscriptionId === subscription.id}
                    >
                      {processingSubscriptionId === subscription.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {locale === 'ru' ? 'Отменить' : 'Cancel'}
                    </Button>
                  </>
                )}

                {subscription.status === 'paused' && (
                  <Button
                    className="w-full"
                    onClick={() => showConfirmation(subscription, 'resume')}
                    disabled={processingSubscriptionId === subscription.id}
                  >
                    {processingSubscriptionId === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <PlayCircle className="h-4 w-4 mr-2" />
                    )}
                    {locale === 'ru' ? 'Возобновить' : 'Resume'}
                  </Button>
                )}

                {(subscription.status === 'canceled' || subscription.status === 'expired') && (
                  <Button className="w-full" variant="outline" disabled>
                    {locale === 'ru' ? 'Подписка неактивна' : 'Subscription inactive'}
                  </Button>
                )}

                {subscription.status === 'failed' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      /* Редирект на страницу оплаты */
                    }}
                  >
                    {locale === 'ru' ? 'Обновить способ оплаты' : 'Update payment method'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'cancel' &&
                (locale === 'ru' ? 'Отменить подписку?' : 'Cancel subscription?')}
              {actionType === 'pause' &&
                (locale === 'ru' ? 'Приостановить подписку?' : 'Pause subscription?')}
              {actionType === 'resume' &&
                (locale === 'ru' ? 'Возобновить подписку?' : 'Resume subscription?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'cancel' &&
                (locale === 'ru'
                  ? 'Подписка будет отменена, но вы сможете пользоваться услугами до окончания оплаченного периода.'
                  : 'Your subscription will be canceled, but you can continue to use the service until the end of the paid period.')}
              {actionType === 'pause' &&
                (locale === 'ru'
                  ? 'Подписка будет приостановлена, и с вас не будут списываться средства до её возобновления.'
                  : 'Your subscription will be paused, and you will not be charged until you resume it.')}
              {actionType === 'resume' &&
                (locale === 'ru'
                  ? 'Подписка будет возобновлена, и следующий платеж будет списан в соответствии с периодом подписки.'
                  : 'Your subscription will be resumed, and the next payment will be charged according to the subscription period.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{locale === 'ru' ? 'Отмена' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {locale === 'ru' ? 'Подтвердить' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
