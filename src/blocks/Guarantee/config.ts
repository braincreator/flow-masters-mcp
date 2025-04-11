import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Guarantee: Block = {
  slug: 'guarantee',
  interfaceName: 'GuaranteeBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Наша гарантия',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Иконка/Знак гарантии',
    },
    {
      name: 'guaranteeText',
      type: 'richText',
      label: 'Текст гарантии',
      editor: lexicalEditor({}),
      required: true,
      admin: {
        description: 'Опишите условия гарантии возврата средств или удовлетворенности.',
      },
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Срок действия гарантии',
      admin: {
        description: 'Например: 30 дней, 14 дней, Бессрочно',
      },
    },
    {
      name: 'conditions',
      type: 'array',
      label: 'Условия гарантии (опционально)',
      fields: [
        {
          name: 'condition',
          type: 'text',
          label: 'Условие',
          required: true,
        },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: 'Кнопка (опционально)',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Текст кнопки',
          defaultValue: 'Подробнее об условиях',
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL ссылки',
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет блока',
      defaultValue: 'iconLeft',
      options: [
        { label: 'Иконка слева, текст справа', value: 'iconLeft' },
        { label: 'Иконка сверху, текст снизу', value: 'iconTop' },
        { label: 'Текст слева, иконка справа', value: 'iconRight' },
        { label: 'Без иконки', value: 'textOnly' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
    {
      name: 'borderColor',
      type: 'text',
      label: 'Цвет рамки блока (HEX, rgba)',
    },
    {
      name: 'textColor',
      type: 'text',
      label: 'Цвет текста (HEX, rgba)',
    },
  ],
}
