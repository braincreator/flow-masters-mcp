'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface AuthCheckProps {
  children: ReactNode
  locale: string
  redirectTo: string
}

export function AuthCheck({ children, locale, redirectTo }: AuthCheckProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated, don't render children (we'll redirect in the useEffect)
  if (!isAuthenticated || !user) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
}
