'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Message as MessageType,
  MessageButton,
  MessageQuickReply,
  MessageMedia,
  MessageCard,
} from '@/types/chat'
import RichText from '@/components/RichText'
import MarkdownRenderer from './MarkdownRenderer'
import Image from 'next/image'
import { format } from 'date-fns'
import { ru, enUS } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Check, Clock, AlertCircle, ExternalLink, Download, Copy, Send } from 'lucide-react'

type MessageProps = {
  message: MessageType
  showTimestamp?: boolean
  primaryColor?: string
  onButtonClick?: (button: MessageButton) => void
  onQuickReplyClick?: (quickReply: MessageQuickReply) => void
  onRetry?: (messageId: string) => void
}

const Message: React.FC<MessageProps> = ({
  message,
  showTimestamp = true,
  primaryColor = '#0070f3',
  onButtonClick,
  onQuickReplyClick,
  onRetry,
}) => {
  const isBot = message.sender === 'bot'
  const locale = typeof window !== 'undefined' ? window.navigator.language : 'ru'
  const dateLocale = locale.startsWith('ru') ? ru : enUS

  // Форматирование времени
  const formattedTime = message.timestamp
    ? (() => {
        try {
          // Проверяем, является ли timestamp объектом Date, строкой или числом
          const date =
            message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
          return format(date, 'HH:mm', { locale: dateLocale })
        } catch (e) {
          console.warn('Invalid timestamp format:', message.timestamp)
          return format(new Date(), 'HH:mm', { locale: dateLocale })
        }
      })()
    : ''

  // Получаем иконку статуса сообщения
  const getStatusIcon = () => {
    if (message.isTyping) return null

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return (
          <div className="flex">
            <Check className="h-3 w-3 text-muted-foreground" />
            <Check className="h-3 w-3 text-muted-foreground -ml-1" />
          </div>
        )
      case 'read':
        return (
          <div className="flex">
            <Check className="h-3 w-3 text-primary" />
            <Check className="h-3 w-3 text-primary -ml-1" />
          </div>
        )
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return null
    }
  }

  // Рендер медиа-контента
  const renderMedia = (media: MessageMedia) => {
    switch (media.type) {
      case 'image':
        return (
          <div className="rounded-lg overflow-hidden my-3 shadow-sm">
            <Image
              src={media.url}
              alt={media.altText || 'Image'}
              width={media.width || 300}
              height={media.height || 200}
              className="w-full h-auto object-cover"
            />
          </div>
        )
      case 'video':
        return (
          <div className="rounded-lg overflow-hidden my-3 shadow-sm">
            <video
              src={media.url}
              controls
              poster={media.thumbnailUrl}
              className="w-full max-h-[300px]"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )
      case 'audio':
        return (
          <div className="my-3 rounded-lg overflow-hidden shadow-sm">
            <audio src={media.url} controls className="w-full p-2 bg-muted/30">
              Your browser does not support the audio tag.
            </audio>
          </div>
        )
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 border rounded-lg shadow-sm my-3">
            <Download className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm flex-grow truncate">{media.fileName || 'Download file'}</span>
            <Button
              size="sm"
              variant="outline"
              className="chat-button"
              onClick={() => window.open(media.url, '_blank')}
            >
              Download
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  // Рендер карточки
  const renderCard = (card: MessageCard) => {
    return (
      <div className="border rounded-lg overflow-hidden my-3 max-w-[300px] shadow-sm">
        {card.imageUrl && (
          <div className="w-full h-[160px] relative">
            <Image src={card.imageUrl} alt={card.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-4">
          <h4 className="font-medium text-base">{card.title}</h4>
          {card.subtitle && <p className="text-sm text-muted-foreground mt-1.5">{card.subtitle}</p>}

          {card.buttons && card.buttons.length > 0 && (
            <div className="mt-4 flex flex-col gap-2.5">
              {card.buttons.map((button) => renderButton(button))}
            </div>
          )}

          {card.footer && <div className="mt-3 text-xs text-muted-foreground">{card.footer}</div>}
        </div>
      </div>
    )
  }

  // Рендер кнопки
  const renderButton = (button: MessageButton) => {
    const getButtonIcon = () => {
      if (button.icon) return button.icon

      switch (button.action) {
        case 'link':
          return <ExternalLink className="h-4 w-4 mr-1" />
        case 'download':
          return <Download className="h-4 w-4 mr-1" />
        case 'copy':
          return <Copy className="h-4 w-4 mr-1" />
        case 'reply':
          return <Send className="h-4 w-4 mr-1" />
        default:
          return null
      }
    }

    return (
      <Button
        key={button.id}
        variant={button.style || 'secondary'}
        size="sm"
        className="justify-start text-sm chat-button my-1"
        onClick={() => onButtonClick && onButtonClick(button)}
      >
        {getButtonIcon()}
        {button.text}
      </Button>
    )
  }

  // Рендер быстрых ответов
  const renderQuickReplies = (quickReplies: MessageQuickReply[]) => {
    return (
      <div className="flex flex-wrap gap-2.5 mt-3">
        {quickReplies.map((reply) => (
          <Button
            key={reply.id}
            variant="outline"
            size="sm"
            className="rounded-full text-xs py-1.5 px-4 quick-reply hover:shadow-sm"
            onClick={() => onQuickReplyClick && onQuickReplyClick(reply)}
            style={{
              borderColor: primaryColor,
              color: primaryColor,
            }}
          >
            {reply.text}
          </Button>
        ))}
      </div>
    )
  }

  // Рендер индикатора набора текста
  const renderTypingIndicator = () => {
    return (
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    )
  }

  return (
    <div className={cn('flex mb-5 animate-fade-in', isBot ? 'justify-start' : 'justify-end')}>
      <div className={cn('flex max-w-[80%]', isBot ? 'flex-row' : 'flex-row-reverse')}>
        {message.avatar && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden mr-3 mt-1">
            <Image
              src={typeof message.avatar === 'string' ? message.avatar : message.avatar.url}
              alt={message.senderName || (isBot ? 'Бот' : 'Пользователь')}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          {/* Имя отправителя и время */}
          {message.senderName && !message.isTyping && (
            <div className="flex items-center mb-1.5 ml-1 text-xs text-muted-foreground">
              <span className="font-medium">{message.senderName}</span>
              {showTimestamp && <span className="ml-2 opacity-70">{formattedTime}</span>}
            </div>
          )}

          <div
            className={cn(
              'px-4 py-3 rounded-2xl shadow-sm',
              isBot
                ? 'bg-muted text-foreground rounded-tl-none'
                : 'text-primary-foreground rounded-tr-none',
              message.isError ? 'bg-destructive/10' : '',
              message.isTyping ? 'min-h-[32px] min-w-[64px]' : '',
            )}
            style={{
              backgroundColor: isBot ? undefined : primaryColor,
            }}
          >
            {message.isTyping ? (
              renderTypingIndicator()
            ) : (
              <>
                {/* Текстовый контент */}
                {typeof message.content === 'string' ? (
                  message.type === 'markdown' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )
                ) : (
                  <RichText data={message.content} />
                )}

                {/* Медиа контент */}
                {message.media && renderMedia(message.media)}

                {/* Карточка */}
                {message.card && renderCard(message.card)}

                {/* Кнопки */}
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2.5">
                    {message.buttons.map((button) => renderButton(button))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Быстрые ответы (отображаются под сообщением) */}
          {!message.isTyping &&
            message.quickReplies &&
            message.quickReplies.length > 0 &&
            renderQuickReplies(message.quickReplies)}

          {/* Статус сообщения и кнопка повтора */}
          {(!isBot || (message.isError && onRetry)) && (
            <div className="flex items-center justify-end mt-1">
              {!isBot && <div className="mr-1">{getStatusIcon()}</div>}

              {/* Кнопка повтора для сообщений с ошибкой */}
              {message.isError && onRetry && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1"
                  onClick={() => onRetry(message.id)}
                  title="Повторить отправку"
                >
                  <Send className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message
