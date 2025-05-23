'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  name?: string | null
  email?: string | null
  phone?: string | null
  locale?: string
}

interface PersonalInfoTabProps {
  user: User
  onUpdate?: (data: any) => Promise<void>
}

export function PersonalInfoTab({ user, onUpdate }: PersonalInfoTabProps) {
  const t = useTranslations('Account.Profile')
  const [isLoading, setIsLoading] = useState(false)
  const [locale, setLocale] = useState(user.locale || 'ru')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onUpdate) return

    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      locale: locale, // Используем состояние для locale
    }

    try {
      await onUpdate(data)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('fields.fullName')}
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name || ''}
              placeholder={t('placeholders.fullName')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('fields.email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email || ''}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{t('fields.emailReadOnly')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('fields.phone')}
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone || ''}
              placeholder={t('placeholders.phone')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="locale" className="text-sm font-medium">
              {t('fields.language')}
            </label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">{t('languages.russian')}</SelectItem>
                <SelectItem value="en">{t('languages.english')}</SelectItem>
              </SelectContent>
            </Select>
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
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('buttons.saveChanges')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
