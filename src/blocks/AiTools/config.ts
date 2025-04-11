import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const AiTools: Block = {
  slug: 'aiTools',
  interfaceName: 'AiToolsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока каталога ИИ-инструментов',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание блока',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание каталога ИИ-инструментов',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
        { label: 'Карточки', value: 'cards' },
      ],
    },
    {
      name: 'toolsSource',
      type: 'select',
      label: 'Источник инструментов',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция', value: 'collection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Категории инструментов',
      admin: {
        description: 'Структура категорий для организации инструментов',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название категории',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание категории',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Иконка категории',
        },
        {
          name: 'slug',
          type: 'text',
          label: 'Идентификатор категории',
          admin: {
            description: 'Уникальный идентификатор для URL',
          },
        },
      ],
    },
    {
      name: 'tools',
      type: 'array',
      label: 'Инструменты',
      admin: {
        condition: (data, siblingData) => siblingData?.toolsSource === 'manual',
        description: 'Список ИИ-инструментов для отображения',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название инструмента',
          required: true,
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Логотип',
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание инструмента',
          editor: lexicalEditor({}),
        },
        {
          name: 'websiteUrl',
          type: 'text',
          label: 'URL веб-сайта',
          required: true,
        },
        {
          name: 'categoryIds',
          type: 'array',
          label: 'Категории',
          fields: [
            {
              name: 'category',
              type: 'text',
              label: 'Категория',
              required: true,
              admin: {
                description: 'Slug категории',
              },
            },
          ],
        },
        {
          name: 'pricingModel',
          type: 'select',
          label: 'Модель ценообразования',
          options: [
            { label: 'Бесплатно', value: 'free' },
            { label: 'Freemium', value: 'freemium' },
            { label: 'Подписка', value: 'subscription' },
            { label: 'Оплата за использование', value: 'payg' },
            { label: 'Разовая покупка', value: 'onetime' },
            { label: 'Другое', value: 'other' },
          ],
        },
        {
          name: 'features',
          type: 'array',
          label: 'Основные возможности',
          fields: [
            {
              name: 'feature',
              type: 'text',
              label: 'Возможность',
              required: true,
            },
          ],
        },
        {
          name: 'useCases',
          type: 'array',
          label: 'Примеры использования',
          fields: [
            {
              name: 'useCase',
              type: 'text',
              label: 'Пример',
              required: true,
            },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          label: 'Теги',
          fields: [
            {
              name: 'tag',
              type: 'text',
              label: 'Тег',
              required: true,
            },
          ],
        },
        {
          name: 'integration',
          type: 'select',
          label: 'Тип интеграции',
          options: [
            { label: 'API', value: 'api' },
            { label: 'Плагин', value: 'plugin' },
            { label: 'Веб-сервис', value: 'web' },
            { label: 'Нет', value: 'none' },
          ],
        },
        {
          name: 'rating',
          type: 'number',
          label: 'Рейтинг',
          min: 0,
          max: 5,
          admin: {
            step: 0.1,
          },
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: 'Рекомендуемый',
          defaultValue: false,
        },
        {
          name: 'reviewLink',
          type: 'text',
          label: 'Ссылка на обзор',
        },
      ],
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.toolsSource === 'collection',
      },
      fields: [
        {
          name: 'collection',
          type: 'text',
          label: 'Название коллекции',
          required: true,
          admin: {
            description: 'Название коллекции с ИИ-инструментами',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит инструментов',
          defaultValue: 15,
        },
        {
          name: 'sortField',
          type: 'text',
          label: 'Поле для сортировки',
          defaultValue: 'name',
        },
        {
          name: 'sortDirection',
          type: 'select',
          label: 'Направление сортировки',
          defaultValue: 'asc',
          options: [
            { label: 'По возрастанию', value: 'asc' },
            { label: 'По убыванию', value: 'desc' },
          ],
        },
        {
          name: 'filters',
          type: 'array',
          label: 'Фильтры',
          fields: [
            {
              name: 'field',
              type: 'text',
              label: 'Поле',
              required: true,
            },
            {
              name: 'operator',
              type: 'select',
              label: 'Оператор',
              defaultValue: 'equals',
              options: [
                { label: 'Равно', value: 'equals' },
                { label: 'Не равно', value: 'not_equals' },
                { label: 'Содержит', value: 'contains' },
                { label: 'В списке', value: 'in' },
                { label: 'Не в списке', value: 'not_in' },
                { label: 'Существует', value: 'exists' },
              ],
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
            },
          ],
        },
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.toolsSource === 'api',
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
          name: 'method',
          type: 'select',
          label: 'HTTP метод',
          defaultValue: 'GET',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
          ],
        },
        {
          name: 'headers',
          type: 'array',
          label: 'Заголовки',
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
        {
          name: 'responseMapping',
          type: 'group',
          label: 'Мапинг ответа',
          fields: [
            {
              name: 'items',
              type: 'text',
              label: 'Путь к массиву инструментов',
              defaultValue: 'data.tools',
            },
            {
              name: 'name',
              type: 'text',
              label: 'Поле с названием',
              defaultValue: 'name',
            },
            {
              name: 'description',
              type: 'text',
              label: 'Поле с описанием',
              defaultValue: 'description',
            },
            {
              name: 'logo',
              type: 'text',
              label: 'Поле с логотипом',
              defaultValue: 'logoUrl',
            },
            {
              name: 'websiteUrl',
              type: 'text',
              label: 'Поле с URL сайта',
              defaultValue: 'website',
            },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'enableFiltering',
          type: 'checkbox',
          label: 'Включить фильтрацию',
          defaultValue: true,
        },
        {
          name: 'enableSearch',
          type: 'checkbox',
          label: 'Включить поиск',
          defaultValue: true,
        },
        {
          name: 'enableSorting',
          type: 'checkbox',
          label: 'Включить сортировку',
          defaultValue: true,
        },
        {
          name: 'showCategoriesNav',
          type: 'checkbox',
          label: 'Показывать навигацию по категориям',
          defaultValue: true,
        },
        {
          name: 'itemsPerPage',
          type: 'number',
          label: 'Элементов на странице',
          defaultValue: 12,
        },
        {
          name: 'itemsPerRow',
          type: 'select',
          label: 'Элементов в ряду',
          defaultValue: '3',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.displayType === 'grid' || siblingData?.displayType === 'cards',
          },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
          ],
        },
        {
          name: 'showTags',
          type: 'checkbox',
          label: 'Показывать теги',
          defaultValue: true,
        },
        {
          name: 'showPricing',
          type: 'checkbox',
          label: 'Показывать модель ценообразования',
          defaultValue: true,
        },
        {
          name: 'showRating',
          type: 'checkbox',
          label: 'Показывать рейтинг',
          defaultValue: true,
        },
        {
          name: 'showFeatures',
          type: 'checkbox',
          label: 'Показывать основные возможности',
          defaultValue: true,
        },
      ],
    },
  ],
}
