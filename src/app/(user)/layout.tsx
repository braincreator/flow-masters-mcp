import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Area',
  description: 'User area of Flow Masters',
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="user-layout">
      {children}
    </div>
  )
}
