'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Shield, Loader2 } from 'lucide-react'
import { PasswordInput } from '@/components/ui/password-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface SecurityTabProps {
  onPasswordChange?: (data: any) => Promise<void>
}

export function SecurityTab({ onPasswordChange }: SecurityTabProps) {
  const t = useTranslations('Account.Profile')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onPasswordChange) return

    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Reset error state
    setPasswordError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError(t('errors.passwordsDoNotMatch'))
      return
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setPasswordError(t('errors.passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
      await onPasswordChange({ currentPassword, newPassword })
      // Reset form on success
      event.currentTarget.reset()
    } catch (error) {
      logError('Failed to change password:', error)
      setPasswordError(t('errors.passwordChangeFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-amber-50 to-background dark:from-amber-950/20 dark:to-background p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">
              {t('security.passwordTips.title')}
            </h3>
            <ul className="mt-2 text-sm space-y-1 text-amber-700 dark:text-amber-400/80">
              <li>{t('security.passwordTips.length')}</li>
              <li>{t('security.passwordTips.mixture')}</li>
              <li>{t('security.passwordTips.avoid')}</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {passwordError && (
          <Alert variant="destructive">
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('security.currentPassword')}</Label>
            <PasswordInput id="currentPassword" name="currentPassword" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('security.newPassword')}</Label>
            <PasswordInput id="newPassword" name="newPassword" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('security.confirmPassword')}</Label>
            <PasswordInput id="confirmPassword" name="confirmPassword" required />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('buttons.updating')}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                {t('buttons.updatePassword')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
