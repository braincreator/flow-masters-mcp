import React from 'react'
import Leaderboard from '@/components/Leaderboard/Leaderboard'

export const metadata = {
  title: 'Таблица лидеров',
  description: 'Рейтинг пользователей по опыту и достижениям',
}

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Leaderboard limit={20} />
    </div>
  )
}
