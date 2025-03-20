'use client'

import { useEffect, useState } from 'react'

export function useSiteConfig() {
  const [siteConfig, setSiteConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/site-config')
        if (!response.ok) throw new Error('Failed to fetch site config')
        const data = await response.json()
        setSiteConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { siteConfig, loading, error }
}