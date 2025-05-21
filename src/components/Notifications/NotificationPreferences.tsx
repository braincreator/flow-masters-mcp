'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NotificationStoredType } from '@/types/notifications'
import { toast } from '@/components/ui/use-toast'
import { AlertCircle, Bell, BellOff, Info, Settings } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

interface NotificationPreferencesProps {
  onSave: (preferences: NotificationPreferences) => Promise<void>
  initialPreferences?: NotificationPreferences
}

export interface NotificationPreferences {
  channels: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  types: Record<
    NotificationStoredType,
    {
      enabled: boolean
      priority: 'low' | 'normal' | 'high'
    }
  >
  frequency: 'immediately' | 'daily-digest' | 'weekly-digest' | 'custom'
  schedule?: {
    daysOfWeek?: number[] // 0-6, где 0 - воскресенье
    time?: string // формат "HH:MM"
  }
  quietHours: {
    enabled: boolean
    start: string // "HH:MM"
    end: string // "HH:MM"
  }
}

// Группировка типов уведомлений по категориям для лучшего UX
const notificationGroups = [
  {
    title: 'Course & Learning',
    description: 'Уведомления о прогрессе в обучении',
    types: [
      NotificationStoredType.COURSE_ENROLLED,
      NotificationStoredType.LESSON_COMPLETED,
      NotificationStoredType.MODULE_COMPLETED,
      NotificationStoredType.ASSESSMENT_SUBMITTED,
      NotificationStoredType.ASSESSMENT_GRADED,
      NotificationStoredType.COURSE_COMPLETED,
      NotificationStoredType.CERTIFICATE_ISSUED,
    ],
  },
  {
    title: 'Achievements & Rewards',
    description: 'Уведомления о достижениях и наградах',
    types: [NotificationStoredType.ACHIEVEMENT_UNLOCKED, NotificationStoredType.LEVEL_UP],
  },
  {
    title: 'System & Billing',
    description: 'Важные системные уведомления',
    types: [
      NotificationStoredType.SYSTEM_ALERT,
      NotificationStoredType.GENERAL_INFO,
      NotificationStoredType.ORDER_UPDATE,
      NotificationStoredType.SUBSCRIPTION_UPDATE,
    ],
  },
  {
    title: 'Account & Social',
    description: 'Уведомления о вашем аккаунте и социальных взаимодействиях',
    types: [NotificationStoredType.ACCOUNT_ACTIVITY, NotificationStoredType.SOCIAL_INTERACTION],
  },
  {
    title: 'Marketing & Promotions',
    description: 'Рекламные предложения и акции',
    types: [NotificationStoredType.PROMOTIONAL],
  },
]

// Получение человекочитаемого названия типа уведомления
const getHumanReadableType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Создаем дефолтные предпочтения
const defaultPreferences: NotificationPreferences = {
  channels: {
    email: true,
    push: true,
    inApp: true,
  },
  types: Object.values(NotificationStoredType).reduce(
    (acc, type) => {
      acc[type] = {
        enabled: true,
        priority: 'normal',
      }
      return acc
    },
    {} as Record<NotificationStoredType, { enabled: boolean; priority: 'low' | 'normal' | 'high' }>,
  ),
  frequency: 'immediately',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  onSave,
  initialPreferences,
}) => {
  const t = useTranslations('NotificationPreferences')
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences || defaultPreferences,
  )
  const [isSaving, setIsSaving] = useState(false)

  // Обработчик для изменения канала уведомлений
  const handleChannelChange = (
    channel: keyof NotificationPreferences['channels'],
    value: boolean,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value,
      },
    }))
  }

  // Обработчик для изменения состояния типа уведомлений
  const handleTypeToggle = (type: NotificationStoredType, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: {
          ...prev.types[type],
          enabled: value,
        },
      },
    }))
  }

  // Обработчик для изменения приоритета типа уведомлений
  const handlePriorityChange = (
    type: NotificationStoredType,
    priority: 'low' | 'normal' | 'high',
  ) => {
    setPreferences((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: {
          ...prev.types[type],
          priority,
        },
      },
    }))
  }

  // Обработчик для изменения частоты уведомлений
  const handleFrequencyChange = (frequency: NotificationPreferences['frequency']) => {
    setPreferences((prev) => ({
      ...prev,
      frequency,
    }))
  }

  // Обработчик для изменения Тихих часов
  const handleQuietHoursChange = (
    field: keyof NotificationPreferences['quietHours'],
    value: any,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value,
      },
    }))
  }

  // Обработчик для сохранения предпочтений
  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      await onSave(preferences)
      toast({
        description: t('saveSuccess'),
        duration: 3000,
      })
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      toast({
        description: t('saveError'),
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="channels">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="channels">{t('channels.title')}</TabsTrigger>
            <TabsTrigger value="types">{t('types.title')}</TabsTrigger>
            <TabsTrigger value="delivery">{t('delivery.title')}</TabsTrigger>
          </TabsList>

          {/* Вкладка каналов уведомлений */}
          <TabsContent value="channels" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t('channels.subtitle')}</h3>

              <div className="space-y-4">
                {/* Email уведомления */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">{t('channels.email')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('channels.emailDescription')}
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.channels.email}
                    onCheckedChange={(value) => handleChannelChange('email', value)}
                  />
                </div>

                <Separator />

                {/* Push уведомления */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">{t('channels.push')}</Label>
                    <p className="text-xs text-muted-foreground">{t('channels.pushDescription')}</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferences.channels.push}
                    onCheckedChange={(value) => handleChannelChange('push', value)}
                  />
                </div>

                <Separator />

                {/* In-App уведомления */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inapp-notifications">{t('channels.inApp')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('channels.inAppDescription')}
                    </p>
                  </div>
                  <Switch
                    id="inapp-notifications"
                    checked={preferences.channels.inApp}
                    onCheckedChange={(value) => handleChannelChange('inApp', value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Вкладка типов уведомлений */}
          <TabsContent value="types" className="space-y-6">
            <div className="space-y-6">
              {notificationGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">{group.title}</h3>
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                  </div>

                  <div className="space-y-4">
                    {group.types.map((type) => (
                      <div key={type} className="grid grid-cols-[1fr,auto] gap-2 items-center">
                        <div className="space-y-0.5">
                          <Label htmlFor={`type-${type}`} className="cursor-pointer">
                            {getHumanReadableType(type)}
                          </Label>

                          {/* Выбор приоритета */}
                          {preferences.types[type].enabled && (
                            <div className="flex items-center space-x-2 mt-1">
                              <RadioGroup
                                value={preferences.types[type].priority}
                                onValueChange={(value) =>
                                  handlePriorityChange(type, value as 'low' | 'normal' | 'high')
                                }
                                className="flex items-center space-x-1"
                              >
                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem
                                    value="low"
                                    id={`${type}-low`}
                                    className="h-3 w-3"
                                  />
                                  <Label htmlFor={`${type}-low`} className="text-xs cursor-pointer">
                                    {t('priority.low')}
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem
                                    value="normal"
                                    id={`${type}-normal`}
                                    className="h-3 w-3"
                                  />
                                  <Label
                                    htmlFor={`${type}-normal`}
                                    className="text-xs cursor-pointer"
                                  >
                                    {t('priority.normal')}
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <RadioGroupItem
                                    value="high"
                                    id={`${type}-high`}
                                    className="h-3 w-3"
                                  />
                                  <Label
                                    htmlFor={`${type}-high`}
                                    className="text-xs cursor-pointer"
                                  >
                                    {t('priority.high')}
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </div>

                        <Switch
                          id={`type-${type}`}
                          checked={preferences.types[type].enabled}
                          onCheckedChange={(value) => handleTypeToggle(type, value)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Разделитель между группами */}
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Вкладка настроек доставки */}
          <TabsContent value="delivery" className="space-y-6">
            <div className="space-y-6">
              {/* Настройка частоты */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">{t('delivery.frequency')}</h3>

                <RadioGroup
                  value={preferences.frequency}
                  onValueChange={(value) =>
                    handleFrequencyChange(value as NotificationPreferences['frequency'])
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediately" id="immediately" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="immediately">{t('delivery.immediately')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t('delivery.immediatelyDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily-digest" id="daily-digest" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="daily-digest">{t('delivery.dailyDigest')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t('delivery.dailyDigestDescription')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly-digest" id="weekly-digest" />
                    <div className="grid gap-0.5">
                      <Label htmlFor="weekly-digest">{t('delivery.weeklyDigest')}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t('delivery.weeklyDigestDescription')}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Тихие часы */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiet-hours">{t('delivery.quietHours')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('delivery.quietHoursDescription')}
                    </p>
                  </div>
                  <Switch
                    id="quiet-hours"
                    checked={preferences.quietHours.enabled}
                    onCheckedChange={(value) => handleQuietHoursChange('enabled', value)}
                  />
                </div>

                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor="quiet-hours-start" className="text-xs">
                        {t('delivery.quietHoursStart')}
                      </Label>
                      <input
                        id="quiet-hours-start"
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        className="w-full h-8 rounded-md border border-input px-3 py-1 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="quiet-hours-end" className="text-xs">
                        {t('delivery.quietHoursEnd')}
                      </Label>
                      <input
                        id="quiet-hours-end"
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        className="w-full h-8 rounded-md border border-input px-3 py-1 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button variant="default" onClick={handleSavePreferences} disabled={isSaving}>
          {isSaving ? t('saving') : t('save')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default NotificationPreferences
