'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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
import { useRouter } from 'next/navigation'

interface LanguageSettingsProps {
  user: User
  locale: string
}

export function LanguageSettings({ user, locale }: LanguageSettingsProps) {
  const t = useTranslations('Settings.language')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState(locale)

  async function onSubmit() {
    setIsLoading(true)
    setSuccess('')
    setError('')

    try {
      // Here you would implement the API call to update language settings
      // For now, we'll just simulate a successful update and redirect to the selected language
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (selectedLanguage !== locale) {
        // Redirect to the same page but with the new locale
        const currentPath = window.location.pathname
        const newPath = currentPath.replace(`/${locale}/`, `/${selectedLanguage}/`)
        router.push(newPath)
      } else {
        setSuccess(t('successMessage'))
      }
    } catch (err) {
      setError(t('errorMessage'))
      console.error('Error updating language settings:', err)
    } finally {
      setIsLoading(false)
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('selectLabel')}</h3>
              <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en">{t('languages.en')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ru" id="ru" />
                  <Label htmlFor="ru">{t('languages.ru')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="flex justify-end">
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
