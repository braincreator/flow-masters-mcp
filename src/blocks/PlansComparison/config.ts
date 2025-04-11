import type { Block } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const PlansComparison: Block = {
  slug: 'plansComparison',
  interfaceName: 'PlansComparisonBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      admin: {
        description: 'Основной заголовок блока сравнения планов',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Подзаголовок',
      admin: {
        description: 'Подзаголовок или краткое описание',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Описание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Общее описание предлагаемых планов',
      },
    },
    {
      name: 'switchLabels',
      type: 'group',
      label: 'Метки переключателя (опционально)',
      admin: {
        description: 'Для переключения между разными типами планов (например, месячные/годовые)',
      },
      fields: [
        {
          name: 'firstOption',
          type: 'text',
          label: 'Первая опция',
          defaultValue: 'Месячная оплата',
        },
        {
          name: 'secondOption',
          type: 'text',
          label: 'Вторая опция',
          defaultValue: 'Годовая оплата',
        },
        {
          name: 'showDiscount',
          type: 'checkbox',
          label: 'Показать скидку',
          defaultValue: true,
        },
        {
          name: 'discountText',
          type: 'text',
          label: 'Текст скидки',
          defaultValue: 'Экономия 20%',
          admin: {
            condition: (data, siblingData) => siblingData.showDiscount,
          },
        },
      ],
    },
    {
      name: 'plans',
      type: 'array',
      label: 'Планы',
      admin: {
        description: 'Планы или тарифы для сравнения',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название плана',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Описание плана',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Иконка',
          admin: {
            description: 'Название иконки из библиотеки (например, "Zap" из Lucide)',
          },
        },
        {
          name: 'monthlyPrice',
          type: 'group',
          label: 'Месячная стоимость',
          fields: [
            {
              name: 'value',
              type: 'number',
              label: 'Значение',
              required: true,
            },
            {
              name: 'currency',
              type: 'select',
              label: 'Валюта',
              defaultValue: 'RUB',
              options: [
                { label: 'Рубли (₽)', value: 'RUB' },
                { label: 'Доллары ($)', value: 'USD' },
                { label: 'Евро (€)', value: 'EUR' },
              ],
            },
            {
              name: 'suffix',
              type: 'text',
              label: 'Суффикс',
              defaultValue: '/мес',
            },
            {
              name: 'strikethroughPrice',
              type: 'number',
              label: 'Перечеркнутая цена',
              admin: {
                description: 'Для отображения скидки (оставьте пустым, если нет скидки)',
              },
            },
          ],
        },
        {
          name: 'yearlyPrice',
          type: 'group',
          label: 'Годовая стоимость',
          fields: [
            {
              name: 'value',
              type: 'number',
              label: 'Значение',
              required: true,
            },
            {
              name: 'currency',
              type: 'select',
              label: 'Валюта',
              defaultValue: 'RUB',
              options: [
                { label: 'Рубли (₽)', value: 'RUB' },
                { label: 'Доллары ($)', value: 'USD' },
                { label: 'Евро (€)', value: 'EUR' },
              ],
            },
            {
              name: 'suffix',
              type: 'text',
              label: 'Суффикс',
              defaultValue: '/год',
            },
            {
              name: 'strikethroughPrice',
              type: 'number',
              label: 'Перечеркнутая цена',
              admin: {
                description: 'Для отображения скидки (оставьте пустым, если нет скидки)',
              },
            },
            {
              name: 'monthlyEquivalent',
              type: 'checkbox',
              label: 'Показать месячный эквивалент',
              defaultValue: true,
            },
          ],
        },
        {
          name: 'features',
          type: 'array',
          label: 'Возможности',
          admin: {
            description: 'Список возможностей, включенных в план',
          },
          fields: [
            {
              name: 'feature',
              type: 'text',
              label: 'Возможность',
              required: true,
            },
            {
              name: 'included',
              type: 'select',
              label: 'Включено',
              defaultValue: 'yes',
              options: [
                { label: 'Да', value: 'yes' },
                { label: 'Нет', value: 'no' },
                { label: 'Частично', value: 'partial' },
                { label: 'Пользовательское значение', value: 'custom' },
              ],
            },
            {
              name: 'customValue',
              type: 'text',
              label: 'Пользовательское значение',
              admin: {
                condition: (data, siblingData) => siblingData.included === 'custom',
                description: 'Например: "До 10 пользователей", "5 ГБ"',
              },
            },
            {
              name: 'highlight',
              type: 'checkbox',
              label: 'Выделить',
              defaultValue: false,
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
              defaultValue: 'Выбрать план',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL',
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
          label: 'Популярный план',
          defaultValue: false,
          admin: {
            description: 'Отметьте, чтобы выделить этот план как популярный выбор',
          },
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Бейдж',
          admin: {
            description: 'Например: "Популярный", "Лучший выбор", "Распродажа"',
          },
        },
      ],
    },
    {
      name: 'featureCategories',
      type: 'array',
      label: 'Категории возможностей',
      admin: {
        description: 'Группировать возможности по категориям (опционально)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название категории',
          required: true,
        },
        {
          name: 'features',
          type: 'array',
          label: 'Возможности',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Название возможности',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Описание',
              admin: {
                description: 'Пояснение к возможности (отображается при наведении)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'disclaimer',
      type: 'richText',
      label: 'Примечание',
      editor: lexicalEditor({}),
      admin: {
        description: 'Мелкий текст или примечание под таблицей планов',
      },
    },
    {
      name: 'layout',
      type: 'select',
      label: 'Макет отображения',
      defaultValue: 'table',
      options: [
        { label: 'Таблица', value: 'table' },
        { label: 'Карточки', value: 'cards' },
        { label: 'Сетка', value: 'grid' },
      ],
    },
    {
      name: 'showFeatureComparison',
      type: 'checkbox',
      label: 'Показать сравнение возможностей',
      defaultValue: true,
      admin: {
        description: 'Включить детальное сравнение функций',
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
    singular: 'Блок сравнения планов',
    plural: 'Блоки сравнения планов',
  },
}
