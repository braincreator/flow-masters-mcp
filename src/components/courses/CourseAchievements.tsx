'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { fetchUserAchievements } from '@/lib/api/achievements'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface CourseAchievementsProps {
  courseId: string
  className?: string
}

type Achievement = {
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

export default function CourseAchievements({ courseId, className = '' }: CourseAchievementsProps) {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) return

      try {
        setLoading(true)
        const progress = await fetchUserAchievements(user.id)
        
        // Фильтруем достижения, связанные с этим курсом
        const courseAchievements: Achievement[] = []
        
        Object.values(progress.categories).forEach((category: any) => {
          category.achievements.forEach((achievement: any) => {
            // Проверяем, связано ли достижение с этим курсом
            if (achievement.courseId === courseId) {
              courseAchievements.push(achievement)
            }
          })
        })
        
        setAchievements(courseAchievements)
      } catch (err) {
        console.error('Error loading achievements:', err)
        setError('Не удалось загрузить достижения')
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [user, courseId])

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={`text-red-500 text-sm ${className}`}>{error}</div>
  }

  if (achievements.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        Нет доступных достижений для этого курса
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-4">Достижения курса</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`relative rounded-lg overflow-hidden border-2 ${
              achievement.isEarned 
                ? rarityBorders[achievement.rarity as keyof typeof rarityBorders] || rarityBorders.common
                : 'border-gray-200'
            } ${achievement.isEarned ? '' : 'opacity-50'}`}
          >
            <div className={`p-4 text-center ${achievement.isEarned ? rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common : 'bg-gray-100'}`}>
              <div className="relative w-12 h-12 mx-auto mb-2">
                {achievement.icon?.url ? (
                  <Image
                    src={achievement.icon.url}
                    alt={achievement.title}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xl">🏆</span>
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
    </div>
  )
}
