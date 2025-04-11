import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const TargetAudience: Block = {
  slug: 'targetAudience',
  interfaceName: 'TargetAudienceBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Для кого этот курс?',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
    },
    {
      name: 'audienceDescription',
      type: 'richText',
      label: 'Общее описание аудитории',
      editor: lexicalEditor({}),
    },
    {
      name: 'idealFor',
      type: 'array',
      label: 'Идеально подходит для:',
      minRows: 1,
      fields: [
        {
          name: 'icon',
          type: 'text', // Или upload
          label: 'Иконка',
          admin: {
            description: 'Иконка, символизирующая группу (например, fa-user-tie)',
          },
        },
        {
          name: 'groupName',
          type: 'text',
          label: 'Название группы',
          required: true,
          admin: {
            description: 'Например: Начинающие разработчики, Маркетологи, Аналитики данных',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Краткое описание, почему им подходит курс',
        },
      ],
    },
    {
      name: 'prerequisites',
      type: 'group',
      label: 'Необходимые условия/знания',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Заголовок секции',
          defaultValue: 'Что нужно знать перед началом',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Требования',
          fields: [
            {
              name: 'requirement',
              type: 'text',
              label: 'Требование',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'notIdealFor',
      type: 'group',
      label: 'Кому курс может не подойти',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Заголовок секции',
          defaultValue: 'Кому этот курс может не подойти',
        },
        {
          name: 'items',
          type: 'array',
          label: 'Группы/Причины',
          fields: [
            {
              name: 'reason',
              type: 'text',
              label: 'Причина/Группа',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения "Идеально для"',
      defaultValue: 'list',
      options: [
        { label: 'Список с иконками', value: 'list' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Теги', value: 'tags' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Количество колонок (для карточек)',
      defaultValue: '3',
      admin: {
        condition: (data, siblingData) => siblingData?.layout === 'cards',
      },
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
  ],
}
