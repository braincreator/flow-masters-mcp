'use client'

import React, { useEffect, useState } from 'react'
import { getTopUsers } from '@/lib/api/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Trophy } from 'lucide-react'
import Link from 'next/link'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface TopUsersProps {
  limit?: number
  showTitle?: boolean
  showLink?: boolean
  className?: string
}

export default function TopUsers({
  limit = 5,
  showTitle = true,
  showLink = true,
  className = '',
}: TopUsersProps) {
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        setLoading(true)
        const data = await getTopUsers(limit)
        setTopUsers(data)
      } catch (err) {
        logError('Error loading top users:', err)
        setError('Не удалось загрузить топ пользователей')
      } finally {
        setLoading(false)
      }
    }

    loadTopUsers()
  }, [limit])

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-4 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={`text-red-500 p-2 ${className}`}>{error}</div>
  }

  if (topUsers.length === 0) {
    return <div className={`text-gray-500 p-2 ${className}`}>Нет данных</div>
  }

  return (
    <div className={`${className}`}>
      {showTitle && <h3 className="text-lg font-semibold mb-3">Топ пользователей</h3>}

      <div className="space-y-2">
        {topUsers.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 text-center">
                {index < 3 ? (
                  <Trophy
                    className={`h-5 w-5 ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                          ? 'text-gray-400'
                          : 'text-amber-600'
                    }`}
                  />
                ) : (
                  <span className="font-medium">{index + 1}</span>
                )}
              </div>

              <Avatar className="h-8 w-8">
                {user.user.avatar ? (
                  <AvatarImage src={user.user.avatar} alt={user.user.name} />
                ) : (
                  <AvatarFallback>
                    {user.user.name ? user.user.name.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <div className="font-medium">{user.user.name}</div>
                <div className="text-xs text-gray-500">Уровень {user.level}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold">{user.xp} XP</div>
              <div className="text-xs text-gray-500">{user.achievements || 0} достижений</div>
            </div>
          </div>
        ))}
      </div>

      {showLink && (
        <div className="mt-3 text-center">
          <Link
            href="/leaderboard"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Посмотреть полную таблицу лидеров
          </Link>
        </div>
      )}
    </div>
  )
}
