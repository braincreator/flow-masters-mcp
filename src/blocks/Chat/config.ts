import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Chat: Block = {
  slug: 'chat',
  interfaceName: 'ChatBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока чата',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Краткое описание или приветствие',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Подробное описание блока чата',
      },
    },
    {
      name: 'webhookSettings',
      type: 'group',
      label: 'Настройки вебхука',
      fields: [
        {
          name: 'webhookSource',
          type: 'radio',
          label: 'Источник настроек вебхука',
          defaultValue: 'collection',
          options: [
            {
              label: 'Выбрать из коллекции',
              value: 'collection',
            },
            {
              label: 'Указать вручную',
              value: 'manual',
            },
          ],
          admin: {
            description: 'Выберите способ настройки вебхука',
          },
        },
        {
          name: 'webhook',
          type: 'relationship',
          relationTo: 'integrations',
          label: 'Вебхук',
          required: true,
          admin: {
            description: 'Выберите настроенный вебхук из коллекции интеграций',
            condition: (_, siblingData) => siblingData?.webhookSource === 'collection',
            where: {
              type: { equals: 'webhook' },
              status: { equals: 'active' },
            },
          },
        },
        {
          name: 'webhookUrl',
          type: 'text',
          label: 'URL вебхука',
          required: true,
          admin: {
            description: 'URL вебхука для отправки сообщений',
            condition: (_, siblingData) => siblingData?.webhookSource === 'manual',
          },
        },
        {
          name: 'webhookSecret',
          type: 'text',
          label: 'Секретный ключ вебхука',
          admin: {
            description: 'Секретный ключ для аутентификации запросов (опционально)',
            condition: (_, siblingData) => siblingData?.webhookSource === 'manual',
          },
        },
        {
          name: 'timeout',
          type: 'number',
          label: 'Таймаут ответа (мс)',
          defaultValue: 30000,
          admin: {
            description: 'Максимальное время ожидания ответа в миллисекундах',
            condition: (_, siblingData) => siblingData?.webhookSource === 'manual',
          },
        },
      ],
    },
    {
      name: 'chatSettings',
      type: 'group',
      label: 'Настройки чата',
      fields: [
        {
          name: 'initialMessage',
          type: 'richText',
          label: 'Начальное сообщение',
          editor: lexicalEditor({}),
          defaultValue: [
            {
              children: [
                {
                  text: 'Привет! Я чат-бот. Чем могу помочь?',
                },
              ],
            },
          ],
        },
        {
          name: 'placeholderText',
          type: 'text',
          label: 'Текст плейсхолдера в поле ввода',
          defaultValue: 'Введите ваше сообщение...',
        },
        {
          name: 'botName',
          type: 'text',
          label: 'Имя бота',
          defaultValue: 'Ассистент',
        },
        {
          name: 'botAvatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Аватар бота',
        },
        {
          name: 'userAvatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Аватар пользователя (опционально)',
        },
      ],
    },
    {
      name: 'promptSuggestions',
      type: 'array',
      label: 'Подсказки для запросов',
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Текст подсказки',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Описание (опционально)',
          admin: {
            description: 'Дополнительная информация о подсказке (отображается при наведении)',
          },
        },
      ],
    },
    {
      name: 'fallbackResponses',
      type: 'array',
      label: 'Резервные ответы',
      admin: {
        description:
          'Ответы, которые будут использованы, если сервер не ответит или произойдет ошибка',
      },
      fields: [
        {
          name: 'response',
          type: 'richText',
          label: 'Текст ответа',
          editor: lexicalEditor({}),
          required: true,
        },
      ],
    },
    {
      name: 'appearance',
      type: 'group',
      label: 'Внешний вид',
      fields: [
        {
          name: 'theme',
          type: 'select',
          label: 'Тема оформления',
          defaultValue: 'light',
          options: [
            { label: 'Светлая', value: 'light' },
            { label: 'Темная', value: 'dark' },
            { label: 'Системная', value: 'system' },
          ],
        },
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Основной цвет (HEX)',
          defaultValue: '#0070f3',
        },
        {
          name: 'chatHeight',
          type: 'number',
          label: 'Высота чата (px)',
          defaultValue: 500,
        },
        {
          name: 'maxWidth',
          type: 'number',
          label: 'Максимальная ширина (px)',
          defaultValue: 800,
        },
        {
          name: 'borderRadius',
          type: 'select',
          label: 'Скругление углов',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Малое', value: 'small' },
            { label: 'Среднее', value: 'medium' },
            { label: 'Большое', value: 'large' },
          ],
        },
        {
          name: 'showTimestamps',
          type: 'checkbox',
          label: 'Показывать время сообщений',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'calendlySettings',
      type: 'group',
      label: 'Настройки Calendly',
      fields: [
        {
          name: 'enableCalendly',
          type: 'checkbox',
          label: 'Включить бронирование встреч',
          defaultValue: false,
          admin: {
            description: 'Показывать виджет Calendly в чате при запросе на бронирование',
          },
        },
        {
          name: 'calendlySource',
          type: 'radio',
          label: 'Источник настроек Calendly',
          defaultValue: 'collection',
          options: [
            {
              label: 'Выбрать из коллекции',
              value: 'collection',
            },
            {
              label: 'Указать вручную',
              value: 'manual',
            },
          ],
          admin: {
            description: 'Выберите способ настройки Calendly',
            condition: (_, siblingData) => siblingData?.enableCalendly === true,
          },
        },
        {
          name: 'calendlySettingId',
          type: 'relationship',
          relationTo: 'calendly-settings',
          label: 'Настройки Calendly',
          admin: {
            description: 'Выберите настройки Calendly из коллекции',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.calendlySource === 'collection',
          },
        },
        {
          name: 'username',
          type: 'text',
          label: 'Calendly Username',
          admin: {
            description: 'Ваш username в Calendly (часть URL после calendly.com/)',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.calendlySource === 'manual',
          },
        },
        {
          name: 'eventType',
          type: 'text',
          label: 'Тип события',
          admin: {
            description: 'Slug типа события в Calendly (часть URL после username)',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.calendlySource === 'manual',
          },
        },
        {
          name: 'hideEventTypeDetails',
          type: 'checkbox',
          label: 'Скрыть детали события',
          defaultValue: true,
          admin: {
            description: 'Скрыть детали типа события в виджете Calendly',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.calendlySource === 'manual',
          },
        },
        {
          name: 'hideGdprBanner',
          type: 'checkbox',
          label: 'Скрыть баннер GDPR',
          defaultValue: true,
          admin: {
            description: 'Скрыть баннер GDPR в виджете Calendly',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.calendlySource === 'manual',
          },
        },
        {
          name: 'bookingTriggerWords',
          type: 'array',
          label: 'Триггерные слова для бронирования',
          admin: {
            description:
              'Слова, при наличии которых в сообщении пользователя будет предложено бронирование',
            condition: (_, siblingData) => siblingData?.enableCalendly === true,
          },
          defaultValue: [
            { word: 'записаться' },
            { word: 'запись' },
            { word: 'встреча' },
            { word: 'встретиться' },
            { word: 'бронирование' },
            { word: 'забронировать' },
            { word: 'консультация' },
          ],
          fields: [
            {
              name: 'word',
              type: 'text',
              label: 'Слово',
              required: true,
            },
          ],
        },
        {
          name: 'bookingResponseMessage',
          type: 'richText',
          label: 'Сообщение при предложении бронирования',
          editor: lexicalEditor({}),
          defaultValue: [
            {
              children: [
                {
                  text: 'Вы можете забронировать встречу, выбрав удобное время в календаре ниже:',
                },
              ],
            },
          ],
          admin: {
            description: 'Сообщение, которое будет показано перед виджетом Calendly',
            condition: (_, siblingData) => siblingData?.enableCalendly === true,
          },
        },
        {
          name: 'showCalendlyButton',
          type: 'checkbox',
          label: 'Показывать кнопку бронирования',
          defaultValue: false,
          admin: {
            description: 'Показывать кнопку для отправки запроса на бронирование',
            condition: (_, siblingData) => siblingData?.enableCalendly === true,
          },
        },
        {
          name: 'buttonText',
          type: 'text',
          label: 'Текст кнопки',
          defaultValue: 'Забронировать встречу',
          admin: {
            description: 'Текст, который будет отображаться на кнопке бронирования',
            condition: (_, siblingData) =>
              siblingData?.enableCalendly === true && siblingData?.showCalendlyButton === true,
          },
        },
      ],
    },
    {
      name: 'advancedSettings',
      type: 'group',
      label: 'Расширенные настройки',
      fields: [
        {
          name: 'enableHistory',
          type: 'checkbox',
          label: 'Сохранять историю чата',
          defaultValue: true,
        },
        {
          name: 'maxMessages',
          type: 'number',
          label: 'Максимальное количество сообщений',
          defaultValue: 50,
        },
        {
          name: 'sendMetadata',
          type: 'checkbox',
          label: 'Отправлять метаданные',
          defaultValue: true,
          admin: {
            description: 'Отправлять дополнительные данные о пользователе и странице',
          },
        },
        {
          name: 'debugMode',
          type: 'checkbox',
          label: 'Режим отладки',
          defaultValue: false,
          admin: {
            description: 'Показывать отладочную информацию в консоли',
          },
        },
        {
          name: 'testMode',
          type: 'checkbox',
          label: 'Тестовый режим',
          defaultValue: false,
          admin: {
            description: 'Использовать тестовые ответы без отправки запросов на сервер',
          },
        },
      ],
    },
  ],
}
