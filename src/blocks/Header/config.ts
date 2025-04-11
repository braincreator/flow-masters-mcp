import type { Block } from 'payload'

export const Header: Block = {
  slug: 'header',
  interfaceName: 'HeaderBlock',
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Логотип',
      admin: {
        description: 'Логотип для отображения в шапке',
      },
    },
    {
      name: 'navigation',
      type: 'array',
      label: 'Навигация',
      admin: {
        description: 'Пункты меню для отображения в шапке',
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
          name: 'isActive',
          type: 'checkbox',
          label: 'Активная ссылка',
          admin: {
            description: 'Отметьте, если эта ссылка должна быть выделена как активная',
          },
        },
      ],
    },
    {
      name: 'actions',
      type: 'array',
      label: 'Кнопки действий',
      admin: {
        description: 'Кнопки для отображения в шапке',
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
      name: 'style',
      type: 'select',
      label: 'Стиль',
      defaultValue: 'default',
      options: [
        { label: 'По умолчанию', value: 'default' },
        { label: 'Центрированный', value: 'centered' },
        { label: 'Минималистичный', value: 'minimal' },
      ],
    },
    {
      name: 'sticky',
      type: 'select',
      label: 'Фиксация при прокрутке',
      defaultValue: 'none',
      options: [
        { label: 'Нет', value: 'none' },
        { label: 'Всегда', value: 'always' },
        { label: 'После прокрутки', value: 'scrolled' },
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
    singular: 'Шапка',
    plural: 'Шапки',
  },
}
