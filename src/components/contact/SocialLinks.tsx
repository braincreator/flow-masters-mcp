import React from 'react'
import { Github, Linkedin, Send, MessageCircle } from 'lucide-react' // Пример иконок, добавьте нужные
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SocialLinksProps {
  links: {
    github?: string
    linkedin?: string
    telegram?: string
    tenchat?: string
    // Добавьте другие соцсети по необходимости
    [key: string]: string | undefined // Для поддержки произвольных ключей
  }
}

const iconMap: { [key: string]: React.ReactNode } = {
  github: <Github className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  telegram: <Send className="h-5 w-5" />, // Send используется для Telegram
  tenchat: <MessageCircle className="h-5 w-5" />, // MessageCircle для TenChat
}

const nameMap: { [key: string]: string } = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  tenchat: 'TenChat',
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex space-x-3">
        {Object.entries(links).map(([key, url]) => {
          if (!url) return null // Не рендерим, если ссылка не предоставлена
          const Icon = iconMap[key]
          const Name = nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1) // Используем имя из карты или форматируем ключ
          if (!Icon) return null // Не рендерим, если нет иконки для ключа

          return (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Перейти в ${Name}`}
                  >
                    {Icon}
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{Name}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
