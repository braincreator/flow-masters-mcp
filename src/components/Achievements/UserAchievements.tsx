'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserAchievements } from '@/lib/api/achievements'
import Image from 'next/image'

type AchievementCategory = {
  total: number
  earned: number
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: {
      url: string
    }
    rarity: string
    xpValue: number
    isEarned: boolean
    earnedAt: string | null
  }>
}

type AchievementProgress = {
  totalAchievements: number
  earnedAchievements: number
  progressPercentage: number
  categories: Record<string, AchievementCategory>
}

const rarityColors = {
  common: 'bg-gray-200',
  uncommon: 'bg-green-200',
  rare: 'bg-blue-200',
  epic: 'bg-purple-200',
  legendary: 'bg-yellow-200',
}

const rarityBorders = {
  common: 'border-gray-400',
  uncommon: 'border-green-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
}

export default function UserAchievements() {
  const { user } = useAuth()
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return

      try {
        setLoading(true)
        const progress = await fetchUserAchievements(user.id)
        setAchievementProgress(progress)
        
        // Set first category as active by default
        if (progress && Object.keys(progress.categories).length > 0) {
          setActiveCategory(Object.keys(progress.categories)[0])
        }
      } catch (err) {
        console.error('Error loading achievements:', err)
        setError('Не удалось загрузить достижения')
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [user])

  if (!user) {
    return <div className="p-4 text-center">Войдите, чтобы увидеть свои достижения</div>
  }

  if (loading) {
    return <div className="p-4 text-center">Загрузка достижений...</div>
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>
  }

  if (!achievementProgress) {
    return <div className="p-4 text-center">Нет данных о достижениях</div>
  }

  const { totalAchievements, earnedAchievements, progressPercentage, categories } = achievementProgress

  const categoryLabels = {
    course_completion: 'Завершение курсов',
    learning_milestones: 'Учебные достижения',
    engagement: 'Вовлеченность',
    social: 'Социальная активность',
    special: 'Особые достижения',
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Мои достижения</h2>
      
      {/* Overall Progress */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Общий прогресс</h3>
          <span className="text-lg font-bold">{earnedAchievements} / {totalAchievements}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-right text-sm text-gray-600">
          {progressPercentage}% завершено
        </div>
        
        <div className="mt-4">
          <div className="text-lg font-semibold mb-2">Уровень: {user.level || 1}</div>
          <div className="text-sm text-gray-600">XP: {user.xp || 0}</div>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {Object.entries(categories).map(([category, data]) => (
            <button
              key={category}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeCategory === category
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {categoryLabels[category as keyof typeof categoryLabels] || category}{' '}
              ({data.earned}/{data.total})
            </button>
          ))}
        </div>
      </div>
      
      {/* Achievement Grid */}
      {activeCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories[activeCategory].achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`relative rounded-lg overflow-hidden border-2 ${
                achievement.isEarned 
                  ? rarityBorders[achievement.rarity as keyof typeof rarityBorders] || rarityBorders.common
                  : 'border-gray-200'
              } ${achievement.isEarned ? '' : 'opacity-50'}`}
            >
              <div className={`p-4 text-center ${achievement.isEarned ? rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common : 'bg-gray-100'}`}>
                <div className="relative w-16 h-16 mx-auto mb-2">
                  {achievement.icon?.url ? (
                    <Image
                      src={achievement.icon.url}
                      alt={achievement.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-sm">{achievement.title}</h4>
                <div className="text-xs mt-1">{achievement.xpValue} XP</div>
                
                {achievement.isEarned && achievement.earnedAt && (
                  <div className="text-xs mt-2 text-gray-600">
                    Получено: {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="p-2 bg-white">
                <p className="text-xs text-gray-600">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
