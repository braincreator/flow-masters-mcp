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
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ManageSubscriptionsProps {
  userId: string
  locale?: string
  storageKey?: string
}

// Статус подписки с цветом и локализованным названием
type StatusInfo = {
  label: string
  color: string
}

export default function ManageSubscriptions({ userId, locale = 'ru' }: ManageSubscriptionsProps) {
  const t = useTranslations('ManageSubscriptions')
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
          throw new Error(t('errorFetchSubscriptions'))
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
          throw new Error(data.error || t('errorFetchGeneric'))
        }
      } catch (error) {
        console.error('Error fetching user subscriptions:', error)
        setError(error instanceof Error ? error.message : t('errorFetchGeneric'))
      } finally {
        setLoading(false)
      }
    }

    fetchUserSubscriptions()
  }, [userId, t])

  // Локализованные статусы подписок
  const getStatusInfo = (status: string): StatusInfo => {
    const statusKey = `status${status.charAt(0).toUpperCase() + status.slice(1)}`
    const label = t.rich(statusKey, { default: status })
    let color = 'bg-gray-500' // Default color

    switch (status) {
      case 'active':
        color = 'bg-green-500'
        break
      case 'paused':
        color = 'bg-amber-500'
        break
      case 'canceled':
      case 'failed':
        color = 'bg-red-500'
        break
      case 'pending':
        color = 'bg-blue-500'
        break
    }

    return { label: label || status, color }
  }

  // Форматирование периода
  const formatPeriod = (period: string): string => {
    const periodKey = `period${period.charAt(0).toUpperCase() + period.slice(1)}`
    return t.rich(periodKey, { default: period }) || period
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
        throw new Error(errorData.error || t('errorActionGeneric'))
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
      setError(error instanceof Error ? error.message : t('errorActionGeneric'))
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

  // Заголовки и текст диалога
  const getConfirmationDetails = () => {
    if (!actionType) return { title: '', description: '', actionText: '' }
    const title = t('confirmTitle')
    const description = t(`confirmDescription${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`)
    const actionText = t(`confirmAction${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`)
    return { title, description, actionText }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
        <span>{t('loadingMessage')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t('errorTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noSubscriptionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {t('noSubscriptionsDescription')}
          </p>
          <Button asChild>
            <Link href={`/${locale}/account/subscriptions/new`}>
              {t('browsePlansButton')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('yourSubscriptionsTitle')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('manageSubscriptionsDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {subscriptions.map((subscription) => {
          const statusInfo = getStatusInfo(subscription.status)

          return (
            <Card key={subscription.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{subscription.plan?.name || t('planLabel')}</CardTitle>
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
                      {t('startDateLabel')}
                    </span>
                    <span className="text-sm ml-2">{formatDate(subscription.startDate)}</span>
                  </div>

                  {subscription.status === 'active' && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('nextPaymentLabel')}
                      </span>
                      <span className="text-sm ml-2">
                        {formatDate(subscription.nextPaymentDate)}
                      </span>
                    </div>
                  )}

                  {subscription.endDate && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('endDateLabel')}
                      </span>
                      <span className="text-sm ml-2">{formatDate(subscription.endDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className={cn(
                "flex gap-2",
                subscription.status === 'active' && "grid grid-cols-2"
              )}>
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
                      <span className="ml-2">{t('pauseButton')}</span>
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
                      <span className="ml-2">{t('cancelButton')}</span>
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
                    <span className="ml-2">{t('resumeButton')}</span>
                  </Button>
                )}

                {(subscription.status === 'canceled' || subscription.status === 'expired') && (
                  <Button className="w-full" variant="outline" disabled>
                    {t('inactiveSubscription')}
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
                    {t('updatePaymentMethod')}
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
            <AlertDialogTitle>{getConfirmationDetails().title}</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationDetails().description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
              {t('confirmCancelButton')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={processingSubscriptionId === selectedSubscription?.id}
            >
              {processingSubscriptionId === selectedSubscription?.id
                ? t('processing')
                : getConfirmationDetails().actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
