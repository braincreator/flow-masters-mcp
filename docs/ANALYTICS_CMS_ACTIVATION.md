# Активация CMS интеграции для аналитики

## Текущий статус

✅ **Готово:**
- Новая система аналитики полностью реализована
- Работает через переменные окружения
- Поддерживает Yandex Metrica, VK Pixel, Top.Mail.Ru
- FlexibleAnalyticsProvider настроен в layout
- API endpoint создан

⚠️ **Требует активации:**
- CMS интеграция (глобал AnalyticsSettings)
- Полная настройка через админку

## Шаги для активации CMS

### 1. Проверить глобал в админке
После деплоя зайти в админку CMS и проверить, что появился новый глобал:
- Перейти в админку → Globals
- Найти "Настройки аналитики" (Analytics Settings)
- Если нет - перезапустить сервер

### 2. Настроить аналитику в CMS
1. Открыть "Настройки аналитики"
2. Включить нужные сервисы
3. Ввести ID счетчиков:
   - Yandex Metrica ID: `98849829` (или ваш)
   - Top.Mail.Ru ID: `3661858` (из вашего кода)
   - VK Pixel ID: если есть
4. Настроить дополнительные параметры
5. Сохранить

### 3. Активировать CMS в API
Раскомментировать код в `src/app/api/analytics-settings/route.ts`:

```typescript
// Заменить временный код на:
const payload = await getPayload({ config })

const analyticsSettings = await payload.findGlobal({
  slug: 'analytics-settings' as any,
})

const settings: CMSAnalyticsSettings = {
  enabled: (analyticsSettings as any).enabled ?? defaultAnalyticsSettings.enabled,
  debug: (analyticsSettings as any).debug ?? defaultAnalyticsSettings.debug,
  // ... остальные поля
}
```

### 4. Проверить работу
1. Открыть сайт в режиме разработки
2. Проверить debug панель (правый нижний угол)
3. Убедиться, что все сервисы загружаются
4. Протестировать отправку событий

## Переменные окружения (fallback)

Пока CMS не активирован, система использует переменные окружения:

```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
NEXT_PUBLIC_TOP_MAIL_RU_ID=3661858
NEXT_PUBLIC_VK_PIXEL_ID=your_vk_pixel_id
```

## Использование

### Базовое использование
```tsx
import { useAnalytics } from '@/lib/analytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleClick = () => {
    analytics.trackEvent('button_click', { button: 'cta' })
    analytics.trackGoal('conversion')
  }
}
```

### Специфичное для Top.Mail.Ru
```tsx
import { useTopMailRu } from '@/lib/analytics'

function VKAdsComponent() {
  const tmr = useTopMailRu()
  
  const handleConversion = () => {
    tmr.goal('purchase', { value: 1000 })
    tmr.pageView({ source: 'manual' })
  }
}
```

## Debug режим

В development автоматически показывается панель отладки:
- Статус всех сервисов
- Кнопки для тестирования
- Лог последних событий
- Возможность очистки событий

## Troubleshooting

### Сервисы не загружаются
1. Проверить переменные окружения
2. Проверить настройки в CMS
3. Проверить консоль браузера на ошибки
4. Проверить debug панель

### CMS не работает
1. Убедиться, что глобал добавлен в payload.config.ts
2. Перезапустить сервер
3. Проверить API endpoint `/api/analytics-settings`

### События не отправляются
1. Проверить, что сервисы загружены (debug панель)
2. Проверить правильность ID счетчиков
3. Проверить сетевые запросы в DevTools

## Миграция с старой системы

Старая система аналитики автоматически заменена новой. Если нужно вернуться:

1. Заменить `FlexibleAnalyticsProvider` на старый `AnalyticsProvider`
2. Восстановить старые компоненты из git истории
3. Удалить новые файлы аналитики

## Поддержка

При проблемах:
1. Проверить debug панель
2. Проверить консоль браузера
3. Проверить API endpoint
4. Обратиться к документации в `docs/ANALYTICS_USAGE_GUIDE.md`
