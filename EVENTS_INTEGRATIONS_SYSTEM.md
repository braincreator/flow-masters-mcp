# 🚀 Система событий и интеграций FlowMasters

## ✅ Что реализовано

### 🎯 Централизованная система событий
- **EventBus** - центральная шина событий с поддержкой приоритетов и retry логики
- **EventService** - управление подписками и отправка уведомлений
- **WebhookService** - отправка данных во внешние системы
- **Автоматические события** - генерация событий при изменениях в коллекциях

### 📊 Типы событий
- **Пользователи**: регистрация, вход, обновление профиля
- **Лиды и формы**: создание лида, отправка формы, конвертация
- **Заказы и платежи**: создание заказа, оплата, завершение
- **Подписки**: создание, продление, отмена
- **Бронирования**: создание, подтверждение, отмена
- **Курсы**: запись, завершение, прогресс
- **Система**: ошибки, предупреждения, интеграции

### 🔔 Каналы уведомлений
- **Email** - отправка на указанные адреса
- **Telegram** - уведомления в чаты/каналы
- **WhatsApp** - сообщения через WhatsApp Business API
- **Webhook** - HTTP запросы во внешние системы
- **Slack** - сообщения в каналы (готовится)
- **SMS** - текстовые сообщения (готовится)

## 🏗️ Архитектура

### Основные компоненты:

```
EventBus (Шина событий)
├── EventService (Управление подписками)
├── WebhookService (HTTP интеграции)
├── NotificationService (Уведомления)
└── ServiceRegistry (Реестр сервисов)
```

### Коллекции:
- **EventSubscriptions** - подписки на события
- **EventLogs** - логи обработки событий
- **WebhookLogs** - логи webhook вызовов

## 📝 Использование

### 1. Создание подписки на события

```typescript
// Через API
POST /api/events/subscriptions
{
  "name": "New Lead Notifications",
  "eventTypes": ["lead.created", "form.submitted"],
  "channels": ["email", "telegram"],
  "emailRecipients": ["admin@flowmasters.ru"],
  "telegramChatIds": ["-1001234567890"],
  "priority": "high",
  "isActive": true
}
```

### 2. Настройка webhook интеграции

```typescript
POST /api/events/subscriptions
{
  "name": "CRM Integration",
  "eventTypes": ["lead.created", "lead.converted"],
  "channels": ["webhook"],
  "webhookUrl": "https://your-crm.com/api/webhooks/flowmasters",
  "webhookSecret": "your-secret-key",
  "webhookHeaders": {
    "Authorization": "Bearer your-token"
  }
}
```

### 3. Публикация событий вручную

```typescript
// В коде
const eventService = serviceRegistry.getEventService()
await eventService.publishEvent('custom.event', {
  userId: '123',
  action: 'button_click',
  data: { button: 'cta-main' }
})

// Через API
POST /api/events
{
  "eventType": "custom.event",
  "eventData": {
    "userId": "123",
    "action": "button_click"
  }
}
```

### 4. Получение статистики

```typescript
// Статистика событий
GET /api/events?eventType=lead.created&dateFrom=2024-01-01

// Статистика webhook
GET /api/webhooks/stats?url=your-crm.com&dateFrom=2024-01-01
```

## 🔧 Настройка уведомлений админов

### Email уведомления
```json
{
  "name": "Admin Email Alerts",
  "eventTypes": ["lead.created", "order.created", "payment.failed"],
  "channels": ["email"],
  "emailRecipients": [
    "admin@flowmasters.ru",
    "manager@flowmasters.ru"
  ],
  "priority": "high"
}
```

### Telegram уведомления
```json
{
  "name": "Telegram Alerts",
  "eventTypes": ["lead.created", "form.submitted"],
  "channels": ["telegram"],
  "telegramChatIds": [
    {
      "chatId": "-1001234567890",
      "name": "Группа админов"
    },
    {
      "chatId": "123456789",
      "name": "Личный чат"
    }
  ]
}
```

### WhatsApp уведомления
```json
{
  "name": "WhatsApp Notifications",
  "eventTypes": ["lead.created", "order.created"],
  "channels": ["whatsapp"],
  "whatsappContacts": [
    {
      "phoneNumber": "+7 999 123-45-67",
      "name": "Менеджер по продажам"
    },
    {
      "phoneNumber": "+7 999 987-65-43",
      "name": "Директор"
    }
  ]
}
```

## 🌐 Webhook интеграции

### Формат webhook payload
```json
{
  "event": {
    "id": "evt_1234567890_abc123",
    "type": "lead.created",
    "timestamp": "2024-01-15T10:30:00Z",
    "source": "flowmasters",
    "version": "1.0",
    "data": {
      "current": {
        "id": "lead_123",
        "name": "Иван Иванов",
        "phone": "+7 (999) 123-45-67",
        "email": "ivan@example.com",
        "source": "ai-agency-landing"
      }
    }
  },
  "subscription": {
    "id": "sub_123",
    "name": "CRM Integration"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "sha256=abc123..."
}
```

### Верификация подписи
```typescript
const crypto = require('crypto')

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}
```

## 🔄 Retry логика

### Автоматические повторы
- **Максимум попыток**: 3 (настраивается)
- **Задержка**: экспоненциальная (1с, 2с, 4с...)
- **Максимальная задержка**: 30 секунд
- **Условия повтора**: HTTP 5xx, timeout, network errors

### Настройка retry
```json
{
  "retryConfig": {
    "maxAttempts": 5,
    "initialDelay": 2000,
    "backoffMultiplier": 2,
    "maxDelay": 60000
  }
}
```

## 📊 Мониторинг и логирование

### Логи событий
- Все события логируются в коллекцию `event-logs`
- Статус доставки по каждому каналу
- Время обработки и ошибки
- Количество попыток доставки

### Логи webhook
- Детальные логи всех HTTP запросов
- Время ответа и статус коды
- Заголовки запроса и ответа
- Метрики производительности

### Алерты
- Критические ошибки после 3 неудачных попыток
- Медленные webhook (>10 секунд)
- Высокий процент ошибок

## 🎛️ API Endpoints

### События
- `GET /api/events` - список событий
- `POST /api/events` - создать событие
- `POST /api/events/test` - тестировать подписку/webhook

### Подписки
- `GET /api/events/subscriptions` - список подписок
- `POST /api/events/subscriptions` - создать подписку
- `PUT /api/events/subscriptions/:id` - обновить подписку
- `DELETE /api/events/subscriptions/:id` - удалить подписку

### Статистика
- `GET /api/webhooks/stats` - статистика webhook
- `GET /api/events/stats` - статистика событий

## 🔐 Безопасность

### Webhook безопасность
- HMAC SHA256 подписи для верификации
- Настраиваемые заголовки авторизации
- Timeout защита (30 секунд по умолчанию)
- Rate limiting (планируется)

### Доступ к API
- Аутентификация через Payload CMS
- Роли: admin, manager для чтения
- Только admin для создания/изменения

## 🚀 Примеры интеграций

### 1. CRM интеграция
```bash
# Создание подписки для отправки лидов в CRM
curl -X POST /api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Lead Sync",
    "eventTypes": ["lead.created"],
    "channels": ["webhook"],
    "webhookUrl": "https://crm.example.com/api/leads",
    "webhookHeaders": {
      "Authorization": "Bearer crm-token"
    }
  }'
```

### 2. Email маркетинг
```bash
# Подписка на события для email кампаний
curl -X POST /api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Email Marketing",
    "eventTypes": ["user.registered", "course.completed"],
    "channels": ["webhook"],
    "webhookUrl": "https://mailchimp.com/api/webhooks"
  }'
```

### 3. Аналитика
```bash
# Отправка событий в аналитическую систему
curl -X POST /api/events/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analytics Tracking",
    "eventTypes": ["*"],
    "channels": ["webhook"],
    "webhookUrl": "https://analytics.example.com/events"
  }'
```

## 📈 Метрики и KPI

### Отслеживаемые метрики
- Общее количество событий
- События по типам
- Успешность доставки по каналам
- Среднее время обработки
- Количество ошибок и повторов

### Дашборд (планируется)
- Реальное время событий
- Графики производительности
- Алерты и уведомления
- Статистика по интеграциям

## 🔮 Планы развития

### Ближайшие улучшения
- [ ] Slack интеграция
- [ ] SMS уведомления
- [ ] Push уведомления
- [ ] Дашборд в админке
- [ ] A/B тестирование уведомлений

### Долгосрочные планы
- [ ] GraphQL подписки
- [ ] Batch обработка событий
- [ ] Event sourcing
- [ ] Машинное обучение для оптимизации

## 🔧 Исправленные ошибки

### Критические исправления:
✅ **Типы EventSubscription** - исправлено соответствие между типами и коллекциями
✅ **EventBusService** - заменен устаревший метод `substr` на `substring`
✅ **EventService** - реализованы методы логирования и полные фильтры
✅ **WebhookService** - добавлены методы статистики и улучшена обработка ошибок
✅ **API endpoints** - исправлена работа с новыми типами данных
✅ **FormSubmissions** - улучшена безопасная обработка связанных форм

### Новые возможности:
🆕 **Утилиты событий** - `/src/utilities/events.ts` с валидацией и форматированием
🆕 **Обработка ошибок** - `/src/middleware/events-error-handler.ts` с circuit breaker
🆕 **Валидация подписок** - автоматическая проверка URL и email при создании
🆕 **Мониторинг производительности** - отслеживание времени выполнения операций
🆕 **Маскирование данных** - автоматическое скрытие чувствительной информации

### Улучшения безопасности:
🔒 **Валидация webhook URL** - проверка корректности адресов
🔒 **Подписи webhook** - HMAC SHA256 для верификации
🔒 **Circuit breaker** - защита от каскадных ошибок
🔒 **Retry логика** - умные повторы с экспоненциальной задержкой

---

Система событий и интеграций готова к использованию! Все формы и важные действия в FlowMasters теперь генерируют события, которые можно использовать для автоматических уведомлений, интеграций с внешними системами и аналитики.

**Система полностью протестирована и исправлена!** 🎉
