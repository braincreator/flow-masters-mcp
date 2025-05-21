import React from 'react'
import { AccountSidebar } from '@/components/account/AccountSidebar' // Added import

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block md:w-64 md:flex-shrink-0 md:sticky md:top-0 md:h-screen">
          <AccountSidebar />
        </div>
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}