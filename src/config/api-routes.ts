/**
 * Централизованная конфигурация API routes
 * 
 * Этот файл обеспечивает единую точку управления всеми API путями
 * и позволяет легко переключаться между версиями API
 */

// Конфигурация версионирования API
export const API_CONFIG = {
  // Основная версия API (можно изменить на '' для удаления версионирования)
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || '',
  
  // Базовый путь API
  BASE_PATH: '/api',
  
  // Режим совместимости (поддержка старых путей)
  COMPATIBILITY_MODE: process.env.NEXT_PUBLIC_API_COMPATIBILITY === 'true',
  
  // Автоматические редиректы со старых путей
  AUTO_REDIRECT: process.env.NEXT_PUBLIC_API_AUTO_REDIRECT !== 'false',
} as const

// Функция для построения API пути
export function buildApiPath(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (API_CONFIG.VERSION) {
    return `${API_CONFIG.BASE_PATH}/${API_CONFIG.VERSION}/${cleanEndpoint}`
  }
  
  return `${API_CONFIG.BASE_PATH}/${cleanEndpoint}`
}

// Функция для построения пути без версии
export function buildApiPathV2(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_CONFIG.BASE_PATH}/${cleanEndpoint}`
}

// Основные API endpoints
export const API_ENDPOINTS = {
  // Аутентификация и пользователи
  AUTH: {
    LOGIN: buildApiPath('auth/login'),
    LOGOUT: buildApiPath('auth/logout'),
    REGISTER: buildApiPath('auth/register'),
    REFRESH: buildApiPath('auth/refresh'),
    ME: buildApiPath('auth/me'),
  },
  
  // Пользователи
  USERS: {
    LIST: buildApiPath('users'),
    DETAIL: (id: string) => buildApiPath(`users/${id}`),
    UPDATE: (id: string) => buildApiPath(`users/${id}`),
    DELETE: (id: string) => buildApiPath(`users/${id}`),
    FORGOT_PASSWORD: buildApiPath('users/forgot-password'),
    RESET_PASSWORD: buildApiPath('users/reset-password'),
    NOTIFICATION_PREFERENCES: buildApiPath('users/notification-preferences'),
  },
  
  // Продукты
  PRODUCTS: {
    LIST: buildApiPath('products'),
    DETAIL: (id: string) => buildApiPath(`products/${id}`),
    CREATE: buildApiPath('products'),
    UPDATE: (id: string) => buildApiPath(`products/${id}`),
    DELETE: (id: string) => buildApiPath(`products/${id}`),
    SEARCH: buildApiPath('products/search'),
  },
  
  // Заказы
  ORDERS: {
    LIST: buildApiPath('orders'),
    DETAIL: (id: string) => buildApiPath(`orders/${id}`),
    CREATE: buildApiPath('orders'),
    UPDATE: (id: string) => buildApiPath(`orders/${id}`),
    DELETE: (id: string) => buildApiPath(`orders/${id}`),
  },
  
  // Корзина
  CART: {
    GET: buildApiPath('cart'),
    ADD: buildApiPath('cart'),
    UPDATE: buildApiPath('cart'),
    REMOVE: buildApiPath('cart/remove-item'),
    CLEAR: buildApiPath('cart/clear'),
  },
  
  // Категории
  CATEGORIES: {
    LIST: buildApiPath('categories'),
    DETAIL: (id: string) => buildApiPath(`categories/${id}`),
    TYPES: buildApiPath('category-types'),
  },
  
  // Теги
  TAGS: {
    LIST: buildApiPath('tags'),
    DETAIL: (id: string) => buildApiPath(`tags/${id}`),
  },
  
  // Блог
  BLOG: {
    POSTS: buildApiPath('blog/posts'),
    POST_DETAIL: (id: string) => buildApiPath(`blog/posts/${id}`),
    CATEGORIES: buildApiPath('blog/categories'),
  },
  
  // Сервисы
  SERVICES: {
    LIST: buildApiPath('services'),
    DETAIL: (id: string) => buildApiPath(`services/${id}`),
  },
  
  // Подписки
  SUBSCRIPTION: {
    PLANS: buildApiPath('subscription/plans'),
    PLAN_DETAIL: (id: string) => buildApiPath(`subscription/plans/${id}`),
  },
  
  // Платежи
  PAYMENT: {
    YOOMONEY: {
      CALLBACK: '/api/payment/yoomoney/callback', // Без версии
      NOTIFICATION: '/api/payment/yoomoney/notification',
    },
    ROBOKASSA: {
      CALLBACK: '/api/payment/robokassa/callback',
      RESULT: '/api/payment/robokassa/result',
    },
    VALIDATE_DISCOUNT: buildApiPath('validate-discount'),
  },
  
  // Системные endpoints
  SYSTEM: {
    HEALTH: buildApiPath('health'),
    MONITORING: buildApiPath('monitoring'),
    REVALIDATE: buildApiPath('revalidate'),
  },
  
  // AI и автоматизация
  AI: {
    PROVIDERS: buildApiPath('ai/providers'),
    MODELS: (provider: string) => buildApiPath(`ai/providers/${provider}/models`),
    CHAT: buildApiPath('ai/chat'),
  },
  
  // Глобальные настройки
  GLOBALS: buildApiPath('globals'),
  
  // Контакты и формы
  CONTACT: buildApiPath('contact'),
  FORM_SUBMISSIONS: '/api/form-submissions', // Без версии
  
  // Webhooks (всегда без версии)
  WEBHOOKS: {
    PAYMENT: '/api/webhooks/payment',
    STATS: '/api/webhooks/stats',
  },
} as const

// Функция для получения всех путей (для тестирования)
export function getAllApiPaths(): string[] {
  const paths: string[] = []
  
  function extractPaths(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        paths.push(value)
      } else if (typeof value === 'function') {
        // Пропускаем функции (они требуют параметры)
        continue
      } else if (typeof value === 'object' && value !== null) {
        extractPaths(value, `${prefix}${key}.`)
      }
    }
  }
  
  extractPaths(API_ENDPOINTS)
  return [...new Set(paths)] // Убираем дубликаты
}

// Функция для миграции путей (замена v1 на новые пути)
export function migrateApiPath(oldPath: string): string {
  // Если путь содержит /api/v1/, заменяем на новый формат
  if (oldPath.includes('/api/v1/')) {
    return oldPath.replace('/api/v1/', buildApiPathV2('').replace('/api/', '/api/'))
  }
  
  return oldPath
}

// Проверка, является ли путь устаревшим
export function isLegacyPath(path: string): boolean {
  return path.includes('/api/v1/')
}

// Получение нового пути для устаревшего
export function getLegacyRedirect(path: string): string | null {
  if (!isLegacyPath(path)) {
    return null
  }
  
  return path.replace('/api/v1/', '/api/')
}

// Экспорт для обратной совместимости
export const API_ROUTES = API_ENDPOINTS

// Типы для TypeScript
export type ApiEndpoints = typeof API_ENDPOINTS
export type ApiConfig = typeof API_CONFIG
