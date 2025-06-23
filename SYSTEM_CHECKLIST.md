# ✅ Чеклист проверки системы FlowMasters

## 🔧 **Техническая проверка**

### 📁 **Файловая структура**
- ✅ `src/components/Layout/AnalyticsLayout.tsx` - основной layout аналитики
- ✅ `src/components/PixelManager/index.tsx` - менеджер пикселей
- ✅ `src/components/Analytics/TrackableButton.tsx` - компоненты отслеживания
- ✅ `src/components/Analytics/FormTracker.tsx` - отслеживание форм
- ✅ `src/components/Analytics/ButtonTracker.tsx` - отслеживание взаимодействий
- ✅ `src/components/Analytics/index.ts` - централизованный экспорт
- ✅ `src/components/CookieConsent/index.tsx` - GDPR баннер
- ✅ `src/hooks/usePixelEvents.ts` - хуки для событий
- ✅ `src/services/event.service.ts` - сервис событий
- ✅ `src/services/whatsapp.service.ts` - WhatsApp сервис
- ✅ `src/collections/Pixels/index.ts` - коллекция пикселей
- ✅ `src/collections/EventSubscriptions/index.ts` - подписки на события
- ✅ `src/collections/EventLogs/index.ts` - логи событий

### 🗑️ **Удаленные файлы (старая система)**
- ❌ `src/components/Analytics/AnalyticsProvider.tsx` - УДАЛЕН
- ❌ `src/components/Analytics/VKPixel.tsx` - УДАЛЕН
- ❌ `src/components/Analytics/TopMailRu.tsx` - УДАЛЕН
- ❌ `src/components/YandexMetrika/YandexMetrikaRobust.tsx` - УДАЛЕН

### 🔄 **Интеграция в layout**
- ✅ `src/app/(frontend)/layout.tsx` - AnalyticsLayout добавлен
- ✅ `src/app/(frontend)/[lang]/layout.tsx` - старый AnalyticsProvider удален
- ✅ Нет конфликтов между системами аналитики

## 🎯 **Функциональная проверка**

### 📊 **Система пикселей**
```bash
# Проверка API пикселей
curl http://localhost:3000/api/pixels/active

# Ожидаемый ответ:
{
  "pixels": [],
  "count": 0,
  "page": "all"
}
```

### 📱 **WhatsApp интеграция**
```bash
# Тест WhatsApp (если настроен)
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+7 999 123-45-67",
    "message": "Тест системы"
  }'

# Ожидаемый ответ (если не настроен):
{
  "error": "WhatsApp service not available"
}
```

### 🔔 **Система событий**
```bash
# Проверка подписок на события
curl http://localhost:3000/api/events/subscriptions

# Ожидаемый ответ:
{
  "subscriptions": [],
  "count": 0
}
```

## 🧪 **Тестирование компонентов**

### 1. **Проверка импортов**
```tsx
// Этот импорт должен работать без ошибок
import { 
  CTAButton, 
  LeadForm, 
  usePixelEvents,
  TRACKING_EVENTS 
} from '@/components/Analytics'
```

### 2. **Тест TrackableButton**
```tsx
import { CTAButton } from '@/components/Analytics'

function TestPage() {
  return (
    <CTAButton 
      conversionType="lead"
      conversionValue={5000}
      onClick={() => console.log('Clicked!')}
    >
      Тестовая кнопка
    </CTAButton>
  )
}
```

### 3. **Тест автоматического отслеживания**
```html
<!-- Эти элементы должны автоматически отслеживаться -->
<button data-track>Кнопка с отслеживанием</button>
<button class="cta-button">CTA кнопка</button>
<button data-buy>Кнопка покупки</button>
<a href="tel:+79991234567">Телефон</a>
<a href="mailto:test@example.com">Email</a>
```

### 4. **Тест GDPR баннера**
- ✅ Баннер должен появиться при первом посещении
- ✅ Выбор должен сохраняться в localStorage
- ✅ Пиксели должны загружаться только после согласия

## 🔍 **Проверка в браузере**

### 📱 **DevTools Console**
```javascript
// Проверка загрузки системы
console.log('Analytics system loaded:', !!window.analyticsLoaded)

// Проверка пикселей (если настроены)
console.log('VK Pixel:', !!window.VK)
console.log('Facebook Pixel:', !!window.fbq)
console.log('Google Analytics:', !!window.gtag)
console.log('Yandex Metrica:', !!window.ym)
```

### 🍪 **LocalStorage**
```javascript
// Проверка сохранения согласия на cookies
localStorage.getItem('cookie-consent')
localStorage.getItem('cookie-consent-timestamp')
```

### 🌐 **Network Tab**
- ✅ Запросы к `/api/pixels/active` должны возвращать 200
- ✅ Пиксели должны загружаться только после согласия
- ✅ События должны отправляться в `/api/pixels/active` (POST)

## 🎛️ **Проверка админки**

### 📊 **Pixels Collection**
1. Перейти в Admin → Marketing → Pixels
2. Нажать "Create New"
3. Заполнить тестовый пиксель:
   ```
   Название: Test VK Pixel
   Тип: VK Pixel
   ID: VK-RTRG-TEST-12345
   Страницы: Все страницы
   Активен: ✅
   ```
4. Сохранить и проверить в API

### 🔔 **Event Subscriptions**
1. Перейти в Admin → Integrations → Event Subscriptions
2. Нажать "Create New"
3. Заполнить тестовую подписку:
   ```
   Название: Test Notifications
   События: lead.created
   Каналы: Email
   Email: test@example.com
   Активна: ✅
   ```
4. Сохранить и проверить в API

### 📝 **Event Logs**
1. Перейти в Admin → Integrations → Event Logs
2. Проверить, что логи создаются при событиях
3. Убедиться в корректности данных

## 🚨 **Возможные проблемы и решения**

### ❌ **Ошибка: "Cannot find module '@/components/Analytics'"**
**Решение:** Проверить, что файл `src/components/Analytics/index.ts` существует

### ❌ **Ошибка: "AnalyticsLayout is not defined"**
**Решение:** Проверить импорт в `src/app/(frontend)/layout.tsx`

### ❌ **Пиксели не загружаются**
**Решение:** 
1. Проверить согласие на cookies в localStorage
2. Убедиться, что пиксели активны в админке
3. Проверить API `/api/pixels/active`

### ❌ **События не отслеживаются**
**Решение:**
1. Проверить консоль браузера на ошибки
2. Убедиться, что пиксели загружены
3. Проверить Network tab на запросы к API

### ❌ **WhatsApp не работает**
**Решение:**
1. Проверить переменные окружения
2. Убедиться в корректности токенов
3. Проверить API `/api/whatsapp/test`

## ✅ **Критерии успешной проверки**

### 🎯 **Обязательные проверки**
- [ ] Нет ошибок в консоли браузера
- [ ] AnalyticsLayout загружается без ошибок
- [ ] GDPR баннер появляется и работает
- [ ] API endpoints возвращают корректные ответы
- [ ] Импорты компонентов работают
- [ ] Админка позволяет создавать пиксели и подписки

### 🚀 **Дополнительные проверки**
- [ ] Автоматическое отслеживание работает (data-track)
- [ ] TrackableButton отправляет события
- [ ] Скролл и время на странице отслеживаются
- [ ] Внешние ссылки отслеживаются
- [ ] WhatsApp тестирование работает (если настроен)

### 📊 **Проверка производительности**
- [ ] Страница загружается быстро
- [ ] Нет дублирования запросов к API
- [ ] Пиксели загружаются асинхронно
- [ ] Нет блокировки рендеринга

---

**Если все пункты выполнены ✅ - система работает корректно!** 🎉

В случае проблем - проверьте соответствующие разделы документации или обратитесь к OPTIMIZATION_REPORT.md для деталей изменений.
