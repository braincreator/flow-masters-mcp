'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Динамический импорт клиентского компонента
const PayloadAPIClient = dynamic(
  () => import('./payload-client').then((mod) => mod.PayloadAPIClient),
  {
    ssr: false,
  },
)

// Provider, который можно использовать в серверных компонентах
export function PayloadAPIProvider({ children }: { children: React.ReactNode }) {
  return <PayloadAPIClient>{children}</PayloadAPIClient>
}

// Реэкспорт хука для использования в клиентских компонентах
export { usePayloadAPI } from './payload-client'
