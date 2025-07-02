import React from 'react'

export interface OrganizationSchemaProps {
  language?: 'ru' | 'en'
}

/**
 * Organization Schema компонент
 * Генерирует структурированные данные для организации
 */
export default function OrganizationSchema({ language = 'ru' }: OrganizationSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Flow Masters',
    alternateName: 'FlowMasters',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    image: `${baseUrl}/images/organization-image.jpg`,
    
    description: language === 'ru'
      ? 'Компания по автоматизации бизнес-процессов и разработке AI решений'
      : 'Business process automation and AI solutions development company',
    
    foundingDate: '2023',
    
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressRegion: 'Краснодарский край',
      addressLocality: 'Краснодар',
    },
    
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['Russian', 'English'],
        url: `${baseUrl}/${language}/contact`,
      },
      {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        availableLanguage: ['Russian', 'English'],
        url: `${baseUrl}/${language}/contact`,
      },
    ],
    
    sameAs: [
      'https://t.me/flowmasters_ru',
      'https://github.com/flowmasters',
      // Добавьте другие социальные сети при наличии
    ],
    
    areaServed: [
      {
        '@type': 'Country',
        name: 'Russia',
      },
      {
        '@type': 'Country',
        name: 'Kazakhstan',
      },
      {
        '@type': 'Country',
        name: 'Belarus',
      },
      // Глобальные удаленные услуги
      {
        '@type': 'Place',
        name: 'Worldwide (Remote)',
      },
    ],
    
    serviceType: [
      language === 'ru' ? 'Автоматизация бизнес-процессов' : 'Business Process Automation',
      language === 'ru' ? 'Разработка AI решений' : 'AI Solutions Development',
      language === 'ru' ? 'Создание чат-ботов' : 'Chatbot Development',
      language === 'ru' ? 'Интеграция систем' : 'System Integration',
      language === 'ru' ? 'Консультации по цифровизации' : 'Digital Transformation Consulting',
    ],
    
    knowsAbout: [
      'Business Process Automation',
      'Artificial Intelligence',
      'Machine Learning',
      'Chatbot Development',
      'System Integration',
      'Workflow Automation',
      'n8n',
      'OpenAI API',
      'Python',
      'JavaScript',
      'Node.js',
      'React',
      'MongoDB',
      'PostgreSQL',
    ],
    
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: language === 'ru' ? 'Каталог услуг Flow Masters' : 'Flow Masters Service Catalog',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: language === 'ru' ? 'Автоматизация бизнес-процессов' : 'Business Process Automation',
            description: language === 'ru' 
              ? 'Создание автоматизированных workflow для оптимизации операций'
              : 'Creating automated workflows to optimize operations',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: language === 'ru' ? 'Разработка AI решений' : 'AI Solutions Development',
            description: language === 'ru'
              ? 'Интеграция искусственного интеллекта в бизнес-процессы'
              : 'Integrating artificial intelligence into business processes',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: language === 'ru' ? 'Создание чат-ботов' : 'Chatbot Development',
            description: language === 'ru'
              ? 'Разработка интеллектуальных ботов для различных платформ'
              : 'Developing intelligent bots for various platforms',
          },
        },
      ],
    },
    
    employee: [
      {
        '@type': 'Person',
        name: 'Flow Masters Team',
        jobTitle: language === 'ru' ? 'Команда экспертов' : 'Expert Team',
        knowsAbout: [
          'Business Process Automation',
          'AI Development',
          'System Integration',
        ],
      },
    ],
    
    award: [
      language === 'ru' ? 'Эксперт по автоматизации n8n' : 'n8n Automation Expert',
      language === 'ru' ? 'Сертифицированный разработчик OpenAI' : 'Certified OpenAI Developer',
    ],
    
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
    
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Клиент Flow Masters',
        },
        reviewBody: language === 'ru'
          ? 'Отличная автоматизация процессов, сэкономили много времени'
          : 'Excellent process automation, saved a lot of time',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData),
      }}
    />
  )
}
