import React from 'react'
import { Metadata } from 'next'
import { N8nChatDemoBlock } from '@/blocks/N8nChatDemo/Component'

export const metadata: Metadata = {
  title: 'N8n Chat Demo | Flow Masters',
  description: 'Интерактивная демонстрация возможностей автоматизации с использованием n8n',
}

export default function N8nChatDemoPage() {
  // Тестовые данные для демонстрации
  const demoData = {
    heading: 'Демонстрация интеграции с n8n',
    subheading: 'Задайте вопрос о возможностях автоматизации',
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
                text: 'Этот чат интегрирован с n8n для демонстрации возможностей автоматизации. Попробуйте задать вопрос о том, как автоматизировать бизнес-процессы или интегрировать различные сервисы.',
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
      // Замените на реальный URL вебхука n8n
      n8nWebhookUrl: 'https://n8n.flow-masters.ru/webhook/c352d717-c827-49b9-9bfa-621a4655ab2e',
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
                  text: 'Привет! Я демонстрационный чат-бот, интегрированный с n8n. Задайте мне вопрос о возможностях автоматизации.',
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
      placeholderText: 'Задайте вопрос об автоматизации...',
      botName: 'Автоматизация Бот',
    },
    promptSuggestions: [
      {
        text: 'Что такое n8n?',
        description: 'Узнайте больше о платформе n8n',
      },
      {
        text: 'Как интегрировать CRM с почтой?',
        description: 'Примеры интеграции CRM-систем',
      },
      {
        text: 'Какие задачи можно автоматизировать?',
        description: 'Обзор возможностей автоматизации',
      },
      {
        text: 'Как настроить вебхуки?',
        description: 'Информация о настройке вебхуков',
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
    },
    blockType: 'n8nChatDemo' as const,
  }

  return (
    <div className="container mx-auto py-10">
      <N8nChatDemoBlock {...demoData} />
    </div>
  )
}
