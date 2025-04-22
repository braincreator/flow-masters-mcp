import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'type', 'updatedAt'],
    description: 'Коллекция для уроков внутри модулей курсов.',
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Урок',
    plural: 'Уроки',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название урока',
      required: true,
      localized: true,
    },
    ...slugField('title', { slugOverrides: { admin: { readOnly: true } } }),
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      label: 'Модуль',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Краткое описание',
      localized: true,
    },
    {
      name: 'content',
      label: 'Содержимое урока',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => defaultFeatures,
      }),
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Тип урока',
      options: [
        { label: 'Видео', value: 'video' },
        { label: 'Текст', value: 'text' },
        { label: 'Тест', value: 'quiz' },
        { label: 'Задание', value: 'assignment' },
      ],
      defaultValue: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Длительность',
      admin: {
        description: 'Например: "30 минут" или "1 час"',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Порядок',
      admin: {
        description: 'Порядковый номер урока в модуле',
        position: 'sidebar',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'URL видео',
      admin: {
        description: 'URL видео для уроков типа "Видео"',
        condition: (data) => data.type === 'video',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      label: 'Вложения',
      admin: {
        description: 'Файлы, прикрепленные к уроку',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название',
          required: true,
        },
        {
          name: 'file',
          type: 'upload',
          label: 'Файл',
          relationTo: 'media',
          required: true,
        },
      ],
    },
  ],
}
