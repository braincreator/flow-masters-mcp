# 🚫 Настройки, блокирующие пиксели и счетчики

## 📋 Обзор

Это полное руководство по всем настройкам в проекте, которые могут блокировать загрузку и работу аналитических пикселей.

## 🔧 **1. Настройки пикселей в админке (Payload CMS)**

### **Основные блокирующие настройки:**

#### **1.1 Статус активности (`isActive`)**
```typescript
// src/components/PixelManager/index.tsx:140
if (!pixel.isActive) return false
```
- ❌ **Блокирует**: Если пиксель отмечен как неактивный в админке
- 🔧 **Решение**: Включить пиксель в админ-панели

#### **1.2 GDPR согласие (`gdprCompliant` + `userConsent`)**
```typescript
// src/components/PixelManager/index.tsx:143
if (pixel.gdprCompliant && !userConsent) return false
```
- ❌ **Блокирует**: GDPR-совместимые пиксели без согласия пользователя
- 🔧 **Решение**: Получить согласие пользователя или отключить GDPR для пикселя

#### **1.3 Настройки страниц (`pages`)**
```typescript
// src/components/PixelManager/index.tsx:146-149
if (pixel.pages.includes('all')) return true
if (pixel.pages.includes(currentPage)) return true
return false
```
- ❌ **Блокирует**: Если текущая страница не указана в настройках пикселя
- 🔧 **Решение**: Добавить 'all' или конкретную страницу в настройки

#### **1.4 Неправильные ID пикселей**
```typescript
// Валидация в src/collections/Pixels/index.ts:427-447
function validatePixelId(type: string, pixelId: string): boolean {
  switch (type) {
    case 'yandex_metrica': return /^\d{8,9}$/.test(pixelId)
    case 'vk': return /^\d{6,10}$/.test(pixelId)
    case 'facebook': return /^\d{15,16}$/.test(pixelId)
    // ...
  }
}
```
- ❌ **Блокирует**: Неправильный формат ID пикселя
- 🔧 **Решение**: Проверить и исправить ID в админке

## 🍪 **2. Система согласий (GDPR/Cookie Consent)**

### **2.1 Cookie Consent Banner**
```typescript
// src/components/CookieConsentBanner/CookieConsentBanner.tsx:98-100
if (consent.analytics) {
  sendYandexHit()
}
```

#### **Блокирующие сценарии:**
- ❌ **Баннер не показан**: Пользователь не видит возможность дать согласие
- ❌ **Согласие не дано**: `analytics: false` в детальных настройках
- ❌ **Маркетинг отключен**: `marketing: false` блокирует рекламные пиксели

### **2.2 Hook useCookieConsent**
```typescript
// src/hooks/useCookieConsent.ts:73-75
hasAnalytics: detailedConsent?.analytics || false,
hasMarketing: detailedConsent?.marketing || false,
```

#### **Проверки согласий:**
- `hasAnalytics` - для Yandex Metrika, Google Analytics
- `hasMarketing` - для VK Pixel, Facebook Pixel, рекламных сетей

### **2.3 AnalyticsLayout условия**
```typescript
// src/components/Layout/AnalyticsLayout.tsx:116-121
{shouldLoadPixels && (
  <PixelManager
    currentPage={currentPage}
    userConsent={true}
  />
)}
```

#### **Условие `shouldLoadPixels`:**
```typescript
// src/components/Layout/AnalyticsLayout.tsx:95-108
const shouldLoadPixels = useMemo(() => {
  // В development режиме всегда загружаем для тестирования
  if (process.env.NODE_ENV === 'development') return true
  
  // В production проверяем согласие
  return hasMarketing || hasAnalytics
}, [hasMarketing, hasAnalytics])
```

## ⚙️ **3. Переменные окружения**

### **3.1 Отсутствующие ID сервисов**
```bash
# .env.local
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
NEXT_PUBLIC_VK_PIXEL_ID=12345678
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### **Блокирующие сценарии:**
- ❌ **ID не установлен**: Пиксель не может инициализироваться
- ❌ **Неправильный формат**: Валидация отклоняет ID
- ❌ **Пустая строка**: Считается как отсутствующий ID

### **3.2 NODE_ENV влияние**
```typescript
// Различное поведение в development vs production
if (process.env.NODE_ENV === 'development') {
  // Отладочная информация, всегда загружаем пиксели
  return true
}
```

## 🚩 **4. Feature Flags (Флаги функций)**

### **4.1 Analytics Feature Flag**
```typescript
// src/config/app.ts:163
features: {
  analytics: true,
  // ...
}
```

#### **Потенциальные блокировки:**
- ❌ **analytics: false**: Полностью отключает аналитику
- ❌ **Условная логика**: Может блокировать в определенных условиях

### **4.2 Environment-specific настройки**
```typescript
// Различные настройки для разных сред
const config = {
  development: { analytics: true, debug: true },
  production: { analytics: true, debug: false },
  test: { analytics: false, debug: false }
}
```

## 🔒 **5. Заголовки безопасности (уже рассмотрены)**

### **5.1 Content Security Policy**
- Блокирует внешние скрипты
- Ограничивает inline JavaScript
- Фильтрует домены

### **5.2 X-Content-Type-Options**
- Блокирует скрипты с неправильным MIME-типом

## 📱 **6. Условная загрузка по устройствам/браузерам**

### **6.1 User Agent проверки**
```typescript
// Потенциальная логика блокировки
const isBot = /bot|crawler|spider/i.test(navigator.userAgent)
if (isBot) {
  // Не загружаем аналитику для ботов
  return
}
```

### **6.2 Мобильные ограничения**
```typescript
// WebView ограничения
const isWebView = /wv|WebView/i.test(navigator.userAgent)
if (isWebView) {
  // Упрощенная аналитика для WebView
  loadSimplifiedAnalytics()
}
```

## 🎯 **7. Логика размещения пикселей**

### **7.1 Placement настройки**
```typescript
// src/collections/Pixels/index.ts
placement: 'head' | 'body_start' | 'body_end'
```

#### **Влияние на загрузку:**
- `head` - загружается раньше, но может блокироваться CSP
- `body_start` - загружается после начала body
- `body_end` - загружается в конце, может не успеть на быстрых переходах

### **7.2 Load Priority**
```typescript
// src/components/PixelManager/index.tsx:152-158
const getScriptStrategy = (priority: string) => {
  switch (priority) {
    case 'high': return 'beforeInteractive'
    case 'low': return 'lazyOnload'
    default: return 'afterInteractive'
  }
}
```

#### **Стратегии загрузки:**
- `beforeInteractive` - блокирует рендеринг до загрузки
- `afterInteractive` - загружается после интерактивности
- `lazyOnload` - отложенная загрузка, может не загрузиться

## 🔄 **8. API эндпоинты и их блокировки**

### **8.1 Pixels API**
```typescript
// src/components/PixelManager/index.tsx:123
const response = await fetch(`/api/pixels/active?page=${currentPage}`)
```

#### **Потенциальные проблемы:**
- ❌ **API недоступен**: 500/404 ошибки
- ❌ **Медленный ответ**: Таймауты загрузки
- ❌ **Неправильные данные**: Пустой массив пикселей

### **8.2 Database подключение**
```typescript
// Если Payload CMS недоступен
try {
  const pixels = await payload.find({ collection: 'pixels' })
} catch (error) {
  // Пиксели не загрузятся
  return []
}
```

## 🧪 **9. Режимы разработки и тестирования**

### **9.1 Development режим**
```typescript
// src/components/Layout/AnalyticsLayout.tsx:127
{process.env.NODE_ENV === 'development' && <PixelDebug />}
```

#### **Особенности:**
- ✅ **Отладочная информация**: Дополнительные компоненты
- ✅ **Принудительная загрузка**: Игнорирует некоторые ограничения
- ⚠️ **Другое поведение**: Может отличаться от production

### **9.2 Test окружение**
```typescript
// В тестах аналитика может быть отключена
if (process.env.NODE_ENV === 'test') {
  return // Не загружаем аналитику в тестах
}
```

## 📊 **10. Мониторинг и диагностика блокировок**

### **10.1 Логирование**
```typescript
// src/components/PixelManager/index.tsx:55-64
if (typeof window !== 'undefined' && window.ym) {
  logDebug('Yandex Metrica: ✅ Loaded and available')
} else {
  logWarn('Yandex Metrica: ❌ Not loaded or not available')
}
```

### **10.2 Health Check**
```typescript
// Автоматическая проверка через 5 секунд
setTimeout(() => {
  const health = checkAnalyticsHealth()
  logInfo('Analytics Health Check:', health)
}, 5000)
```

## 🛠️ **Инструменты диагностики**

### **1. Pixel Configuration Analyzer**
- Проверяет настройки пикселей в админке
- Анализирует согласия пользователей
- Выявляет проблемы конфигурации

### **2. Analytics Diagnostics**
- Комплексная проверка всех компонентов
- Браузерные и серверные тесты
- Автоматические рекомендации

### **3. Security Headers Test**
- Анализ влияния заголовков безопасности
- CSP проверки
- MIME-type валидация

## 🎯 **Чек-лист для диагностики блокировок**

### **Админка (Payload CMS):**
- [ ] Пиксель активен (`isActive: true`)
- [ ] Правильный ID пикселя
- [ ] Настройки страниц включают текущую страницу или 'all'
- [ ] GDPR настройки соответствуют требованиям

### **Согласия пользователя:**
- [ ] Cookie banner показывается пользователям
- [ ] Согласие на аналитику получено (`hasAnalytics: true`)
- [ ] Согласие на маркетинг получено (`hasMarketing: true`)
- [ ] Детальные согласия сохранены корректно

### **Переменные окружения:**
- [ ] Все необходимые ID установлены
- [ ] Формат ID соответствует требованиям
- [ ] NODE_ENV настроен правильно

### **Feature Flags:**
- [ ] `analytics: true` в конфигурации
- [ ] Нет условной логики, блокирующей аналитику

### **Безопасность:**
- [ ] CSP разрешает аналитические домены
- [ ] MIME-типы настроены правильно
- [ ] Нет блокирующих заголовков

### **API и база данных:**
- [ ] Pixels API отвечает корректно
- [ ] База данных доступна
- [ ] Нет ошибок в логах сервера

## 🚀 **Быстрые решения**

### **Для разработчиков:**
1. Запустить диагностику: `/en/test/analytics`
2. Проверить консоль браузера на ошибки
3. Убедиться в наличии согласий пользователя
4. Проверить активность пикселей в админке

### **Для администраторов:**
1. Включить все необходимые пиксели
2. Проверить правильность ID
3. Настроить страницы для пикселей
4. Убедиться в корректности GDPR настроек

### **Экстренные меры:**
1. Отключить GDPR для критичных пикселей
2. Установить `pages: ['all']` для всех пикселей
3. Принудительно установить `userConsent: true`
4. Проверить переменные окружения
