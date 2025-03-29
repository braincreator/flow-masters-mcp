'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

      const response = await fetch(`/api/globals/settings?depth=2`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch settings: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error('Error fetching settings:', err)
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
