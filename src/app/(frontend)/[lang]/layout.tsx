import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'
import { AdminBar } from '@/components/AdminBar'
import { draftMode } from 'next/headers'
import { getSiteConfig } from '@/utilities/get-site-config'

const locales = ['en', 'ru']

interface LayoutProps {
  children: ReactNode
  params: {
    lang: string
  }
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params
  const { isEnabled: isDraftMode } = await draftMode()
  const siteConfig = await getSiteConfig()
  
  if (!locales.includes(lang)) {
    return notFound()
  }

  return (
    <>
      {/* AI-themed background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-ai-radial opacity-20 animate-float" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-ai-radial opacity-20 animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      
      {isDraftMode && <AdminBar />}
      <Header />
      <main className="min-h-screen relative">
        {children}
      </main>
      <Footer />
    </>
  )
}
