'use client'

import { useEffect, useState } from 'react'

/**
 * Хук для определения, выполняется ли код на клиенте
 * Решает проблемы с SSR/гидратацией
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Хук для безопасного доступа к window объекту
 */
export function useWindow() {
  const isClient = useIsClient()
  return isClient ? window : undefined
}

/**
 * Хук для безопасного доступа к переменным окружения на клиенте
 */
export function useClientEnv() {
  const isClient = useIsClient()
  
  if (!isClient) {
    return {
      NEXT_PUBLIC_YANDEX_METRIKA_ID: undefined,
      NEXT_PUBLIC_VK_PIXEL_ID: undefined,
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: undefined,
      NEXT_PUBLIC_FORCE_LOAD_PIXELS: undefined,
      NODE_ENV: undefined
    }
  }

  return {
    NEXT_PUBLIC_YANDEX_METRIKA_ID: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
    NEXT_PUBLIC_VK_PIXEL_ID: process.env.NEXT_PUBLIC_VK_PIXEL_ID,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_FORCE_LOAD_PIXELS: process.env.NEXT_PUBLIC_FORCE_LOAD_PIXELS,
    NODE_ENV: process.env.NODE_ENV
  }
}
