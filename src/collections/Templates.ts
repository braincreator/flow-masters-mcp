import { CollectionConfig } from 'payload/types'
import { isAdmin, isAdminOrEditor } from '../access/isAdmin'

const Templates: CollectionConfig = {
  slug: 'templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название шаблона',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Курс',
          value: 'course',
        },
        {
          label: 'Лендинг',
          value: 'landing',
        },
        {
          label: 'Воронка',
          value: 'funnel',
        },
        {
          label: 'Полный комплект',
          value: 'full',
        },
      ],
      defaultValue: 'course',
      label: 'Тип шаблона',
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      label: 'Содержимое шаблона',
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Миниатюра',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Публичный шаблон',
      defaultValue: false,
    },
  ],
  timestamps: true,
}

export default Templates
