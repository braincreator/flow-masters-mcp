import React from 'react'
import UserRewards from '@/components/Rewards/UserRewards'

export const metadata = {
  title: 'Мои награды',
  description: 'Просмотр ваших наград и бонусов',
}

export default function RewardsPage() {
  return (
    <div className="container mx-auto py-8">
      <UserRewards showAll={true} />
    </div>
  )
}
