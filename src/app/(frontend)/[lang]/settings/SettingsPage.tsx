'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicatorStyles } from '@/components/ui/tabs'
import { ProfileSettings } from './components/ProfileSettings'
import { NotificationSettings } from './components/NotificationSettings'
import { PrivacySettings } from './components/PrivacySettings'
import { LoadingPreferences } from '@/components/settings/loading-preferences'

interface SettingsPageProps {
  locale: string
}

export function SettingsPage({ locale }: SettingsPageProps) {
  const t = useTranslations('Settings')
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/settings`)}`)
    }
  }, [isLoading, isAuthenticated, router, locale])

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">
              {t('common.notAuthenticated', { defaultValue: 'Authentication Required' })}
            </h2>
            <p className="text-muted-foreground">
              {t('common.notAuthenticatedDescription', {
                defaultValue: 'Please log in to access your settings',
              })}
            </p>
            <Button
              onClick={() =>
                router.push(
                  `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/settings`)}`,
                )
              }
            >
              {t('common.loginButton', { defaultValue: 'Log In' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <TabsIndicatorStyles />
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="privacy">{t('tabs.privacy')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('tabs.appearance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings user={user} locale={locale} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings user={user} locale={locale} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacySettings user={user} locale={locale} />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardContent className="py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{t('appearance.loadingAnimations')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('appearance.loadingAnimationsDescription')}
                  </p>
                </div>

                <LoadingPreferences />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
