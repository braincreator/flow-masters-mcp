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
                text: 'Этот чат поможет вам получить ответы на интересующие вопросы. Попробуйте задать вопрос о наших услугах или записаться на консультацию.',
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
                  text: 'Привет! Я интерактивный чат-бот. Могу ответить на ваши вопросы или помочь записаться на консультацию.',
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
        text: 'Хочу записаться на консультацию',
        description: 'Бронирование консультации',
      },
      {
        text: 'Какие у вас есть продукты?',
        description: 'Обзор продуктов',
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
    calendlySettings: {
      enableCalendly: true,
      calendlySource: 'collection' as const,
      calendlySettingId: '6807ebb606a018fcfa243010', // ID настроек в коллекции CalendlySettings
      // Кнопка под чатом не нужна, так как календарь открывается через кнопку в чате
      showCalendlyButton: false,
      buttonText: 'Забронировать консультацию',
      // Слова-триггеры для автоматического предложения бронирования
      bookingTriggerWords: [
        // Основные триггерные слова
        { word: 'записаться' },
        { word: 'запись' },
        { word: 'встреча' },
        { word: 'встретиться' },
        { word: 'бронирование' },
        { word: 'забронировать' },
        { word: 'консультация' },
        // Дополнительные триггерные слова
        { word: 'календарь' },
        { word: 'расписание' },
        { word: 'связаться' },
        { word: 'связь' },
        { word: 'звонок' },
        { word: 'позвонить' },
        { word: 'свободн' },
        { word: 'доступн' },
        { word: 'удобн' },
        { word: 'помощь' },
        { word: 'поддержк' },
        { word: 'совет' },
        { word: 'обсудить' },
        { word: 'общение' },
        { word: 'поговорить' },
      ],
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
                  text: 'Вы можете забронировать консультацию, нажав на кнопку с иконкой календаря ниже:',
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
