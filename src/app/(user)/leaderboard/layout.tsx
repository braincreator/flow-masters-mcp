import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'User rankings by experience and achievements',
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="leaderboard-layout">
      {children}
    </div>
  )
}
