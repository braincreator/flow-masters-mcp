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
        // Можно использовать существующие блоки или создать новые специфичные
        {
          slug: 'testimonialsRef', // Ссылка на блок Testimonials
          fields: [
            {
              name: 'relation',
              type: 'relationship',
              relationTo: 'testimonials', // Предполагается наличие коллекции testimonials
              label: 'Выберите отзывы',
              hasMany: true,
            },
            {
              name: 'layout',
              type: 'select',
              label: 'Макет отображения отзывов',
              defaultValue: 'carousel',
              options: [
                { label: 'Карусель', value: 'carousel' },
                { label: 'Сетка', value: 'grid' },
                { label: 'Список', value: 'list' },
              ],
            },
          ],
        },
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
        {
          slug: 'statsCounter',
          labels: {
            singular: 'Счетчик',
            plural: 'Счетчики',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок секции счетчиков (опционально)',
            },
            {
              name: 'items',
              type: 'array',
              label: 'Показатели',
              minRows: 1,
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  label: 'Значение (например, 1000+, 95%)',
                  required: true,
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Описание показателя',
                  required: true,
                  admin: {
                    description: 'Например: Довольных студентов, Завершенных проектов',
                  },
                },
                {
                  name: 'icon',
                  type: 'text',
                  label: 'Иконка (опционально)',
                },
              ],
            },
            {
              name: 'layout',
              type: 'select',
              label: 'Макет отображения счетчиков',
              defaultValue: 'grid',
              options: [
                { label: 'Сетка', value: 'grid' },
                { label: 'В ряд', value: 'row' },
              ],
            },
            {
              name: 'columns',
              type: 'select',
              label: 'Количество колонок (для сетки)',
              defaultValue: '3',
              options: ['1', '2', '3', '4'],
              admin: {
                condition: (data, siblingData) => siblingData?.layout === 'grid',
              },
            },
            {
              name: 'animate',
              type: 'checkbox',
              label: 'Анимировать счетчики при появлении',
              defaultValue: true,
            },
          ],
        },
        {
          slug: 'mediaMentions',
          labels: {
            singular: 'Упоминание в СМИ',
            plural: 'Упоминания в СМИ',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Заголовок секции (опционально)',
            },
            {
              name: 'items',
              type: 'array',
              label: 'Логотипы СМИ',
              minRows: 1,
              fields: [
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Логотип СМИ',
                },
                {
                  name: 'name',
                  type: 'text',
                  label: 'Название СМИ',
                },
                {
                  name: 'url',
                  type: 'text',
                  label: 'Ссылка на публикацию (опционально)',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
  ],
}
