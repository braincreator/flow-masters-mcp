import type { Metadata } from 'next'
import { getSiteConfig } from './get-site-config'
import { getServerSideURL } from './getURL'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Types
interface MetadataImage {
  url: string
  width: number
  height: number
  alt?: string
}

interface SeoMeta {
  title?: string | null
  description?: string | null
  image?: Partial<MetadataImage> | null
  noIndex?: boolean
}

interface SeoVerification {
  google?: string;
  yandex?: string;
}

// Constants
const DEFAULT_IMAGE: MetadataImage = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Flow Masters'
}

const BASE_URL = getServerSideURL()

const DEFAULT_METADATA: Metadata = {
  title: 'FlowMasters',
  description: 'Business Process Automation',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    siteName: 'FlowMasters',
    images: [DEFAULT_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
  },
  manifest: '/site.webmanifest',
}

// Utility functions
function createMetadataImage(image?: Partial<MetadataImage> | null): MetadataImage {
  if (!image?.url) return DEFAULT_IMAGE
  
  return {
    url: image.url,
    width: image.width || DEFAULT_IMAGE.width,
    height: image.height || DEFAULT_IMAGE.height,
    alt: image.alt || DEFAULT_IMAGE.alt
  }
}

function createOpenGraph(params: {
  title: string
  description: string
  image: MetadataImage
  siteName?: string
}) {
  const { title, description, image, siteName } = params
  
  return {
    type: 'website',
    siteName: siteName || DEFAULT_METADATA.openGraph?.siteName || 'Flow Masters',
    title,
    description,
    images: [image],
  }
}

function createTwitter(params: {
  title: string
  description: string
  image: MetadataImage
  creator?: string
}) {
  const { title, description, image, creator } = params
  
  return {
    card: 'summary_large_image' as const,
    title,
    description,
    images: [image.url],
    ...(creator && { creator }),
  }
}

// Main functions
export async function generateDefaultMetadata(): Promise<Metadata> {
  try {
    const siteConfig = await getSiteConfig()
    
    if (!siteConfig) {
      return DEFAULT_METADATA
    }

    const { seo, title, description, branding } = siteConfig

    const metaImage = createMetadataImage(
      typeof seo?.defaultOgImage === 'object' && seo?.defaultOgImage !== null
        ? {
            url: seo.defaultOgImage.url || '',
            width: seo.defaultOgImage.width || DEFAULT_IMAGE.width,
            height: seo.defaultOgImage.height || DEFAULT_IMAGE.height,
            alt: seo.defaultOgImage.alt || undefined
          }
        : seo?.defaultOgImage 
          ? { url: typeof seo.defaultOgImage === 'string' ? seo.defaultOgImage : '' }
          : null
    )
    const baseTitle = seo?.defaultMetaTitle || title || DEFAULT_METADATA.title
    const baseDescription = seo?.defaultMetaDescription || description || DEFAULT_METADATA.description

    const metadata: Metadata = {
      metadataBase: new URL(BASE_URL),
      
      title: {
        default: (baseTitle || 'Flow Masters') as string,
        template: `%s | ${baseTitle}`,
      },
      
      description: baseDescription,
      
      openGraph: createOpenGraph({
        title: (baseTitle || 'Flow Masters') as string,
        description: baseDescription ?? '',
        image: metaImage,
        siteName: title ?? undefined
      }),

      twitter: createTwitter({
        title: baseTitle as string,
        description: baseDescription ?? '',
        image: metaImage,
        creator: siteConfig?.socialLinks?.twitter ?? undefined
      }),

      icons: {
        icon: [
          {
            url: typeof branding?.favicon === 'object'
              ? branding?.favicon?.url ?? (typeof branding?.favicon === 'string' ? branding.favicon : '/favicon.svg')
              : typeof branding?.favicon === 'string'
                ? branding.favicon
                : '/favicon.svg',
            type: 'image/svg+xml'
          },
          {
            url: '/favicon.ico',
            type: 'image/x-icon'
          }
        ],
        apple: branding?.favicon && typeof branding.favicon === 'object' && (branding.favicon as any).url
          ? [{ url: (branding.favicon as any).url }]
          : [{ url: '/icon.svg', type: 'image/svg+xml' }],
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },

      verification: {
        ...(seo?.defaultGoogleVerification && {
          google: seo.defaultGoogleVerification,
        }),
        ...(seo?.defaultYandexVerification && {
          yandex: seo.defaultYandexVerification,
        }),
      },

      alternates: {
        canonical: BASE_URL,
        languages: {
          'en': '/en',
          'ru': '/ru',
        },
      },

      manifest: '/site.webmanifest',
    }

    return validateMetadata(metadata)
  } catch (error) {
    logError('Error generating metadata:', error)
    return DEFAULT_METADATA
  }
}

export async function generatePageMetadata(params: SeoMeta): Promise<Metadata> {
  const { title, description, image, noIndex = false } = params
  const defaultMetadata = await generateDefaultMetadata()
  
  const metaImage = createMetadataImage(image)
  const metaTitle = title || defaultMetadata.title as string
  const metaDescription = description || defaultMetadata.description as string
  
  const metadata: Metadata = {
    ...defaultMetadata,
    ...(title && { title }),
    ...(description && { description }),
    
    openGraph: createOpenGraph({
      title: metaTitle,
      description: metaDescription,
      image: metaImage,
      siteName: defaultMetadata.openGraph?.siteName
    }),
    
    twitter: createTwitter({
      title: metaTitle,
      description: metaDescription,
      image: metaImage,
      creator: defaultMetadata.twitter?.creator
    }),
    
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    }),
  }

  return validateMetadata(metadata)
}

function validateMetadata(metadata: Metadata): Metadata {
  // Remove undefined, null, and empty string values
  const clean = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(clean).filter(Boolean)
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = Object.entries(obj)
        .filter(([_, v]) => v != null && v !== '')
        .map(([k, v]) => [k, clean(v)])
      
      return Object.fromEntries(cleaned)
    }
    
    return obj
  }

  return clean(metadata)
}
