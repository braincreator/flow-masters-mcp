'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicatorStyles } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { EnrolledCourses } from './EnrolledCourses'
import { AccountProfile } from './AccountProfile'
import UserAchievements from '@/components/Achievements/UserAchievements'
import UserRewards from '@/components/Rewards/UserRewards'
import TopUsers from '@/components/Leaderboard/TopUsers'
import PendingBookings from '@/components/services/PendingBookings'
import { useTranslations } from 'next-intl'

interface AccountDashboardProps {
  locale: string
}

export function AccountDashboard({ locale }: AccountDashboardProps) {
  const t = useTranslations('AccountDashboard')
  const commonT = useTranslations('common')
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'courses')

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/account')}`)
    }
  }, [isLoading, isAuthenticated, router])

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (
      tabParam &&
      ['courses', 'achievements', 'rewards', 'profile', 'settings'].includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

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
          <CardTitle>{t('notAuthenticated')}</CardTitle>
          <CardDescription>{t('notAuthenticatedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')}>{t('loginButton')}</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('welcomeMessage', { name: user.name })}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          {commonT('logout')}
        </Button>
      </div>

      {/* Показываем незавершенные бронирования, если они есть */}
      <PendingBookings locale={locale} />

      <Tabs
        value={activeTab}
        defaultValue={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          // Update URL when tab changes
          const params = new URLSearchParams(searchParams.toString())
          params.set('tab', value)
          router.replace(`/${locale}/account?${params.toString()}`, { scroll: false })
        }}
        className="space-y-4"
      >
        <TabsIndicatorStyles />
        <div className="relative overflow-hidden tabs-gradient tab-indicator-glow tabs-hover-effect tabs-active-scale">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl mx-auto">
            <TabsTrigger value="courses" className="relative z-10 tab-with-icon">
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
                className="lucide lucide-book-open"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              {t('tabs.courses')}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="relative z-10 tab-with-icon">
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
                className="lucide lucide-medal"
              >
                <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
                <path d="M11 12 5.12 2.2" />
                <path d="m13 12 5.88-9.8" />
                <path d="M12 8v8" />
                <circle cx="12" cy="18" r="4" />
              </svg>
              {t('tabs.achievements')}
            </TabsTrigger>
            <TabsTrigger value="rewards" className="relative z-10 tab-with-icon">
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
                className="lucide lucide-gift"
              >
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
              {t('tabs.rewards')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="relative z-10 tab-with-icon">
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
                className="lucide lucide-user"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {t('tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="relative z-10 tab-with-icon">
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
                className="lucide lucide-settings"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {t('tabs.settings')}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="courses" className="space-y-4 tab-content-transition">
          <EnrolledCourses userId={user.id} locale={locale} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 tab-content-transition">
          <Card>
            <CardHeader>
              <CardTitle>{t('achievementsCard.title')}</CardTitle>
              <CardDescription>{t('achievementsCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <UserAchievements />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('leaderboardCard.title')}</CardTitle>
              <CardDescription>{t('leaderboardCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <TopUsers limit={5} showTitle={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 tab-content-transition">
          <Card>
            <CardHeader>
              <CardTitle>{t('rewardsCard.title')}</CardTitle>
              <CardDescription>{t('rewardsCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <UserRewards showAll={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 tab-content-transition">
          <AccountProfile user={user} locale={locale} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 tab-content-transition">
          <Card>
            <CardHeader>
              <CardTitle>{t('settingsCard.title')}</CardTitle>
              <CardDescription>{t('settingsCard.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t('settingsCard.comingSoon')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
