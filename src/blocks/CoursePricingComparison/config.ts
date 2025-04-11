import type { Block } from 'payload'

export const CoursePricingComparison: Block = {
  slug: 'coursePricingComparison',
  interfaceName: 'CoursePricingComparisonBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Заголовок блока',
      defaultValue: 'Выберите подходящий тариф',
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
      label: 'Курс, к которому относятся тарифы (опционально)',
      admin: {
        description: 'Для автоматического заполнения названия курса или фильтрации тарифов',
      },
    },
    {
      name: 'plans',
      type: 'array',
      label: 'Тарифные планы',
      minRows: 1,
      maxRows: 4, // Ограничим 4 для удобного отображения
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Название тарифа',
          required: true,
          admin: {
            description: 'Например: Стандарт, Премиум, VIP',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Краткое описание тарифа',
        },
        {
          name: 'price',
          type: 'text',
          label: 'Цена',
          required: true,
          admin: {
            description: 'Например: 10000 руб, $99, Бесплатно',
          },
        },
        {
          name: 'priceSuffix',
          type: 'text',
          label: 'Суффикс цены (опционально)',
          admin: {
            description: 'Например: /мес, единоразово',
          },
        },
        {
          name: 'features',
          type: 'array',
          label: 'Включенные возможности/модули',
          fields: [
            {
              name: 'feature',
              type: 'text',
              label: 'Возможность',
              required: true,
            },
            {
              name: 'included',
              type: 'checkbox',
              label: 'Включено',
              defaultValue: true,
            },
            {
              name: 'details',
              type: 'text',
              label: 'Детали (опционально)',
              admin: {
                description: 'Например: "До 10 проектов", "Базовый уровень"',
              },
            },
          ],
        },
        {
          name: 'ctaButton',
          type: 'group',
          label: 'Кнопка призыва к действию',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Текст кнопки',
              required: true,
              defaultValue: 'Выбрать тариф',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL ссылки (оплата, регистрация)',
              required: true,
            },
          ],
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          label: 'Выделенный тариф',
          defaultValue: false,
          admin: {
            description: 'Пометить как рекомендуемый или самый популярный',
          },
        },
        {
          name: 'badgeText',
          type: 'text',
          label: 'Текст значка (опционально)',
          admin: {
            condition: (data, siblingData) => siblingData.isFeatured,
            description: 'Например: "Популярный", "Лучший выбор"',
          },
        },
      ],
    },
    {
      name: 'displaySettings',
      type: 'group',
      label: 'Настройки отображения',
      fields: [
        {
          name: 'showDescriptions',
          type: 'checkbox',
          label: 'Показывать описания тарифов',
          defaultValue: true,
        },
        {
          name: 'showFeatures',
          type: 'checkbox',
          label: 'Показывать список возможностей',
          defaultValue: true,
        },
        {
          name: 'highlightFeatured',
          type: 'checkbox',
          label: 'Визуально выделять рекомендуемый тариф',
          defaultValue: true,
        },
        {
          name: 'comparisonMode',
          type: 'checkbox',
          label: 'Включить режим сравнения (показать все возможности для всех тарифов)',
          defaultValue: false,
        },
        {
          name: 'featuresAlignment',
          type: 'select',
          label: 'Выравнивание текста возможностей',
          defaultValue: 'left',
          options: [
            { label: 'По левому краю', value: 'left' },
            { label: 'По центру', value: 'center' },
          ],
        },
        {
          name: 'backgroundColor',
          type: 'text',
          label: 'Цвет фона блока (HEX, rgba)',
        },
      ],
    },
  ],
}
