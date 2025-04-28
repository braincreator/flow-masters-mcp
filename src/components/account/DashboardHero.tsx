'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Award, Flame, Calendar, Bell, Settings } from 'lucide-react'
import { useNotifications } from '@/providers/NotificationsProvider'

interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar?: string
  level?: number
  xp?: number
  xpToNextLevel?: number
  streak?: number
  lastActive?: string
}

interface DashboardHeroProps {
  user: User
  locale: string
  onLogout: () => void
}

export function DashboardHero({ user, locale, onLogout }: DashboardHeroProps) {
  const t = useTranslations('DashboardHero')
  const [greeting, setGreeting] = useState('')
  const { unreadCount: notifications } = useNotifications()

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(t('goodMorning'))
    else if (hour < 18) setGreeting(t('goodAfternoon'))
    else setGreeting(t('goodEvening'))
  }, [t])

  // Calculate level progress
  const levelProgress =
    user.xp && user.xpToNextLevel ? Math.round((user.xp / user.xpToNextLevel) * 100) : 0

  // Generate initials for avatar fallback
  const initials = user.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/5 via-background to-secondary/5 border border-border/50 shadow-md backdrop-blur-sm">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary/20 shadow-md">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback className="text-lg md:text-xl bg-primary/5">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {greeting}, {user.name.split(' ')[0]}
                </h1>
                {/* {user.streak && user.streak > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3" />
                    {user.streak} {t('dayStreak')}
                  </Badge>
                ) : null} */}
              </div>
              <p className="text-muted-foreground">{t('welcomeBack')}</p>
              {user.level && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      {t('level')} {user.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {user.xp} / {user.xpToNextLevel} XP
                    </span>
                  </div>
                  <Progress value={levelProgress} max={100} className="h-1.5 w-40" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => (window.location.href = `/${locale}/notifications`)}
            >
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = `/${locale}/settings`)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              {t('logout')}
            </Button>
          </motion.div>
        </div>

        {user.lastActive && (
          <motion.div
            className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {t('lastActive')}:{' '}
              {new Date(user.lastActive).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  )
}
