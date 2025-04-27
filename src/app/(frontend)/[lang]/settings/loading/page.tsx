'use client'

import { LoadingPreferences } from '@/components/settings/loading-preferences'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslations } from 'next-intl'

export default function LoadingSettingsPage() {
  const t = useTranslations('Settings')
  
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('loading.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('loading.description')}
          </p>
        </div>
        
        <Separator />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('loading.preferences')}</CardTitle>
            <CardDescription>
              {t('loading.preferencesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingPreferences />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
