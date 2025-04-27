'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import PendingBookings from '@/components/services/PendingBookings'
import { useTranslations } from 'next-intl'
import { DashboardHero } from './DashboardHero'
import { UserStats } from './UserStats'
import { ActivityFeed } from './ActivityFeed'
import { QuickActions } from './QuickActions'
import { RecommendedCourses } from './RecommendedCourses'

interface AccountDashboardProps {
  locale: string
}

export function AccountDashboard({ locale }: AccountDashboardProps) {
  const t = useTranslations('AccountDashboard')
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      // Сохраняем локаль при перенаправлении на страницу логина
      router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/account`)}`)
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
        <CardHeader>
          <CardTitle>{t('notAuthenticated')}</CardTitle>
          <CardDescription>{t('notAuthenticatedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() =>
              router.push(`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/account`)}`)
            }
          >
            {t('loginButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero section with user stats */}
      <DashboardHero
        user={{
          ...user,
          level: user.level ?? 1,
          xp: user.xp ?? 0,
          xpToNextLevel: user.xpToNextLevel ?? 1000,
          streak: user.streak ?? 0,
          lastActive: user.lastActive ?? new Date().toISOString(),
        }}
        locale={locale}
        onLogout={logout}
      />

      {/* Показываем незавершенные бронирования, если они есть */}
      <PendingBookings locale={locale} />

      {/* Quick actions grid */}
      <QuickActions locale={locale} onLogout={logout} />

      {/* User stats and activity feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <UserStats userId={user.id} locale={locale} />
        </div>
        <div className="md:col-span-1">
          <ActivityFeed userId={user.id} locale={locale} limit={5} />
        </div>
      </div>

      {/* Recommended courses */}
      <RecommendedCourses userId={user.id} locale={locale} limit={3} />
    </div>
  )
}
