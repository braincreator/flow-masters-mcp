'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Компонент для безопасной гидратации
 * Предотвращает мисматчи между сервером и клиентом
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * HOC для компонентов, которые должны рендериться только на клиенте
 */
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function ClientOnlyComponent(props: P) {
    return (
      <ClientOnly fallback={fallback}>
        <Component {...props} />
      </ClientOnly>
    )
  }
}

/**
 * Хук для безопасного доступа к браузерным API
 */
export function useBrowserAPI() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return {
    hasMounted,
    window: hasMounted ? window : undefined,
    document: hasMounted ? document : undefined,
    localStorage: hasMounted ? localStorage : undefined,
    sessionStorage: hasMounted ? sessionStorage : undefined,
  }
}
