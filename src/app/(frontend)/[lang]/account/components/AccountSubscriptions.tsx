'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import ManageSubscriptions from '@/components/ManageSubscriptions'
import SubscriptionPlans from '@/components/SubscriptionPlans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicatorStyles } from '@/components/ui/tabs'
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
        <TabsIndicatorStyles />
        <div className="relative overflow-hidden tabs-gradient tab-indicator-glow tabs-hover-effect tabs-active-scale">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="current" className="relative z-10 tab-with-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-credit-card"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
              {t('tabs.current')}
            </TabsTrigger>
            <TabsTrigger value="new" className="relative z-10 tab-with-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-circle"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              {t('tabs.new')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="space-y-4 tab-content-transition">
          <ManageSubscriptions userId={user.id} locale={locale} />
        </TabsContent>

        <TabsContent value="new" className="space-y-4 tab-content-transition">
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
