import React from 'react'
import { generateStructuredData } from '@/components/SEO/SEOHead'

export interface SERPLink {
  name: string
  url: string
  description?: string
}

export interface SERPLinksProps {
  links: SERPLink[]
  searchAction?: {
    target: string
    queryInput: string
  }
}

/**
 * SERP Links компонент для улучшения отображения в поисковой выдаче
 * Генерирует структурированные данные для Google Sitelinks
 */
export default function SERPLinks({ links, searchAction }: SERPLinksProps) {
  // Генерируем структурированные данные для сайтлинков
  const sitelinksData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flow Masters',
    url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru',
    ...(searchAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: searchAction.target,
        },
        'query-input': searchAction.queryInput,
      },
    }),
    ...(links.length > 0 && {
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: links.map((link, index) => ({
          '@type': 'SiteNavigationElement',
          position: index + 1,
          name: link.name,
          description: link.description,
          url: link.url,
        })),
      },
    }),
  }

  // Дополнительные структурированные данные для навигации
  const navigationData = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru',
    hasPart: links.map((link) => ({
      '@type': 'WebPage',
      name: link.name,
      description: link.description,
      url: link.url,
    })),
  }

  return (
    <>
      {/* Основные структурированные данные для сайтлинков */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(sitelinksData),
        }}
      />
      
      {/* Дополнительные данные для навигации */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(navigationData),
        }}
      />
    </>
  )
}

/**
 * Предустановленные SERP links для главной страницы
 */
export const DEFAULT_SERP_LINKS: SERPLink[] = [
  {
    name: 'Услуги',
    url: '/services',
    description: 'Автоматизация бизнес-процессов и AI решения',
  },
  {
    name: 'Блог',
    url: '/blog',
    description: 'Экспертные статьи об ИИ и автоматизации',
  },
  {
    name: 'О нас',
    url: '/about',
    description: 'Команда экспертов по цифровой трансформации',
  },
  {
    name: 'Контакты',
    url: '/contact',
    description: 'Свяжитесь с нами для консультации',
  },
  {
    name: 'Кейсы',
    url: '/cases',
    description: 'Успешные проекты автоматизации',
  },
  {
    name: 'Курсы',
    url: '/courses',
    description: 'Обучение работе с ИИ и автоматизацией',
  },
]

/**
 * Поисковое действие для сайта
 */
export const DEFAULT_SEARCH_ACTION = {
  target: `${process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'}/search?q={search_term_string}`,
  queryInput: 'required name=search_term_string',
}
