import { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/isAdmin'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { formatPreviewURL } from '@/utilities/formatPreviewURL'
import { revalidatePage } from '@/utilities/revalidatePage'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    group: 'E-commerce',
    useAsTitle: 'title',
    defaultColumns: ['title', 'serviceType', 'price', 'status'],
    preview: (doc, { locale }) => formatPreviewURL('products', doc, locale), // Временно используем products для предпросмотра
  },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'serviceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Консультация', value: 'consultation' },
        // { label: 'Обучение', value: 'training' }, // Закомментировано, так как обучение реализовано через курсы
        { label: 'Разработка', value: 'development' },
        { label: 'Поддержка', value: 'support' },
        { label: 'Аудит ИИ-решений', value: 'audit' },
        { label: 'Интеграция ИИ', value: 'integration' },
        { label: 'Создание контента', value: 'content_creation' },
        { label: 'Автоматизация', value: 'automation' },
        // { label: 'Обучение моделей', value: 'model_training' }, // Дополнительный тип услуги для будущего
        // { label: 'Анализ данных', value: 'data_analysis' }, // Дополнительный тип услуги для будущего
        // { label: 'ИИ-стратегия', value: 'ai_strategy' }, // Дополнительный тип услуги для будущего
        // { label: 'Этика и соответствие', value: 'ethics_compliance' }, // Дополнительный тип услуги для будущего
        // { label: 'Исследования и разработка', value: 'research_development' }, // Дополнительный тип услуги для будущего
        { label: 'Другое', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Тип услуги',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      maxLength: 160,
      localized: true,
      admin: {
        description: 'Краткое описание для карточек услуг (макс. 160 символов)',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Базовая цена в USD',
        position: 'sidebar',
      },
    },
    {
      name: 'isPriceStartingFrom',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Цена является начальной (будет отображаться как "от X")',
        position: 'sidebar',
      },
    },
    {
      name: 'localizedPrices',
      type: 'group',
      admin: {
        description: 'Локализованные цены (переопределяют базовую цену для указанных локалей)',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'ru',
          type: 'number',
          min: 0,
          admin: {
            description: 'Цена в рублях для русской локали',
          },
        },
        // Можно добавить другие локали при необходимости
        {
          name: 'en',
          type: 'number',
          min: 0,
          admin: {
            description: 'Цена в долларах для английской локали (если отличается от базовой)',
          },
        },
      ],
    },
    {
      name: 'duration',
      type: 'number',
      min: 0,
      admin: {
        description: 'Продолжительность в минутах (0 для неограниченной)',
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: false,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Изображение услуги',
      },
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'included',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Включено ли в базовую стоимость',
          },
        },
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
      admin: {
        description: 'Галерея изображений услуги',
      },
    },
    {
      name: 'relatedServices',
      type: 'relationship',
      relationTo: 'services' as const,
      hasMany: true,
      admin: {
        description: 'Связанные услуги',
      },
    },
    {
      name: 'requiresBooking',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Требуется ли бронирование времени для этой услуги',
        position: 'sidebar',
      },
    },
    {
      name: 'bookingSettings',
      type: 'group',
      admin: {
        condition: (data) => data.requiresBooking === true,
      },
      fields: [
        {
          name: 'provider',
          type: 'select',
          options: [
            { label: 'Calendly', value: 'calendly' },
            { label: 'Встроенный календарь', value: 'internal' },
            { label: 'Другой', value: 'other' },
          ],
          defaultValue: 'calendly',
        },
        {
          name: 'calendlyUsername',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'calendly',
            description: 'Имя пользователя Calendly',
          },
        },
        {
          name: 'calendlyEventType',
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'calendly',
            description: 'Тип события Calendly',
          },
        },
        {
          name: 'hideEventTypeDetails',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'calendly',
            description: 'Скрыть детали типа события',
          },
        },
        {
          name: 'hideGdprBanner',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'calendly',
            description: 'Скрыть баннер GDPR',
          },
        },
        {
          name: 'enableAdditionalInfo',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Включить форму дополнительной информации',
          },
        },
        {
          name: 'additionalInfoFields',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.enableAdditionalInfo === true,
            description: 'Поля для дополнительной информации',
          },
          fields: [
            {
              name: 'fieldName',
              type: 'text',
              required: true,
              admin: {
                description: 'Имя поля (латинскими буквами, без пробелов)',
              },
            },
            {
              name: 'fieldLabel',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Название поля',
              },
            },
            {
              name: 'fieldType',
              type: 'select',
              required: true,
              options: [
                { label: 'Текст', value: 'text' },
                { label: 'Текстовая область', value: 'textarea' },
                { label: 'Число', value: 'number' },
                { label: 'Дата', value: 'date' },
                { label: 'Выбор', value: 'select' },
                { label: 'Флажок', value: 'checkbox' },
              ],
              defaultValue: 'text',
            },
            {
              name: 'required',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Обязательное поле',
              },
            },
            {
              name: 'options',
              type: 'array',
              admin: {
                condition: (_, siblingData) => siblingData?.fieldType === 'select',
                description: 'Варианты выбора',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'description',
              type: 'text',
              localized: true,
              admin: {
                description: 'Подсказка для поля',
              },
            },
            {
              name: 'placeholder',
              type: 'text',
              localized: true,
              admin: {
                description: 'Плейсхолдер',
              },
            },
            {
              name: 'sendToCalendly',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                condition: (_, siblingData) => siblingData?.fieldType !== 'checkbox',
                description: 'Отправлять в Calendly как дополнительный вопрос',
              },
            },
          ],
        },
        {
          name: 'additionalInfoTitle',
          type: 'text',
          localized: true,
          admin: {
            condition: (_, siblingData) => siblingData?.enableAdditionalInfo === true,
            description: 'Заголовок формы дополнительной информации',
          },
        },
        {
          name: 'additionalInfoDescription',
          type: 'textarea',
          localized: true,
          admin: {
            condition: (_, siblingData) => siblingData?.enableAdditionalInfo === true,
            description: 'Описание формы дополнительной информации',
          },
        },
        {
          name: 'additionalInfoRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (_, siblingData) => siblingData?.enableAdditionalInfo === true,
            description: 'Обязательно заполнять форму',
          },
        },
      ],
    },
    {
      name: 'requiresPayment',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Требуется ли оплата перед получением услуги',
        position: 'sidebar',
      },
    },
    {
      name: 'paymentSettings',
      type: 'group',
      admin: {
        condition: (data) => data.requiresPayment === true,
      },
      fields: [
        {
          name: 'paymentType',
          type: 'select',
          options: [
            { label: 'Полная предоплата', value: 'full_prepayment' },
            { label: 'Частичная предоплата', value: 'partial_prepayment' },
            { label: 'Оплата после', value: 'post_payment' },
          ],
          defaultValue: 'full_prepayment',
        },
        {
          name: 'prepaymentPercentage',
          type: 'number',
          min: 10,
          max: 100,
          defaultValue: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.paymentType === 'partial_prepayment',
            description: 'Процент предоплаты',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
        { label: 'Архив', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Social Share Image',
        },
      ],
    },
    ...slugField(),
  ],
}
