'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Check, Loader2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface NotificationPreferences {
  email?: {
    orderUpdates?: boolean
    subscriptionUpdates?: boolean
    accountActivity?: boolean
    marketingAndPromotions?: boolean
    productNewsAndTips?: boolean
  }
  notificationFrequency?: 'immediately' | 'daily' | 'weekly' | 'never'
}

interface NotificationsTabProps {
  preferences: NotificationPreferences
  onUpdate?: (data: NotificationPreferences) => Promise<void>
}

export function NotificationsTab({ preferences, onUpdate }: NotificationsTabProps) {
  const t = useTranslations('Account.Profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Состояние для чекбоксов
  const [orderUpdates, setOrderUpdates] = useState(preferences.email?.orderUpdates || false)
  const [subscriptionUpdates, setSubscriptionUpdates] = useState(
    preferences.email?.subscriptionUpdates || false,
  )
  const [accountActivity, setAccountActivity] = useState(
    preferences.email?.accountActivity || false,
  )
  const [marketingAndPromotions, setMarketingAndPromotions] = useState(
    preferences.email?.marketingAndPromotions || false,
  )
  const [productNewsAndTips, setProductNewsAndTips] = useState(
    preferences.email?.productNewsAndTips || false,
  )

  // Состояние для радио-кнопок
  const [frequency, setFrequency] = useState(preferences.notificationFrequency || 'immediately')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onUpdate) return

    setIsLoading(true)
    setIsSuccess(false)

    const updatedPreferences: NotificationPreferences = {
      email: {
        orderUpdates,
        subscriptionUpdates,
        accountActivity,
        marketingAndPromotions,
        productNewsAndTips,
      },
      notificationFrequency: frequency as 'immediately' | 'daily' | 'weekly' | 'never',
    }

    try {
      await onUpdate(updatedPreferences)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">{t('notifications.emailNotifications')}</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="orderUpdates"
                checked={orderUpdates}
                onCheckedChange={setOrderUpdates}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="orderUpdates" className="font-medium">
                  {t('notifications.orderUpdates.title')}
                </Label>
                <p className="text-muted-foreground">
                  {t('notifications.orderUpdates.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="subscriptionUpdates"
                checked={subscriptionUpdates}
                onCheckedChange={setSubscriptionUpdates}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="subscriptionUpdates" className="font-medium">
                  {t('notifications.subscriptionUpdates.title')}
                </Label>
                <p className="text-muted-foreground">
                  {t('notifications.subscriptionUpdates.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accountActivity"
                checked={accountActivity}
                onCheckedChange={setAccountActivity}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="accountActivity" className="font-medium">
                  {t('notifications.accountActivity.title')}
                </Label>
                <p className="text-muted-foreground">
                  {t('notifications.accountActivity.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketingAndPromotions"
                checked={marketingAndPromotions}
                onCheckedChange={setMarketingAndPromotions}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="marketingAndPromotions" className="font-medium">
                  {t('notifications.marketing.title')}
                </Label>
                <p className="text-muted-foreground">{t('notifications.marketing.description')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="productNewsAndTips"
                checked={productNewsAndTips}
                onCheckedChange={setProductNewsAndTips}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="productNewsAndTips" className="font-medium">
                  {t('notifications.productNews.title')}
                </Label>
                <p className="text-muted-foreground">
                  {t('notifications.productNews.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">{t('notifications.frequency.title')}</h3>
          <div className="bg-muted/40 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-4">
              {t('notifications.frequency.description')}
            </p>
            <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediately" id="frequency-immediately" />
                <Label htmlFor="frequency-immediately" className="text-sm font-medium">
                  {t('notifications.frequency.immediately')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="frequency-daily" />
                <Label htmlFor="frequency-daily" className="text-sm font-medium">
                  {t('notifications.frequency.daily')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="frequency-weekly" />
                <Label htmlFor="frequency-weekly" className="text-sm font-medium">
                  {t('notifications.frequency.weekly')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="frequency-never" />
                <Label htmlFor="frequency-never" className="text-sm font-medium">
                  {t('notifications.frequency.never')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('buttons.saving')}
              </>
            ) : isSuccess ? (
              <>
                <Check className="h-4 w-4" />
                {t('buttons.saved')}
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                {t('buttons.savePreferences')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
