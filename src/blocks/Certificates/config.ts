import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Certificates: Block = {
  slug: 'certificates',
  interfaceName: 'CertificatesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока сертификатов',
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
        description: 'Общее описание раздела сертификатов',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Способ отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
        { label: 'Карусель', value: 'carousel' },
        { label: 'Галерея', value: 'gallery' },
      ],
    },
    {
      name: 'certificatesSource',
      type: 'select',
      label: 'Источник сертификатов',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция', value: 'collection' },
        { label: 'API', value: 'api' },
        { label: 'Данные пользователя', value: 'user' },
      ],
    },
    {
      name: 'certificates',
      type: 'array',
      label: 'Сертификаты',
      admin: {
        condition: (data, siblingData) => siblingData?.certificatesSource === 'manual',
        description: 'Список сертификатов для отображения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название сертификата',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание сертификата',
          editor: lexicalEditor({}),
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение сертификата',
        },
        {
          name: 'issueDate',
          type: 'date',
          label: 'Дата выдачи',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'expiryDate',
          type: 'date',
          label: 'Дата истечения',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'issuer',
          type: 'group',
          label: 'Издатель',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Название организации',
              required: true,
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Логотип',
            },
            {
              name: 'website',
              type: 'text',
              label: 'Веб-сайт',
            },
          ],
        },
        {
          name: 'credentialID',
          type: 'text',
          label: 'ID сертификата',
          admin: {
            description: 'Уникальный идентификатор сертификата',
          },
        },
        {
          name: 'verificationUrl',
          type: 'text',
          label: 'URL для проверки',
          admin: {
            description: 'Ссылка для проверки подлинности сертификата',
          },
        },
        {
          name: 'skills',
          type: 'array',
          label: 'Навыки',
          fields: [
            {
              name: 'skill',
              type: 'text',
              label: 'Навык',
              required: true,
            },
          ],
        },
        {
          name: 'status',
          type: 'select',
          label: 'Статус',
          defaultValue: 'active',
          options: [
            { label: 'Активный', value: 'active' },
            { label: 'Ожидает выдачи', value: 'pending' },
            { label: 'Просрочен', value: 'expired' },
            { label: 'Доступен', value: 'available' },
          ],
        },
        {
          name: 'requirements',
          type: 'array',
          label: 'Требования для получения',
          admin: {
            condition: (data, siblingData) => siblingData?.status === 'available',
          },
          fields: [
            {
              name: 'requirement',
              type: 'text',
              label: 'Требование',
              required: true,
            },
            {
              name: 'completed',
              type: 'checkbox',
              label: 'Выполнено',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.certificatesSource === 'collection',
      },
      fields: [
        {
          name: 'collection',
          type: 'text',
          label: 'Название коллекции',
          required: true,
          admin: {
            description: 'Название коллекции с сертификатами',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит сертификатов',
          defaultValue: 10,
        },
        {
          name: 'sortField',
          type: 'text',
          label: 'Поле для сортировки',
          defaultValue: 'issueDate',
        },
        {
          name: 'sortDirection',
          type: 'select',
          label: 'Направление сортировки',
          defaultValue: 'desc',
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
                { label: 'Больше', value: 'greater_than' },
                { label: 'Меньше', value: 'less_than' },
              ],
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
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.certificatesSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
          admin: {
            description: 'URL для получения данных сертификатов',
          },
        },
        {
          name: 'apiKey',
          type: 'text',
          label: 'API ключ',
          admin: {
            description: 'Ключ для доступа к API (если требуется)',
          },
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
              label: 'Путь к массиву элементов',
              admin: {
                description:
                  'Путь к массиву сертификатов в ответе API (например, data.certificates)',
              },
            },
            {
              name: 'title',
              type: 'text',
              label: 'Поле с названием',
              defaultValue: 'title',
            },
            {
              name: 'description',
              type: 'text',
              label: 'Поле с описанием',
              defaultValue: 'description',
            },
            {
              name: 'image',
              type: 'text',
              label: 'Поле с изображением',
              defaultValue: 'image',
            },
          ],
        },
      ],
    },
    {
      name: 'userSettings',
      type: 'group',
      label: 'Настройки пользователя',
      admin: {
        condition: (data, siblingData) => siblingData?.certificatesSource === 'user',
      },
      fields: [
        {
          name: 'userField',
          type: 'text',
          label: 'Поле пользователя',
          required: true,
          admin: {
            description: 'Поле или отношение пользователя, содержащее сертификаты',
          },
        },
        {
          name: 'showCompletedOnly',
          type: 'checkbox',
          label: 'Показывать только полученные',
          defaultValue: false,
        },
        {
          name: 'showAvailable',
          type: 'checkbox',
          label: 'Показывать доступные',
          defaultValue: true,
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
          name: 'cardsPerRow',
          type: 'select',
          label: 'Карточек в ряду',
          defaultValue: '3',
          admin: {
            condition: (data, siblingData) => siblingData?.displayType === 'grid',
          },
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ],
        },
        {
          name: 'showIssuer',
          type: 'checkbox',
          label: 'Показывать издателя',
          defaultValue: true,
        },
        {
          name: 'showDate',
          type: 'checkbox',
          label: 'Показывать дату',
          defaultValue: true,
        },
        {
          name: 'enableSocialSharing',
          type: 'checkbox',
          label: 'Включить социальный шеринг',
          defaultValue: false,
        },
        {
          name: 'enablePrinting',
          type: 'checkbox',
          label: 'Включить печать',
          defaultValue: true,
        },
        {
          name: 'enableDownload',
          type: 'checkbox',
          label: 'Включить скачивание',
          defaultValue: true,
        },
        {
          name: 'progressDisplay',
          type: 'select',
          label: 'Отображение прогресса',
          defaultValue: 'progressBar',
          options: [
            { label: 'Прогресс-бар', value: 'progressBar' },
            { label: 'Процент', value: 'percent' },
            { label: 'Дробь', value: 'fraction' },
            { label: 'Скрыть', value: 'hidden' },
          ],
        },
      ],
    },
  ],
}
