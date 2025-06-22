# 🚀 Полное руководство по настройке FlowMasters

## ✅ Что уже готово и работает

### 🎯 **Система событий и уведомлений**
- ✅ **EventBus** - централизованная шина событий
- ✅ **WhatsApp уведомления** - через WhatsApp Business API
- ✅ **Telegram уведомления** - через Telegram Bot API
- ✅ **Email уведомления** - через SMTP
- ✅ **Webhook интеграции** - для внешних систем
- ✅ **Автоматические события** - при создании лидов, заказов, форм

### 📊 **Система пикселей и аналитики**
- ✅ **Управление через админку** - добавление пикселей без кода
- ✅ **10+ платформ** - VK, Facebook, Google Analytics, Yandex Metrica и др.
- ✅ **GDPR соответствие** - управление согласием на cookies
- ✅ **Автоматическое отслеживание** - клики, скролл, время на странице
- ✅ **Готовые компоненты** - TrackableButton, TrackableForm и др.

### 🔧 **Интеграция в layout**
- ✅ **AnalyticsLayout** - уже добавлен в frontend layout
- ✅ **Автоматическая загрузка** - пиксели загружаются на всех страницах
- ✅ **Отслеживание взаимодействий** - работает из коробки

## 🛠️ Настройка за 5 минут

### 1. Переменные окружения

Добавьте в `.env` (все опционально, работает без настройки):

```bash
# WhatsApp Business API (опционально)
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Email SMTP (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Настройка пикселей через админку

1. Перейдите в **Admin → Marketing → Pixels**
2. Нажмите **Create New**
3. Заполните поля:
   ```
   Название: VK Ретаргетинг
   Тип пикселя: VK Pixel
   ID пикселя: VK-RTRG-1234567-ABCDE
   Страницы: Все страницы
   Активен: ✅
   ```
4. Сохраните

**Готово!** Пиксель автоматически загрузится на всех страницах.

### 3. Настройка уведомлений

1. Перейдите в **Admin → Integrations → Event Subscriptions**
2. Нажмите **Create New**
3. Заполните:
   ```
   Название: Уведомления о лидах
   События: lead.created, form.submitted
   Каналы: Email, Telegram, WhatsApp
   Email получатели: admin@yoursite.com
   Активна: ✅
   ```
4. Сохраните

**Готово!** Теперь вы будете получать уведомления о всех новых лидах.

## 🎯 Использование в коде

### Простое отслеживание

```tsx
import { CTAButton, LeadForm } from '@/components/Analytics'

// Кнопка с автоматическим отслеживанием
<CTAButton 
  conversionType="lead"
  conversionValue={5000}
>
  Получить консультацию
</CTAButton>

// Форма с автоматическим отслеживанием
<LeadForm 
  formName="Contact Form"
  conversionValue={3000}
>
  <input type="text" name="name" placeholder="Имя" />
  <input type="email" name="email" placeholder="Email" />
  <button type="submit">Отправить</button>
</LeadForm>
```

### Отслеживание через data-атрибуты

```html
<!-- Автоматически отслеживается как button_click -->
<button data-track>Кнопка</button>

<!-- CTA кнопка (автоматически отслеживается) -->
<button class="cta-button">Заказать звонок</button>

<!-- Кнопка покупки (автоматически отслеживается) -->
<button data-buy>Купить сейчас</button>
```

## 📱 Настройка WhatsApp (опционально)

### 1. Получение токенов

1. Создайте **Facebook Business аккаунт**
2. Настройте **WhatsApp Business API**
3. Получите токены в **Meta for Developers**

### 2. Добавление в .env

```bash
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

### 3. Тестирование

```bash
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+7 999 123-45-67",
    "message": "Тест WhatsApp!"
  }'
```

## 📊 Популярные пиксели

### VK Pixel
```
Тип: VK Pixel
ID: VK-RTRG-1234567-ABCDE
Получить: https://vk.com/ads → Ретаргетинг
```

### Facebook Pixel
```
Тип: Facebook Pixel
ID: 1234567890123456
Получить: https://business.facebook.com → События
```

### Google Analytics 4
```
Тип: Google Analytics 4
ID: G-XXXXXXXXXX
Получить: https://analytics.google.com
```

### Yandex Metrica
```
Тип: Yandex Metrica
ID: 12345678
Получить: https://metrica.yandex.ru
```

## 🔧 Продвинутая настройка

### Условная загрузка пикселей

```tsx
// Разные пиксели для разных страниц
Admin → Pixels → Create New
Страницы: Только "Страницы продуктов"
```

### Фильтрация событий

```json
// В Event Subscriptions
"filters": [
  {
    "field": "data.current.source",
    "operator": "eq",
    "value": "premium-landing"
  }
]
```

### Webhook интеграции

```json
// Отправка в CRM
{
  "name": "CRM Integration",
  "eventTypes": ["lead.created"],
  "channels": ["webhook"],
  "webhookUrl": "https://your-crm.com/api/leads",
  "webhookSecret": "secret-key"
}
```

## 📚 Документация

- **EVENTS_INTEGRATIONS_SYSTEM.md** - полная документация по событиям
- **PIXELS_SYSTEM.md** - руководство по пикселям
- **EVENTS_EXAMPLES.md** - примеры использования
- **ANALYTICS_COMPONENTS_EXAMPLES.md** - примеры компонентов

## 🎉 Готовые сценарии

### E-commerce
1. Добавьте **Facebook Pixel** и **VK Pixel**
2. Настройте уведомления о заказах в **WhatsApp**
3. Используйте `<BuyButton>` для кнопок покупки

### B2B сервис
1. Добавьте **LinkedIn Insight Tag** и **Yandex Metrica**
2. Настройте уведомления о лидах в **Telegram**
3. Используйте `<LeadForm>` для форм заявок

### Образование
1. Добавьте **TikTok Pixel** и **Google Analytics**
2. Настройте уведомления о регистрациях
3. Используйте отслеживание прогресса курсов

## ❓ Частые вопросы

### Q: Нужно ли что-то настраивать для работы?
**A:** Нет! Система работает из коробки. Пиксели и уведомления - опционально.

### Q: Как добавить новый пиксель?
**A:** Admin → Marketing → Pixels → Create New. Без кода!

### Q: Как получать уведомления о лидах?
**A:** Admin → Integrations → Event Subscriptions → Create New.

### Q: Работает ли GDPR?
**A:** Да! Автоматически показывается баннер согласия на cookies.

### Q: Можно ли отключить отслеживание?
**A:** Да, просто не добавляйте пиксели в админке.

---

**Система полностью готова к использованию!** 🎉

Все работает автоматически. Добавляйте пиксели через админку, настраивайте уведомления и получайте детальную аналитику без написания кода. 🚀
