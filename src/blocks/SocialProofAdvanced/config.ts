import type { Block } from 'payload'

export const SocialProofAdvanced: Block = {
  slug: 'socialProofAdvanced',
  interfaceName: 'SocialProofAdvancedBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Нам доверяют',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
    },
    {
      name: 'elements',
      type: 'blocks',
      label: 'Элементы социального доказательства',
      minRows: 1,
      blocks: [
        // Временно оставляем только один блок для теста
        // {
        //   slug: 'testimonialsRef',
        //   fields: [ /* ... */ ],
        // },
        {
          slug: 'logos',
          labels: {
            singular: 'Логотипы',
            plural: 'Логотипы',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок секции логотипов (опционально)',
            },
            {
              name: 'items',
              type: 'array',
              label: 'Логотипы компаний/партнеров',
              minRows: 1,
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Логотип',
                },
                {
                  name: 'name',
                  type: 'text',
                  label: 'Название компании (для alt/title)',
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Ссылка (опционально)',
                },
              ],
            },
            {
              name: 'layout',
              type: 'select',
              label: 'Макет отображения логотипов',
              defaultValue: 'grid',
              options: [
                { label: 'Сетка', value: 'grid' },
                { label: 'Карусель', value: 'carousel' },
              ],
            },
            {
              name: 'columns',
              type: 'select',
              label: 'Количество колонок (для сетки)',
              defaultValue: '5',
              options: ['2', '3', '4', '5', '6'],
              admin: {
                condition: (data, siblingData) => siblingData?.layout === 'grid',
              },
            },
          ],
        },
        // {
        //   slug: 'statsCounter',
        //   labels: { /* ... */ },
        //   fields: [ /* ... */ ],
        // },
        // {
        //   slug: 'mediaMentions',
        //   labels: { /* ... */ },
        //   fields: [ /* ... */ ],
        // },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
  ],
}
