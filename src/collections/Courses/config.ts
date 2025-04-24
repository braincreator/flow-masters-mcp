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
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Связанный продукт',
      admin: {
        description: 'Продукт, который нужно купить для доступа к курсу',
        position: 'sidebar',
      },
    },
    {
      name: 'accessType',
      type: 'select',
      label: 'Тип доступа',
      options: [
        { label: 'Платный', value: 'paid' },
        { label: 'Бесплатный', value: 'free' },
        { label: 'По подписке', value: 'subscription' },
      ],
      defaultValue: 'paid',
      admin: {
        position: 'sidebar',
        description: 'Как пользователи получают доступ к курсу',
      },
    },
    {
      name: 'accessDuration',
      type: 'group',
      label: 'Длительность доступа',
      admin: {
        description: 'Как долго пользователи имеют доступ к курсу после покупки',
        condition: (data) => data?.accessType === 'paid',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Неограниченный', value: 'unlimited' },
            { label: 'Ограниченный период', value: 'limited' },
          ],
          defaultValue: 'unlimited',
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Количество единиц времени',
            condition: (data) => data?.type === 'limited',
          },
        },
        {
          name: 'unit',
          type: 'select',
          options: [
            { label: 'Дни', value: 'days' },
            { label: 'Недели', value: 'weeks' },
            { label: 'Месяцы', value: 'months' },
            { label: 'Годы', value: 'years' },
          ],
          defaultValue: 'months',
          admin: {
            condition: (data) => data?.type === 'limited',
          },
        },
      ],
    },
  ],
}
