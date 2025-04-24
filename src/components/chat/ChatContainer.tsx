'use client'

import React, { RefObject, useState } from 'react'
import { cn } from '@/lib/utils'
import { Message as MessageType, MessageButton, MessageQuickReply } from '@/types/chat'
import Message from './Message'
import ChatInput from './ChatInput'
import SuggestionChips from './SuggestionChips'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import './chat.css'
import { useTranslations } from 'next-intl'

type ChatContainerProps = {
  messages: MessageType[]
  isLoading: boolean
  error: string | null
  onSendMessage: (message: string) => void
  onRetryMessage?: (messageId: string) => void
  suggestions?: string[]
  onSuggestionClick: (suggestion: string) => void
  onButtonClick?: (button: MessageButton) => void
  placeholder?: string
  theme?: 'light' | 'dark' | 'system'
  primaryColor?: string
  height?: number
  borderRadius?: 'none' | 'small' | 'medium' | 'large'
  showTimestamps?: boolean
  messagesEndRef: RefObject<HTMLDivElement | null>
  maxRetries?: number
  enableTypingIndicator?: boolean
  locale: string
}

const getBorderRadiusClass = (borderRadius: 'none' | 'small' | 'medium' | 'large') => {
  switch (borderRadius) {
    case 'none':
      return 'rounded-none'
    case 'small':
      return 'rounded-md'
    case 'medium':
      return 'rounded-lg'
    case 'large':
      return 'rounded-xl'
    default:
      return 'rounded-lg'
  }
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetryMessage,
  suggestions = [],
  onSuggestionClick,
  onButtonClick,
  placeholder: initialPlaceholder,
  theme = 'light',
  primaryColor = '#0070f3',
  height = 500,
  borderRadius = 'medium',
  showTimestamps = true,
  messagesEndRef,
  maxRetries = 3,
  enableTypingIndicator = true,
  locale,
}) => {
  const t = useTranslations('Chat')
  const placeholder = initialPlaceholder || t('inputPlaceholder')

  // Состояние для отслеживания попыток повторной отправки
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null)

  // Определяем классы для темы
  const themeClass = theme === 'dark' ? 'dark' : theme === 'system' ? '' : 'light'
  const borderRadiusClass = getBorderRadiusClass(borderRadius)

  // Обработчик клика по кнопке
  const handleButtonClick = (button: MessageButton) => {
    // Если есть внешний обработчик, используем его
    if (onButtonClick) {
      onButtonClick(button)
      return
    }

    // Стандартная обработка кнопок
    switch (button.action) {
      case 'reply':
        onSendMessage(button.value)
        break
      case 'link':
        if (button.url) {
          window.open(button.url, '_blank')
        }
        break
      case 'copy':
        navigator.clipboard.writeText(button.value)
        break
      case 'download':
        if (button.url) {
          const link = document.createElement('a')
          link.href = button.url
          link.download = button.text || 'download'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        break
      default:
        // Для пользовательских действий просто отправляем значение
        onSendMessage(button.value)
    }
  }

  // Обработчик клика по быстрому ответу
  const handleQuickReplyClick = (quickReply: MessageQuickReply) => {
    onSendMessage(quickReply.value)
  }

  // Обработчик повторной отправки сообщения
  const handleRetry = (messageId: string) => {
    if (onRetryMessage) {
      setRetryingMessageId(messageId)
      onRetryMessage(messageId).finally(() => {
        setRetryingMessageId(null)
      })
    }
  }

  // Проверяем, можно ли повторить отправку сообщения
  const canRetry = (message: MessageType) => {
    return message.isError && (!message.retryCount || message.retryCount < maxRetries)
  }

  return (
    <div
      className={cn('flex flex-col border border-border shadow-md', borderRadiusClass, themeClass)}
      style={
        {
          '--chat-primary-color': primaryColor,
          '--chat-primary-color-rgb': primaryColor.startsWith('#')
            ? `${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}`
            : '0, 112, 243',
          height: `${height}px`,
        } as React.CSSProperties
      }
    >
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 chat-messages">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            showTimestamp={showTimestamps}
            primaryColor={primaryColor}
            onButtonClick={handleButtonClick}
            onQuickReplyClick={handleQuickReplyClick}
            onRetry={canRetry(message) ? handleRetry : undefined}
            locale={locale}
          />
        ))}

        {/* Индикатор набора текста теперь добавляется как сообщение с isTyping=true */}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive p-3 rounded-md bg-destructive/10 animate-fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="flex-grow">{error}</p>
            {onRetryMessage && (
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => onRetryMessage('last')}
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('retryButton')}
              </Button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 py-3 border-t border-border/50">
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
            primaryColor={primaryColor}
          />
        </div>
      )}

      <div className="border-t border-border/50 px-4 py-3">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          placeholder={placeholder}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  )
}

export default ChatContainer
