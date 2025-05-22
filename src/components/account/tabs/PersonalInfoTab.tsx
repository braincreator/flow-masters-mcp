'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, Loader2 } from 'lucide-react'

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
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onUpdate) return
    
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      locale: formData.get('locale')
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
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name || ''}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder={t('placeholders.fullName')}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('fields.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email || ''}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              {t('fields.emailReadOnly')}
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('fields.phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={user.phone || ''}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder={t('placeholders.phone')}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="locale" className="text-sm font-medium">
              {t('fields.language')}
            </label>
            <select
              id="locale"
              name="locale"
              defaultValue={user.locale || 'ru'}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="ru">{t('languages.russian')}</option>
              <option value="en">{t('languages.english')}</option>
            </select>
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