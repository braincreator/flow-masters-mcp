'use client'

import React, { useState, useEffect, useRef } from 'react'
import RichText from '@/components/RichText'
import { BaseBlock } from '../BaseBlock/Component'
import ChatContainer from '@/components/chat/ChatContainer'
import { Message } from '@/types/chat'
import { getRandomFallbackResponse } from '@/utilities/chat'
import { parseJsonSafely } from '@/utils/jsonFixer'
import { useTranslations } from 'next-intl'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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
  calendlySettings?: {
    enableCalendly?: boolean
    calendlySource?: 'collection' | 'manual'
    calendlySettingId?: string
    username?: string
    eventType?: string
    hideEventTypeDetails?: boolean
    hideGdprBanner?: boolean
    bookingTriggerWords?: { word: string }[]
    bookingResponseMessage?: Record<string, unknown>
    showCalendlyButton?: boolean
    buttonText?: string
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
  calendlySettings = {},
  promptSuggestions = [],
  fallbackResponses = [],
  appearance = {},
  advancedSettings = {},
  settings,
}) => {
  // Удаляем неиспользуемую переменную _router
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Состояние для пользовательской информации
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string }>({})

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
              logDebug('Получены данные интеграции:', data.doc)
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
                logError('Ошибка при обновлении даты использования интеграции:', err)
              }
            })
          } else {
            if (debugMode) {
              logError('Ошибка при загрузке данных вебхука:', await response.text())
            }
          }
        } catch (err) {
          if (debugMode) {
            logError('Ошибка при загрузке данных вебхука:', err)
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
              '# Поддержка Markdown\n\n- Можно использовать **жирный** и *курсив*\n- Списки и заголовки\n\n```js\nconst code = "formatted code block";\nlogDebug("Debug:", code);\n```',
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

  // Извлечение информации о пользователе из сообщений
  useEffect(() => {
    // Простая логика для извлечения имени и email из сообщений
    const nameMatch = messages.find(
      (m) =>
        m.sender === 'user' &&
        (m.content.toString().toLowerCase().includes('меня зовут') ||
          m.content.toString().toLowerCase().includes('моё имя')),
    )

    const emailMatch = messages.find(
      (m) => m.sender === 'user' && m.content.toString().includes('@'),
    )

    if (nameMatch) {
      // Простая эвристика для извлечения имени
      const content = nameMatch.content.toString().toLowerCase()
      const nameIndex = Math.max(content.indexOf('меня зовут'), content.indexOf('моё имя'))

      if (nameIndex >= 0) {
        const name = nameMatch.content
          .toString()
          .substring(nameIndex + 10)
          .trim()
        setUserInfo((prev) => ({ ...prev, name }))
      }
    }

    if (emailMatch) {
      // Простая эвристика для извлечения email
      const words = emailMatch.content.toString().split(' ')
      const email = words.find((w: string) => w.includes('@') && w.includes('.'))

      if (email) {
        setUserInfo((prev) => ({ ...prev, email }))
      }
    }
  }, [messages])

  // Проверка на наличие триггерных слов для бронирования
  /**
   * Улучшенная функция для проверки наличия триггерных слов бронирования в сообщении
   * Проверяет не только отдельные слова, но и фразы, а также контекст сообщения
   */
  const checkForBookingTriggers = (content: string): boolean => {
    if (!calendlySettings?.enableCalendly || !calendlySettings?.bookingTriggerWords?.length) {
      return false
    }

    // Приводим текст к нижнему регистру и удаляем знаки препинания для лучшего сопоставления
    const lowerContent = content.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')

    // Разбиваем на слова для проверки отдельных слов и словосочетаний
    const words = lowerContent.split(/\s+/)

    // 1. Проверка на точное совпадение триггерных слов
    const hasExactTriggerWord = calendlySettings.bookingTriggerWords.some((item) =>
      lowerContent.includes(item.word.toLowerCase()),
    )

    if (hasExactTriggerWord) return true

    // 2. Проверка на наличие слов в контексте бронирования/записи
    const bookingContextWords = ['хочу', 'можно', 'как', 'когда', 'где', 'время']
    const hasBookingContext = bookingContextWords.some((contextWord) =>
      lowerContent.includes(contextWord),
    )

    // Слова, связанные с временем (для определения контекста бронирования)
    const timeWords = [
      'время',
      'часы',
      'минуты',
      'дата',
      'день',
      'неделя',
      'месяц',
      'завтра',
      'сегодня',
    ]
    const hasTimeContext = timeWords.some((timeWord) => lowerContent.includes(timeWord))

    // 3. Проверка на наличие фраз, связанных с бронированием
    const bookingPhrases = [
      'когда можно',
      'как записаться',
      'хочу записаться',
      'нужна консультация',
      'нужна встреча',
      'хочу встретиться',
      'хочу проконсультироваться',
      'запишите меня',
      'свободное время',
      'свободная дата',
      'когда удобно',
      'ваше расписание',
      'ваша занятость',
      'когда вы свободны',
      'когда можем',
      'хочу поговорить',
      'нужен звонок',
      'нужна помощь',
      'нужна поддержка',
      'нужен совет',
    ]

    const hasBookingPhrase = bookingPhrases.some((phrase) => lowerContent.includes(phrase))

    // 4. Проверка на вопросы о времени/дате/расписании
    const isTimeQuestion =
      (lowerContent.includes('когда') ||
        lowerContent.includes('во сколько') ||
        lowerContent.includes('в какое время')) &&
      (lowerContent.includes('можно') ||
        lowerContent.includes('удобно') ||
        lowerContent.includes('доступно'))

    // 5. Проверка на наличие слов из триггерного списка в контексте бронирования
    const hasTriggerWordInContext = calendlySettings.bookingTriggerWords.some((item) => {
      const triggerWord = item.word.toLowerCase()
      // Проверяем, есть ли триггерное слово в массиве слов
      return words.some((word) => {
        // Проверяем на частичное совпадение (например, "запис" будет соответствовать "записаться", "записи" и т.д.)
        return word.includes(triggerWord) || triggerWord.includes(word)
      })
    })

    // Возвращаем true, если выполняется хотя бы одно из условий:
    // 1. Есть фраза, связанная с бронированием
    // 2. Есть вопрос о времени/дате
    // 3. Есть триггерное слово в контексте бронирования или времени
    return (
      hasBookingPhrase ||
      isTimeQuestion ||
      (hasTriggerWordInContext && (hasBookingContext || hasTimeContext))
    )
  }

  // Состояние для хранения загруженных настроек Calendly из коллекции
  const [collectionCalendlySettings, setCollectionCalendlySettings] = useState<{
    username?: string
    eventType?: string
    hideEventTypeDetails?: boolean
    hideGdprBanner?: boolean
    isLoading: boolean
    error?: string
  }>({ isLoading: false })

  // Загрузка настроек Calendly из коллекции при инициализации компонента
  useEffect(() => {
    const loadCalendlySettings = async () => {
      if (
        calendlySettings?.enableCalendly &&
        calendlySettings.calendlySource === 'collection' &&
        calendlySettings.calendlySettingId
      ) {
        try {
          const response = await fetch(
            `/api/calendly-settings/${calendlySettings.calendlySettingId}`,
          )

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
              `Ошибка при загрузке настроек Calendly: ${response.status} ${errorText}`,
            )
          }

          const data = await response.json()

          // Обрабатываем ответ от стандартного API Payload
          if (data) {
            setCollectionCalendlySettings({
              username: data.username,
              eventType: data.eventType,
              hideEventTypeDetails: data.hideEventTypeDetails,
              hideGdprBanner: data.hideGdprBanner,
              isLoading: false,
              error: undefined,
            })
          } else {
            throw new Error('Не удалось получить настройки Calendly')
          }
        } catch (error) {
          logError('Ошибка при загрузке настроек Calendly:', error)
          setCollectionCalendlySettings({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка',
          })
        }
      }
    }

    // Загружаем настройки Calendly при инициализации компонента
    if (calendlySettings?.enableCalendly) {
      setCollectionCalendlySettings((prev) => ({ ...prev, isLoading: true }))
      loadCalendlySettings()
    }
  }, [
    // Загружаем настройки только при инициализации или изменении настроек
    calendlySettings?.enableCalendly,
    calendlySettings?.calendlySource,
    calendlySettings?.calendlySettingId,
  ])

  // Получение настроек Calendly
  const _getCalendlySettings = () => {
    if (!calendlySettings?.enableCalendly) {
      return null
    }

    if (calendlySettings.calendlySource === 'collection' && calendlySettings.calendlySettingId) {
      // Возвращаем загруженные настройки из коллекции
      if (collectionCalendlySettings.username && collectionCalendlySettings.eventType) {
        return {
          username: collectionCalendlySettings.username,
          eventType: collectionCalendlySettings.eventType,
          hideEventTypeDetails: collectionCalendlySettings.hideEventTypeDetails,
          hideGdprBanner: collectionCalendlySettings.hideGdprBanner,
        }
      }
      return null
    }

    if (calendlySettings.calendlySource === 'manual') {
      return {
        username: calendlySettings.username,
        eventType: calendlySettings.eventType,
        hideEventTypeDetails: calendlySettings.hideEventTypeDetails,
        hideGdprBanner: calendlySettings.hideGdprBanner,
      }
    }

    return null
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

    // Проверяем, есть ли в сообщении триггерные слова для бронирования
    const isBookingRequest = checkForBookingTriggers(content)

    if (isBookingRequest && calendlySettings?.enableCalendly) {
      // Проверяем наличие настроек Calendly
      // Для простоты не проверяем результат, так как отображение календаря происходит в другом месте
      _getCalendlySettings()

      // Добавляем сообщение с предложением забронировать встречу
      const bookingMessage: Message = {
        id: `bot-booking-${Date.now()}`,
        content:
          calendlySettings.bookingResponseMessage ||
          'Вы можете забронировать встречу, выбрав удобное время в календаре ниже:',
        sender: 'bot',
        timestamp: new Date(),
        senderName: botName,
        avatar: botAvatar,
        buttons: [
          {
            id: `calendly-btn-${Date.now()}`,
            text: useTranslations('Chat')('showCalendarButton'),
            value: 'показать календарь',
            style: 'primary',
          },
        ],
      }

      // Получаем настройки Calendly
      const calendlyConfig = _getCalendlySettings()

      // Если настроек нет, показываем сообщение об ошибке
      if (!calendlyConfig) {
        const errorMessage: Message = {
          id: `bot-error-${Date.now()}`,
          content: useTranslations('Chat')('serverError'),
          sender: 'bot',
          timestamp: new Date(),
          senderName: botName,
          avatar: botAvatar,
          isError: true,
        }
        setMessages((prev) => [...prev, errorMessage])
      }

      // Добавляем сообщение с предложением забронировать встречу
      setMessages((prev) => [...prev, bookingMessage])

      setIsLoading(false)
      return
    }

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
          logDebug('Используется тестовый режим без отправки запросов на сервер')
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
          logDebug('Отправляем запрос с параметрами:', {
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
          logError(`Ошибка API: ${response.status}`, errorText)

          // Проверяем, есть ли детали ошибки в JSON формате
          let errorDetails: { error?: string } = {}
          try {
            errorDetails = JSON.parse(errorText)
          } catch (_e) {
            // Не JSON, используем как есть
          }

          throw new Error(`Ошибка: ${response.status} - ${errorDetails.error || errorText}`)
        }

        // Получаем ответ и проверяем его на валидность
        const rawData = await response.text()

        // Используем улучшенный парсер JSON
        type ChatResponseData = {
          status?: string
          response?: string
          type?: string
          media?: any
          card?: any
          buttons?: any[]
          quickReplies?: any[]
          metadata?: Record<string, any>
        }

        const parsedData = parseJsonSafely<ChatResponseData>(rawData, {
          status: 'success',
          response: 'Не удалось получить ответ от сервера. Пожалуйста, попробуйте еще раз.',
          type: 'text',
        })

        if (debugMode && parsedData) {
          logDebug('Полученный ответ:', parsedData)
        }

        data = parsedData
      }

      // Удаляем индикатор набора текста
      setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicatorId))

      // Добавляем ответ бота в чат
      // Проверяем, что data не null
      if (!data) {
        data = {
          response: 'Не удалось получить ответ от сервера',
          type: 'text',
        }
      }

      // Приводим тип к строке, чтобы соответствовал MessageType
      const messageType = (data.type as string) || 'text'

      // Используем приведение типов для решения проблем с TypeScript
      const responseData = data as unknown as {
        response: string
        type?: string
        media?: any
        card?: any
        buttons?: any[]
        quickReplies?: any[]
        metadata?: Record<string, any>
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: responseData.response || 'Нет ответа',
        sender: 'bot',
        timestamp: new Date(),
        senderName: botName,
        avatar: botAvatar,
        type: messageType as any, // Используем any для обхода проблем с типами
        media: responseData.media,
        card: responseData.card,
        buttons: responseData.buttons,
        quickReplies: responseData.quickReplies,
        metadata: responseData.metadata,
      }

      setMessages((prev) => {
        // Ограничиваем количество сообщений
        const updatedMessages = [...prev, botMessage]
        return updatedMessages.slice(-maxMessages)
      })
    } catch (err) {
      if (debugMode) {
        logError('Ошибка при отправке сообщения:', err)
      }

      // Удаляем индикатор набора текста
      setMessages((prev) => prev.filter((msg) => msg.id !== typingIndicatorId))

      const t = useTranslations('Chat')
      setError(t('errorMessage'))

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
            locale={typeof window !== 'undefined' ? window.navigator.language : 'en'}
            onButtonClick={(button) => {
              // Если нажата кнопка показа календаря
              if (button.value === 'показать календарь') {
                const calendlyConfig = _getCalendlySettings()
                if (calendlyConfig) {
                  // Создаем URL для Calendly
                  const username = calendlyConfig.username || ''
                  const eventType = calendlyConfig.eventType || ''

                  if (username && eventType) {
                    // Добавляем сообщение с компонентом оплаты и бронирования
                    // Используем динамический импорт компонента ServiceBookingInChat
                    import('@/components/chat/ServiceBookingInChat')
                      .then(({ ServiceBookingInChat }) => {
                        // Создаем сообщение с компонентом бронирования
                        const bookingMessage: Message = {
                          id: `calendly-booking-${Date.now()}`,
                          content: '',
                          sender: 'bot',
                          timestamp: new Date(),
                          senderName: botName,
                          avatar: botAvatar,
                          type: 'component',
                          component: (
                            <ServiceBookingInChat
                              serviceType="consultation"
                              calendlyUsername={username}
                              calendlyEventType={eventType}
                              hideEventTypeDetails={calendlyConfig.hideEventTypeDetails}
                              hideGdprBanner={calendlyConfig.hideGdprBanner}
                              prefill={{
                                name: userInfo.name,
                                email: userInfo.email,
                              }}
                              className="w-full"
                            />
                          ),
                        }

                        setMessages((prev) => [...prev, bookingMessage])
                      })
                      .catch((error) => {
                        logError('Failed to load ConsultingBookingFlow component:', error)

                        // Если не удалось загрузить компонент, показываем ошибку
                        const errorMessage: Message = {
                          id: `bot-error-${Date.now()}`,
                          content:
                            'Не удалось загрузить компонент бронирования. Пожалуйста, свяжитесь с нами другим способом.',
                          sender: 'bot',
                          timestamp: new Date(),
                          senderName: botName,
                          avatar: botAvatar,
                          isError: true,
                        }
                        setMessages((prev) => [...prev, errorMessage])
                      })
                  } else {
                    // Если нет необходимых параметров
                    const errorMessage: Message = {
                      id: `calendly-error-${Date.now()}`,
                      content: 'Не удалось открыть календарь: недостаточно данных в настройках.',
                      sender: 'bot',
                      timestamp: new Date(),
                      senderName: botName,
                      avatar: botAvatar,
                      isError: true,
                    }
                    setMessages((prev) => [...prev, errorMessage])
                  }
                } else {
                  // Если нет настроек
                  const errorMessage: Message = {
                    id: `calendly-error-${Date.now()}`,
                    content: 'Не удалось открыть календарь: настройки недоступны.',
                    sender: 'bot',
                    timestamp: new Date(),
                    senderName: botName,
                    avatar: botAvatar,
                    isError: true,
                  }
                  setMessages((prev) => [...prev, errorMessage])
                }
              } else {
                // Для других кнопок отправляем сообщение
                sendMessage(button.value)
              }
            }}
          />

          {/* Кнопка под чатом удалена, теперь календарь открывается только через кнопку в чате */}
        </div>
      </div>
    </BaseBlock>
  )
}

export default ChatBlock
