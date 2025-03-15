'use client'
import { getClientSideURL } from '@/utilities/getURL'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'
import { useRouter, usePathname } from 'next/navigation'
import React from 'react'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract the language from the current path
  const pathParts = pathname.split('/')
  let locale: string | undefined

  if (pathname.startsWith('/posts/')) {
    // For posts, get locale from header or default
    locale = undefined // Will use default locale handling
  } else {
    // For regular pages, get locale from URL
    locale = pathParts[1]
    if (!['en', 'ru'].includes(locale)) {
      locale = 'ru' // Fallback to Russian if invalid locale
    }
  }

  return (
    <PayloadLivePreview 
      refresh={router.refresh} 
      serverURL={getClientSideURL()} 
      additionalQueryParams={{ 
        locale: locale,
      }}
    />
  )
}
