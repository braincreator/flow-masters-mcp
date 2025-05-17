import React from 'react'
import UserAchievements from '@/components/Achievements/UserAchievements'

export const metadata = {
  title: 'Мои достижения',
  description: 'Просмотр ваших достижений и прогресса',
}

export default function AchievementsPage() {
  return (
    <div className="container mx-auto py-8">
      <UserAchievements />
    </div>
  )
}
