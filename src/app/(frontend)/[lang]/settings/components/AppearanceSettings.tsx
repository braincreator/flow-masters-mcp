'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sun, Moon, Monitor } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useThemeSwitch } from '@/hooks/useThemeSwitch'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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

interface AppearanceSettingsProps {
  user: User
  locale: string
}

export function AppearanceSettings({ user: _user, locale: _locale }: AppearanceSettingsProps) {
  const t = useTranslations('Settings.appearance')

  // Use the real theme provider instead of the mock
  const { theme, switchTheme } = useThemeSwitch()

  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [fontSize, setFontSize] = useState('medium')
  const [colorScheme, setColorScheme] = useState('default')

  async function onSubmit() {
    setIsLoading(true)
    setSuccess('')
    setError('')

    try {
      // Here you would implement the API call to update appearance settings
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(t('successMessage'))
    } catch (err) {
      setError(t('errorMessage'))
      logError('Error updating appearance settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefault = () => {
    switchTheme('system')
    setFontSize('medium')
    setColorScheme('default')
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
            {/* Theme Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('theme.title')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => switchTheme('light')}
                >
                  <Sun className="h-6 w-6" />
                  <span>{t('theme.light')}</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => switchTheme('dark')}
                >
                  <Moon className="h-6 w-6" />
                  <span>{t('theme.dark')}</span>
                </div>
                <div
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    theme === 'system'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => switchTheme('system')}
                >
                  <Monitor className="h-6 w-6" />
                  <span>{t('theme.system')}</span>
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('fontSize.title')}</h3>
              <RadioGroup value={fontSize} onValueChange={setFontSize}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label htmlFor="small">{t('fontSize.small')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">{t('fontSize.medium')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label htmlFor="large">{t('fontSize.large')}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Color Scheme */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('colorScheme.title')}</h3>
              <RadioGroup value={colorScheme} onValueChange={setColorScheme}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="default" />
                  <Label htmlFor="default">{t('colorScheme.default')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blue" id="blue" />
                  <Label htmlFor="blue">{t('colorScheme.blue')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green" id="green" />
                  <Label htmlFor="green">{t('colorScheme.green')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purple" id="purple" />
                  <Label htmlFor="purple">{t('colorScheme.purple')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetToDefault}>
              {t('resetButton')}
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('savingButton', { defaultValue: 'Saving...' })}
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
