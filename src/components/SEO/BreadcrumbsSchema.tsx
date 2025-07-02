import React from 'react'
import { BreadcrumbItem } from '@/components/Breadcrumbs'

export interface BreadcrumbsSchemaProps {
  items: BreadcrumbItem[]
  baseUrl?: string
}

/**
 * Breadcrumbs Schema компонент
 * Генерирует структурированные данные для хлебных крошек
 */
export default function BreadcrumbsSchema({ items, baseUrl }: BreadcrumbsSchemaProps) {
  if (!items || items.length === 0) return null

  const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

  // Добавляем главную страницу если её нет
  const breadcrumbItems = items[0]?.label !== 'Главная' && items[0]?.label !== 'Home'
    ? [{ label: 'Главная', url: '/' }, ...items]
    : items

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.url ? `${siteUrl}${item.url}` : undefined,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  )
}

/**
 * Хук для автоматической генерации breadcrumbs из URL
 */
export function useBreadcrumbsFromPath(pathname: string, locale: string = 'ru') {
  const breadcrumbs = React.useMemo(() => {
    if (!pathname) return []

    const segments = pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = []

    // Убираем локаль из сегментов
    const pathSegments = segments[0] === locale ? segments.slice(1) : segments

    // Маппинг сегментов на читаемые названия
    const segmentLabels: Record<string, Record<string, string>> = {
      ru: {
        services: 'Услуги',
        blog: 'Блог',
        posts: 'Статьи',
        about: 'О нас',
        contact: 'Контакты',
        cases: 'Кейсы',
        courses: 'Курсы',
        team: 'Команда',
        portfolio: 'Портфолио',
        pricing: 'Цены',
        faq: 'FAQ',
        privacy: 'Политика конфиденциальности',
        terms: 'Условия использования',
      },
      en: {
        services: 'Services',
        blog: 'Blog',
        posts: 'Posts',
        about: 'About',
        contact: 'Contact',
        cases: 'Cases',
        courses: 'Courses',
        team: 'Team',
        portfolio: 'Portfolio',
        pricing: 'Pricing',
        faq: 'FAQ',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
      },
    }

    const labels = segmentLabels[locale] || segmentLabels.ru

    // Генерируем breadcrumbs
    pathSegments.forEach((segment, index) => {
      const url = `/${locale}/${pathSegments.slice(0, index + 1).join('/')}`
      const label = labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      items.push({
        label,
        url,
        active: index === pathSegments.length - 1,
      })
    })

    return items
  }, [pathname, locale])

  return breadcrumbs
}

/**
 * Предустановленные breadcrumbs для основных страниц
 */
export const PREDEFINED_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/services': [
    { label: 'Услуги', url: '/services', active: true },
  ],
  '/blog': [
    { label: 'Блог', url: '/blog', active: true },
  ],
  '/about': [
    { label: 'О нас', url: '/about', active: true },
  ],
  '/contact': [
    { label: 'Контакты', url: '/contact', active: true },
  ],
  '/cases': [
    { label: 'Кейсы', url: '/cases', active: true },
  ],
  '/courses': [
    { label: 'Курсы', url: '/courses', active: true },
  ],
  '/services/automation': [
    { label: 'Услуги', url: '/services' },
    { label: 'Автоматизация', url: '/services/automation', active: true },
  ],
  '/services/ai-solutions': [
    { label: 'Услуги', url: '/services' },
    { label: 'ИИ решения', url: '/services/ai-solutions', active: true },
  ],
  '/services/chatbots': [
    { label: 'Услуги', url: '/services' },
    { label: 'Чат-боты', url: '/services/chatbots', active: true },
  ],
  '/services/integration': [
    { label: 'Услуги', url: '/services' },
    { label: 'Интеграция', url: '/services/integration', active: true },
  ],
}

/**
 * Функция для получения breadcrumbs для конкретной страницы
 */
export function getBreadcrumbsForPage(pathname: string, locale: string = 'ru'): BreadcrumbItem[] {
  // Убираем локаль из пути
  const cleanPath = pathname.replace(`/${locale}`, '') || '/'

  // Проверяем предустановленные breadcrumbs
  if (PREDEFINED_BREADCRUMBS[cleanPath]) {
    return PREDEFINED_BREADCRUMBS[cleanPath]
  }

  // Генерируем автоматически
  return useBreadcrumbsFromPath(pathname, locale)
}
