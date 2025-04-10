import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Steps: Block = {
  slug: 'steps',
  labels: {
    singular: 'Блок шагов',
    plural: 'Блоки шагов',
  },
  graphQL: {
    singularName: 'StepsBlock',
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
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Шаги процесса',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Заголовок шага',
          },
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor({}),
          admin: {
            description: 'Описание шага',
          },
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Имя иконки из коллекции (опционально)',
          },
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Изображение или видео (опционально)',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'vertical',
      options: [
        {
          label: 'Вертикальный',
          value: 'vertical',
        },
        {
          label: 'Горизонтальный',
          value: 'horizontal',
        },
        {
          label: 'Зигзаг',
          value: 'zigzag',
        },
      ],
      admin: {
        description: 'Стиль отображения шагов',
      },
    },
    {
      name: 'showNumbers',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать номера шагов',
      },
    },
    {
      name: 'showLines',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать соединительные линии',
      },
    },
  ],
}
