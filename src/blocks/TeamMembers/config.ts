import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const TeamMembers: Block = {
  slug: 'teamMembers',
  labels: {
    singular: 'Команда',
    plural: 'Команды',
  },
  graphQL: {
    singularName: 'TeamMembersBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Заголовок блока',
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание блока (опционально)',
      },
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Члены команды',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Имя участника команды',
          },
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Должность или роль',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          admin: {
            description: 'Краткая биография (опционально)',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Фото участника команды',
          },
        },
        {
          name: 'social',
          type: 'group',
          admin: {
            description: 'Ссылки на социальные сети (опционально)',
          },
          fields: [
            {
              name: 'twitter',
              type: 'text',
              admin: {
                description: 'Ссылка на Twitter',
              },
            },
            {
              name: 'linkedin',
              type: 'text',
              admin: {
                description: 'Ссылка на LinkedIn',
              },
            },
            {
              name: 'github',
              type: 'text',
              admin: {
                description: 'Ссылка на GitHub',
              },
            },
            {
              name: 'website',
              type: 'text',
              admin: {
                description: 'Ссылка на персональный сайт',
              },
            },
          ],
        },
      ],
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
      ],
      admin: {
        description: 'Стиль отображения',
      },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: 3,
      options: [
        {
          label: '2 колонки',
          value: 2,
        },
        {
          label: '3 колонки',
          value: 3,
        },
        {
          label: '4 колонки',
          value: 4,
        },
      ],
      admin: {
        description: 'Количество колонок',
        condition: (data) => data.layout === 'grid',
      },
    },
  ],
}
