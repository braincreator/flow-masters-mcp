import React from 'react'

interface OrganizationData {
  name: string
  url: string
  logo: string
  description: string
  email: string
  telephone?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressCountry: string
    postalCode: string
  }
  sameAs: string[]
}

interface ArticleData {
  headline: string
  description: string
  author: string
  datePublished: string
  dateModified: string
  image: string
  url: string
}

interface ServiceData {
  name: string
  description: string
  provider: string
  url: string
  image?: string
  offers?: {
    price: string
    priceCurrency: string
    availability: string
  }
}

interface StructuredDataProps {
  type: 'organization' | 'article' | 'service' | 'website'
  data: OrganizationData | ArticleData | ServiceData | any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
    
    switch (type) {
      case 'organization':
        const orgData = data as OrganizationData
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: orgData.name,
          url: orgData.url,
          logo: orgData.logo,
          description: orgData.description,
          email: orgData.email,
          ...(orgData.telephone && { telephone: orgData.telephone }),
          ...(orgData.address && { address: {
            '@type': 'PostalAddress',
            ...orgData.address
          }}),
          sameAs: orgData.sameAs,
          foundingDate: '2024',
          numberOfEmployees: '1-10',
          industry: 'Artificial Intelligence',
          serviceArea: {
            '@type': 'Country',
            name: 'Russia'
          }
        }

      case 'article':
        const articleData = data as ArticleData
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: articleData.headline,
          description: articleData.description,
          author: {
            '@type': 'Person',
            name: articleData.author
          },
          publisher: {
            '@type': 'Organization',
            name: 'Flow Masters',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`
            }
          },
          datePublished: articleData.datePublished,
          dateModified: articleData.dateModified,
          image: articleData.image,
          url: articleData.url,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleData.url
          }
        }

      case 'service':
        const serviceData = data as ServiceData
        return {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: serviceData.name,
          description: serviceData.description,
          provider: {
            '@type': 'Organization',
            name: serviceData.provider,
            url: baseUrl
          },
          url: serviceData.url,
          ...(serviceData.image && { image: serviceData.image }),
          ...(serviceData.offers && {
            offers: {
              '@type': 'Offer',
              ...serviceData.offers
            }
          }),
          serviceType: 'AI Automation',
          areaServed: {
            '@type': 'Country',
            name: 'Russia'
          }
        }

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Flow Masters',
          url: baseUrl,
          description: 'Делаем искусственный интеллект доступным для любого бизнеса. Автоматизация процессов с помощью ИИ.',
          publisher: {
            '@type': 'Organization',
            name: 'Flow Masters'
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          },
          inLanguage: ['ru', 'en']
        }

      default:
        return null
    }
  }

  const structuredData = generateStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}

// Предустановленные данные для организации
export const organizationData: OrganizationData = {
  name: 'Flow Masters',
  url: 'https://flow-masters.ru',
  logo: 'https://flow-masters.ru/logo.png',
  description: 'Делаем искусственный интеллект доступным для любого бизнеса. Автоматизация процессов с помощью ИИ.',
  email: 'admin@flow-masters.ru',
  sameAs: [
    'https://t.me/flow_masters_bot',
    'https://linkedin.com/in/alexander-yudin'
  ]
}
