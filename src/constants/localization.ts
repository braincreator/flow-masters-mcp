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