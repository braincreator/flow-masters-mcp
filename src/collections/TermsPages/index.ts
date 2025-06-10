import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { defaultLexical } from '../../fields/defaultLexical'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
// import { revalidateTermsPage } from './hooks/revalidateTermsPages'

export const TermsPages: CollectionConfig = {
  slug: 'terms-pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    group: 'Content Management',
    useAsTitle: 'title',
    defaultColumns: ['title', 'tabType', 'updatedAt'],
    description: 'Управление контентом для табов на странице Terms',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Название таба (например: "Услуги", "Консультации")',
      },
    },
    {
      name: 'tabType',
      type: 'select',
      required: true,
      unique: true,
      options: [
        {
          label: 'Услуги',
          value: 'services',
        },
        {
          label: 'Консультации',
          value: 'consulting',
        },
        {
          label: 'Сервисы',
          value: 'systems',
        },
        {
          label: 'Продукты',
          value: 'products',
        },
      ],
      admin: {
        description: 'Тип таба - определяет какой контент будет отображаться',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
      admin: {
        description: 'Подзаголовок таба (опционально)',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: defaultLexical,
      required: true,
      localized: true,
      admin: {
        description: 'Основной контент таба с условиями и соглашениями',
      },
    },
    {
      name: 'importantNote',
      type: 'richText',
      editor: defaultLexical,
      localized: true,
      admin: {
        description: 'Важная информация (отображается в отдельном блоке)',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Порядок отображения табов (0 = первый)',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Отображать ли этот таб на странице',
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    // afterChange: [revalidateTermsPage],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
    },
    maxPerDoc: 10,
  },
}
