import React from 'react'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

interface SimplePageProps {
  params: { lang: string }
}

export default function SimpleBlogPage({ params }: SimplePageProps) {
  const locale = (params.lang || DEFAULT_LOCALE) as Locale

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          {locale === 'ru' ? 'Блог' : 'Blog'} - Simple Page
        </h1>
        <p className="text-lg mb-8">This is a simplified blog page to test the routing.</p>
        <div className="border p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Testing Blog Route</h2>
          <p>
            If you can see this page, the blog route is working correctly, but there might be an
            issue with the main blog page implementation.
          </p>
        </div>
      </div>
    </div>
  )
}
