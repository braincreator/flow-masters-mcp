import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Card: Block = {
  slug: 'card',
  interfaceName: 'CardBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
      admin: {
        description: 'Заголовок карточки',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Содержимое',
      editor: lexicalEditor({}),
      admin: {
        description: 'Текстовое содержимое карточки',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение',
      admin: {
        description: 'Изображение для карточки',
      },
    },
    {
      name: 'action',
      type: 'group',
      label: 'Действие',
      admin: {
        description: 'Кнопка или ссылка для карточки',
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
      name: 'isLink',
      type: 'checkbox',
      label: 'Сделать всю карточку ссылкой',
      defaultValue: false,
      admin: {
        description:
          'Если отмечено, вся карточка будет кликабельной и будет вести по указанной ссылке',
      },
    },
    {
      name: 'style',
      type: 'select',
      label: 'Стиль',
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
      name: 'hover',
      type: 'select',
      label: 'Эффект при наведении',
      defaultValue: 'none',
      options: [
        { label: 'Нет', value: 'none' },
        { label: 'Подъем', value: 'lift' },
        { label: 'Подсветка', value: 'glow' },
        { label: 'Рамка', value: 'border' },
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
    singular: 'Карточка',
    plural: 'Карточки',
  },
}
