import React from 'react'
import { Metadata } from 'next'
import { ChatBlock } from '@/blocks/Chat/Component'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'

interface Props {
  params: {
    lang: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await Promise.resolve(params)
  const t = await getTranslations({ locale: lang, namespace: 'chat' })

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function ChatPage({ params }: Props) {
  const { lang } = await Promise.resolve(params)
  setRequestLocale(lang)

  // Получаем переводы
  const t = await getTranslations({ locale: lang, namespace: 'chat' })
  // Тестовые данные для демонстрации
  const chatData = {
    heading: t('heading'),
    subheading: t('subheading'),
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
                text: t('description'),
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
                  text: t('initialMessage'),
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
      placeholderText: t('placeholderText'),
      botName: t('botName'),
    },
    promptSuggestions: [
      {
        text: t('promptSuggestions.services.text'),
        description: t('promptSuggestions.services.description'),
      },
      {
        text: t('promptSuggestions.contact.text'),
        description: t('promptSuggestions.contact.description'),
      },
      {
        text: t('promptSuggestions.booking.text'),
        description: t('promptSuggestions.booking.description'),
      },
      {
        text: t('promptSuggestions.products.text'),
        description: t('promptSuggestions.products.description'),
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
                    text: t('fallbackResponses.serverError'),
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
                    text: t('fallbackResponses.technicalIssue'),
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
    calendlySettings: {
      enableCalendly: true,
      calendlySource: 'collection' as const,
      calendlySettingId: '6807ebb606a018fcfa243010', // ID настроек в коллекции CalendlySettings
      // Кнопка под чатом не нужна, так как календарь открывается через кнопку в чате
      showCalendlyButton: false,
      buttonText: t('calendlySettings.buttonText'),
      // Слова-триггеры для автоматического предложения бронирования
      bookingTriggerWords: t('calendlySettings.bookingTriggerWords')
        .split(',')
        .map((word) => ({ word: word.trim() })),
      // Сообщение при запросе на бронирование
      bookingResponseMessage: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: t('calendlySettings.bookingResponseMessage'),
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
