# Руководство по использованию аналитики

Новая система аналитики поддерживает несколько способов настройки. Выберите наиболее подходящий для вашего проекта.

## 🎯 Способы настройки

### 1. Через CMS (рекомендуется) 

**Преимущества:**
- Настройка через удобный интерфейс админки
- Можно изменять без перезапуска приложения
- Поддержка нескольких пикселей VK
- Валидация настроек
- Возможность включать/выключать отдельные сервисы

**Настройка:**

1. Добавьте глобал в payload.config.ts:
```ts
import { AnalyticsSettings } from '@/globals/AnalyticsSettings'

export default buildConfig({
  globals: [
    AnalyticsSettings,
    // ... другие глобалы
  ],
})
```

2. Используйте в layout.tsx:
```tsx
import { FlexibleAnalyticsProvider } from '@/providers/FlexibleAnalyticsProvider'

export default function Layout({ children }) {
  return (
    <FlexibleAnalyticsProvider configSource="cms">
      {children}
    </FlexibleAnalyticsProvider>
  )
}
```

3. Настройте в админке:
- Перейдите в админку CMS → Globals → Настройки аналитики
- Включите нужные сервисы
- Введите ID счетчиков
- Настройте дополнительные параметры

### 2. Через переменные окружения (простой способ)

**Преимущества:**
- Быстрая настройка
- Подходит для простых случаев
- Безопасность (ID не в коде)

**Настройка:**

1. Добавьте в .env.local:
```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
NEXT_PUBLIC_VK_PIXEL_ID=VK-RTRG-000000-XXXXX
NEXT_PUBLIC_TOP_MAIL_RU_ID=3661858
```

2. Используйте в layout.tsx:
```tsx
import { EnvAnalyticsProvider } from '@/providers/FlexibleAnalyticsProvider'

export default function Layout({ children }) {
  return (
    <EnvAnalyticsProvider>
      {children}
    </EnvAnalyticsProvider>
  )
}
```

### 3. Ручная конфигурация (для сложных случаев)

**Преимущества:**
- Полный контроль над настройками
- Программная настройка
- Условная логика

**Настройка:**
```tsx
import { ManualAnalyticsProvider, AnalyticsConfig } from '@/providers/FlexibleAnalyticsProvider'

const analyticsConfig: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  yandexMetrica: {
    counterId: '98849829',
    enabled: true,
    options: {
      clickmap: true,
      trackLinks: true,
      webvisor: true, // Включаем вебвизор
      accurateTrackBounce: true
    }
  },
  vkPixel: [
    {
      pixelId: 'VK-RTRG-000000-XXXXX',
      enabled: true,
      trackPageView: true
    },
    {
      pixelId: 'VK-RTRG-111111-YYYYY', // Второй пиксель
      enabled: true,
      trackPageView: false
    }
  ],
  topMailRu: {
    counterId: '3661858',
    enabled: true,
    trackPageView: true
  }
}

export default function Layout({ children }) {
  return (
    <ManualAnalyticsProvider config={analyticsConfig}>
      {children}
    </ManualAnalyticsProvider>
  )
}
```

## 🔧 Использование в компонентах

### Универсальное отслеживание
```tsx
import { useAnalytics } from '@/lib/analytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleClick = () => {
    // Отправляется во все подключенные сервисы
    analytics.trackEvent('button_click', { 
      button: 'cta',
      location: 'hero' 
    })
    
    analytics.trackGoal('conversion', { 
      source: 'homepage' 
    })
  }
  
  return <button onClick={handleClick}>Кликни меня</button>
}
```

### Специфичное отслеживание
```tsx
import { useYandexMetrica, useVKPixel, useTopMailRu } from '@/lib/analytics'

function AdvancedComponent() {
  const ym = useYandexMetrica()
  const vk = useVKPixel()
  const tmr = useTopMailRu()
  
  const handleYandexGoal = () => {
    ym.goal('yandex_specific_goal', { custom_param: 'value' })
  }
  
  const handleVKEvent = () => {
    vk.event('vk_custom_event', { event_value: 100 })
  }
  
  const handleTopMailRuGoal = () => {
    tmr.goal('tmr_conversion', { conversion_type: 'lead' })
  }
  
  return (
    <div>
      <button onClick={handleYandexGoal}>Yandex Goal</button>
      <button onClick={handleVKEvent}>VK Event</button>
      <button onClick={handleTopMailRuGoal}>TMR Goal</button>
    </div>
  )
}
```

### Ecommerce отслеживание
```tsx
import { useEcommerceTracking } from '@/lib/analytics'

function ShopComponent() {
  const { trackPurchase, trackAddToCart } = useEcommerceTracking()
  
  const handlePurchase = () => {
    trackPurchase([
      {
        id: 'product-123',
        name: 'Товар',
        category: 'Категория',
        price: 1000,
        quantity: 1
      }
    ], 'order-' + Date.now(), 1000)
  }
  
  const handleAddToCart = () => {
    trackAddToCart([
      {
        id: 'product-456',
        name: 'Другой товар',
        price: 500,
        quantity: 2
      }
    ])
  }
  
  return (
    <div>
      <button onClick={handleAddToCart}>В корзину</button>
      <button onClick={handlePurchase}>Купить</button>
    </div>
  )
}
```

## 🎛️ Настройка в CMS

### Основные настройки
- **Включить аналитику** - глобальное включение/выключение
- **Режим отладки** - показывает debug панель в development
- **Домены для отслеживания** - ограничить отслеживание определенными доменами
- **Исключенные пути** - не отслеживать на определенных страницах

### Yandex Metrica
- **ID счетчика** - найдите в настройках на metrica.yandex.ru
- **Карта кликов** - визуализация кликов пользователей
- **Отслеживание ссылок** - автоматическое отслеживание внешних ссылок
- **Вебвизор** - запись действий пользователей (влияет на приватность)
- **Точный отказ** - более точное измерение показателя отказов

### VK Pixel
- **ID пикселей** - можно добавить несколько (формат: VK-RTRG-XXXXXX-XXXXX)
- **Отслеживать просмотры страниц** - автоматическое отслеживание

### Top.Mail.Ru (VK Ads)
- **ID счетчика** - найдите в настройках на top.mail.ru
- **Отслеживать просмотры страниц** - автоматическое отслеживание

## 🔍 Отладка

### Debug панель
В режиме разработки автоматически показывается панель отладки:
- Статус сервисов (загружены/не загружены)
- Кнопки для тестирования каждого сервиса
- Лог последних событий
- Возможность очистки событий

### Логи в консоли
При включенном debug режиме в консоли отображаются:
- Статус инициализации сервисов
- Отправленные события
- Ошибки загрузки

## 🚀 Рекомендации

### Для продакшена
1. Используйте CMS для настройки
2. Отключите debug режим
3. Настройте исключенные пути (/admin, /api)
4. Включите только нужные сервисы

### Для разработки
1. Включите debug режим
2. Используйте тестовые ID счетчиков
3. Проверяйте работу через debug панель

### Для безопасности
1. Не включайте вебвизор без необходимости
2. Исключите админские страницы из отслеживания
3. Используйте переменные окружения для чувствительных данных

## 🔧 Миграция

Если у вас уже есть старая система аналитики:
1. Замените старый AnalyticsProvider на FlexibleAnalyticsProvider
2. Настройте нужный источник конфигурации
3. Обновите компоненты для использования новых хуков
4. Протестируйте в debug режиме
5. Удалите старые компоненты аналитики
