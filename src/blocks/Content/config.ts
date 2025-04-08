import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  BlocksFeature,
} from '@payloadcms/richtext-lexical'

import { actionGroup } from '@/fields/actionGroup'
import { Banner } from '../Banner/config'
import { MediaBlock } from '../MediaBlock/config'
import { Code } from '../Code/config'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'verticalAlignment',
    type: 'select',
    label: 'Вертикальное выравнивание',
    defaultValue: 'top',
    options: [
      { label: 'Сверху', value: 'top' },
      { label: 'По центру', value: 'center' },
      { label: 'Снизу', value: 'bottom' },
    ],
  },
  {
    name: 'horizontalAlignment',
    type: 'select',
    label: 'Горизонтальное выравнивание',
    defaultValue: 'left',
    options: [
      { label: 'Слева', value: 'left' },
      { label: 'По центру', value: 'center' },
      { label: 'Справа', value: 'right' },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BlocksFeature({
            blocks: [Banner, MediaBlock, Code],
          }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableActions',
    type: 'checkbox',
  },
  actionGroup({
    overrides: {
      admin: {
        condition: (_, { enableActions }) => Boolean(enableActions),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    // Заголовок блока (опционально)
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока (опционально)',
      admin: {
        description: 'Если указан, будет отображаться над колонками',
      },
    },
    // Подзаголовок блока (опционально)
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок блока (опционально)',
      admin: {
        description: 'Если указан, будет отображаться под заголовком',
      },
    },
    // Колонки с контентом
    {
      name: 'columns',
      type: 'array',
      label: 'Колонки с контентом',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
    // Настройки отображения
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
          name: 'textAlignment',
          type: 'select',
          label: 'Выравнивание текста',
          defaultValue: 'left',
          options: [
            { label: 'По левому краю', value: 'left' },
            { label: 'По центру', value: 'center' },
            { label: 'По правому краю', value: 'right' },
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
    singular: 'Блок с контентом',
    plural: 'Блоки с контентом',
  },
}
