import React from 'react'

interface AboutPageJsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  locale: string
}

export function AboutPageJsonLd({ data, locale }: AboutPageJsonLdProps) {
  // Безопасное извлечение данных
  const heroSubtitle = data.hero?.subtitle || 'AI агентство Flow Masters'
  const founderName = data.founder?.name || 'Александр Юдин'
  const founderRole = data.founder?.role || 'Основатель и CEO'
  const founderPhoto =
    typeof data.founder?.photo === 'object' && data.founder.photo?.url
      ? data.founder.photo.url
      : undefined
  const founderLinkedIn = data.founder?.socialLinks?.linkedin

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flow Masters',
    description: heroSubtitle,
    url: `https://flow-masters.ru/${locale}/about`,
    logo: 'https://flow-masters.ru/logo.png',
    foundingDate: '2022',
    founder: {
      '@type': 'Person',
      name: founderName,
      jobTitle: founderRole,
      ...(founderPhoto && { image: founderPhoto }),
      ...(founderLinkedIn && {
        sameAs: [founderLinkedIn],
      }),
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'admin@flow-masters.ru',
      telephone: '+7 (995) 738-77-09',
      availableLanguage: ['Russian', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressLocality: 'Краснодар',
    },
    serviceArea: {
      '@type': 'Country',
      name: 'Russia',
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Business Automation',
      'Process Optimization',
      'AI Consulting',
    ],
  }

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flow Masters',
    url: 'https://flow-masters.ru',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://flow-masters.ru/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'ru' ? 'Главная' : 'Home',
        item: `https://flow-masters.ru/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'ru' ? 'О нас' : 'About Us',
        item: `https://flow-masters.ru/${locale}/about`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
    </>
  )
}
