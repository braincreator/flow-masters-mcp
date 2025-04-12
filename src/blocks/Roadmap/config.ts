import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Roadmap: Block = {
  slug: 'roadmap',
  interfaceName: 'RoadmapBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока дорожной карты',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Краткое описание дорожной карты',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание дорожной карты',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'vertical',
      options: [
        { label: 'Вертикальная шкала', value: 'vertical' },
        { label: 'Горизонтальная шкала', value: 'horizontal' },
        { label: 'Колонки по статусу', value: 'columns' }, // Например: Запланировано, В разработке, Завершено
        { label: 'Временная шкала (Gantt-подобная)', value: 'timeline' },
      ],
    },
    {
      name: 'itemsSource',
      type: 'select',
      label: 'Источник элементов',
      defaultValue: 'manual',
      options: [
        { label: 'Ручное добавление', value: 'manual' },
        { label: 'Коллекция', value: 'collection' },
        { label: 'API', value: 'api' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Элементы дорожной карты',
      admin: {
        condition: (data, siblingData) => siblingData?.itemsSource === 'manual',
        description: 'Список этапов, задач или фич',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название элемента',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание элемента',
          editor: lexicalEditor({}),
        },
        {
          name: 'status',
          type: 'select',
          label: 'Статус',
          options: [
            { label: 'Запланировано', value: 'planned' },
            { label: 'В разработке', value: 'inProgress' },
            { label: 'Завершено', value: 'completed' },
            { label: 'Отложено', value: 'onHold' },
            { label: 'Отменено', value: 'cancelled' },
            { label: 'Идея', value: 'idea' },
          ],
        },
        {
          name: 'startDate',
          type: 'date',
          label: 'Дата начала',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Дата окончания (или ожидаемая)',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'category',
          type: 'text',
          label: 'Категория/Тема',
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
          name: 'priority',
          type: 'select',
          label: 'Приоритет',
          options: [
            { label: 'Низкий', value: 'low' },
            { label: 'Средний', value: 'medium' },
            { label: 'Высокий', value: 'high' },
            { label: 'Критический', value: 'critical' },
          ],
        },
        {
          name: 'assignedTo',
          type: 'text',
          label: 'Назначено (имя или команда)',
        },
        {
          name: 'progress',
          type: 'number',
          label: 'Прогресс (%)',
          min: 0,
          max: 100,
        },
        {
          name: 'link',
          type: 'text',
          label: 'Связанная ссылка',
          admin: {
            description: 'Ссылка на задачу, документ или другую информацию',
          },
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Иконка',
        },
      ],
    },
    {
      name: 'collectionSettings',
      type: 'group',
      label: 'Настройки коллекции',
      admin: {
        condition: (data, siblingData) => siblingData?.itemsSource === 'collection',
      },
      fields: [
        {
          name: 'targetCollection',
          type: 'text',
          label: 'Roadmap Item Collection Slug',
          required: true,
          admin: {
            description: 'Введите слаг коллекции, из которой нужно брать элементы дорожной карты.',
          },
        },
        {
          name: 'limit',
          type: 'number',
          label: 'Лимит элементов',
          defaultValue: 50,
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
        {
          name: 'fieldMapping',
          type: 'group',
          label: 'Маппинг полей коллекции',
          fields: [
            { name: 'title', type: 'text', label: 'Поле: Название', defaultValue: 'title' },
            {
              name: 'description',
              type: 'text',
              label: 'Поле: Описание',
              defaultValue: 'description',
            },
            { name: 'status', type: 'text', label: 'Поле: Статус', defaultValue: 'status' },
            {
              name: 'startDate',
              type: 'text',
              label: 'Поле: Дата начала',
              defaultValue: 'startDate',
            },
            {
              name: 'endDate',
              type: 'text',
              label: 'Поле: Дата окончания',
              defaultValue: 'endDate',
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
        condition: (data, siblingData) => siblingData?.itemsSource === 'api',
      },
      fields: [
        {
          name: 'apiUrl',
          type: 'text',
          label: 'URL API',
          required: true,
        },
      ],
    },
    {
      name: 'displaySettings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'showStatus',
          type: 'checkbox',
          label: 'Показывать статус',
          defaultValue: true,
        },
        {
          name: 'showDates',
          type: 'checkbox',
          label: 'Показывать даты',
          defaultValue: true,
        },
        {
          name: 'showProgress',
          type: 'checkbox',
          label: 'Показывать прогресс (%)',
          defaultValue: true,
        },
        {
          name: 'showTags',
          type: 'checkbox',
          label: 'Показывать теги',
          defaultValue: true,
        },
        {
          name: 'showCategory',
          type: 'checkbox',
          label: 'Показывать категорию',
          defaultValue: true,
        },
        {
          name: 'groupBy',
          type: 'select',
          label: 'Группировать по',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Статусу', value: 'status' },
            { label: 'Категории', value: 'category' },
            { label: 'Дате (месяц/квартал)', value: 'date' },
          ],
        },
        {
          name: 'enableFiltering',
          type: 'checkbox',
          label: 'Включить фильтрацию',
          defaultValue: true,
        },
        {
          name: 'enableVoting',
          type: 'checkbox',
          label: 'Включить голосование за элементы (для идей)',
          defaultValue: false,
        },
        {
          name: 'colorScheme',
          type: 'select',
          label: 'Цветовая схема',
          options: [
            { label: 'По статусу', value: 'status' },
            { label: 'По категории', value: 'category' },
            { label: 'Монохромная', value: 'monochrome' },
            { label: 'Пользовательская', value: 'custom' },
          ],
        },
        {
          name: 'customColors',
          type: 'array',
          label: 'Пользовательские цвета',
          admin: {
            condition: (data, siblingData) => siblingData?.colorScheme === 'custom',
          },
          fields: [
            {
              name: 'value',
              type: 'text',
              label: 'Значение (статус/категория)',
              required: true,
            },
            {
              name: 'color',
              type: 'text',
              label: 'Цвет (HEX)',
              required: true,
            },
          ],
        },
      ],
    },
  ],
}
