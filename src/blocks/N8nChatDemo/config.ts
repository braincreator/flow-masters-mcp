import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const N8nChatDemo: Block = {
  slug: 'n8nChatDemo',
  interfaceName: 'N8nChatDemoBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока демонстрации чата',
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
        description: 'Подробное описание демонстрации автоматизации',
      },
    },
    {
      name: 'webhookSettings',
      type: 'group',
      label: 'Настройки вебхука',
      fields: [
        {
          name: 'n8nWebhookUrl',
          type: 'text',
          label: 'URL вебхука n8n',
          required: true,
          admin: {
            description: 'URL вебхука для отправки сообщений в n8n',
          },
        },
        {
          name: 'webhookSecret',
          type: 'text',
          label: 'Секретный ключ вебхука',
          admin: {
            description: 'Секретный ключ для аутентификации запросов (опционально)',
          },
        },
        {
          name: 'timeout',
          type: 'number',
          label: 'Таймаут ответа (мс)',
          defaultValue: 30000,
          admin: {
            description: 'Максимальное время ожидания ответа от n8n в миллисекундах',
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
                  text: 'Привет! Я демонстрационный чат-бот, интегрированный с n8n. Задайте мне вопрос о возможностях автоматизации.',
                },
              ],
            },
          ],
        },
        {
          name: 'placeholderText',
          type: 'text',
          label: 'Текст плейсхолдера в поле ввода',
          defaultValue: 'Задайте вопрос об автоматизации...',
        },
        {
          name: 'botName',
          type: 'text',
          label: 'Имя бота',
          defaultValue: 'Автоматизация Бот',
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
        description: 'Ответы, которые будут использованы, если n8n не ответит или произойдет ошибка',
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
            description: 'Отправлять дополнительные данные о пользователе и странице в n8n',
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
      ],
    },
  ],
}
