import type { Block } from 'payload'
import { blockFields } from '../fields'

export const AuthorBio: Block = {
  slug: 'authorBio',
  labels: {
    singular: 'Об авторе',
    plural: 'Об авторе',
  },
  graphQL: {
    singularName: 'AuthorBioBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'author',
      type: 'group',
      required: true,
      admin: {
        description: 'Информация об авторе',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Имя автора',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Аватар автора',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          admin: {
            description: 'Биография автора',
          },
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Должность автора',
          },
        },
        {
          name: 'company',
          type: 'text',
          admin: {
            description: 'Название компании',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          admin: {
            description: 'Социальные сети',
          },
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
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
                  label: 'GitHub',
                  value: 'github',
                },
                {
                  label: 'Instagram',
                  value: 'instagram',
                },
                {
                  label: 'Website',
                  value: 'website',
                },
              ],
              admin: {
                description: 'Платформа',
              },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                description: 'URL профиля',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'card',
      options: [
        {
          label: 'Карточка',
          value: 'card',
        },
        {
          label: 'Встроенный',
          value: 'inline',
        },
      ],
      admin: {
        description: 'Стиль отображения',
      },
    },
  ],
}
