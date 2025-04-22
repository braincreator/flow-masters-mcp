import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { availableBlocks } from '../../blocks'

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    group: 'Learning Management',
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'updatedAt'],
    description: 'Коллекция для учебных курсов платформы.',
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Курс',
    plural: 'Курсы',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название курса',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
        { label: 'Архив', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users', // Или 'authors', если есть отдельная коллекция
      label: 'Автор/Инструктор',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка курса',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Краткое описание (для карточек)',
      localized: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      label: 'Уровень сложности',
      options: [
        { label: 'Начинающий', value: 'beginner' },
        { label: 'Средний', value: 'intermediate' },
        { label: 'Продвинутый', value: 'advanced' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'text',
      label: 'Примерная длительность (текст)',
      admin: {
        description: "Например, '10 часов', '3 недели'.",
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Теги/Категории',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'layout',
      label: 'Содержимое страницы курса',
      type: 'blocks',
      minRows: 1,
      blocks: availableBlocks,
      required: true,
      localized: true,
    },
    // Дополнительные поля, если нужны:
    // {
    //   name: 'price',
    //   type: 'number',
    // },
    // {
    //   name: 'relatedProducts', // Связь с продуктами (если курс - это продукт)
    //   type: 'relationship',
    //   relationTo: 'products',
    // },
    // {
    //   name: 'accessRules', // Правила доступа к курсу
    //   type: 'group',
    // }
  ],
}
