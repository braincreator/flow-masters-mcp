import React from 'react'
import { DEFAULT_LOCALE, type Locale } from '@/constants'

interface TestPageProps {
  params: { lang: string }
}

export default function TestBlogPage({ params }: TestPageProps) {
  const locale = (params.lang || DEFAULT_LOCALE) as Locale

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Blog Test Page - {locale}</h1>
      <p className="mt-4">This is a test page to check if the blog routing works.</p>
      <div className="mt-8 p-4 border rounded-md">
        <h2 className="text-xl font-semibold">Debug Info</h2>
        <p>Language parameter: {params.lang}</p>
        <p>This page is accessed via: /{params.lang}/blog/test</p>
      </div>
    </div>
  )
}
