import type { Block } from 'payload'
import { blockFields } from '../fields'

export const Comments: Block = {
  slug: 'comments',
  labels: {
    singular: 'Комментарии',
    plural: 'Комментарии',
  },
  graphQL: {
    singularName: 'CommentsBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Комментарии',
      admin: {
        description: 'Заголовок секции комментариев',
      },
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'native',
      options: [
        {
          label: 'Встроенные',
          value: 'native',
        },
        {
          label: 'Disqus',
          value: 'disqus',
        },
        {
          label: 'Facebook',
          value: 'facebook',
        },
      ],
      admin: {
        description: 'Система комментариев',
      },
    },
    {
      name: 'disqusShortname',
      type: 'text',
      admin: {
        description: 'Shortname для Disqus (если выбран Disqus)',
        condition: (data) => data.provider === 'disqus',
      },
    },
    {
      name: 'facebookAppId',
      type: 'text',
      admin: {
        description: 'Facebook App ID (если выбран Facebook)',
        condition: (data) => data.provider === 'facebook',
      },
    },
    {
      name: 'showCount',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать количество комментариев',
      },
    },
    {
      name: 'commentsPerPage',
      type: 'number',
      defaultValue: 10,
      admin: {
        description: 'Количество комментариев на странице (для встроенных комментариев)',
        condition: (data) => data.provider === 'native',
      },
    },
    {
      name: 'allowReplies',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Разрешить ответы на комментарии',
        condition: (data) => data.provider === 'native',
      },
    },
    {
      name: 'requireAuth',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Требовать авторизацию для комментирования',
        condition: (data) => data.provider === 'native',
      },
    },
    {
      name: 'moderationEnabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Включить модерацию комментариев',
        condition: (data) => data.provider === 'native',
      },
    },
  ],
}
