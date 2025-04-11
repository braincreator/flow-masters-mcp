import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Footer: Block = {
  slug: 'footer',
  interfaceName: 'FooterBlock',
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Логотип',
      admin: {
        description: 'Логотип для отображения в футере',
      },
    },
    {
      name: 'copyright',
      type: 'richText',
      label: 'Копирайт',
      editor: lexicalEditor({}),
      admin: {
        description: 'Текст копирайта и правовая информация',
      },
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Колонки ссылок',
      admin: {
        description: 'Колонки с ссылками для отображения в футере',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок колонки',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          label: 'Ссылки',
          admin: {
            description: 'Список ссылок в колонке',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              label: 'Ссылка',
              required: true,
            },
            {
              name: 'isExternal',
              type: 'checkbox',
              label: 'Внешняя ссылка',
              admin: {
                description: 'Отметьте, если ссылка ведет на внешний ресурс',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'social',
      type: 'array',
      label: 'Социальные сети',
      admin: {
        description: 'Ссылки на социальные сети',
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Платформа',
          required: true,
          options: [
            { label: 'Twitter', value: 'twitter' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'GitHub', value: 'github' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Схема расположения',
      defaultValue: 'columns',
      options: [
        { label: 'Колонки', value: 'columns' },
        { label: 'Простой', value: 'simple' },
        { label: 'Центрированный', value: 'centered' },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: 'Стиль',
      defaultValue: 'default',
      options: [
        { label: 'По умолчанию', value: 'default' },
        { label: 'Минималистичный', value: 'minimal' },
        { label: 'Темный', value: 'dark' },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
      admin: {
        description: 'Дополнительные настройки для блока',
      },
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          label: 'Цвет фона',
          defaultValue: 'transparent',
          options: [
            { label: 'Прозрачный', value: 'transparent' },
            { label: 'Светлый', value: 'light' },
            { label: 'Темный', value: 'dark' },
            { label: 'Акцентный', value: 'accent' },
          ],
        },
        {
          name: 'paddingTop',
          type: 'select',
          label: 'Отступ сверху',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'paddingBottom',
          type: 'select',
          label: 'Отступ снизу',
          defaultValue: 'medium',
          options: [
            { label: 'Нет', value: 'none' },
            { label: 'Маленький', value: 'small' },
            { label: 'Средний', value: 'medium' },
            { label: 'Большой', value: 'large' },
          ],
        },
        {
          name: 'containerWidth',
          type: 'select',
          label: 'Ширина контейнера',
          defaultValue: 'default',
          options: [
            { label: 'По умолчанию', value: 'default' },
            { label: 'Узкий', value: 'narrow' },
            { label: 'Широкий', value: 'wide' },
            { label: 'Полный', value: 'full' },
          ],
        },
      ],
    },
  ],
  labels: {
    singular: 'Футер',
    plural: 'Футеры',
  },
}
