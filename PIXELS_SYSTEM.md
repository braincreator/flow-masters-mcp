# 📊 Система управления пикселями FlowMasters

## ✅ Что реализовано

### 🎯 **Централизованное управление пикселями**
- **Админка** - удобное управление всеми пикселями через интерфейс
- **Автоматическая загрузка** - пиксели загружаются на нужных страницах
- **GDPR соответствие** - учет согласия пользователя на cookies
- **Приоритеты загрузки** - контроль порядка загрузки пикселей

### 📈 **Поддерживаемые платформы**
- **VK Pixel** - ретаргетинг ВКонтакте
- **Facebook Pixel** - реклама в Facebook/Instagram
- **Google Analytics 4** - веб-аналитика
- **Google Analytics Universal** - старая версия GA
- **Yandex Metrica** - российская аналитика
- **Google Ads** - конверсии Google Ads
- **TikTok Pixel** - реклама в TikTok
- **Twitter Pixel** - реклама в Twitter
- **LinkedIn Insight Tag** - B2B аналитика
- **Custom Scripts** - любые пользовательские скрипты

### 🔧 **Возможности настройки**
- **Выбор страниц** - где показывать пиксель
- **Размещение** - head, начало body, конец body
- **Приоритет загрузки** - высокий, обычный, низкий
- **Асинхронная загрузка** - не блокирует загрузку страницы
- **События** - настройка отслеживания конверсий

## 🚀 Быстрый старт

### 1. Добавление VK Pixel

1. Перейдите в админку → Marketing → Pixels
2. Нажмите "Create New"
3. Заполните поля:
   ```
   Название: VK Ретаргетинг
   Тип пикселя: VK Pixel
   ID пикселя: VK-RTRG-1234567-ABCDE
   Страницы: Все страницы
   Размещение: В <head>
   ```
4. Настройте события VK:
   - ✅ Отслеживать просмотры страниц
   - ✅ Отслеживать события
5. Сохраните

### 2. Добавление Facebook Pixel

```
Название: Facebook Реклама
Тип пикселя: Facebook Pixel
ID пикселя: 1234567890123456
Страницы: Все страницы
Размещение: В <head>

Настройки Facebook Pixel:
- ✅ Отслеживать просмотры страниц
- ✅ Расширенное сопоставление
- Стандартные события: Purchase, Lead, CompleteRegistration
```

### 3. Добавление Google Analytics 4

```
Название: Google Analytics
Тип пикселя: Google Analytics 4
ID пикселя: G-XXXXXXXXXX
Measurement ID: G-XXXXXXXXXX
Страницы: Все страницы

Настройки GA4:
- ✅ Расширенная электронная торговля
- Пользовательские параметры:
  * user_type: registered
  * traffic_source: organic
```

### 4. Добавление Yandex Metrica

```
Название: Яндекс.Метрика
Тип пикселя: Yandex Metrica
ID пикселя: 12345678
Страницы: Все страницы

Настройки Яндекс.Метрики:
- ✅ Карта кликов
- ✅ Отслеживание ссылок
- ✅ Точный показатель отказов
- ❌ Вебвизор (по желанию)
- ✅ Электронная торговля
```

## 🎛️ Интеграция в код

### 1. Добавление в Layout

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

### 2. Отслеживание событий

```tsx
// В компонентах
import { usePixelEvents } from '@/hooks/usePixelEvents'

function OrderForm() {
  const { trackLead, trackPurchase } = usePixelEvents()

  const handleSubmit = async (formData) => {
    // Отправляем форму
    const result = await submitOrder(formData)
    
    if (result.success) {
      // Отслеживаем конверсию
      await trackPurchase({
        value: result.total,
        currency: 'RUB',
        orderId: result.orderId,
        items: result.items
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* форма */}
    </form>
  )
}
```

### 3. Отслеживание лидов

```tsx
// На странице благодарности
import { ConversionTracker } from '@/components/Layout/AnalyticsLayout'

function ThankYouPage({ leadData }) {
  return (
    <div>
      <h1>Спасибо за заявку!</h1>
      
      {/* Автоматически отслеживает конверсию */}
      <ConversionTracker 
        conversionType="lead"
        conversionData={{
          value: 5000,
          currency: 'RUB',
          content_name: 'Консультация'
        }}
      />
    </div>
  )
}
```

### 4. Ручное отслеживание событий

```tsx
import { usePixelEvents } from '@/hooks/usePixelEvents'

function ProductPage({ product }) {
  const { trackViewContent, trackAddToCart } = usePixelEvents()

  useEffect(() => {
    // Отслеживаем просмотр товара
    trackViewContent({
      content_name: product.name,
      content_category: product.category,
      content_ids: [product.id],
      value: product.price,
      currency: 'RUB'
    })
  }, [product])

  const handleAddToCart = () => {
    // Отслеживаем добавление в корзину
    trackAddToCart({
      value: product.price,
      currency: 'RUB',
      content_name: product.name,
      content_ids: [product.id]
    })
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={handleAddToCart}>
        Добавить в корзину
      </button>
    </div>
  )
}
```

## 🔒 GDPR и согласие на cookies

### Автоматическое управление согласием

Система автоматически:
- Показывает баннер согласия на cookies
- Загружает пиксели только после согласия
- Сохраняет выбор пользователя
- Учитывает категории cookies (аналитика, маркетинг, функциональные)

### Настройка пикселей для GDPR

```
При создании пикселя:
- ✅ Соответствие GDPR - пиксель будет загружаться только после согласия
- ❌ Соответствие GDPR - пиксель загружается всегда (только для необходимых)
```

### Категории cookies

- **Необходимые** - всегда активны, нельзя отключить
- **Аналитические** - Google Analytics, Yandex Metrica
- **Маркетинговые** - Facebook Pixel, VK Pixel, Google Ads
- **Функциональные** - пользовательские настройки

## 📊 Мониторинг и аналитика

### API для получения пикселей

```bash
# Получить активные пиксели
GET /api/pixels/active

# Получить пиксели для конкретной страницы
GET /api/pixels/active?page=home

# Получить пиксели для конкретного размещения
GET /api/pixels/active?placement=head
```

### Отправка событий через API

```bash
# Отправить событие во все пиксели
POST /api/pixels/active
{
  "eventName": "purchase",
  "eventData": {
    "value": 5000,
    "currency": "RUB",
    "order_id": "12345"
  },
  "page": "checkout"
}

# Отправить событие в конкретные типы пикселей
POST /api/pixels/active
{
  "eventName": "lead",
  "eventData": {
    "value": 3000,
    "content_name": "Консультация"
  },
  "pixelTypes": ["facebook", "vk"]
}
```

## 🎯 Примеры настройки для разных сценариев

### E-commerce магазин

```
1. Google Analytics 4 - общая аналитика
   - Все страницы
   - Расширенная электронная торговля
   
2. Facebook Pixel - реклама
   - Все страницы
   - События: Purchase, AddToCart, ViewContent
   
3. Google Ads - конверсии
   - Страницы благодарности
   - События покупок
   
4. Yandex Metrica - российская аналитика
   - Все страницы
   - Электронная торговля
```

### B2B сервис

```
1. Google Analytics 4 - аналитика
   - Все страницы
   
2. LinkedIn Insight Tag - B2B аналитика
   - Все страницы
   
3. Facebook Pixel - лидогенерация
   - Страницы услуг и форм
   - События: Lead, Contact
   
4. VK Pixel - российская аудитория
   - Все страницы
```

### Образовательная платформа

```
1. Google Analytics 4 - аналитика курсов
   - Все страницы
   - Пользовательские события обучения
   
2. Facebook Pixel - реклама курсов
   - Страницы курсов
   - События: CompleteRegistration, Purchase
   
3. TikTok Pixel - молодая аудитория
   - Страницы курсов
   
4. Yandex Metrica - российские студенты
   - Все страницы
```

## 🔧 Продвинутые настройки

### Пользовательские события VK

```
Событие: course_purchase
Триггер: Отправка формы
CSS селектор: #course-order-form

Событие: consultation_request
Триггер: Клик по кнопке
CSS селектор: .consultation-btn
```

### Пользовательские параметры GA4

```
Параметр: user_segment
Значение: premium

Параметр: traffic_source
Значение: organic

Параметр: course_category
Значение: programming
```

### Условная загрузка пикселей

```javascript
// Загружать Facebook Pixel только для платящих пользователей
if (user.isPremium) {
  // Пиксель загрузится автоматически
}

// Разные пиксели для разных регионов
const userRegion = getUserRegion()
if (userRegion === 'RU') {
  // VK Pixel и Yandex Metrica
} else {
  // Facebook Pixel и Google Analytics
}
```

## 🚀 Планы развития

### Ближайшие улучшения
- [ ] Snapchat Pixel
- [ ] Pinterest Tag
- [ ] Apple Search Ads
- [ ] Дашборд с метриками пикселей
- [ ] A/B тестирование пикселей

### Долгосрочные планы
- [ ] Автоматическая оптимизация загрузки
- [ ] Машинное обучение для персонализации
- [ ] Интеграция с CDP платформами
- [ ] Real-time аналитика

---

Система пикселей FlowMasters готова к использованию! Настройте нужные пиксели через админку и начните отслеживать конверсии автоматически. 🎉
