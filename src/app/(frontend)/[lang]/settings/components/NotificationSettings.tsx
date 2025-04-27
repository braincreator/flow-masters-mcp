'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  useEmailNotificationPreferences,
  usePushNotificationPreferences,
  useNotificationFrequency,
} from '@/hooks/useContexts'
// Define User interface based on AuthProvider
interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
  bio?: string
}

interface NotificationSettingsProps {
  user: User
  locale: string
}

export function NotificationSettings(_props: NotificationSettingsProps) {
  const t = useTranslations('Settings.notifications')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Use selector hooks for better performance
  const {
    emailNotifications,
    updateEmailNotifications,
    resetEmailNotifications,
    isLoading: emailLoading,
  } = useEmailNotificationPreferences()

  const {
    pushNotifications,
    updatePushNotifications,
    resetPushNotifications,
    isLoading: pushLoading,
  } = usePushNotificationPreferences()

  const {
    notificationFrequency,
    updateNotificationFrequency,
    isLoading: frequencyLoading,
  } = useNotificationFrequency()

  // Combined loading state
  const isLoading = emailLoading || pushLoading || frequencyLoading

  async function onSubmit() {
    setSuccess('')
    setError('')

    try {
      // Update all notification preferences at once
      await Promise.all([
        updateEmailNotifications(emailNotifications),
        updatePushNotifications(pushNotifications),
        updateNotificationFrequency(notificationFrequency),
      ])

      setSuccess(t('successMessage'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorMessage'))
      console.error('Error updating notification settings:', err)
    }
  }

  // Reset all notification preferences to defaults
  async function resetAll() {
    setSuccess('')
    setError('')

    try {
      await Promise.all([resetEmailNotifications(), resetPushNotifications()])

      // Also reset frequency to immediately
      await updateNotificationFrequency('immediately')

      setSuccess(t('resetSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resetError'))
      console.error('Error resetting notification preferences:', err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('emailNotifications')}</h3>
              <div className="grid gap-4">
                {Object.entries(emailNotifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`email-${key}`} className="flex-1">
                      {t(`categories.${key}`)}
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateEmailNotifications({ [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('pushNotifications')}</h3>
              <div className="grid gap-4">
                {Object.entries(pushNotifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`push-${key}`} className="flex-1">
                      {t(`categories.${key}`)}
                    </Label>
                    <Switch
                      id={`push-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updatePushNotifications({ [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('frequency.title')}</h3>
              <RadioGroup
                value={notificationFrequency}
                onValueChange={(value) => updateNotificationFrequency(value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediately" id="immediately" />
                  <Label htmlFor="immediately">{t('frequency.immediately')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">{t('frequency.daily')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">{t('frequency.weekly')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">{t('frequency.never')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetAll}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              {t('resetButton')}
            </Button>

            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('savingButton')}
                </>
              ) : (
                t('saveButton')
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
