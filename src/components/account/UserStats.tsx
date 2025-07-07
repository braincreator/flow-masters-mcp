'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsIndicatorStyles } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { BarChart, Activity, Award, Clock, Calendar, TrendingUp, Flame } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface UserStatsProps {
  userId: string
  locale: string
}

interface UserStatsData {
  totalCourses: number
  completedCourses: number
  totalLessons: number
  completedLessons: number
  totalTime: number
  streak: number
  lastActive: string
  level: number
  xp: number
  xpToNextLevel: number
  achievements: number
  totalAchievements: number
}

export function UserStats({ userId, locale }: UserStatsProps) {
  const t = useTranslations('UserStats')
  const [stats, setStats] = useState<UserStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const fetchStats = async (retryAfterRefresh = false) => {
      try {
        setIsLoading(true)

        // Fetch real user stats from the API
        const response = await fetch(`/api/user/${userId}/stats`, {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // If we get a 401 or 403 and haven't retried yet, try refreshing auth and retrying
          if ((response.status === 401 || response.status === 403) && !retryAfterRefresh) {
            logWarn('Authentication error, refreshing auth and retrying...')
            await refreshAuth()
            return fetchStats(true) // Retry with the retryAfterRefresh flag set to true
          }
          throw new Error(`Failed to fetch user stats: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setStats(result.data)
        } else {
          // Fallback to default values if API fails
          setStats({
            totalCourses: 0,
            completedCourses: 0,
            totalLessons: 0,
            completedLessons: 0,
            totalTime: 0,
            streak: 0,
            lastActive: new Date().toISOString(),
            level: 1,
            xp: 0,
            xpToNextLevel: 1000,
            achievements: 0,
            totalAchievements: 0,
          })
          logWarn('No user stats found or invalid response format:', result)
        }

        setIsLoading(false)
      } catch (error) {
        logError('Error fetching user stats:', error)

        // If we already tried refreshing auth and still got an error, just log it
        // The retry logic is now handled in the fetch call itself

        // Fallback to default values
        setStats({
          totalCourses: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0,
          totalTime: 0,
          streak: 0,
          lastActive: new Date().toISOString(),
          level: 1,
          xp: 0,
          xpToNextLevel: 1000,
          achievements: 0,
          totalAchievements: 0,
        })
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [userId, locale, refreshAuth])

  if (isLoading || !stats) {
    return (
      <Card className="w-full border-border/50 shadow-md">
        <CardHeader className="pb-2 bg-muted/30">
          <CardTitle className="text-xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate percentages
  const courseProgress = Math.round((stats.completedCourses / stats.totalCourses) * 100)
  const lessonProgress = Math.round((stats.completedLessons / stats.totalLessons) * 100)
  const levelProgress = Math.round((stats.xp / stats.xpToNextLevel) * 100)
  const achievementProgress = Math.round((stats.achievements / stats.totalAchievements) * 100)

  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="w-full border-border/50 shadow-md overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="overview"
          className="w-full"
        >
          <TabsIndicatorStyles />
          <div className="flex justify-end mb-4">
            <TabsList className="h-9 p-1">
              <TabsTrigger value="overview" className="text-xs px-2 py-1">
                <Activity className="w-3 h-3 mr-1" />
                {t('tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs px-2 py-1">
                <BarChart className="w-3 h-3 mr-1" />
                {t('tabs.progress')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center mb-2">
                  <Award className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-sm font-medium">{t('level')}</h3>
                </div>
                <p className="text-2xl font-bold">{stats.level}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{stats.xp} XP</span>
                    <span>{stats.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={levelProgress} max={100} className="h-1.5" />
                </div>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center mb-2">
                  <Flame className="w-5 h-5 mr-2 text-orange-500" />
                  <h3 className="text-sm font-medium">{t('streak')}</h3>
                </div>
                <p className="text-2xl font-bold">
                  {stats.streak} {t('days')}
                </p>
                <p className="text-xs text-gray-500 mt-2">{t('keepGoing')}</p>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  <h3 className="text-sm font-medium">{t('totalTime')}</h3>
                </div>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
                <p className="text-xs text-gray-500 mt-2">{t('learning')}</p>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  <h3 className="text-sm font-medium">{t('lastActive')}</h3>
                </div>
                <p className="text-lg font-bold">{formatDate(stats.lastActive)}</p>
                <p className="text-xs text-gray-500 mt-2">{t('stayActive')}</p>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">{t('courseProgress')}</h3>
                  <span className="text-sm font-bold">{courseProgress}%</span>
                </div>
                <Progress value={courseProgress} max={100} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats.completedCourses} / {stats.totalCourses} {t('coursesCompleted')}
                </p>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">{t('lessonProgress')}</h3>
                  <span className="text-sm font-bold">{lessonProgress}%</span>
                </div>
                <Progress value={lessonProgress} max={100} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats.completedLessons} / {stats.totalLessons} {t('lessonsCompleted')}
                </p>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">{t('achievementProgress')}</h3>
                  <span className="text-sm font-bold">{achievementProgress}%</span>
                </div>
                <Progress value={achievementProgress} max={100} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {stats.achievements} / {stats.totalAchievements} {t('achievementsUnlocked')}
                </p>
              </motion.div>

              <motion.div
                className="bg-card p-4 rounded-lg border border-border/50 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="text-sm font-medium">{t('learningTrend')}</h3>
                </div>
                <div className="flex items-end h-12 mt-2 space-x-1">
                  {[40, 65, 45, 70, 85, 60, 90].map((value, i) => (
                    <div
                      key={i}
                      className="bg-primary/60 rounded-t w-full"
                      style={{ height: `${value}%` }}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('lastSevenDays')}</p>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
