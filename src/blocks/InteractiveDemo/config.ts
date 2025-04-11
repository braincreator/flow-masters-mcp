import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const InteractiveDemo: Block = {
  slug: 'interactiveDemo',
  interfaceName: 'InteractiveDemoBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока интерактивной демонстрации',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание демонстрации',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание демонстрации ИИ-решения',
      },
    },
    {
      name: 'demoType',
      type: 'select',
      label: 'Тип демонстрации',
      defaultValue: 'chat',
      options: [
        { label: 'Чат с ИИ', value: 'chat' },
        { label: 'Генерация контента', value: 'generation' },
        { label: 'Анализ данных', value: 'analysis' },
        { label: 'Распознавание изображений', value: 'image-recognition' },
        { label: 'Классификация текста', value: 'text-classification' },
        { label: 'Перевод текста', value: 'translation' },
        { label: 'Интеграция API', value: 'api-integration' },
        { label: 'Пользовательский', value: 'custom' },
      ],
    },
    {
      name: 'demoSamples',
      type: 'array',
      label: 'Примеры для демонстрации',
      admin: {
        description: 'Предварительно настроенные примеры для тестирования',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название примера',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание примера',
        },
        {
          name: 'inputPlaceholder',
          type: 'text',
          label: 'Placeholder для ввода',
          admin: {
            description: 'Подсказка в поле ввода для пользователя',
          },
        },
        {
          name: 'defaultInput',
          type: 'textarea',
          label: 'Текст по умолчанию',
          admin: {
            description: 'Предзаполненный текст для примера',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
          admin: {
            description: 'Иллюстрация для примера (если применимо)',
          },
        },
      ],
    },
    {
      name: 'interactiveOptions',
      type: 'group',
      label: 'Настройки интерактивности',
      fields: [
        {
          name: 'allowUserInput',
          type: 'checkbox',
          label: 'Разрешить пользовательский ввод',
          defaultValue: true,
        },
        {
          name: 'showLoadingState',
          type: 'checkbox',
          label: 'Показывать состояние загрузки',
          defaultValue: true,
        },
        {
          name: 'maxInputLength',
          type: 'number',
          label: 'Максимальная длина ввода',
          defaultValue: 500,
        },
        {
          name: 'responseDelay',
          type: 'number',
          label: 'Задержка ответа (мс)',
          defaultValue: 0,
          admin: {
            description: 'Искусственная задержка перед отображением ответа (0 - без задержки)',
          },
        },
        {
          name: 'simulatedResponse',
          type: 'checkbox',
          label: 'Симулировать ответ',
          defaultValue: false,
          admin: {
            description: 'Использовать предопределенные ответы вместо реального API',
          },
        },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => !siblingData?.interactiveOptions?.simulatedResponse,
        description: 'Настройки для подключения к реальному API',
      },
      fields: [
        {
          name: 'apiType',
          type: 'select',
          label: 'Тип API',
          options: [
            { label: 'OpenAI', value: 'openai' },
            { label: 'Hugging Face', value: 'huggingface' },
            { label: 'Собственный API', value: 'custom' },
          ],
        },
        {
          name: 'endpointUrl',
          type: 'text',
          label: 'URL эндпоинта',
          admin: {
            description: 'URL API для обработки запросов',
          },
        },
        {
          name: 'modelName',
          type: 'text',
          label: 'Название модели',
          admin: {
            description: 'Название используемой модели (если применимо)',
          },
        },
        {
          name: 'headerParams',
          type: 'array',
          label: 'Параметры заголовка',
          admin: {
            description: 'Дополнительные параметры заголовка запроса',
          },
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
      name: 'simulatedResponses',
      type: 'array',
      label: 'Предопределенные ответы',
      admin: {
        condition: (data, siblingData) => siblingData?.interactiveOptions?.simulatedResponse,
        description: 'Ответы для симуляции работы ИИ',
      },
      fields: [
        {
          name: 'inputPattern',
          type: 'text',
          label: 'Шаблон запроса',
          admin: {
            description: 'Текст запроса или регулярное выражение для сопоставления',
          },
        },
        {
          name: 'response',
          type: 'textarea',
          label: 'Ответ',
          required: true,
        },
      ],
    },
    {
      name: 'uiOptions',
      type: 'group',
      label: 'Настройки интерфейса',
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
          name: 'layout',
          type: 'select',
          label: 'Макет',
          defaultValue: 'split',
          options: [
            { label: 'Разделенный', value: 'split' },
            { label: 'Полноэкранный', value: 'fullscreen' },
            { label: 'Карточки', value: 'cards' },
            { label: 'Вкладки', value: 'tabs' },
          ],
        },
        {
          name: 'showInputControls',
          type: 'checkbox',
          label: 'Показывать элементы управления вводом',
          defaultValue: true,
        },
        {
          name: 'showExampleSelector',
          type: 'checkbox',
          label: 'Показывать селектор примеров',
          defaultValue: true,
        },
        {
          name: 'avatarImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Аватар ИИ-ассистента',
        },
        {
          name: 'assistantName',
          type: 'text',
          label: 'Имя ассистента',
          defaultValue: 'ИИ-Ассистент',
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Призыв к действию',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Включить CTA',
          defaultValue: false,
        },
        {
          name: 'text',
          type: 'text',
          label: 'Текст',
          admin: {
            condition: (data, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          admin: {
            condition: (data, siblingData) => siblingData.enabled,
          },
        },
        {
          name: 'style',
          type: 'select',
          label: 'Стиль',
          defaultValue: 'primary',
          options: [
            { label: 'Основной', value: 'primary' },
            { label: 'Вторичный', value: 'secondary' },
            { label: 'Контурный', value: 'outline' },
          ],
          admin: {
            condition: (data, siblingData) => siblingData.enabled,
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          label: 'Цвет фона',
          defaultValue: 'transparent',
          options: [
            { label: 'Прозрачный', value: 'transparent' },
            { label: 'Светлый', value: 'light' },
            { label: 'Темный', value: 'dark' },
            { label: 'Акцентный', value: 'accent' },
          ],
        },
        {
          name: 'paddingTop',
          type: 'select',
          label: 'Отступ сверху',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'paddingBottom',
          type: 'select',
          label: 'Отступ снизу',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'containerWidth',
          type: 'select',
          label: 'Ширина контейнера',
          defaultValue: 'default',
          options: [
            { label: 'По умолчанию', value: 'default' },
            { label: 'Узкий', value: 'narrow' },
            { label: 'Широкий', value: 'wide' },
            { label: 'Полный', value: 'full' },
          ],
        },
      ],
    },
  ],
  labels: {
    singular: 'Блок интерактивной демонстрации',
    plural: 'Блоки интерактивных демонстраций',
  },
}
