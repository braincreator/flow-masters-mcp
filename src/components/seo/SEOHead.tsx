import { Metadata } from 'next'
import { StructuredData, organizationData } from './StructuredData'

interface SEOHeadProps {
  title: string
  description: string
  canonical?: string
  image?: string
  type?: 'website' | 'article' | 'service'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  locale?: string
  alternateLocales?: { locale: string; href: string }[]
  noIndex?: boolean
}

export function generateSEOMetadata({
  title,
  description,
  canonical,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  locale = 'ru',
  alternateLocales = [],
  noIndex = false
}: SEOHeadProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
  const fullTitle = title.includes('Flow Masters') ? title : `${title} | Flow Masters`
  const ogImage = image || `${baseUrl}/website-template-OG.webp`
  const canonicalUrl = canonical || baseUrl

  const metadata: Metadata = {
    title: fullTitle,
    description,
    
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'Flow Masters',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      type: type === 'article' ? 'article' : 'website',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@flow_masters',
    },

    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ru': locale === 'ru' ? canonicalUrl : `${baseUrl}/ru`,
        'en': locale === 'en' ? canonicalUrl : `${baseUrl}/en`,
        ...alternateLocales.reduce((acc, alt) => {
          acc[alt.locale] = alt.href
          return acc
        }, {} as Record<string, string>)
      },
    },

    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },

    other: {
      'msapplication-TileColor': '#2563eb',
      'theme-color': '#2563eb',
    },
  }

  // Добавляем специфичные для статей мета-теги
  if (type === 'article' && author) {
    metadata.authors = [{ name: author }]
  }

  return metadata
}

interface SEOComponentProps extends SEOHeadProps {
  children?: React.ReactNode
  structuredDataType?: 'organization' | 'article' | 'service' | 'website'
  structuredData?: any
}

export function SEOHead({ 
  structuredDataType = 'website', 
  structuredData,
  children,
  ...seoProps 
}: SEOComponentProps) {
  // Определяем данные для структурированной разметки
  let structuredDataToUse = structuredData

  if (!structuredDataToUse) {
    switch (structuredDataType) {
      case 'organization':
        structuredDataToUse = organizationData
        break
      case 'article':
        structuredDataToUse = {
          headline: seoProps.title,
          description: seoProps.description,
          author: seoProps.author || 'Flow Masters',
          datePublished: seoProps.publishedTime || new Date().toISOString(),
          dateModified: seoProps.modifiedTime || new Date().toISOString(),
          image: seoProps.image || `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'}/website-template-OG.webp`,
          url: seoProps.canonical || process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
        }
        break
      case 'service':
        structuredDataToUse = {
          name: seoProps.title,
          description: seoProps.description,
          provider: 'Flow Masters',
          url: seoProps.canonical || process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru',
          image: seoProps.image
        }
        break
    }
  }

  return (
    <>
      <StructuredData type={structuredDataType} data={structuredDataToUse} />
      {children}
    </>
  )
}

// Хелпер для быстрого создания SEO метаданных для разных типов страниц
export const createPageSEO = (props: SEOHeadProps) => generateSEOMetadata(props)

export const createArticleSEO = (props: Omit<SEOHeadProps, 'type'>) => 
  generateSEOMetadata({ ...props, type: 'article' })

export const createServiceSEO = (props: Omit<SEOHeadProps, 'type'>) => 
  generateSEOMetadata({ ...props, type: 'service' })
