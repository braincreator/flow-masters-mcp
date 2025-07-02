'use client'

import React, { useEffect } from 'react'
import { trackPostView } from '@/lib/blogHelpers'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Props {
  children: React.ReactNode
  params: {
    slug: string
    lang: string
  }
}

export default function BlogPostLayout({ children, params }: Props) {
  // Используем React.use для получения params из Promise
  const resolvedParams = React.use(params)
  const slug = resolvedParams.slug

  // Используем эффект для отслеживания просмотра только на клиенте
  useEffect(() => {
    // Track post view on component mount (only on client)
    if (typeof window !== 'undefined') {
      fetch('/api/v1/blog/post-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug }),
      })
        .then((response) => {
          if (response.ok) {
            // Добавляем пост в просмотренные
            const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
            viewedPosts.push(slug)
            sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts))
          }
        })
        .catch((error) => {
          logError('Failed to track post view:', error)
        })
    }
  }, [slug])

  return <>{children}</>
}
