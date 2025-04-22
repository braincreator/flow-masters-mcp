import React from 'react'
import { Metadata } from 'next'
import { ChatBlock } from '@/blocks/Chat/Component'

export const metadata: Metadata = {
  title: 'Интерактивный чат | Flow Masters',
  description: 'Интерактивный чат для общения и получения информации',
}

export default function ChatPage() {
  // Тестовые данные для демонстрации
  const chatData = {
    heading: 'Интерактивный чат',
    subheading: 'Задайте вопрос и получите ответ',
    description: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Этот чат поможет вам получить ответы на интересующие вопросы. Попробуйте задать вопрос о наших услугах или продуктах.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    webhookSettings: {
      // Явно указываем источник настроек
      webhookSource: 'manual' as const,
      // Используем тот же URL вебхука, но с новым именем поля
      webhookUrl: 'https://n8n.flow-masters.ru/webhook/c352d717-c827-49b9-9bfa-621a4655ab2e',
      webhookSecret: 'demo-secret',
      timeout: 30000,
    },
    chatSettings: {
      initialMessage: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Привет! Я интерактивный чат-бот. Чем могу помочь?',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      placeholderText: 'Введите ваше сообщение...',
      botName: 'Ассистент',
    },
    promptSuggestions: [
      {
        text: 'Расскажи о ваших услугах',
        description: 'Информация об услугах компании',
      },
      {
        text: 'Как с вами связаться?',
        description: 'Контактная информация',
      },
      {
        text: 'Какие у вас есть продукты?',
        description: 'Обзор продуктов',
      },
      {
        text: 'Нужна консультация',
        description: 'Запрос на консультацию',
      },
    ],
    fallbackResponses: [
      {
        response: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Извините, в данный момент я не могу получить ответ от сервера. Попробуйте повторить запрос позже или свяжитесь с нами для получения дополнительной информации.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      },
      {
        response: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Похоже, возникла техническая проблема. Наша команда уже работает над её устранением. Пожалуйста, попробуйте снова через несколько минут.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      },
    ],
    appearance: {
      theme: 'light' as const,
      primaryColor: '#0070f3',
      chatHeight: 500,
      maxWidth: 800,
      borderRadius: 'medium' as const,
      showTimestamps: true,
    },
    advancedSettings: {
      enableHistory: true,
      maxMessages: 50,
      sendMetadata: true,
      debugMode: true,
      testMode: false,
    },
    blockType: 'chat' as const,
  }

  return (
    <div className="container mx-auto py-10">
      <ChatBlock {...chatData} />
    </div>
  )
}
