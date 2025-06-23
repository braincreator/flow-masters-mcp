# 📚 Примеры использования системы событий FlowMasters

## 🚀 Быстрый старт

### 1. Создание подписки на новые лиды

```bash
curl -X POST http://localhost:3000/api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Уведомления о новых лидах",
    "description": "Отправка уведомлений админам о новых лидах",
    "eventTypes": ["lead.created"],
    "channels": ["email", "telegram", "whatsapp"],
    "priority": "high",
    "emailRecipients": [
      {
        "email": "admin@flowmasters.ru",
        "name": "Администратор"
      }
    ],
    "telegramChatIds": [
      {
        "chatId": "-1001234567890",
        "name": "Группа админов"
      }
    ],
    "whatsappContacts": [
      {
        "phoneNumber": "+7 999 123-45-67",
        "name": "Менеджер по продажам"
      }
    ],
    "isActive": true
  }'
```

### 2. Настройка CRM интеграции через webhook

```bash
curl -X POST http://localhost:3000/api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Integration",
    "description": "Синхронизация лидов с CRM системой",
    "eventTypes": ["lead.created", "lead.converted"],
    "channels": ["webhook"],
    "priority": "normal",
    "webhookUrl": "https://your-crm.com/api/webhooks/flowmasters",
    "webhookSecret": "your-secret-key-here",
    "webhookHeaders": {
      "Authorization": "Bearer your-api-token",
      "X-Source": "FlowMasters"
    },
    "retryConfig": {
      "maxAttempts": 5,
      "initialDelay": 2000,
      "backoffMultiplier": 2,
      "maxDelay": 60000
    },
    "isActive": true
  }'
```

### 3. Фильтрация событий по условиям

```bash
curl -X POST http://localhost:3000/api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "VIP клиенты",
    "description": "Уведомления только о VIP лидах",
    "eventTypes": ["lead.created"],
    "channels": ["email"],
    "emailRecipients": [
      {
        "email": "vip@flowmasters.ru",
        "name": "VIP менеджер"
      }
    ],
    "filters": [
      {
        "field": "data.current.source",
        "operator": "eq",
        "value": "premium-landing"
      },
      {
        "field": "data.current.metadata.budget",
        "operator": "gte",
        "value": "100000"
      }
    ],
    "priority": "critical",
    "isActive": true
  }'
```

## 🔧 Программное использование

### 1. Публикация события в коде

```typescript
import { ServiceRegistry } from '@/services/service.registry'

// В хуке коллекции или API endpoint
const serviceRegistry = ServiceRegistry.getInstance(payload)
const eventService = serviceRegistry.getEventService()

await eventService.publishEvent('order.created', {
  id: order.id,
  customerId: order.customer,
  total: order.total,
  currency: order.currency,
  items: order.items,
  status: order.status,
}, {
  source: 'order_creation',
  collection: 'orders',
  operation: 'create',
  userId: req.user?.id,
  userEmail: req.user?.email,
})
```

### 2. Безопасная обработка событий

```typescript
import { safeEventOperation } from '@/middleware/events-error-handler'

const result = await safeEventOperation(
  async () => {
    return await eventService.publishEvent('payment.completed', paymentData)
  },
  {
    eventType: 'payment.completed',
    eventId: payment.id,
  }
)

if (!result.success) {
  console.error('Failed to publish payment event:', result.error)
}
```

### 3. Использование утилит событий

```typescript
import { 
  isValidEventType, 
  createEventSummary, 
  getEventPriority,
  maskSensitiveData 
} from '@/utilities/events'

// Валидация типа события
if (!isValidEventType(eventType)) {
  throw new Error('Invalid event type')
}

// Создание краткого описания
const summary = createEventSummary(event)
console.log(summary) // "Новый лид: Иван Иванов (+7 999 123-45-67)"

// Определение приоритета
const priority = getEventPriority('payment.failed') // 'high'

// Маскирование чувствительных данных
const maskedData = maskSensitiveData({
  email: 'user@example.com',
  password: 'secret123',
  creditCard: '4111111111111111'
})
// Результат: { email: 'user@example.com', password: '***MASKED***', creditCard: '***MASKED***' }
```

## 🌐 Webhook интеграции

### 1. Обработка webhook в вашем приложении

```javascript
// Express.js endpoint для обработки webhook от FlowMasters
app.post('/api/webhooks/flowmasters', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-flowmasters-signature']
  const payload = req.body.toString()
  
  // Проверяем подпись
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FLOWMASTERS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).send('Invalid signature')
  }
  
  const event = JSON.parse(payload)
  
  // Обрабатываем событие
  switch (event.event.type) {
    case 'lead.created':
      await handleNewLead(event.event.data.current)
      break
    
    case 'order.created':
      await handleNewOrder(event.event.data.current)
      break
    
    case 'payment.completed':
      await handlePaymentCompleted(event.event.data.current)
      break
    
    default:
      console.log('Unknown event type:', event.event.type)
  }
  
  res.status(200).send('OK')
})
```

### 2. Интеграция с популярными сервисами

#### Zapier webhook
```bash
# URL для Zapier
https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_ID/YOUR_HOOK_ID/

# Настройка подписки
{
  "name": "Zapier Integration",
  "eventTypes": ["lead.created", "form.submitted"],
  "channels": ["webhook"],
  "webhookUrl": "https://hooks.zapier.com/hooks/catch/YOUR_ZAPIER_ID/YOUR_HOOK_ID/"
}
```

#### Make.com (Integromat) webhook
```bash
# URL для Make.com
https://hook.eu1.make.com/YOUR_WEBHOOK_ID

# Настройка подписки
{
  "name": "Make.com Integration",
  "eventTypes": ["order.created", "payment.completed"],
  "channels": ["webhook"],
  "webhookUrl": "https://hook.eu1.make.com/YOUR_WEBHOOK_ID"
}
```

#### Slack webhook
```bash
# URL для Slack
https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Настройка подписки
{
  "name": "Slack Notifications",
  "eventTypes": ["lead.created", "order.created"],
  "channels": ["webhook"],
  "webhookUrl": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
}
```

## 📊 Мониторинг и отладка

### 1. Получение статистики событий

```bash
# Общая статистика
curl "http://localhost:3000/api/events?limit=100"

# Статистика по типу события
curl "http://localhost:3000/api/events?eventType=lead.created&dateFrom=2024-01-01"

# Статистика webhook
curl "http://localhost:3000/api/webhooks/stats?url=your-crm.com"
```

### 2. Тестирование подписок

```bash
# Тест конкретной подписки
curl -X POST http://localhost:3000/api/events/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription",
    "subscriptionId": "subscription_id_here",
    "eventType": "system.test"
  }'

# Тест webhook URL
curl -X POST http://localhost:3000/api/events/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "webhook",
    "webhookUrl": "https://your-webhook-url.com/endpoint",
    "webhookSecret": "optional-secret"
  }'
```

### 3. Отладка в коде

```typescript
import { eventPerformanceMonitor } from '@/middleware/events-error-handler'

// Измерение производительности
await eventPerformanceMonitor.measure(
  async () => {
    return await eventService.publishEvent('custom.event', data)
  },
  'custom_event_publishing'
)

// Получение метрик
const metrics = eventPerformanceMonitor.getMetrics()
console.log('Event metrics:', metrics)
```

## 🎯 Практические сценарии

### 1. Автоматизация продаж

```typescript
// При создании лида
await eventService.publishEvent('lead.created', leadData)

// При конвертации лида в клиента
await eventService.publishEvent('lead.converted', {
  leadId: lead.id,
  customerId: customer.id,
  conversionValue: order.total,
  conversionDate: new Date().toISOString(),
})

// При создании заказа
await eventService.publishEvent('order.created', orderData)
```

### 2. Уведомления о платежах

```typescript
// Успешная оплата
await eventService.publishEvent('payment.completed', {
  paymentId: payment.id,
  orderId: payment.orderId,
  amount: payment.amount,
  currency: payment.currency,
  method: payment.method,
})

// Неудачная оплата
await eventService.publishEvent('payment.failed', {
  paymentId: payment.id,
  orderId: payment.orderId,
  errorCode: payment.errorCode,
  errorMessage: payment.errorMessage,
})
```

### 3. Аналитика и отчетность

```typescript
// Отправка данных в аналитические системы
{
  "name": "Analytics Tracking",
  "eventTypes": ["*"], // Все события
  "channels": ["webhook"],
  "webhookUrl": "https://analytics.example.com/events",
  "filters": [
    {
      "field": "metadata.source",
      "operator": "ne",
      "value": "test"
    }
  ]
}
```

## 🔄 Миграция с legacy системы

### 1. Постепенный переход

```typescript
// В хуках коллекций - поддержка обеих систем
hooks: {
  afterChange: [
    async ({ doc, operation, req }) => {
      // Legacy система (сохраняем для совместимости)
      const integrationService = serviceRegistry.getIntegrationService()
      await integrationService.processEvent('lead.created', legacyData)
      
      // Новая система событий
      const eventService = serviceRegistry.getEventService()
      await eventService.publishEvent('lead.created', newData)
    }
  ]
}
```

### 2. Отключение legacy уведомлений

```typescript
// Постепенно убираем legacy код после настройки новых подписок
// Комментируем или удаляем старые вызовы TelegramService
```

## 📱 WhatsApp интеграция

### 1. Настройка WhatsApp Business API

Для работы с WhatsApp нужно:

1. **Создать Facebook Business аккаунт**
2. **Настроить WhatsApp Business API**
3. **Получить токены доступа**
4. **Добавить переменные окружения:**

```bash
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

### 2. Тестирование WhatsApp

```bash
# Отправка тестового сообщения
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+7 999 123-45-67",
    "message": "Тестовое сообщение от FlowMasters!"
  }'

# Отправка шаблонного сообщения
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+7 999 123-45-67",
    "type": "template",
    "templateName": "hello_world",
    "templateParams": ["Иван"]
  }'

# Получение списка шаблонов
curl http://localhost:3000/api/whatsapp/test
```

### 3. Создание подписки только для WhatsApp

```bash
curl -X POST http://localhost:3000/api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "WhatsApp Уведомления",
    "description": "Мгновенные уведомления в WhatsApp",
    "eventTypes": ["lead.created", "order.created", "payment.completed"],
    "channels": ["whatsapp"],
    "priority": "high",
    "whatsappContacts": [
      {
        "phoneNumber": "+7 999 123-45-67",
        "name": "Директор"
      },
      {
        "phoneNumber": "+7 999 987-65-43",
        "name": "Менеджер продаж"
      }
    ],
    "isActive": true
  }'
```

### 4. Форматирование сообщений WhatsApp

WhatsApp поддерживает ограниченное форматирование:

```typescript
import { WhatsAppService } from '@/services/whatsapp.service'

const whatsapp = new WhatsAppService(payload)

// Форматированное сообщение
const message = whatsapp.formatMessage(
  'Новый лид от FlowMasters! Имя клиента очень важно.',
  {
    bold: ['FlowMasters', 'важно'],
    italic: ['лид'],
    monospace: ['клиента']
  }
)

// Результат: "Новый _лид_ от *FlowMasters*! Имя ```клиента``` очень *важно*."
```

## 📊 Система пикселей

### 1. Быстрая настройка через админку

1. Перейдите в **Admin → Marketing → Pixels**
2. Нажмите **Create New**
3. Выберите тип пикселя (VK, Facebook, Google Analytics и т.д.)
4. Введите ID пикселя
5. Выберите страницы для отслеживания
6. Сохраните

### 2. Интеграция в Next.js приложение

```tsx
// app/layout.tsx
import AnalyticsLayout from '@/components/Layout/AnalyticsLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <AnalyticsLayout>
          {children}
        </AnalyticsLayout>
      </body>
    </html>
  )
}
```

### 3. Отслеживание конверсий

```tsx
// pages/thank-you.tsx
import { ConversionTracker } from '@/components/Layout/AnalyticsLayout'

export default function ThankYouPage() {
  return (
    <div>
      <h1>Спасибо за заказ!</h1>

      {/* Автоматически отправит событие во все настроенные пиксели */}
      <ConversionTracker
        conversionType="purchase"
        conversionData={{
          value: 5000,
          currency: 'RUB',
          order_id: '12345'
        }}
      />
    </div>
  )
}
```

### 4. Ручное отслеживание событий

```tsx
import { usePixelEvents } from '@/hooks/usePixelEvents'

function ProductPage() {
  const { trackViewContent, trackAddToCart } = usePixelEvents()

  const handleAddToCart = () => {
    trackAddToCart({
      value: 2500,
      currency: 'RUB',
      content_name: 'Курс по программированию',
      content_ids: ['course-123']
    })
  }

  return (
    <button onClick={handleAddToCart}>
      Добавить в корзину
    </button>
  )
}
```

### 5. GDPR соответствие

Система автоматически:
- Показывает баннер согласия на cookies
- Загружает пиксели только после согласия пользователя
- Сохраняет выбор пользователя
- Учитывает категории cookies (аналитика, маркетинг, функциональные)

```tsx
import Cookies from 'js-cookie'

function MyComponent() {
  const consent = Cookies.get('gdpr_consent_status')

  // Пиксели загружаются автоматически на основе согласия
  // consent === 'all' - все пиксели разрешены
  // consent === 'necessary' - только необходимые cookies
}
```

---

Эти примеры помогут быстро начать работу с системой событий и пикселями FlowMasters! 🚀
