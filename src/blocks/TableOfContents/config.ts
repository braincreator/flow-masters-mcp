import { Block } from 'payload/types'
import { blockFields } from '../fields'

export const TableOfContents: Block = {
  slug: 'tableOfContents',
  labels: {
    singular: 'Оглавление',
    plural: 'Оглавления',
  },
  graphQL: {
    singularName: 'TableOfContentsBlock',
  },
  fields: [
    ...blockFields,
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Содержание',
      admin: {
        description: 'Заголовок блока (опционально)',
      },
    },
    {
      name: 'autoGenerate',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Автоматически генерировать оглавление на основе заголовков страницы',
      },
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        description: 'Элементы оглавления (используется, если автогенерация отключена)',
        condition: (data) => data.autoGenerate !== true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: {
            description: 'Текст пункта оглавления',
          },
        },
        {
          name: 'anchor',
          type: 'text',
          required: true,
          admin: {
            description: 'Якорь (ID элемента, например "about-section")',
          },
        },
        {
          name: 'level',
          type: 'select',
          defaultValue: 1,
          options: [
            {
              label: 'Уровень 1',
              value: 1,
            },
            {
              label: 'Уровень 2',
              value: 2,
            },
            {
              label: 'Уровень 3',
              value: 3,
            },
          ],
          admin: {
            description: 'Уровень вложенности',
          },
        },
      ],
    },
    {
      name: 'sticky',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Фиксировать оглавление при прокрутке',
      },
    },
    {
      name: 'showNumbers',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Показывать нумерацию пунктов',
      },
    },
    {
      name: 'maxDepth',
      type: 'select',
      defaultValue: 3,
      options: [
        {
          label: 'Только H1',
          value: 1,
        },
        {
          label: 'H1 и H2',
          value: 2,
        },
        {
          label: 'H1, H2 и H3',
          value: 3,
        },
      ],
      admin: {
        description: 'Максимальный уровень заголовков для отображения',
        condition: (data) => data.autoGenerate === true,
      },
    },
  ],
}
