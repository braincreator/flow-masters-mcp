'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserLevelInfo } from '@/lib/api/users'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface UserLevelProps {
  userId?: string
  showDetails?: boolean
  className?: string
}

type LevelInfo = {
  currentLevel: number
  currentXP: number
  nextLevelXP: number
  xpToNextLevel: number
  progress: number
  isMaxLevel: boolean
  user: {
    id: string
    name: string
    email: string
    xp: number
    level: number
  }
}

export default function UserLevel({ userId, showDetails = true, className = '' }: UserLevelProps) {
  const { user: authUser } = useAuth()
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Используем ID пользователя из пропсов или из авторизованного пользователя
  const userIdToUse = userId || authUser?.id

  useEffect(() => {
    const loadLevelInfo = async () => {
      if (!userIdToUse) return

      try {
        setLoading(true)
        const info = await getUserLevelInfo(userIdToUse)
        setLevelInfo(info)
      } catch (err) {
        console.error('Error loading level info:', err)
        setError('Не удалось загрузить информацию о уровне')
      } finally {
        setLoading(false)
      }
    }

    loadLevelInfo()
  }, [userIdToUse])

  if (!userIdToUse) {
    return null
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={`text-red-500 text-sm ${className}`}>{error}</div>
  }

  if (!levelInfo) {
    return <div className={`text-gray-500 text-sm ${className}`}>Нет данных о уровне</div>
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
          {levelInfo.currentLevel}
        </div>
        <div>
          <div className="font-semibold">Уровень {levelInfo.currentLevel}</div>
          {!levelInfo.isMaxLevel && (
            <div className="text-xs text-gray-500">
              {levelInfo.xpToNextLevel} XP до уровня {levelInfo.currentLevel + 1}
            </div>
          )}
        </div>
      </div>

      {!levelInfo.isMaxLevel && (
        <div className="mb-4">
          <Progress value={levelInfo.progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.nextLevelXP} XP</span>
          </div>
        </div>
      )}

      {levelInfo.isMaxLevel && (
        <div className="mb-4 text-center py-2 bg-yellow-100 text-yellow-800 rounded-md">
          Максимальный уровень достигнут!
        </div>
      )}

      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">Статистика</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">Всего XP:</div>
            <div className="font-medium">{levelInfo.currentXP}</div>

            <div className="text-gray-600">Текущий уровень:</div>
            <div className="font-medium">{levelInfo.currentLevel}</div>

            {!levelInfo.isMaxLevel && (
              <>
                <div className="text-gray-600">Следующий уровень:</div>
                <div className="font-medium">{levelInfo.currentLevel + 1}</div>

                <div className="text-gray-600">Прогресс:</div>
                <div className="font-medium">{levelInfo.progress}%</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
