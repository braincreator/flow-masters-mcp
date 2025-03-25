import type { ProductType, ProductFeatureKey, SupportedLocale } from '@/types/constants'

export const LOCALES = {
  EN: 'en',
  RU: 'ru',
} as const

export const LOCALE_LABELS = {
  [LOCALES.EN]: 'English',
  [LOCALES.RU]: 'Russian',
} as const

export const DEFAULT_LOCALE = LOCALES.RU

export const TIMEZONES = {
  MOSCOW: 'Europe/Moscow',
  LONDON: 'Europe/London',
  NEW_YORK: 'America/New_York',
  TOKYO: 'Asia/Tokyo',
} as const

export const DEFAULT_TIMEZONE = TIMEZONES.MOSCOW

export const PRODUCT_TYPE_LABELS: Record<SupportedLocale, Record<ProductType, string>> = {
  en: {
    digital: 'Digital Product',
    subscription: 'Subscription',
    service: 'Service',
    access: 'Feature Access',
  },
  ru: {
    digital: 'Цифровой продукт',
    subscription: 'Подписка',
    service: 'Услуга',
    access: 'Доступ к функциям',
  },
}

export const PRODUCT_FEATURE_LABELS: Record<SupportedLocale, Record<ProductFeatureKey, string>> = {
  en: {
    'instant-delivery': 'Instant Delivery',
    'download': 'Download',
    'no-shipping': 'No Shipping Required',
    'shipping': 'Shipping',
    'inventory': 'Inventory Management',
    'tracking': 'Order Tracking',
    'recurring-billing': 'Recurring Billing',
    'access-control': 'Access Control',
    'updates': 'Regular Updates',
    'booking': 'Booking System',
    'scheduling': 'Scheduling',
    'custom-delivery': 'Custom Delivery',
    'instant-activation': 'Instant Activation',
    'feature-gating': 'Feature Gating',
  },
  ru: {
    'instant-delivery': 'Мгновенная доставка',
    'download': 'Скачивание',
    'no-shipping': 'Без доставки',
    'shipping': 'Доставка',
    'inventory': 'Управление запасами',
    'tracking': 'Отслеживание заказа',
    'recurring-billing': 'Регулярные платежи',
    'access-control': 'Контроль доступа',
    'updates': 'Регулярные обновления',
    'booking': 'Система бронирования',
    'scheduling': 'Планирование',
    'custom-delivery': 'Индивидуальная доставка',
    'instant-activation': 'Мгновенная активация',
    'feature-gating': 'Управление доступом',
  },
}
