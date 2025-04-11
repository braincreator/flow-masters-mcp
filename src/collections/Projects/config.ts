import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    description: 'Коллекция для хранения студенческих проектов или работ.',
    defaultColumns: ['title', 'author', 'projectUrl', 'status', 'updatedAt'],
  },
  labels: {
    singular: 'Проект',
    plural: 'Проекты',
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название проекта',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание проекта',
      editor: lexicalEditor({}),
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: 'Автор проекта',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'projectUrl',
      type: 'url',
      label: 'Ссылка на проект (GitHub, сайт и т.д.)',
    },
    {
      name: 'status', // Для модерации или отображения статуса
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'На рассмотрении', value: 'review' },
        { label: 'Опубликован', value: 'published' },
        { label: 'Отклонен', value: 'rejected' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка проекта',
      required: true,
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Галерея (скриншоты, видео)',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Подпись',
        },
      ],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Теги/Технологии',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedCourse',
      type: 'relationship',
      relationTo: 'courses',
      label: 'Связанный курс (опционально)',
      admin: {
        position: 'sidebar',
      },
    },
    // Можно добавить поле для отзыва преподавателя/ментора
  ],
}
