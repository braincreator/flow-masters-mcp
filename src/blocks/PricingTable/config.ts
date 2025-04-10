import { Block } from 'payload/types'
import { blockFields } from '../fields'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const PricingTable: Block = {
  slug: 'pricingTable',
  labels: {
    singular: 'Таблица цен',
    plural: 'Таблицы цен',
  },
  graphQL: {
    singularName: 'PricingTableBlock',
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
        description: 'Описание (опционально)',
      },
    },
    {
      name: 'plans',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        description: 'Тарифные планы',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Название тарифа',
          },
        },
        {
          name: 'price',
          type: 'text',
          required: true,
          admin: {
            description: 'Цена (например, "9900" или "Бесплатно")',
          },
        },
        {
          name: 'interval',
          type: 'text',
          admin: {
            description: 'Интервал оплаты (например, "/месяц", "/год")',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Краткое описание тарифа',
          },
        },
        {
          name: 'features',
          type: 'array',
          admin: {
            description: 'Список функций',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'included',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Функция включена в тариф',
              },
            },
          ],
        },
        {
          name: 'isPopular',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Отметить как популярный тариф',
          },
        },
        {
          name: 'actions',
          type: 'array',
          maxRows: 2,
          admin: {
            description: 'Кнопки',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'primary',
              options: [
                {
                  label: 'Основная',
                  value: 'primary',
                },
                {
                  label: 'Вторичная',
                  value: 'secondary',
                },
                {
                  label: 'Контур',
                  value: 'outline',
                },
                {
                  label: 'Ссылка',
                  value: 'link',
                },
              ],
            },
          ],
        },
      ],
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
          label: 'Сетка',
          value: 'grid',
        },
        {
          label: 'Компактный',
          value: 'compact',
        },
      ],
    },
  ],
}
