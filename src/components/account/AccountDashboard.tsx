'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'
import { EnrolledCourses } from './EnrolledCourses'
import { AccountProfile } from './AccountProfile'
import UserAchievements from '@/components/Achievements/UserAchievements'
import UserRewards from '@/components/Rewards/UserRewards'
import TopUsers from '@/components/Leaderboard/TopUsers'
import { useTranslations } from 'next-intl'

interface AccountDashboardProps {
  locale: string
}

export function AccountDashboard({ locale }: AccountDashboardProps) {
  const t = useTranslations('AccountDashboard')
  const commonT = useTranslations('common')
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('courses')

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/account')}`)
    }
  }, [isLoading, isAuthenticated, router])

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

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-md">
          <TabsTrigger value="courses">{t('tabs.courses')}</TabsTrigger>
          <TabsTrigger value="achievements">{t('tabs.achievements')}</TabsTrigger>
          <TabsTrigger value="rewards">{t('tabs.rewards')}</TabsTrigger>
          <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <EnrolledCourses userId={user.id} locale={locale} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
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

        <TabsContent value="rewards" className="space-y-4">
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

        <TabsContent value="profile" className="space-y-4">
          <AccountProfile user={user} locale={locale} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
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
