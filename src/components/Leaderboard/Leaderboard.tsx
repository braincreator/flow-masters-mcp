'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getLeaderboard, getUserRank } from '@/lib/api/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import Link from 'next/link'

interface LeaderboardProps {
  limit?: number
  showPagination?: boolean
  showUserRank?: boolean
  className?: string
}

export default function Leaderboard({
  limit = 10,
  showPagination = true,
  showUserRank = true,
  className = '',
}: LeaderboardProps) {
  const { user } = useAuth()
  const [leaderboardData, setLeaderboardData] = useState<any>(null)
  const [userRankData, setUserRankData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true)
        const data = await getLeaderboard(limit, page)
        setLeaderboardData(data)

        // Если пользователь авторизован и нужно показать его ранг
        if (user && showUserRank) {
          const rankData = await getUserRank(user.id)
          setUserRankData(rankData)
        }
      } catch (err) {
        console.error('Error loading leaderboard:', err)
        setError('Не удалось загрузить таблицу лидеров')
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [user, showUserRank, limit, page])

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (leaderboardData && page < leaderboardData.totalPages) {
      setPage(page + 1)
    }
  }

  const getRankChangeIcon = (rankChange: number) => {
    if (rankChange > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (rankChange < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <div className={`text-red-500 p-4 ${className}`}>{error}</div>
  }

  if (!leaderboardData || leaderboardData.docs.length === 0) {
    return <div className={`text-gray-500 p-4 ${className}`}>Нет данных в таблице лидеров</div>
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold mb-6">Таблица лидеров</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-3 text-left">Ранг</th>
              <th className="p-3 text-left">Пользователь</th>
              <th className="p-3 text-center">Уровень</th>
              <th className="p-3 text-center">XP</th>
              <th className="p-3 text-center">Достижения</th>
              <th className="p-3 text-center">Изменение</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.docs.map((entry: any) => {
              const isCurrentUser = user && entry.user.id === user.id

              return (
                <tr
                  key={entry.id}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="p-3">
                    {entry.rank <= 3 ? (
                      <div className="flex items-center">
                        <Trophy
                          className={`h-5 w-5 mr-1 ${
                            entry.rank === 1
                              ? 'text-yellow-500'
                              : entry.rank === 2
                                ? 'text-gray-400'
                                : 'text-amber-600'
                          }`}
                        />
                        {entry.rank}
                      </div>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {entry.user.avatar ? (
                          <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
                        ) : (
                          <AvatarFallback>
                            {entry.user.name ? entry.user.name.substring(0, 2).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">{entry.user.name}</span>
                      {isCurrentUser && <span className="text-xs text-blue-600">(Вы)</span>}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                      {entry.level}
                    </div>
                  </td>
                  <td className="p-3 text-center">{entry.xp}</td>
                  <td className="p-3 text-center">{entry.achievements || 0}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getRankChangeIcon(entry.rankChange)}
                      <span
                        className={`${
                          entry.rankChange > 0
                            ? 'text-green-500'
                            : entry.rankChange < 0
                              ? 'text-red-500'
                              : 'text-gray-500'
                        }`}
                      >
                        {entry.rankChange !== 0 ? Math.abs(entry.rankChange) : '-'}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showUserRank &&
        userRankData &&
        userRankData.user &&
        !leaderboardData.docs.some((entry: any) => entry.user.id === user?.id) && (
          <div className="mt-4 p-3 border rounded-md bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-2">Ваша позиция</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{userRankData.user.rank}</span>
                <Avatar className="h-8 w-8">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Уровень</div>
                  <div className="font-bold">{userRankData.user.level}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">XP</div>
                  <div className="font-bold">{userRankData.user.xp}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Изменение</div>
                  <div className="flex items-center justify-center">
                    {getRankChangeIcon(userRankData.user.rankChange)}
                    <span
                      className={`font-bold ${
                        userRankData.user.rankChange > 0
                          ? 'text-green-500'
                          : userRankData.user.rankChange < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                      }`}
                    >
                      {userRankData.user.rankChange !== 0
                        ? Math.abs(userRankData.user.rankChange)
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {showPagination && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Страница {page} из {leaderboardData.totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page <= 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= leaderboardData.totalPages}
            >
              Вперед
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
