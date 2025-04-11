import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Tabs: Block = {
  slug: 'tabs',
  interfaceName: 'TabsBlock',
  fields: [
    {
      name: 'tabs',
      type: 'array',
      label: 'Вкладки',
      required: true,
      admin: {
        description: 'Добавьте необходимые вкладки',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Название вкладки',
          required: true,
          admin: {
            description: 'Отображаемое название вкладки',
          },
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Содержимое вкладки',
          editor: lexicalEditor({}),
          required: true,
        },
        {
          name: 'media',
          type: 'upload',
          label: 'Медиа (опционально)',
          relationTo: 'media',
          admin: {
            description: 'Изображение или видео для вкладки (опционально)',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'horizontal',
      options: [
        { label: 'Горизонтальные', value: 'horizontal' },
        { label: 'Вертикальные', value: 'vertical' },
      ],
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Вариант отображения',
      defaultValue: 'default',
      options: [
        { label: 'По умолчанию', value: 'default' },
        { label: 'Таблетки', value: 'pills' },
        { label: 'Боксы', value: 'boxed' },
      ],
    },
    {
      name: 'style',
      type: 'select',
      label: 'Стиль блока',
      defaultValue: 'default',
      options: [
        { label: 'По умолчанию', value: 'default' },
        { label: 'Выделенный', value: 'accent' },
        { label: 'Светлый', value: 'light' },
        { label: 'Темный', value: 'dark' },
      ],
    },
    {
      name: 'size',
      type: 'select',
      label: 'Размер',
      defaultValue: 'md',
      options: [
        { label: 'Маленький', value: 'sm' },
        { label: 'Средний', value: 'md' },
        { label: 'Большой', value: 'lg' },
      ],
    },
    {
      name: 'defaultTab',
      type: 'number',
      label: 'Вкладка по умолчанию',
      defaultValue: 0,
      admin: {
        description: 'Индекс вкладки, которая будет активна по умолчанию (начиная с 0)',
      },
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
    singular: 'Блок с вкладками',
    plural: 'Блоки с вкладками',
  },
}
