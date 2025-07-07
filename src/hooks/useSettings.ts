'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/httpClient'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Settings {
  [key: string]: any
  currencies?: {
    code: string
    symbol: string
    name: string
    isDefault: boolean
  }[]
  exchangeRates?: {
    from: string
    to: string
    rate: number
  }[]
  paymentProviders?: {
    name: string
    isActive: boolean
    apiKey?: string
    secretKey?: string
    [key: string]: any
  }[]
}

interface UseSettingsResult {
  settings: Settings | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  const fetchSettings = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.get(`/api/globals/settings?depth=2`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setSettings(data)
    } catch (err) {
      logError('Error fetching settings:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  }
}

export default useSettings
