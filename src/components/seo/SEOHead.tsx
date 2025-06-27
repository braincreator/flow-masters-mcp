import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getRssFeedUrls } from '@/utilities/rssHelpers'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product' | 'service'
  locale?: string
  alternateLocales?: { locale: string; url: string }[]
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
  noFollow?: boolean
  canonical?: string
}

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'Product' | 'Service' | 'BreadcrumbList'
  data: Record<string, any>
}

const DEFAULT_SEO = {
  siteName: 'FlowMasters',
  defaultTitle: 'FlowMasters - AI-Powered Business Automation',
  defaultDescription:
    'Автоматизация бизнес-процессов с помощью ИИ. Создаем умные решения для вашего бизнеса.',
  defaultImage: '/images/og-default.jpg',
  defaultUrl: 'https://flow-masters.ru',
  twitterHandle: '@flowmasters',
  facebookAppId: '',
}

/**
 * Generate metadata for Next.js pages
 */
export async function generateSEOMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  locale = 'ru',
  alternateLocales = [],
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  noFollow = false,
  canonical,
}: SEOProps = {}): Promise<Metadata> {
  const t = await getTranslations('SEO')

  const finalTitle = title ? `${title} | ${DEFAULT_SEO.siteName}` : DEFAULT_SEO.defaultTitle
  const finalDescription = description || DEFAULT_SEO.defaultDescription
  const finalImage = image || DEFAULT_SEO.defaultImage
  const finalUrl = url || DEFAULT_SEO.defaultUrl

  // Ensure absolute URLs
  const absoluteImage = finalImage.startsWith('http')
    ? finalImage
    : `${DEFAULT_SEO.defaultUrl}${finalImage}`
  const absoluteUrl = finalUrl.startsWith('http')
    ? finalUrl
    : `${DEFAULT_SEO.defaultUrl}${finalUrl}`

  // Get RSS feed URLs
  const rssFeeds = getRssFeedUrls(DEFAULT_SEO.defaultUrl)

  const metadata: Metadata = {
    title: finalTitle,
    description: finalDescription,
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,

    // Basic meta tags
    authors: author ? [{ name: author }] : undefined,
    creator: DEFAULT_SEO.siteName,
    publisher: DEFAULT_SEO.siteName,

    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Canonical URL
    alternates: {
      canonical: canonical || absoluteUrl,
      languages: alternateLocales.reduce(
        (acc, alt) => {
          acc[alt.locale] = alt.url
          return acc
        },
        {} as Record<string, string>,
      ),
      types: {
        'application/rss+xml': [
          { url: rssFeeds.blog, title: 'Flow Masters - Блог' },
          { url: rssFeeds.blogEn, title: 'Flow Masters - Blog (English)' },
          { url: rssFeeds.services, title: 'Flow Masters - Services' },
        ],
        'application/atom+xml': [{ url: rssFeeds.atom, title: 'Flow Masters - Atom Feed' }],
      },
    },

    // Open Graph
    openGraph: {
      type: type as any,
      title: finalTitle,
      description: finalDescription,
      url: absoluteUrl,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
      locale: locale,
      alternateLocale: alternateLocales.map((alt) => alt.locale),
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [absoluteImage],
      creator: DEFAULT_SEO.twitterHandle,
      site: DEFAULT_SEO.twitterHandle,
    },

    // Additional meta tags
    other: {
      'application-name': DEFAULT_SEO.siteName,
      'apple-mobile-web-app-title': DEFAULT_SEO.siteName,
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#000000',
      'msapplication-tap-highlight': 'no',
      'theme-color': '#000000',
    },
  }

  return metadata
}

/**
 * Generate structured data JSON-LD
 */
export function generateStructuredData({ type, data }: StructuredDataProps): string {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  // Add common organization data for all types
  if (type !== 'Organization') {
    baseData.publisher = {
      '@type': 'Organization',
      name: DEFAULT_SEO.siteName,
      url: DEFAULT_SEO.defaultUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${DEFAULT_SEO.defaultUrl}/images/logo.png`,
      },
    }
  }

  return JSON.stringify(baseData)
}

/**
 * Common structured data generators
 */
export const structuredDataGenerators = {
  organization: () =>
    generateStructuredData({
      type: 'Organization',
      data: {
        name: DEFAULT_SEO.siteName,
        url: DEFAULT_SEO.defaultUrl,
        logo: `${DEFAULT_SEO.defaultUrl}/images/logo.png`,
        description: DEFAULT_SEO.defaultDescription,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+7-XXX-XXX-XXXX',
          contactType: 'customer service',
          availableLanguage: ['Russian', 'English'],
        },
        sameAs: [
          'https://t.me/flowmasters',
          // Add other social media URLs
        ],
      },
    }),

  website: (url: string) =>
    generateStructuredData({
      type: 'WebSite',
      data: {
        name: DEFAULT_SEO.siteName,
        url: url,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${url}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    }),

  article: (article: {
    title: string
    description: string
    url: string
    image: string
    publishedTime: string
    modifiedTime?: string
    author: string
  }) =>
    generateStructuredData({
      type: 'Article',
      data: {
        headline: article.title,
        description: article.description,
        url: article.url,
        image: article.image,
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime || article.publishedTime,
        author: {
          '@type': 'Person',
          name: article.author,
        },
      },
    }),

  breadcrumb: (items: { name: string; url: string }[]) =>
    generateStructuredData({
      type: 'BreadcrumbList',
      data: {
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
    }),
}

/**
 * Component for rendering structured data
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  const jsonLd = generateStructuredData({ type, data })

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
}
