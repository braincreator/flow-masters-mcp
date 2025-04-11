import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'resourceType', 'tags', 'updatedAt'],
    description: 'Коллекция для учебных материалов и ресурсов.',
  },
  versions: {
    drafts: true,
  },
  labels: {
    singular: 'Ресурс',
    plural: 'Ресурсы',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название ресурса',
      required: true,
      localized: true,
    },
    ...slugField(),
    {
      name: 'resourceType',
      type: 'select',
      label: 'Тип ресурса',
      required: true,
      options: [
        { label: 'Ссылка', value: 'link' },
        { label: 'Файл', value: 'file' },
        { label: 'Встроенное видео', value: 'videoEmbed' }, // Например, YouTube/Vimeo
        { label: 'Текстовый блок', value: 'textBlock' },
      ],
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
      name: 'url',
      type: 'url',
      label: 'URL Ссылки',
      admin: {
        condition: (_, siblingData) => siblingData.resourceType === 'link',
      },
      // required: true, // Сделать обязательным если тип 'link'
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      label: 'Файл',
      admin: {
        condition: (_, siblingData) => siblingData.resourceType === 'file',
      },
      // required: true, // Сделать обязательным если тип 'file'
    },
    {
      name: 'videoEmbedUrl',
      type: 'url',
      label: 'URL видео (YouTube, Vimeo и т.п.)',
      admin: {
        condition: (_, siblingData) => siblingData.resourceType === 'videoEmbed',
      },
      // required: true, // Сделать обязательным если тип 'videoEmbed'
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Текстовое содержимое',
      editor: lexicalEditor({}),
      admin: {
        condition: (_, siblingData) => siblingData.resourceType === 'textBlock',
      },
      // required: true, // Сделать обязательным если тип 'textBlock'
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
  ],
}
