import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Newsletter: Block = {
  slug: 'newsletter',
  labels: {
    singular: 'Блок подписки',
    plural: 'Блоки подписки',
  },
  graphQL: {
    singularName: 'NewsletterBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Заголовок блока подписки',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание блока подписки',
      },
    },
    {
      name: 'buttonText',
      type: 'text',
      defaultValue: 'Подписаться',
      admin: {
        description: 'Текст кнопки подписки',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'default',
      options: [
        {
          label: 'Стандартный',
          value: 'default',
        },
        {
          label: 'Компактный',
          value: 'compact',
        },
        {
          label: 'С изображением',
          value: 'withImage',
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Изображение для блока (опционально)',
        condition: (data) => data.layout === 'withImage',
      },
    },
    {
      name: 'placeholder',
      type: 'text',
      defaultValue: 'Ваш email',
      admin: {
        description: 'Placeholder для поля ввода email',
      },
    },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Спасибо за подписку!',
      admin: {
        description: 'Сообщение об успешной подписке',
      },
    },
  ],
}
