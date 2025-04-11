import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок',
      admin: {
        description: 'Заголовок блока статистики',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок блока статистики',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Описание блока статистики',
      },
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Статистика',
      admin: {
        description: 'Добавьте блоки статистики',
      },
      fields: [
        {
          name: 'value',
          type: 'number',
          label: 'Значение',
          required: true,
          admin: {
            description: 'Числовое значение статистики',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Подпись',
          required: true,
          admin: {
            description: 'Текст под числом',
          },
        },
        {
          name: 'description',
          type: 'text',
          label: 'Описание',
          admin: {
            description: 'Дополнительное описание (опционально)',
          },
        },
        {
          name: 'prefix',
          type: 'text',
          label: 'Префикс',
          admin: {
            description: 'Символ перед числом (например, $, ₽)',
          },
        },
        {
          name: 'suffix',
          type: 'text',
          label: 'Суффикс',
          admin: {
            description: 'Символ после числа (например, %, +)',
          },
        },
        {
          name: 'trend',
          type: 'select',
          label: 'Тренд',
          options: [
            { label: 'Нейтральный', value: 'neutral' },
            { label: 'Рост', value: 'up' },
            { label: 'Падение', value: 'down' },
          ],
          admin: {
            description: 'Направление тренда',
          },
        },
        {
          name: 'trendValue',
          type: 'text',
          label: 'Значение тренда',
          admin: {
            description: 'Например, "+15%" или "-3%"',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Тип отображения',
      defaultValue: 'grid',
      options: [
        { label: 'Сетка', value: 'grid' },
        { label: 'Карточки', value: 'cards' },
        { label: 'В строку', value: 'inline' },
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
    singular: 'Блок статистики',
    plural: 'Блоки статистики',
  },
}
