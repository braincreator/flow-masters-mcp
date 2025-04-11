import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const BenefitsOutcomes: Block = {
  slug: 'benefitsOutcomes',
  interfaceName: 'BenefitsOutcomesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Что вы получите',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание преимуществ или результатов',
      },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Преимущества/Результаты',
      minRows: 2,
      fields: [
        {
          name: 'icon',
          type: 'text', // Или upload, если используете кастомные иконки
          label: 'Иконка',
          admin: {
            description: 'Название иконки (например, из Font Awesome) или URL',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Заголовок пункта',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание пункта',
          required: true,
        },
        {
          name: 'link',
          type: 'group',
          label: 'Ссылка (опционально)',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст ссылки',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL ссылки',
            },
          ],
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения пунктов',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список с иконками', value: 'listWithIcons' },
        { label: 'Список с нумерацией', value: 'numberedList' },
        { label: 'Карточки', value: 'cards' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Количество колонок (для сетки/карточек)',
      defaultValue: '3',
      admin: {
        condition: (data, siblingData) =>
          siblingData?.layout === 'grid' || siblingData?.layout === 'cards',
      },
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      name: 'alignment',
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
      name: 'iconPosition',
      type: 'select',
      label: 'Позиция иконки (для списка)',
      defaultValue: 'left',
      admin: {
        condition: (data, siblingData) => siblingData?.layout === 'listWithIcons',
      },
      options: [
        { label: 'Слева от текста', value: 'left' },
        { label: 'Над текстом', value: 'top' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
    {
      name: 'itemBackgroundColor',
      type: 'text',
      label: 'Цвет фона элемента (для карточек) (HEX, rgba)',
      admin: {
        condition: (data, siblingData) => siblingData?.layout === 'cards',
      },
    },
  ],
}
