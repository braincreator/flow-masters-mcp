import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AiAssistant: Block = {
  slug: 'aiAssistant',
  interfaceName: 'AiAssistantBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока ИИ-ассистента',
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
      name: 'appearance',
      type: 'select',
      label: 'Внешний вид',
      defaultValue: 'chatBubble',
      options: [
        { label: 'Чат-пузырь (в углу)', value: 'chatBubble' },
        { label: 'Встроенный виджет', value: 'inlineWidget' },
        { label: 'Полноэкранный чат', value: 'fullScreenChat' },
      ],
    },
    {
      name: 'assistantType',
      type: 'select',
      label: 'Тип ассистента',
      required: true,
      options: [
        { label: 'OpenAI (ChatGPT)', value: 'openai' },
        { label: 'Google Gemini', value: 'gemini' },
        { label: 'Hugging Face', value: 'huggingface' },
        { label: 'Собственный API', value: 'customApi' },
        { label: 'Предопределенные ответы', value: 'predefined' },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) =>
          siblingData?.assistantType === 'openai' ||
          siblingData?.assistantType === 'gemini' ||
          siblingData?.assistantType === 'huggingface' ||
          siblingData?.assistantType === 'customApi',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API ключ',
        },
        {
          name: 'modelName',
          type: 'text',
          label: 'Название модели',
          admin: {
            description: 'Например, gpt-4, gemini-2.5-flash и т.д.',
          },
        },
        {
          name: 'maxTokens',
          type: 'number',
          label: 'Максимум токенов в ответе',
          defaultValue: 150,
        },
        {
          name: 'temperature',
          type: 'number',
          label: 'Температура',
          defaultValue: 0.7,
          min: 0,
          max: 1,
          admin: {
            step: 0.1,
            description: 'Контролирует случайность ответа (0 - детерминированный, 1 - случайный)',
          },
        },
        {
          name: 'customHeaders',
          type: 'array',
          label: 'Дополнительные заголовки',
          fields: [
            {
              name: 'key',
              type: 'text',
              label: 'Ключ',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'predefinedResponses',
      type: 'array',
      label: 'Предопределенные ответы',
      admin: {
        condition: (data, siblingData) => siblingData?.assistantType === 'predefined',
      },
      fields: [
        {
          name: 'userQuery',
          type: 'text',
          label: 'Запрос пользователя (ключевые слова)',
          required: true,
        },
        {
          name: 'response',
          type: 'richText',
          label: 'Ответ ассистента',
          editor: lexicalEditor({}),
          required: true,
        },
      ],
    },
    {
      name: 'initialMessage',
      type: 'richText',
      label: 'Начальное сообщение',
      editor: lexicalEditor({}),
      defaultValue: [
        {
          children: [
            {
              text: 'Привет! Чем могу помочь?',
            },
          ],
        },
      ],
    },
    {
      name: 'promptSuggestions',
      type: 'array',
      label: 'Подсказки для запросов',
      fields: [
        {
          name: 'suggestion',
          type: 'text',
          label: 'Текст подсказки',
          required: true,
        },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Аватар ассистента',
    },
    {
      name: 'placeholderText',
      type: 'text',
      label: 'Текст плейсхолдера в поле ввода',
      defaultValue: 'Спросите меня что-нибудь...',
    },
    {
      name: 'enableHistory',
      type: 'checkbox',
      label: 'Включить историю чата',
      defaultValue: true,
    },
    {
      name: 'enableVoiceInput',
      type: 'checkbox',
      label: 'Включить голосовой ввод',
      defaultValue: false,
    },
    {
      name: 'enableVoiceOutput',
      type: 'checkbox',
      label: 'Включить голосовой вывод',
      defaultValue: false,
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Дополнительные настройки',
      fields: [
        {
          name: 'contextAwareness',
          type: 'checkbox',
          label: 'Учитывать контекст страницы',
          defaultValue: true,
        },
        {
          name: 'language',
          type: 'select',
          label: 'Язык',
          options: [
            { label: 'Русский', value: 'ru' },
            { label: 'Английский', value: 'en' },
            { label: 'Автоопределение', value: 'auto' },
          ],
          defaultValue: 'ru',
        },
        {
          name: 'themeColor',
          type: 'text',
          label: 'Цвет темы (HEX)',
          admin: {
            description: 'Основной цвет для элементов интерфейса чата',
          },
        },
        {
          name: 'requireLogin',
          type: 'checkbox',
          label: 'Требовать авторизацию для использования',
          defaultValue: false,
        },
      ],
    },
  ],
}
