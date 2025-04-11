import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Services: Block = {
  slug: 'services',
  interfaceName: 'ServicesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока с услугами',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание услуг',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание предоставляемых услуг',
      },
    },
    {
      name: 'services',
      type: 'array',
      label: 'Услуги',
      admin: {
        description: 'Список предоставляемых услуг',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название услуги',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание услуги',
          editor: lexicalEditor({}),
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Иконка',
          admin: {
            description: 'Название иконки из библиотеки Lucide или другой используемой библиотеки',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Изображение',
          admin: {
            description: 'Иллюстрация услуги (опционально)',
          },
        },
        {
          name: 'features',
          type: 'array',
          label: 'Особенности услуги',
          admin: {
            description: 'Список ключевых особенностей или преимуществ услуги',
          },
          fields: [
            {
              name: 'text',
              type: 'text',
              label: 'Текст',
              required: true,
            },
          ],
        },
        {
          name: 'cta',
          type: 'group',
          label: 'Призыв к действию',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст кнопки',
            },
            {
              name: 'href',
              type: 'text',
              label: 'Ссылка',
            },
            {
              name: 'style',
              type: 'select',
              label: 'Стиль',
              defaultValue: 'primary',
              options: [
                { label: 'Основной', value: 'primary' },
                { label: 'Вторичный', value: 'secondary' },
                { label: 'Контурный', value: 'outline' },
                { label: 'Ссылка', value: 'link' },
              ],
            },
          ],
        },
        {
          name: 'isPopular',
          type: 'checkbox',
          label: 'Популярная услуга',
          admin: {
            description: 'Отметьте, если хотите выделить эту услугу как популярную',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Список', value: 'list' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Вкладки', value: 'tabs' },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      label: 'Количество колонок',
      defaultValue: '3',
      options: [
        { label: '2 колонки', value: '2' },
        { label: '3 колонки', value: '3' },
        { label: '4 колонки', value: '4' },
      ],
      admin: {
        condition: (data) => data.layout === 'grid' || data.layout === 'cards',
        description: 'Количество колонок в сетке или карточках',
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
    singular: 'Блок услуг',
    plural: 'Блоки услуг',
  },
}
