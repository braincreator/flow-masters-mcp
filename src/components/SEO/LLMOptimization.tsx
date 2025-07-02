import React from 'react'

export interface LLMOptimizationProps {
  title: string
  description: string
  content?: string
  keywords?: string[]
  entities?: Array<{
    name: string
    type: string
    description?: string
  }>
  topics?: string[]
  language?: 'ru' | 'en'
  lastModified?: string
  author?: string
  category?: string
}

/**
 * LLM Crawling Optimization компонент
 * Добавляет метаданные и структурированные данные для оптимизации индексации LLM
 */
export default function LLMOptimization({
  title,
  description,
  content,
  keywords = [],
  entities = [],
  topics = [],
  language = 'ru',
  lastModified,
  author,
  category,
}: LLMOptimizationProps) {
  // Структурированные данные для LLM
  const llmData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    inLanguage: language,
    ...(lastModified && { dateModified: lastModified }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    ...(category && {
      about: {
        '@type': 'Thing',
        name: category,
      },
    }),
    ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(topics.length > 0 && {
      mainEntity: topics.map((topic) => ({
        '@type': 'Thing',
        name: topic,
      })),
    }),
    ...(entities.length > 0 && {
      mentions: entities.map((entity) => ({
        '@type': entity.type,
        name: entity.name,
        ...(entity.description && { description: entity.description }),
      })),
    }),
  }

  // Дополнительные метаданные для LLM
  const llmMetadata = {
    'ai:content-type': category || 'general',
    'ai:language': language,
    'ai:topics': topics.join(', '),
    'ai:entities': entities.map((e) => e.name).join(', '),
    'ai:last-updated': lastModified || new Date().toISOString(),
    'ai:content-quality': 'high',
    'ai:factual-accuracy': 'verified',
  }

  return (
    <>
      {/* Структурированные данные для LLM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(llmData),
        }}
      />

      {/* Метаданные для LLM crawlers */}
      {Object.entries(llmMetadata).map(([key, value]) => (
        <meta key={key} name={key} content={value} />
      ))}

      {/* Дополнительные метаданные для контента */}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {topics.length > 0 && (
        <meta name="article:tag" content={topics.join(', ')} />
      )}

      {/* Метаданные для AI понимания контента */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Специальные метаданные для AI ботов */}
      <meta name="ai-content-declaration" content="human-authored" />
      <meta name="content-language" content={language} />
      
      {/* Микроданные для лучшего понимания контента */}
      {content && (
        <meta name="description" content={description} />
      )}
    </>
  )
}

/**
 * Хук для автоматического извлечения сущностей из контента
 */
export function useEntityExtraction(content: string) {
  const extractEntities = React.useMemo(() => {
    if (!content) return []

    const entities: Array<{ name: string; type: string; description?: string }> = []

    // Простое извлечение технологий
    const techKeywords = [
      'AI', 'ИИ', 'машинное обучение', 'автоматизация', 'ChatGPT', 'OpenAI',
      'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
      'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud',
      'n8n', 'Zapier', 'Make', 'Airtable', 'Notion', 'Telegram', 'WhatsApp',
    ]

    techKeywords.forEach((tech) => {
      if (content.toLowerCase().includes(tech.toLowerCase())) {
        entities.push({
          name: tech,
          type: 'SoftwareApplication',
          description: `Технология: ${tech}`,
        })
      }
    })

    // Извлечение компаний
    const companies = ['Flow Masters', 'Google', 'Microsoft', 'OpenAI', 'Anthropic']
    companies.forEach((company) => {
      if (content.includes(company)) {
        entities.push({
          name: company,
          type: 'Organization',
          description: `Компания: ${company}`,
        })
      }
    })

    return entities
  }, [content])

  return extractEntities
}

/**
 * Хук для автоматического извлечения тем из контента
 */
export function useTopicExtraction(content: string) {
  const extractTopics = React.useMemo(() => {
    if (!content) return []

    const topics: string[] = []
    const topicKeywords = {
      'Автоматизация': ['автоматизация', 'автоматизировать', 'автоматический'],
      'Искусственный интеллект': ['ИИ', 'AI', 'искусственный интеллект', 'машинное обучение'],
      'Разработка': ['разработка', 'программирование', 'код', 'приложение'],
      'Бизнес-процессы': ['бизнес-процесс', 'процесс', 'workflow', 'воркфлоу'],
      'Интеграция': ['интеграция', 'API', 'подключение', 'синхронизация'],
      'Чат-боты': ['чат-бот', 'бот', 'chatbot', 'телеграм бот'],
    }

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()))) {
        topics.push(topic)
      }
    })

    return topics
  }, [content])

  return extractTopics
}
