import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const TechStack: Block = {
  slug: 'techStack',
  interfaceName: 'TechStackBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока с технологическим стеком',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание технологического стека',
      },
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Категории технологий',
      admin: {
        description: 'Группировка технологий по категориям',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название категории',
          required: true,
          admin: {
            description: 'Например: Frontend, Backend, ИИ и машинное обучение и т.д.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание категории',
          admin: {
            description: 'Краткое описание этой области технологий',
          },
        },
        {
          name: 'technologies',
          type: 'array',
          label: 'Технологии',
          admin: {
            description: 'Список технологий в этой категории',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Название технологии',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
              admin: {
                description: 'Краткое описание технологии или ее применения',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Логотип',
              admin: {
                description: 'Логотип или иконка технологии',
              },
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              admin: {
                description: 'Ссылка на официальный сайт технологии',
              },
            },
            {
              name: 'expertise',
              type: 'select',
              label: 'Уровень экспертизы',
              options: [
                { label: 'Начальный', value: 'beginner' },
                { label: 'Средний', value: 'intermediate' },
                { label: 'Продвинутый', value: 'advanced' },
                { label: 'Экспертный', value: 'expert' },
              ],
            },
            {
              name: 'experienceYears',
              type: 'number',
              label: 'Лет опыта',
              admin: {
                description: 'Сколько лет компания работает с этой технологией',
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Ключевая технология',
              admin: {
                description: 'Отметьте для выделения ключевых технологий',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'partners',
      type: 'array',
      label: 'Партнеры и сертификации',
      admin: {
        description: 'Партнерские статусы, сертификации и другие подтверждения экспертизы',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Логотип',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
        },
      ],
    },
    {
      name: 'showLogosOnly',
      type: 'checkbox',
      label: 'Показать только логотипы',
      defaultValue: false,
      admin: {
        description: 'Отображать только логотипы технологий без детальной информации',
      },
    },
    {
      name: 'showExpertiseLevels',
      type: 'checkbox',
      label: 'Показать уровни экспертизы',
      defaultValue: true,
      admin: {
        description: 'Отображать индикаторы уровня экспертизы',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Вкладки по категориям', value: 'tabs' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Количество колонок',
      defaultValue: '4',
      options: [
        { label: '3 колонки', value: '3' },
        { label: '4 колонки', value: '4' },
        { label: '5 колонок', value: '5' },
        { label: '6 колонок', value: '6' },
      ],
      admin: {
        condition: (data) => data.layout === 'grid' && data.showLogosOnly,
        description: 'Количество колонок в сетке логотипов',
      },
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
    singular: 'Блок технологического стека',
    plural: 'Блоки технологического стека',
  },
}
