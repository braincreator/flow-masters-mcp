import type { Block } from 'payload'
import { blockFields } from '../fields'

export const SocialShare: Block = {
  slug: 'socialShare',
  labels: {
    singular: 'Соцсети',
    plural: 'Соцсети',
  },
  graphQL: {
    singularName: 'SocialShareBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Поделиться статьей',
      admin: {
        description: 'Заголовок блока',
      },
    },
    {
      name: 'platforms',
      type: 'select',
      hasMany: true,
      defaultValue: ['twitter', 'facebook', 'linkedin', 'email', 'copy'],
      options: [
        {
          label: 'Twitter',
          value: 'twitter',
        },
        {
          label: 'Facebook',
          value: 'facebook',
        },
        {
          label: 'LinkedIn',
          value: 'linkedin',
        },
        {
          label: 'Reddit',
          value: 'reddit',
        },
        {
          label: 'Email',
          value: 'email',
        },
        {
          label: 'Копировать ссылку',
          value: 'copy',
        },
      ],
      admin: {
        description: 'Выберите платформы для шеринга',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'horizontal',
      options: [
        {
          label: 'Горизонтальный',
          value: 'horizontal',
        },
        {
          label: 'Вертикальный',
          value: 'vertical',
        },
      ],
      admin: {
        description: 'Выберите расположение кнопок',
      },
    },
    {
      name: 'showShareCount',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Показывать количество шерингов',
      },
    },
  ],
}
