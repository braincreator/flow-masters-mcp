'use client'

import { useAuth } from '@/hooks/useAuth'
import SubscriptionPlans from '@/components/SubscriptionPlans'

interface PlansPageClientProps {
  locale: string
}

export default function PlansPageClient({ locale }: PlansPageClientProps) {
  const { user } = useAuth()

  // Use authenticated user ID or guest for unauthenticated users
  const userId = user?.id || 'guest'

  return (
    <SubscriptionPlans
      userId={userId}
      locale={locale}
      heading=""
      description=""
    />
  )
}
