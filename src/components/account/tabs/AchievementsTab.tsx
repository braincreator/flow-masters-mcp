'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Trophy, Award, Star, BarChart3, TrendingUp, Lock } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  dateEarned?: string
  progress?: number
  isLocked?: boolean
}

interface AchievementsTabProps {
  achievements: Achievement[]
  level: number
  xp: number
  nextLevelXp: number
}

export function AchievementsTab({ achievements = [], level = 1, xp = 0, nextLevelXp = 100 }: AchievementsTabProps) {
  const t = useTranslations('Account.Profile')
  
  const progressPercentage = Math.min(100, Math.round((xp / nextLevelXp) * 100))
  
  // Group achievements by status
  const earnedAchievements = achievements.filter(a => !a.isLocked && a.dateEarned)
  const inProgressAchievements = achievements.filter(a => !a.isLocked && !a.dateEarned)
  const lockedAchievements = achievements.filter(a => a.isLocked)
  
  function getIconComponent(iconName: string) {
    switch (iconName) {
      case 'trophy': return <Trophy className="w-5 h-5" />
      case 'award': return <Award className="w-5 h-5" />
      case 'star': return <Star className="w-5 h-5" />
      default: return <Award className="w-5 h-5" />
    }
  }
  
  return (
    <div className="animate-fade-in space-y-8">
      {/* Level Progress Card */}
      <div className="bg-gradient-to-br from-background to-muted/40 rounded-xl p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-bold">{t('achievements.level')} {level}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {xp} / {nextLevelXp} XP
          </div>
        </div>
        
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground">
          {progressPercentage}% {t('achievements.toNextLevel')}
        </div>
      </div>
      
      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            {t('achievements.earned')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex gap-4 p-4 bg-muted/30 border rounded-lg"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  {getIconComponent(achievement.icon)}
                </div>
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.dateEarned && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('achievements.earnedOn')} {achievement.dateEarned}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            {t('achievements.inProgress')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex gap-4 p-4 bg-muted/30 border rounded-lg"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  {getIconComponent(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            {t('achievements.locked')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex gap-4 p-4 bg-muted/10 border border-dashed rounded-lg opacity-70"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-muted/30 text-muted-foreground rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-muted-foreground/70" />
          </div>
          <h3 className="text-xl font-medium mb-2">{t('achievements.noAchievements')}</h3>
          <p className="text-muted-foreground">{t('achievements.earnAchievements')}</p>
        </div>
      )}
    </div>
  )
}