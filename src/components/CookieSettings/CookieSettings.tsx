'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, BarChart3, Target, Palette, Cookie, RefreshCw } from 'lucide-react'
import { useCookieConsent, DetailedConsent } from '@/hooks/useCookieConsent'
import { toast } from 'sonner'

interface CookieCategory {
  key: keyof DetailedConsent
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  details: string[]
  required: boolean
}

const cookieCategories: CookieCategory[] = [
  {
    key: 'necessary',
    icon: Shield,
    title: 'Необходимые cookies',
    description: 'Обеспечивают базовую функциональность сайта и не могут быть отключены.',
    details: [
      'Аутентификация пользователя',
      'Настройки безопасности',
      'Сохранение корзины покупок',
      'Согласие на использование cookies'
    ],
    required: true,
  },
  {
    key: 'analytics',
    icon: BarChart3,
    title: 'Аналитические cookies',
    description: 'Помогают понять, как посетители используют сайт, для улучшения пользовательского опыта.',
    details: [
      'Google Analytics',
      'Яндекс.Метрика',
      'Статистика посещений',
      'Анализ поведения пользователей'
    ],
    required: false,
  },
  {
    key: 'marketing',
    icon: Target,
    title: 'Маркетинговые cookies',
    description: 'Используются для персонализации рекламы и отслеживания эффективности рекламных кампаний.',
    details: [
      'Facebook Pixel',
      'Google Ads',
      'VK Pixel',
      'Ретаргетинг и конверсии'
    ],
    required: false,
  },
  {
    key: 'preferences',
    icon: Palette,
    title: 'Cookies предпочтений',
    description: 'Запоминают ваши настройки и предпочтения для персонализации опыта.',
    details: [
      'Языковые настройки',
      'Тема оформления',
      'Пользовательские настройки',
      'Сохраненные фильтры'
    ],
    required: false,
  },
]

export function CookieSettings() {
  const { detailedConsent, updateConsent, clearConsent } = useCookieConsent()

  const handleToggle = (category: keyof DetailedConsent, value: boolean) => {
    if (category === 'necessary') return // Нельзя отключить необходимые cookies
    
    if (!detailedConsent) return

    const newConsent: DetailedConsent = {
      ...detailedConsent,
      [category]: value
    }

    const hasAnyOptional = newConsent.analytics || newConsent.marketing || newConsent.preferences
    const status = hasAnyOptional ? 'custom' : 'necessary'
    
    updateConsent(newConsent, status)
    toast.success('Настройки cookies обновлены')
  }

  const handleAcceptAll = () => {
    const fullConsent: DetailedConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    updateConsent(fullConsent, 'all')
    toast.success('Все cookies разрешены')
  }

  const handleRejectAll = () => {
    const necessaryConsent: DetailedConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    }
    updateConsent(necessaryConsent, 'necessary')
    toast.success('Разрешены только необходимые cookies')
  }

  const handleReset = () => {
    clearConsent()
    toast.success('Настройки cookies сброшены')
  }

  if (!detailedConsent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="w-5 h-5" />
            Настройки cookies
          </CardTitle>
          <CardDescription>
            Согласие на использование cookies не предоставлено. Пожалуйста, обновите страницу.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="w-5 h-5" />
            Настройки cookies
          </CardTitle>
          <CardDescription>
            Управляйте тем, какие cookies мы можем использовать для улучшения вашего опыта.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleAcceptAll} size="sm">
              Разрешить все
            </Button>
            <Button onClick={handleRejectAll} variant="outline" size="sm">
              Только необходимые
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {cookieCategories.map((category) => {
          const Icon = category.icon
          const isEnabled = detailedConsent[category.key]
          
          return (
            <Card key={category.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {category.title}
                        {category.required && (
                          <Badge variant="secondary" className="text-xs">
                            Обязательно
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(category.key, checked)}
                    disabled={category.required}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Включает:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {category.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
