import type { CollectionConfig } from 'payload/types'
import { isAdmin } from '@/access/isAdmin'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
/**
 * Коллекция для управления пикселями аналитики и рекламы
 * Позволяет настраивать через админку различные пиксели:
 * - VK Pixel
 * - Facebook Pixel
 * - Google Analytics
 * - Yandex Metrica
 * - Google Ads
 * - TikTok Pixel
 * И другие
 */
export const Pixels: CollectionConfig = {
  slug: 'pixels',
  labels: {
    singular: 'Pixel',
    plural: 'Pixels',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'pixelId', 'isActive', 'placement'],
    group: 'Marketing',
    description: 'Управление пикселями аналитики и рекламных платформ',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Название',
      admin: {
        description: 'Название пикселя для удобства управления',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Тип пикселя',
      options: [
        { label: 'VK Pixel', value: 'vk' },
        { label: 'Facebook Pixel', value: 'facebook' },
        { label: 'Google Analytics 4', value: 'ga4' },
        { label: 'Google Analytics Universal', value: 'ga_universal' },
        { label: 'Yandex Metrica', value: 'yandex_metrica' },
        { label: 'Google Ads', value: 'google_ads' },
        { label: 'TikTok Pixel', value: 'tiktok' },
        { label: 'Twitter Pixel', value: 'twitter' },
        { label: 'LinkedIn Insight Tag', value: 'linkedin' },
        { label: 'Snapchat Pixel', value: 'snapchat' },
        { label: 'Pinterest Tag', value: 'pinterest' },
        { label: 'Custom Script', value: 'custom' },
      ],
      admin: {
        description: 'Выберите тип пикселя или платформы',
      },
    },
    {
      name: 'pixelId',
      type: 'text',
      required: true,
      label: 'ID пикселя',
      admin: {
        description: 'ID пикселя или код отслеживания (например, для VK: VK-RTRG-XXXXXX-XXXXX)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Активен',
      admin: {
        description: 'Включить/выключить пиксель',
        position: 'sidebar',
      },
    },
    {
      name: 'placement',
      type: 'select',
      required: true,
      defaultValue: 'head',
      label: 'Размещение',
      options: [
        { label: 'В <head>', value: 'head' },
        { label: 'В начале <body>', value: 'body_start' },
        { label: 'В конце <body>', value: 'body_end' },
      ],
      admin: {
        description: 'Где разместить код пикселя на странице',
        position: 'sidebar',
      },
    },
    {
      name: 'pages',
      type: 'select',
      hasMany: true,
      label: 'Страницы',
      options: [
        { label: 'Все страницы', value: 'all' },
        { label: 'Главная страница', value: 'home' },
        { label: 'Страницы продуктов', value: 'products' },
        { label: 'Страницы услуг', value: 'services' },
        { label: 'Страницы блога', value: 'blog' },
        { label: 'Страница контактов', value: 'contacts' },
        { label: 'Страница "О нас"', value: 'about' },
        { label: 'Страницы форм', value: 'forms' },
        { label: 'Страницы оплаты', value: 'checkout' },
        { label: 'Страницы благодарности', value: 'thank_you' },
      ],
      defaultValue: ['all'],
      admin: {
        description: 'На каких страницах показывать пиксель',
      },
    },
    // Настройки для конкретных типов пикселей
    {
      name: 'vkSettings',
      type: 'group',
      label: 'Настройки VK Pixel',
      admin: {
        condition: (data) => data.type === 'vk',
        description: 'Дополнительные настройки для VK пикселя',
      },
      fields: [
        {
          name: 'trackPageView',
          type: 'checkbox',
          defaultValue: true,
          label: 'Отслеживать просмотры страниц',
        },
        {
          name: 'trackEvents',
          type: 'checkbox',
          defaultValue: true,
          label: 'Отслеживать события',
        },
        {
          name: 'customEvents',
          type: 'array',
          label: 'Пользовательские события',
          fields: [
            {
              name: 'eventName',
              type: 'text',
              required: true,
              label: 'Название события',
            },
            {
              name: 'trigger',
              type: 'select',
              required: true,
              label: 'Триггер',
              options: [
                { label: 'Загрузка страницы', value: 'page_load' },
                { label: 'Клик по кнопке', value: 'button_click' },
                { label: 'Отправка формы', value: 'form_submit' },
                { label: 'Скролл страницы', value: 'scroll' },
              ],
            },
            {
              name: 'selector',
              type: 'text',
              label: 'CSS селектор',
              admin: {
                condition: (data, siblingData) => 
                  siblingData.trigger === 'button_click' || siblingData.trigger === 'form_submit',
                description: 'CSS селектор элемента (для кликов и форм)',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'facebookSettings',
      type: 'group',
      label: 'Настройки Facebook Pixel',
      admin: {
        condition: (data) => data.type === 'facebook',
        description: 'Дополнительные настройки для Facebook пикселя',
      },
      fields: [
        {
          name: 'trackPageView',
          type: 'checkbox',
          defaultValue: true,
          label: 'Отслеживать просмотры страниц',
        },
        {
          name: 'advancedMatching',
          type: 'checkbox',
          defaultValue: false,
          label: 'Расширенное сопоставление',
        },
        {
          name: 'standardEvents',
          type: 'select',
          hasMany: true,
          label: 'Стандартные события',
          options: [
            { label: 'Purchase', value: 'Purchase' },
            { label: 'Lead', value: 'Lead' },
            { label: 'CompleteRegistration', value: 'CompleteRegistration' },
            { label: 'AddToCart', value: 'AddToCart' },
            { label: 'InitiateCheckout', value: 'InitiateCheckout' },
            { label: 'ViewContent', value: 'ViewContent' },
            { label: 'Search', value: 'Search' },
            { label: 'Contact', value: 'Contact' },
          ],
        },
      ],
    },
    {
      name: 'ga4Settings',
      type: 'group',
      label: 'Настройки Google Analytics 4',
      admin: {
        condition: (data) => data.type === 'ga4',
        description: 'Настройки для Google Analytics 4',
      },
      fields: [
        {
          name: 'measurementId',
          type: 'text',
          label: 'Measurement ID',
          admin: {
            description: 'ID измерения GA4 (G-XXXXXXXXXX)',
          },
        },
        {
          name: 'enhancedEcommerce',
          type: 'checkbox',
          defaultValue: false,
          label: 'Расширенная электронная торговля',
        },
        {
          name: 'customDimensions',
          type: 'array',
          label: 'Пользовательские параметры',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Название параметра',
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Значение',
            },
          ],
        },
      ],
    },
    {
      name: 'yandexSettings',
      type: 'group',
      label: 'Настройки Yandex Metrica',
      admin: {
        condition: (data) => data.type === 'yandex_metrica',
        description: 'Настройки для Яндекс.Метрики',
      },
      fields: [
        {
          name: 'clickmap',
          type: 'checkbox',
          defaultValue: true,
          label: 'Карта кликов',
        },
        {
          name: 'trackLinks',
          type: 'checkbox',
          defaultValue: true,
          label: 'Отслеживание ссылок',
        },
        {
          name: 'accurateTrackBounce',
          type: 'checkbox',
          defaultValue: true,
          label: 'Точный показатель отказов',
        },
        {
          name: 'webvisor',
          type: 'checkbox',
          defaultValue: false,
          label: 'Вебвизор',
        },
        {
          name: 'ecommerce',
          type: 'checkbox',
          defaultValue: false,
          label: 'Электронная торговля',
        },
      ],
    },
    {
      name: 'customScript',
      type: 'textarea',
      label: 'Пользовательский скрипт',
      admin: {
        condition: (data) => data.type === 'custom',
        description: 'HTML/JavaScript код для пользовательского пикселя',
        rows: 10,
      },
    },
    // Общие настройки
    {
      name: 'loadPriority',
      type: 'select',
      defaultValue: 'normal',
      label: 'Приоритет загрузки',
      options: [
        { label: 'Высокий', value: 'high' },
        { label: 'Обычный', value: 'normal' },
        { label: 'Низкий', value: 'low' },
      ],
      admin: {
        description: 'Приоритет загрузки пикселя',
        position: 'sidebar',
      },
    },
    {
      name: 'loadAsync',
      type: 'checkbox',
      defaultValue: true,
      label: 'Асинхронная загрузка',
      admin: {
        description: 'Загружать пиксель асинхронно',
        position: 'sidebar',
      },
    },
    {
      name: 'gdprCompliant',
      type: 'checkbox',
      defaultValue: true,
      label: 'Соответствие GDPR',
      admin: {
        description: 'Учитывать согласие пользователя на cookies',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      admin: {
        description: 'Описание назначения пикселя',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Валидация ID пикселя в зависимости от типа
        if (data.type && data.pixelId) {
          const isValid = validatePixelId(data.type, data.pixelId)
          if (!isValid) {
            throw new Error(`Invalid pixel ID format for ${data.type}`)
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Логируем изменения пикселей
        logDebug(`Pixel ${operation}: ${doc.name} (${doc.type})`)
        
        // Можно добавить очистку кэша или перегенерацию статических файлов
        if (operation === 'create' || operation === 'update') {
          // TODO: Очистить кэш пикселей
          // TODO: Уведомить о необходимости обновления сайта
        }
      },
    ],
  },
}

/**
 * Валидация ID пикселя в зависимости от типа
 */
function validatePixelId(type: string, pixelId: string): boolean {
  switch (type) {
    case 'vk':
      return /^VK-RTRG-\d+-[A-Z0-9]+$/.test(pixelId)
    case 'facebook':
      return /^\d{15,16}$/.test(pixelId)
    case 'ga4':
      return /^G-[A-Z0-9]{10}$/.test(pixelId)
    case 'ga_universal':
      return /^UA-\d+-\d+$/.test(pixelId)
    case 'yandex_metrica':
      return /^\d{8,9}$/.test(pixelId)
    case 'google_ads':
      return /^AW-\d{9,11}$/.test(pixelId)
    case 'tiktok':
      return /^[A-Z0-9]{20}$/.test(pixelId)
    default:
      return true // Для custom и других типов не валидируем
  }
}
