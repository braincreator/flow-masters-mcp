'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Check, Loader2 } from 'lucide-react'

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
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onUpdate) return
    
    setIsLoading(true)
    setIsSuccess(false)
    
    const formData = new FormData(event.currentTarget)
    
    const updatedPreferences: NotificationPreferences = {
      email: {
        orderUpdates: formData.get('orderUpdates') === 'on',
        subscriptionUpdates: formData.get('subscriptionUpdates') === 'on',
        accountActivity: formData.get('accountActivity') === 'on',
        marketingAndPromotions: formData.get('marketingAndPromotions') === 'on',
        productNewsAndTips: formData.get('productNewsAndTips') === 'on',
      },
      notificationFrequency: formData.get('frequency') as 'immediately' | 'daily' | 'weekly' | 'never',
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
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="orderUpdates"
                  name="orderUpdates"
                  type="checkbox"
                  defaultChecked={preferences.email?.orderUpdates}
                  className="w-4 h-4 text-accent border-border rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="orderUpdates" className="font-medium">
                  {t('notifications.orderUpdates.title')}
                </label>
                <p className="text-muted-foreground">
                  {t('notifications.orderUpdates.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="subscriptionUpdates"
                  name="subscriptionUpdates"
                  type="checkbox"
                  defaultChecked={preferences.email?.subscriptionUpdates}
                  className="w-4 h-4 text-accent border-border rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="subscriptionUpdates" className="font-medium">
                  {t('notifications.subscriptionUpdates.title')}
                </label>
                <p className="text-muted-foreground">
                  {t('notifications.subscriptionUpdates.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="accountActivity"
                  name="accountActivity"
                  type="checkbox"
                  defaultChecked={preferences.email?.accountActivity}
                  className="w-4 h-4 text-accent border-border rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="accountActivity" className="font-medium">
                  {t('notifications.accountActivity.title')}
                </label>
                <p className="text-muted-foreground">
                  {t('notifications.accountActivity.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="marketingAndPromotions"
                  name="marketingAndPromotions"
                  type="checkbox"
                  defaultChecked={preferences.email?.marketingAndPromotions}
                  className="w-4 h-4 text-accent border-border rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="marketingAndPromotions" className="font-medium">
                  {t('notifications.marketing.title')}
                </label>
                <p className="text-muted-foreground">
                  {t('notifications.marketing.description')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="productNewsAndTips"
                  name="productNewsAndTips"
                  type="checkbox"
                  defaultChecked={preferences.email?.productNewsAndTips}
                  className="w-4 h-4 text-accent border-border rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="productNewsAndTips" className="font-medium">
                  {t('notifications.productNews.title')}
                </label>
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
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="frequency-immediately"
                  name="frequency"
                  type="radio"
                  value="immediately"
                  defaultChecked={preferences.notificationFrequency === 'immediately'}
                  className="w-4 h-4 text-accent border-border"
                />
                <label htmlFor="frequency-immediately" className="ml-3 text-sm font-medium">
                  {t('notifications.frequency.immediately')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="frequency-daily"
                  name="frequency"
                  type="radio"
                  value="daily"
                  defaultChecked={preferences.notificationFrequency === 'daily'}
                  className="w-4 h-4 text-accent border-border"
                />
                <label htmlFor="frequency-daily" className="ml-3 text-sm font-medium">
                  {t('notifications.frequency.daily')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="frequency-weekly"
                  name="frequency"
                  type="radio"
                  value="weekly"
                  defaultChecked={preferences.notificationFrequency === 'weekly'}
                  className="w-4 h-4 text-accent border-border"
                />
                <label htmlFor="frequency-weekly" className="ml-3 text-sm font-medium">
                  {t('notifications.frequency.weekly')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="frequency-never"
                  name="frequency"
                  type="radio"
                  value="never"
                  defaultChecked={preferences.notificationFrequency === 'never'}
                  className="w-4 h-4 text-accent border-border"
                />
                <label htmlFor="frequency-never" className="ml-3 text-sm font-medium">
                  {t('notifications.frequency.never')}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
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
          </button>
        </div>
      </form>
    </div>
  )
}