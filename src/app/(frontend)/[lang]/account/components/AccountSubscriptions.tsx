'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import ManageSubscriptions from '@/components/ManageSubscriptions'
import SubscriptionPlans from '@/components/SubscriptionPlans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

export default function AccountSubscriptions({ locale }: { locale: string }) {
  const t = useTranslations('Account.subscriptions')
  const { user, isLoading } = useAuth()
  const [tab, setTab] = useState('current')

  // Handle tab change
  const handleSelectPlan = () => {
    setTab('new')
  }

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
        <CardHeader>
          <CardTitle>{t('notAuthenticated.title')}</CardTitle>
          <CardDescription>{t('notAuthenticated.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button href="/login" variant="default">
            {t('notAuthenticated.loginButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>

      <Tabs defaultValue="current" value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">{t('tabs.current')}</TabsTrigger>
          <TabsTrigger value="new">{t('tabs.new')}</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <ManageSubscriptions userId={user.id} locale={locale} />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <SubscriptionPlans
            userId={user.id}
            locale={locale}
            heading={t('newSubscription.heading')}
            description={t('newSubscription.description')}
            onSelectPlan={() => setTab('current')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
