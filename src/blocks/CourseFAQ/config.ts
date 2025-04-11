import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CourseFAQ: Block = {
  slug: 'courseFAQ',
  interfaceName: 'CourseFAQBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Часто задаваемые вопросы',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
    },
    {
      name: 'relatedCourse',
      type: 'relationship',
      relationTo: 'courses', // Связь с коллекцией курсов
      label: 'Связать с курсом (опционально)',
      admin: {
        description: 'Если выбрать курс, вопросы будут отображаться только на его странице.',
      },
    },
    {
      name: 'questions',
      type: 'array',
      label: 'Вопросы и ответы',
      minRows: 1,
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Вопрос',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          label: 'Ответ',
          editor: lexicalEditor({}),
          required: true,
        },
        {
          name: 'category',
          type: 'text',
          label: 'Категория (опционально)',
          admin: {
            description: 'Для группировки вопросов, если их много',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'accordion',
      options: [
        { label: 'Аккордеон', value: 'accordion' },
        { label: 'Простой список', value: 'list' },
      ],
    },
    {
      name: 'allowMultipleOpen',
      type: 'checkbox',
      label: 'Разрешить открывать несколько вопросов одновременно (для аккордеона)',
      defaultValue: false,
      admin: {
        condition: (data, siblingData) => siblingData?.layout === 'accordion',
      },
    },
    {
      name: 'showCategories',
      type: 'checkbox',
      label: 'Показывать категории вопросов',
      defaultValue: false,
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Цвет фона блока (HEX, rgba)',
    },
  ],
}
