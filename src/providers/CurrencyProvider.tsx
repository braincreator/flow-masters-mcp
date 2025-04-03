'use client'

import React, { useContext, useEffect, useState } from 'react'
import { updateClientSettings } from '@/utilities/formatPrice'

interface CurrencyContextType {
  refreshRates: () => Promise<void>
  lastUpdated: Date | null
  isLoading: boolean
}

const CurrencyContext = React.createContext<CurrencyContextType>({
  refreshRates: async () => {},
  lastUpdated: null,
  isLoading: true,
})

export const useCurrencySync = () => useContext(CurrencyContext)

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRates = async () => {
    try {
      setIsLoading(true)

      console.log('CurrencyProvider: fetching rates from API...')
      // Получаем настройки через API-вызов
      const response = await fetch('/api/currency-settings')

      console.log('CurrencyProvider: API response status:', response.status)

      if (!response.ok) {
        console.error(
          'CurrencyProvider: API response not OK:',
          response.status,
          response.statusText,
        )
        const errorText = await response.text()
        console.error('CurrencyProvider: API error body:', errorText)
        throw new Error(`Failed to fetch currency settings: ${response.status}`)
      }

      console.log('CurrencyProvider: parsing JSON response')
      const data = await response.json()

      console.log('CurrencyProvider: received data:', {
        hasLocaleSettings: !!data.localeSettings,
        hasRates: !!data.rates,
        baseCurrency: data.baseCurrency,
      })

      // Обновляем настройки в клиентском кеше
      updateClientSettings(data)

      setLastUpdated(new Date())
      console.log('CurrencyProvider: settings updated successfully')
    } catch (err) {
      console.error('CurrencyProvider: Failed to refresh currency rates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // При монтировании компонента получаем настройки
  useEffect(() => {
    // Используем setTimeout, чтобы дать браузеру дорендерить страницу
    const timeoutId = setTimeout(() => {
      fetchRates()
    }, 100)

    // Обновляем курсы каждый час
    const interval = setInterval(fetchRates, 60 * 60 * 1000)
    return () => {
      clearTimeout(timeoutId)
      clearInterval(interval)
    }
  }, [])

  return (
    <CurrencyContext.Provider
      value={{
        refreshRates: fetchRates,
        lastUpdated,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
