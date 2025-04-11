import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CaseStudies: Block = {
  slug: 'caseStudies',
  interfaceName: 'CaseStudiesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока с кейсами',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание кейсов',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание реализованных проектов',
      },
    },
    {
      name: 'cases',
      type: 'array',
      label: 'Кейсы',
      admin: {
        description: 'Список реализованных проектов',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название проекта',
          required: true,
        },
        {
          name: 'client',
          type: 'text',
          label: 'Клиент',
          admin: {
            description: 'Название компании-клиента',
          },
        },
        {
          name: 'summary',
          type: 'textarea',
          label: 'Краткое описание',
          admin: {
            description: 'Краткое описание для отображения в списке кейсов',
          },
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Полное описание',
          editor: lexicalEditor({}),
          admin: {
            description: 'Детальное описание проекта',
          },
        },
        {
          name: 'coverImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Обложка кейса',
          required: true,
          admin: {
            description: 'Основное изображение для кейса',
          },
        },
        {
          name: 'gallery',
          type: 'array',
          label: 'Галерея изображений',
          admin: {
            description: 'Дополнительные изображения проекта',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Изображение',
              required: true,
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Подпись',
            },
          ],
        },
        {
          name: 'tags',
          type: 'array',
          label: 'Теги',
          admin: {
            description: 'Технологии, инструменты или категории проекта',
          },
          fields: [
            {
              name: 'tag',
              type: 'text',
              label: 'Тег',
              required: true,
            },
          ],
        },
        {
          name: 'results',
          type: 'array',
          label: 'Результаты',
          admin: {
            description: 'Ключевые результаты и метрики проекта',
          },
          fields: [
            {
              name: 'metric',
              type: 'text',
              label: 'Метрика',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
              label: 'Описание',
            },
          ],
        },
        {
          name: 'testimonial',
          type: 'group',
          label: 'Отзыв клиента',
          fields: [
            {
              name: 'quote',
              type: 'textarea',
              label: 'Цитата',
              required: true,
            },
            {
              name: 'author',
              type: 'text',
              label: 'Автор',
              required: true,
            },
            {
              name: 'position',
              type: 'text',
              label: 'Должность',
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              label: 'Фото автора',
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
              defaultValue: 'Подробнее',
            },
            {
              name: 'href',
              type: 'text',
              label: 'Ссылка',
            },
          ],
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Избранный кейс',
          admin: {
            description: 'Отметьте, если это один из ключевых проектов',
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
        { label: 'Карусель', value: 'carousel' },
        { label: 'Мозаика', value: 'masonry' },
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
        condition: (data) => data.layout === 'grid' || data.layout === 'masonry',
        description: 'Количество колонок в сетке или мозаике',
      },
    },
    {
      name: 'filterByTags',
      type: 'checkbox',
      label: 'Включить фильтрацию по тегам',
      defaultValue: false,
      admin: {
        description: 'Добавить возможность фильтровать кейсы по тегам',
      },
    },
    {
      name: 'showFeaturedOnly',
      type: 'checkbox',
      label: 'Показывать только избранные кейсы',
      defaultValue: false,
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Лимит отображаемых кейсов',
      defaultValue: 6,
      admin: {
        description: '0 - показать все',
      },
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Настройки отображения',
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
    singular: 'Блок кейсов',
    plural: 'Блоки кейсов',
  },
}
