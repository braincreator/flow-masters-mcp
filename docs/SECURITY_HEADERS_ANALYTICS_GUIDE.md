# 🛡️ Руководство по заголовкам безопасности и аналитике

## 📋 Обзор

Заголовки безопасности защищают ваш сайт от атак, но могут блокировать работу аналитических счетчиков. Это руководство поможет найти баланс между безопасностью и функциональностью.

## 🔍 **X-Content-Type-Options: nosniff**

### Что это такое:
```http
X-Content-Type-Options: nosniff
```

### Как работает:
- **Запрещает браузеру "угадывать" MIME-тип** файлов
- **Заставляет строго следовать** заголовку `Content-Type`
- **Предотвращает MIME-sniffing атаки**

### Влияние на аналитику:
- ✅ **Положительное**: Защищает от атак через поддельные JS файлы
- ⚠️ **Потенциальная проблема**: Если сервер отдает JS с неправильным Content-Type
- 🔧 **Решение**: Убедиться, что все JS файлы отдаются с `Content-Type: application/javascript`

## 🚨 **Content Security Policy (CSP) - ГЛАВНАЯ ПРОБЛЕМА**

### Что может блокировать аналитику:

#### 1. **script-src директива**
```http
Content-Security-Policy: script-src 'self'
```
❌ **Проблема**: Блокирует все внешние скрипты

✅ **Решение**:
```http
Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://mc.yandex.ru 
  https://mc.webvisor.org 
  https://vk.com 
  https://ads.vk.com 
  https://www.googletagmanager.com
```

#### 2. **connect-src директива**
```http
Content-Security-Policy: connect-src 'self'
```
❌ **Проблема**: Блокирует AJAX запросы к аналитическим серверам

✅ **Решение**:
```http
Content-Security-Policy: connect-src 'self' 
  https://mc.yandex.ru 
  https://mc.webvisor.org 
  https://metrika.yandex.ru 
  https://vk.com 
  https://ads.vk.com
```

#### 3. **img-src директива**
```http
Content-Security-Policy: img-src 'self'
```
❌ **Проблема**: Блокирует пиксели отслеживания

✅ **Решение**:
```http
Content-Security-Policy: img-src 'self' data: https: 
  https://mc.yandex.ru 
  https://mc.webvisor.org 
  https://vk.com 
  https://ads.vk.com
```

## 🔧 **Другие проблемные заголовки**

### **X-Frame-Options: DENY**
- **Проблема**: Блокирует iframe виджеты аналитики
- **Решение**: Использовать `SAMEORIGIN` или настроить CSP `frame-ancestors`

### **Referrer-Policy: no-referrer**
- **Проблема**: Аналитика не получает данные о источнике трафика
- **Решение**: Использовать `strict-origin-when-cross-origin`

### **Permissions-Policy**
- **Проблема**: Может блокировать доступ к геолокации для аналитики
- **Решение**: Разрешить нужные API для аналитических доменов

## 🛠️ **Диагностика проблем**

### 1. **Проверка в браузере**
```javascript
// Откройте DevTools → Console
console.log('Yandex Metrika:', typeof window.ym)
console.log('VK Pixel:', typeof window.VK)
console.log('Google Analytics:', typeof window.gtag)
```

### 2. **Проверка CSP ошибок**
- Откройте DevTools → Console
- Ищите ошибки типа: `Refused to load script... because it violates CSP`

### 3. **Проверка Network**
- DevTools → Network
- Фильтр: JS
- Проверьте статус загрузки аналитических скриптов

### 4. **Использование тест-дашборда**
```
https://your-domain.com/en/test/analytics
```

## ✅ **Рекомендуемая конфигурация CSP**

```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 
    https://mc.yandex.ru 
    https://mc.webvisor.org 
    https://vk.com 
    https://ads.vk.com 
    https://yastatic.net 
    https://www.googletagmanager.com 
    https://www.google-analytics.com;
  connect-src 'self' 
    https://mc.yandex.ru 
    https://mc.webvisor.org 
    https://yandex.ru 
    https://metrika.yandex.ru 
    https://vk.com 
    https://ads.vk.com 
    https://www.google-analytics.com 
    https://analytics.google.com 
    wss: ws:;
  img-src 'self' data: https: 
    https://mc.yandex.ru 
    https://mc.webvisor.org 
    https://yandex.ru 
    https://vk.com 
    https://ads.vk.com 
    https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' 
    https://yastatic.net 
    https://fonts.googleapis.com;
  font-src 'self' data: 
    https://yastatic.net 
    https://fonts.gstatic.com;
  frame-src 'self' 
    https://yandex.ru 
    https://metrika.yandex.ru 
    https://vk.com 
    https://ads.vk.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self'
```

## 🚀 **Оптимизация производительности**

### 1. **Кэширование заголовков**
```javascript
// next.config.mjs
async headers() {
  return [
    {
      source: '/metrika/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400'
        }
      ]
    }
  ]
}
```

### 2. **Предзагрузка DNS**
```html
<link rel="dns-prefetch" href="//mc.yandex.ru">
<link rel="dns-prefetch" href="//mc.webvisor.org">
<link rel="dns-prefetch" href="//vk.com">
<link rel="dns-prefetch" href="//ads.vk.com">
```

### 3. **Preconnect для критических ресурсов**
```html
<link rel="preconnect" href="https://mc.webvisor.org">
<link rel="preconnect" href="https://vk.com">
```

## 🔍 **Мониторинг и отладка**

### 1. **Логирование CSP нарушений**
```javascript
// Добавить в CSP
Content-Security-Policy: ...; report-uri /api/csp-report
```

### 2. **Мониторинг аналитики**
```javascript
// Проверка каждые 30 секунд
setInterval(() => {
  if (!window.ym) {
    console.warn('Yandex Metrika not loaded')
  }
  if (!window.VK) {
    console.warn('VK Pixel not loaded')
  }
}, 30000)
```

### 3. **Автоматические тесты**
```javascript
// Cypress/Playwright тест
cy.window().should('have.property', 'ym')
cy.window().should('have.property', 'VK')
```

## 📊 **Метрики успеха**

- ✅ **Загрузка скриптов**: 100% успешных загрузок
- ✅ **Время загрузки**: < 2 секунд для всех скриптов
- ✅ **CSP ошибки**: 0 нарушений в консоли
- ✅ **Аналитические объекты**: Доступны в window через 5 секунд

## 🆘 **Частые проблемы и решения**

### Проблема: "Refused to load script"
**Причина**: CSP блокирует внешний скрипт
**Решение**: Добавить домен в `script-src`

### Проблема: "Mixed Content"
**Причина**: HTTPS сайт загружает HTTP ресурсы
**Решение**: Использовать только HTTPS ссылки

### Проблема: "MIME type mismatch"
**Причина**: Сервер отдает неправильный Content-Type
**Решение**: Настроить сервер для правильных MIME типов

### Проблема: Аналитика работает локально, но не на продакшене
**Причина**: Разные настройки безопасности
**Решение**: Синхронизировать CSP между окружениями

## 🔗 **Полезные ссылки**

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers Scanner](https://securityheaders.com/)
- [MDN CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Yandex Metrica Documentation](https://yandex.ru/support/metrica/)
- [VK Ads Documentation](https://ads.vk.com/help)
