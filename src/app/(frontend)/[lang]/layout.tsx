import { notFound } from 'next/navigation'
import { ClientProviders } from '@/components/ClientProviders'
import { Metadata } from 'next'
import { ReactNode } from 'react'

const locales = ['en', 'ru']

export const metadata: Metadata = {
  title: 'Flow Masters',
  description: 'Flow Masters - Your Business Process Automation Partner',
}

interface LayoutProps {
  children: ReactNode
  params: Promise<{
    lang: string
  }>
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  if (!locales.includes(lang)) {
    return notFound()
  }

  return <ClientProviders lang={lang}>{children}</ClientProviders>
}
