import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Calendar: Block = {
  slug: 'calendar',
  interfaceName: 'CalendarBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока календаря событий',
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
        description: 'Общее описание раздела с событиями',
      },
    },
    {
      name: 'displayType',
      type: 'select',
      label: 'Способ отображения',
      defaultValue: 'list',
      options: [
        { label: 'Список', value: 'list' },
        { label: 'Календарь', value: 'calendar' },
        { label: 'Сетка', value: 'grid' },
        { label: 'Временная шкала', value: 'timeline' },
      ],
    },
    {
      name: 'eventsSource',
      type: 'select',
      label: 'Источник событий',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция событий', value: 'collection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.eventsSource === 'collection',
      },
      fields: [
        {
          name: 'targetCollection',
          type: 'text',
          label: 'Название коллекции',
          admin: {
            description: 'Название коллекции с событиями',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит событий',
          defaultValue: 10,
        },
        {
          name: 'sortField',
          type: 'text',
          label: 'Поле для сортировки',
          defaultValue: 'startDate',
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
      ],
    },
    {
      name: 'apiSettings',
      type: 'group',
      label: 'Настройки API',
      admin: {
        condition: (data, siblingData) => siblingData?.eventsSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
          admin: {
            description: 'URL для получения событий (напр. Google Calendar API)',
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
          name: 'refreshInterval',
          type: 'number',
          label: 'Интервал обновления (мин)',
          defaultValue: 60,
        },
      ],
    },
    {
      name: 'events',
      type: 'array',
      label: 'События',
      admin: {
        condition: (data, siblingData) => siblingData?.eventsSource === 'manual',
        description: 'Список событий для отображения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название события',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание события',
          editor: lexicalEditor({}),
        },
        {
          name: 'startDate',
          type: 'date',
          label: 'Дата начала',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Дата окончания',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'location',
          type: 'group',
          label: 'Место проведения',
          fields: [
            {
              name: 'type',
              type: 'select',
              label: 'Тип',
              defaultValue: 'online',
              options: [
                { label: 'Онлайн', value: 'online' },
                { label: 'Офлайн', value: 'offline' },
                { label: 'Гибридный', value: 'hybrid' },
              ],
            },
            {
              name: 'address',
              type: 'text',
              label: 'Адрес',
              admin: {
                condition: (data, siblingData) =>
                  siblingData?.type === 'offline' || siblingData?.type === 'hybrid',
              },
            },
            {
              name: 'onlineLink',
              type: 'text',
              label: 'Ссылка на трансляцию',
              admin: {
                condition: (data, siblingData) =>
                  siblingData?.type === 'online' || siblingData?.type === 'hybrid',
              },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
        },
        {
          name: 'category',
          type: 'select',
          label: 'Категория',
          options: [
            { label: 'Вебинар', value: 'webinar' },
            { label: 'Конференция', value: 'conference' },
            { label: 'Мастер-класс', value: 'workshop' },
            { label: 'Митап', value: 'meetup' },
            { label: 'Хакатон', value: 'hackathon' },
            { label: 'Другое', value: 'other' },
          ],
        },
        {
          name: 'registrationLink',
          type: 'text',
          label: 'Ссылка для регистрации',
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: 'Выделенное событие',
          defaultValue: false,
        },
        {
          name: 'status',
          type: 'select',
          label: 'Статус',
          defaultValue: 'upcoming',
          options: [
            { label: 'Предстоящее', value: 'upcoming' },
            { label: 'Идет регистрация', value: 'registration' },
            { label: 'Завершено', value: 'past' },
            { label: 'Отменено', value: 'cancelled' },
          ],
        },
        {
          name: 'speakers',
          type: 'array',
          label: 'Спикеры',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Имя',
              required: true,
            },
            {
              name: 'position',
              type: 'text',
              label: 'Должность',
            },
            {
              name: 'company',
              type: 'text',
              label: 'Компания',
            },
            {
              name: 'bio',
              type: 'textarea',
              label: 'Биография',
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              label: 'Фото',
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
          name: 'showPastEvents',
          type: 'checkbox',
          label: 'Показывать прошедшие события',
          defaultValue: false,
        },
        {
          name: 'maxEventsToShow',
          type: 'number',
          label: 'Максимальное количество событий',
          defaultValue: 10,
        },
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
          name: 'enableCalendarExport',
          type: 'checkbox',
          label: 'Включить экспорт в календарь',
          defaultValue: true,
        },
        {
          name: 'showCountdown',
          type: 'checkbox',
          label: 'Показывать обратный отсчёт',
          defaultValue: false,
        },
      ],
    },
  ],
}
