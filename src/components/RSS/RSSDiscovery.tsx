'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rss, Globe, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getRssFeedUrls } from '@/utilities/rssHelpers'

interface RSSDiscoveryProps {
  className?: string
  showTitle?: boolean
  compact?: boolean
}

export function RSSDiscovery({ className, showTitle = true, compact = false }: RSSDiscoveryProps) {
  const t = useTranslations('RSS')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
  const feeds = getRssFeedUrls(baseUrl)

  const feedList = [
    {
      url: feeds.blog,
      title: 'Блог (Русский)',
      description: 'Все статьи блога на русском языке',
      language: 'ru',
      type: 'RSS',
    },
    {
      url: feeds.blogEn,
      title: 'Blog (English)',
      description: 'All blog articles in English',
      language: 'en',
      type: 'RSS',
    },
    {
      url: feeds.services,
      title: 'Услуги / Services',
      description: 'Обновления услуг и новые предложения',
      language: 'ru/en',
      type: 'RSS',
    },
    {
      url: feeds.atom,
      title: 'Atom Feed',
      description: 'Альтернативный формат для RSS-читалок',
      language: 'ru',
      type: 'Atom',
    },
  ]

  const handleFeedClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const copyFeedUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (compact) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Rss className="h-4 w-4" />
          <span>RSS:</span>
          {feedList.slice(0, 2).map((feed, index) => (
            <Button
              key={feed.url}
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              onClick={() => handleFeedClick(feed.url)}
            >
              {feed.language}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            RSS Подписка
          </CardTitle>
          <CardDescription>
            Подпишитесь на наши RSS-каналы, чтобы получать обновления в вашем любимом RSS-читателе
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {feedList.map((feed) => (
          <div
            key={feed.url}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{feed.title}</h4>
                <Badge variant="secondary" className="text-xs">
                  {feed.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {feed.language}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{feed.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyFeedUrl(feed.url)}
                title="Копировать URL"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleFeedClick(feed.url)}
              >
                <Rss className="h-4 w-4 mr-1" />
                Открыть
              </Button>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <h5 className="font-medium mb-2">Популярные RSS-читалки:</h5>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>Feedly</span>
            <span>•</span>
            <span>Inoreader</span>
            <span>•</span>
            <span>NewsBlur</span>
            <span>•</span>
            <span>The Old Reader</span>
            <span>•</span>
            <span>Thunderbird</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Simplified RSS link component for headers/footers
export function RSSLinks({ className }: { className?: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://flow-masters.ru'
  const feeds = getRssFeedUrls(baseUrl)

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">RSS:</span>
        <a
          href={feeds.blog}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="RSS лента блога (русский)"
        >
          <Rss className="h-4 w-4" />
          RU
        </a>
        <a
          href={feeds.blogEn}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="RSS feed (English)"
        >
          <Rss className="h-4 w-4" />
          EN
        </a>
        <a
          href={feeds.atom}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title="Atom feed"
        >
          <Rss className="h-4 w-4" />
          Atom
        </a>
      </div>
    </div>
  )
}
