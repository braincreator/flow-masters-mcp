import type { Block } from 'payload'
import { blockFields } from '../fields'

export const RelatedPosts: Block = {
  slug: 'relatedPosts',
  labels: {
    singular: 'Похожие статьи',
    plural: 'Похожие статьи',
  },
  graphQL: {
    singularName: 'RelatedPostsBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Похожие статьи',
      admin: {
        description: 'Заголовок секции похожих статей',
      },
    },
    {
      name: 'selectionMethod',
      type: 'select',
      defaultValue: 'automatic',
      options: [
        {
          label: 'Автоматически',
          value: 'automatic',
        },
        {
          label: 'Вручную',
          value: 'manual',
        },
      ],
      admin: {
        description: 'Метод выбора похожих статей',
      },
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Выбрать статьи вручную',
        condition: (data) => data.selectionMethod === 'manual',
      },
    },
    {
      name: 'maxPosts',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      admin: {
        description: 'Максимальное количество статей для отображения',
      },
    },
    {
      name: 'criteria',
      type: 'select',
      hasMany: true,
      defaultValue: ['category'],
      options: [
        {
          label: 'По категории',
          value: 'category',
        },
        {
          label: 'По тегам',
          value: 'tags',
        },
        {
          label: 'По автору',
          value: 'author',
        },
        {
          label: 'По популярности',
          value: 'popularity',
        },
      ],
      admin: {
        description: 'Критерии для автоматического подбора похожих статей',
        condition: (data) => data.selectionMethod === 'automatic',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        {
          label: 'Сетка',
          value: 'grid',
        },
        {
          label: 'Список',
          value: 'list',
        },
        {
          label: 'Карусель',
          value: 'carousel',
        },
      ],
      admin: {
        description: 'Стиль отображения похожих статей',
      },
    },
    {
      name: 'showFeaturedImage',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать обложку статьи',
      },
    },
    {
      name: 'showExcerpt',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать краткое описание',
      },
    },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать дату публикации',
      },
    },
    {
      name: 'showAuthor',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать автора',
      },
    },
  ],
}
