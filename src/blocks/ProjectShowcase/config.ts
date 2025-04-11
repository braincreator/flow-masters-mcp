import type { Block, Field } from 'payload'

// Переиспользуемое поле для ссылки
const linkField: Field = {
  name: 'link',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'radio',
      options: [
        { label: 'Внутренняя страница', value: 'reference' },
        { label: 'Внешний URL', value: 'custom' },
      ],
      defaultValue: 'custom',
      admin: { layout: 'horizontal' },
    },
    {
      name: 'label',
      label: 'Текст ссылки',
      type: 'text',
      required: true,
    },
    {
      name: 'reference',
      label: 'Страница',
      type: 'relationship',
      relationTo: 'pages',
      required: true,
      admin: { condition: (_, siblingData) => siblingData?.type === 'reference' },
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      admin: { condition: (_, siblingData) => siblingData?.type === 'custom' },
    },
  ],
}

export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  interfaceName: 'ProjectShowcaseBlock',
  labels: {
    singular: 'Витрина Проектов',
    plural: 'Витрины Проектов',
  },
  fields: [
    {
      name: 'blockTitle',
      type: 'text',
      label: 'Заголовок блока (опционально)',
    },
    {
      name: 'sourceType',
      type: 'select',
      label: 'Источник проектов',
      defaultValue: 'latest',
      options: [
        { label: 'Последние добавленные', value: 'latest' },
        { label: 'Проекты из категории/тега', value: 'category' },
        { label: 'Проекты конкретного курса', value: 'course' },
        { label: 'Выбранные вручную', value: 'manualSelection' },
      ],
      admin: {
        description:
          'Выберите, какие проекты отображать. Логика фильтрации реализуется на фронтенде.',
      },
    },
    {
      name: 'categoryOrTag',
      type: 'relationship',
      relationTo: ['categories', 'tags'], // Разрешаем выбирать категории или теги
      label: 'Категория или Тег',
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === 'category',
      },
    },
    {
      name: 'relatedCourse',
      type: 'relationship',
      relationTo: 'courses',
      label: 'Курс',
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === 'course',
      },
    },
    {
      name: 'selectedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      label: 'Выбрать проекты',
      admin: {
        condition: (_, siblingData) => siblingData.sourceType === 'manualSelection',
      },
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Количество проектов для показа (0 = все)',
      defaultValue: 6,
      min: 0,
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Стиль отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Карусель', value: 'carousel' },
        { label: 'Список', value: 'list' },
      ],
    },
    {
      name: 'displayOptions',
      type: 'group',
      label: 'Отображаемая информация в карточке проекта',
      fields: [
        {
          name: 'showAuthor',
          type: 'checkbox',
          label: 'Показывать автора',
          defaultValue: true,
        },
        {
          name: 'showDate',
          type: 'checkbox',
          label: 'Показывать дату добавления',
          defaultValue: false,
        },
        {
          name: 'showTags',
          type: 'checkbox',
          label: 'Показывать теги/технологии',
          defaultValue: true,
        },
        {
          name: 'showDescriptionExcerpt',
          type: 'checkbox',
          label: 'Показывать краткое описание',
          defaultValue: true,
        },
        // Можно добавить опцию для отображения лайков/комментариев, если такая логика есть
      ],
    },
    {
      name: 'viewAllLink',
      label: "Ссылка на страницу 'Все проекты' (опционально)",
      type: 'group',
      fields: linkField.fields,
    },
  ],
}
