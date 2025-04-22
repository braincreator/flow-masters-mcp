'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import RichText from '@/components/RichText'
import { BaseBlock } from '../BaseBlock/Component'
import ChatContainer from '@/components/chat/ChatContainer'
import { Message } from '@/types/chat'
import { getRandomFallbackResponse } from '@/utilities/chat'

export type ChatProps = {
  heading?: string
  subheading?: string
  description?: any
  webhookSettings: {
    webhookSource?: 'collection' | 'manual'
    webhook?: string
    webhookUrl?: string
    webhookSecret?: string
    timeout?: number
  }
  chatSettings: {
    initialMessage?: Record<string, unknown>
    placeholderText?: string
    botName?: string
    botAvatar?: any
    userAvatar?: any
  }
  promptSuggestions?: {
    text: string
    description?: string
  }[]
  fallbackResponses?: {
    response: Record<string, unknown>
  }[]
  appearance?: {
    theme?: 'light' | 'dark' | 'system'
    primaryColor?: string
    chatHeight?: number
    maxWidth?: number
    borderRadius?: 'none' | 'small' | 'medium' | 'large'
    showTimestamps?: boolean
  }
  advancedSettings?: {
    enableHistory?: boolean
    maxMessages?: number
    sendMetadata?: boolean
    debugMode?: boolean
    testMode?: boolean
  }
  blockType: 'chat'
  blockName?: string
  settings?: Record<string, unknown>
}

export const ChatBlock: React.FC<ChatProps> = ({
  heading,
  subheading,
  description,
  webhookSettings,
  chatSettings,
  promptSuggestions = [],
  fallbackResponses = [],
  appearance = {},
  advancedSettings = {},
  settings,
}) => {
  const _router = useRouter() // Unused but kept for future use
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Настройки по умолчанию
  const {
    theme = 'light',
    primaryColor = '#0070f3',
    chatHeight = 500,
    maxWidth = 800,
    borderRadius = 'medium',
    showTimestamps = true,
  } = appearance

  // Получаем настройки из пропсов
  const defaultTestMode = advancedSettings?.testMode || false
  const {
    enableHistory = true,
    maxMessages = 50,
    sendMetadata = true,
    debugMode = false,
  } = advancedSettings

  // Состояние для тестового режима
  const [testMode, _setTestMode] = useState(defaultTestMode)

  const {
    webhookSource = 'collection',
    webhook,
    webhookUrl,
    webhookSecret = '',
    timeout: _timeout = 30000,
  } = webhookSettings

  // Состояние для хранения данных вебхука из коллекции
  const [webhookData, setWebhookData] = useState<{
    webhookUrl?: string
    webhookSecret?: string
    timeout?: number
  }>({})

  // Загружаем данные вебхука из коллекции, если выбран этот источник
  useEffect(() => {
    const loadWebhookData = async () => {
      if (webhookSource === 'collection' && webhook) {
        try {
          // Получаем данные интеграции из API
          const response = await fetch(`/api/v1/integrations/${webhook}`)
          if (response.ok) {
            const data = await response.json()
            if (debugMode) {
              console.log('Получены данные интеграции:', data.doc)
            }
            setWebhookData({
              webhookUrl: data.doc.webhookUrl,
              webhookSecret: data.doc.apiKey, // Используем apiKey как webhookSecret
              timeout: 30000, // Используем стандартный таймаут
            })

            // Обновляем дату последнего использования интеграции
            fetch(`/api/v1/integrations/${webhook}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lastSync: new Date().toISOString(),
                lastSyncStatus: 'success',
              }),
            }).catch((err) => {
              if (debugMode) {
                console.error('Ошибка при обновлении даты использования интеграции:', err)
              }
            })
          } else {
            if (debugMode) {
              console.error('Ошибка при загрузке данных вебхука:', await response.text())
            }
          }
        } catch (err) {
          if (debugMode) {
            console.error('Ошибка при загрузке данных вебхука:', err)
          }
        }
      }
    }

    loadWebhookData()
  }, [webhook, webhookSource, debugMode])

  const {
    initialMessage,
    placeholderText = 'Введите ваше сообщение...',
    botName = 'Ассистент',
    botAvatar,
    userAvatar,
  } = chatSettings

  // Инициализация чата с начальным сообщением
  useEffect(() => {
    if (initialMessage) {
      setMessages([
        {
          id: 'initial',
          content: initialMessage,
          sender: 'bot',
          timestamp: new Date(),
          senderName: botName,
          avatar: botAvatar,
        },
      ])
    }
  }, [initialMessage, botName, botAvatar])

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Генерируем тестовый ответ для режима тестирования
  const generateTestResponse = (
    userMessage: string,
  ): Promise<{
    response: string
    type?: string
    buttons?: Array<{
      id: string
      text: string
      value: string
      action?: string
      url?: string
      style?: string
    }>
    quickReplies?: Array<{
      id: string
      text: string
      value: string
    }>
  }> => {
    return new Promise((resolve) => {
      // Имитируем задержку ответа
      setTimeout(() => {
        // Простые ответы на разные вопросы
        if (
          userMessage.toLowerCase().includes('привет') ||
          userMessage.toLowerCase().includes('hello')
        ) {
          resolve({
            response: 'Привет! Я тестовый бот. Чем могу помочь?',
            type: 'text',
          })
        } else if (
          userMessage.toLowerCase().includes('маркдаун') ||
          userMessage.toLowerCase().includes('markdown')
        ) {
          resolve({
            response:
              '# Поддержка Markdown\n\n- Можно использовать **жирный** и *курсив*\n- Списки и заголовки\n\n```js\nconst code = "formatted code block";\nconsole.log(code);\n```',
            type: 'markdown',
          })
        } else if (
          userMessage.toLowerCase().includes('кнопк') ||
          userMessage.toLowerCase().includes('button')
        ) {
          resolve({
            response: 'Вот несколько кнопок для тестирования:',
            type: 'text',
            buttons: [
              {
                id: 'btn1',
                text: 'Открыть сайт',
                value: 'открыть сайт',
                action: 'link',
                url: 'https://flow-masters.ru',
                style: 'primary',
              },
              {
                id: 'btn2',
                text: 'Ответить "Спасибо"',
                value: 'Спасибо',
                action: 'reply',
                style: 'secondary',
              },
            ],
          })
        } else {
          resolve({
            response: `Я получил ваше сообщение: "${userMessage}". Это тестовый режим без подключения к серверу.`,
            type: 'text',
            quickReplies: [
              {
                id: 'qr1',
                text: 'Показать Markdown',
                value: 'покажи пример маркдаун',
              },
              {
                id: 'qr2',
                text: 'Показать кнопки',
                value: 'покажи кнопки',
              },
            ],
          })
        }
      }, 1000) // Задержка в 1 секунду
    })
  }

  // Отправка сообщения
  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Добавляем сообщение пользователя в чат
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content,
      sender: 'user',
      timestamp: new Date(),
      senderName: 'Вы',
      avatar: userAvatar,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Добавляем индикатор набора текста
    const typingIndicatorId = `typing-${Date.now()}`
    const typingMessage: Message = {
      id: typingIndicatorId,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      senderName: botName,
      avatar: botAvatar,
      isTyping: true,
    }

    setMessages((prev) => [...prev, typingMessage])

    try {
      let data

      // Если включен тестовый режим, используем локальные ответы
      if (testMode) {
        if (debugMode) {
          console.log('Используется тестовый режим без отправки запросов на сервер')
        }
        data = await generateTestResponse(content)
      } else {
        // Собираем метаданные, если включено
        const metadata = sendMetadata
          ? {
              url: window.location.href,
              userAgent: navigator.userAgent,
              language: navigator.language,
              timestamp: new Date().toISOString(),
            }
          : {}

        // Отправляем запрос на сервер
        // Отладочный вывод
        if (debugMode) {
          console.log('Отправляем запрос с параметрами:', {
            webhookSource,
            webhookUrl,
            webhookData,
            finalWebhookUrl: webhookSource === 'collection' ? webhookData.webhookUrl : webhookUrl,
          })
        }

        // Проверяем, что URL вебхука существует
        const finalWebhookUrl = webhookSource === 'collection' ? webhookData.webhookUrl : webhookUrl
        const finalWebhookSecret =
          webhookSource === 'collection' ? webhookData.webhookSecret : webhookSecret

        if (!finalWebhookUrl) {
          throw new Error('Не указан URL вебхука. Проверьте настройки блока.')
        }

        const response = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            webhookUrl: finalWebhookUrl,
            webhookSecret: finalWebhookSecret,
            metadata,
            history: enableHistory ? messages : [],
          }),
        })

        if (!response.ok) {
          // Получаем детали ошибки
          const errorText = await response.text().catch(() => 'No error details available')
          console.error(`Ошибка API: ${response.status}`, errorText)

          // Проверяем, есть ли детали ошибки в JSON формате
          let errorDetails: { error?: string } = {}
          try {
            errorDetails = JSON.parse(errorText)
          } catch (_e) {
            // Не JSON, используем как есть
          }

          throw new Error(`Ошибка: ${response.status} - ${errorDetails.error || errorText}`)
        }

        data = await response.json()
      }

      // Удаляем индикатор набора текста
      setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicatorId))

      // Добавляем ответ бота в чат
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
        senderName: botName,
        avatar: botAvatar,
        type: data.type || 'text',
        media: data.media,
        card: data.card,
        buttons: data.buttons,
        quickReplies: data.quickReplies,
        metadata: data.metadata,
      }

      setMessages((prev) => {
        // Ограничиваем количество сообщений
        const updatedMessages = [...prev, botMessage]
        return updatedMessages.slice(-maxMessages)
      })
    } catch (err) {
      if (debugMode) {
        console.error('Ошибка при отправке сообщения:', err)
      }

      // Удаляем индикатор набора текста
      setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicatorId))

      setError('Произошла ошибка при обработке запроса')

      // Используем резервный ответ, если есть
      if (fallbackResponses.length > 0) {
        const fallbackResponse = getRandomFallbackResponse(fallbackResponses)

        const errorMessage: Message = {
          id: `bot-error-${Date.now()}`,
          content: fallbackResponse,
          sender: 'bot',
          timestamp: new Date(),
          senderName: botName,
          avatar: botAvatar,
          isError: true,
        }

        setMessages((prev) => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Обработчик клика по подсказке
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  return (
    <BaseBlock settings={settings}>
      <div className="container mx-auto px-4">
        <div className="mx-auto" style={{ maxWidth: `${maxWidth}px` }}>
          {heading && <h2 className="text-3xl font-bold mb-2 text-center">{heading}</h2>}

          {subheading && (
            <p className="text-xl mb-4 text-center text-muted-foreground">{subheading}</p>
          )}

          {description && (
            <div className="mb-6">
              <RichText data={description} />
            </div>
          )}

          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            suggestions={promptSuggestions?.map((s) => s.text) || []}
            onSuggestionClick={handleSuggestionClick}
            placeholder={placeholderText}
            theme={theme}
            primaryColor={primaryColor}
            height={chatHeight}
            borderRadius={borderRadius}
            showTimestamps={showTimestamps}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </BaseBlock>
  )
}

export default ChatBlock
