# 📊 Настройка аналитики FlowMasters

## ✅ Что реализовано

### 1. Улучшенная интернационализация
- **Умное определение языка** по Accept-Language заголовку
- **Сохранение UTM-меток** при редиректах
- **Кэширование выбора языка** в cookies на 1 год
- **Сохранение referer** для корректной работы аналитики

### 2. Комплексная аналитика
- **Яндекс.Метрика** - полностью адаптирована с ecommerce поддержкой
- **VK Pixel** - новый компонент для ретаргетинга ВКонтакте
- **Top.Mail.Ru** - счетчик Mail.Ru для дополнительной аналитики
- **Единый API** - все сервисы работают через один интерфейс
- **Трекинг форм** - автоматический трекинг всех форм на сайте

### 3. Проксирование для обхода блокировщиков
- Все аналитические скрипты проксируются через ваш домен
- Защита от блокировщиков рекламы
- Улучшенная загрузка скриптов

## 📝 Формы с настроенным трекингом

### ✅ Уже настроены:
1. **ContactForm** (`/components/contact/ContactForm.tsx`)
   - Трекинг начала заполнения при фокусе на поле "name"
   - Трекинг успешной/неуспешной отправки
   - Цели: `form_start`, `form_submit`, `form_field_focus`

2. **ModalLeadForm** (`/app/(frontend)/[lang]/home/components/ModalLeadForm.tsx`)
   - Трекинг лид-форм с разными типами действий
   - Трекинг фокуса на поле "name"
   - Цели: `form_start`, `form_submit`, `form_field_focus`

3. **Newsletter** (`/components/Newsletter.tsx`)
   - Трекинг подписки на рассылку
   - Трекинг фокуса на поле email
   - Цели: `form_start`, `form_submit`, `form_field_focus`

### 🔄 Требуют настройки:
- `OrderContactForm` - форма заказа услуг
- Формы в блоках Payload CMS
- Другие кастомные формы

## 🔧 Настройка переменных окружения

### В .env.local добавьте:

```bash
# Analytics Configuration
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
NEXT_PUBLIC_METRIKA_DEBUG=false

# VK Pixel (замените на ваш реальный ID)
NEXT_PUBLIC_VK_PIXEL_ID=VK-RTRG-000000-XXXXX

# Top.Mail.Ru (замените на ваш реальный ID) 
NEXT_PUBLIC_TOP_MAILRU_ID=3661858
```

## 📋 Как получить ID счетчиков

### VK Pixel
1. Перейдите в [рекламный кабинет ВКонтакте](https://ads.vk.com/)
2. Создайте пиксель ретаргетинга
3. Скопируйте ID пикселя (формат: VK-RTRG-XXXXXX-XXXXX)

### Top.Mail.Ru
1. Перейдите на [top.mail.ru](https://top.mail.ru/)
2. Зарегистрируйте сайт
3. Получите ID счетчика (числовой формат)

## 🎯 Как работает умная интернационализация

### 1. Первый визит пользователя
```
Пользователь заходит на: site.com/?utm_source=google&utm_campaign=test
↓
Middleware определяет язык по Accept-Language: "en-US,en;q=0.9,ru;q=0.8"
↓
Редирект на: site.com/en/?utm_source=google&utm_campaign=test
↓
Язык сохраняется в cookie: preferred-locale=en
```

### 2. Повторные визиты
```
Пользователь заходит на: site.com/
↓
Middleware читает cookie: preferred-locale=en
↓
Редирект на: site.com/en/ (без потери UTM-меток)
```

### 3. Прямые переходы
```
Пользователь переходит по ссылке: site.com/ru/blog/article
↓
Никаких редиректов, страница загружается сразу
```

## 🔍 Debug режим

В development режиме включается debug панель:
- Показывает статус всех аналитических сервисов
- Логирует события в консоль
- Отображает индикаторы загрузки

## 📈 Использование в компонентах

### Хук useAnalytics
```tsx
import { useAnalytics } from '@/components/Analytics/AnalyticsProvider'

function MyComponent() {
  const {
    trackEvent,
    trackPageView,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackFormStart,
    trackFormSubmit,
    trackFormFieldFocus
  } = useAnalytics()

  const handleButtonClick = () => {
    trackEvent('button_click', { button_name: 'subscribe' })
  }

  const handleAddToCart = (product: any) => {
    trackAddToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1
    })
  }

  const handlePurchase = (orderId: string, amount: number, items: any[]) => {
    trackPurchase(orderId, amount, 'RUB', items)
  }

  const handleViewProduct = (product: any) => {
    trackViewItem(product)
  }

  // Трекинг форм
  const handleFormStart = () => {
    trackFormStart('contact_form', 'contact')
  }

  const handleFormSubmit = (success: boolean) => {
    trackFormSubmit('contact_form', 'contact', success)
  }

  return (
    <div>
      <button onClick={handleButtonClick}>Подписаться</button>
      <button onClick={() => handleAddToCart(product)}>В корзину</button>
    </div>
  )
}
```

### Трекинг форм с useFormAnalytics
```tsx
import { useFormAnalytics } from '@/hooks/useFormAnalytics'

function ContactForm() {
  const formAnalytics = useFormAnalytics({
    formName: 'contact_form',
    formType: 'contact',
    trackFieldFocus: true,
    trackFieldErrors: true
  })

  const handleSubmit = async (data: any) => {
    try {
      const response = await submitForm(data)
      formAnalytics.handleFormSubmit(true) // Успех
    } catch (error) {
      formAnalytics.handleFormSubmit(false) // Ошибка
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        onFocus={() => formAnalytics.handleFieldFocus('email')}
      />
      <button type="submit">Отправить</button>
    </form>
  )
}
```

### Автоматический трекинг форм
```tsx
import { useAutoFormTracking, FormTracker } from '@/hooks/useFormAnalytics'

// Вариант 1: С помощью ref
function MyForm() {
  const { formRef } = useAutoFormTracking('contact_form', 'contact')

  return (
    <form ref={formRef}>
      <input name="email" />
      <button type="submit">Отправить</button>
    </form>
  )
}

// Вариант 2: С помощью компонента-обертки
function MyForm() {
  return (
    <FormTracker formName="contact_form" formType="contact">
      <form>
        <input name="email" />
        <button type="submit">Отправить</button>
      </form>
    </FormTracker>
  )
}
```

### Отдельные хуки
```tsx
import { useYandexMetrika } from '@/components/YandexMetrika/YandexMetrikaRobust'
import { useVKPixel } from '@/components/Analytics/VKPixel'
import { useTopMailRu } from '@/components/Analytics/TopMailRu'

function AdvancedComponent() {
  const yandex = useYandexMetrika('98849829')
  const vk = useVKPixel('VK-RTRG-000000-XXXXX')
  const topMail = useTopMailRu('3661858')

  const handleSpecificEvent = () => {
    yandex.trackEvent('custom_goal')
    vk.trackEvent('purchase')
    topMail.trackGoal('conversion', 1000)
  }
}
```

## 🚀 Проверка работы

### 1. Запустите проект
```bash
npm run dev
```

### 2. Откройте браузер в режиме инкогнито
- Перейдите на `http://localhost:3000`
- Проверьте редирект на языковую версию
- Откройте DevTools и проверьте консоль на наличие логов аналитики

### 3. Проверьте сохранение UTM-меток
- Перейдите на `http://localhost:3000/?utm_source=test&utm_campaign=demo`
- Убедитесь, что UTM-метки сохранились после редиректа

### 4. Проверьте работу аналитики
- В debug режиме должны появиться индикаторы статуса
- В консоли должны быть логи инициализации сервисов

## ⚠️ Важные замечания

### Для продакшена
1. Замените тестовые ID на реальные в `.env.local`
2. Отключите debug режим: `NEXT_PUBLIC_METRIKA_DEBUG=false`
3. Проверьте работу всех счетчиков в реальных условиях

### SEO оптимизация
- Добавьте hreflang теги для разных языков
- Настройте sitemap.xml для каждого языка
- Убедитесь, что роботы правильно индексируют языковые версии

### Производительность
- Все скрипты загружаются асинхронно
- Используется стратегия `afterInteractive` для оптимальной производительности
- Проксирование предотвращает блокировку скриптов

## 🔧 Дополнительные настройки

### Настройка исключений в Яндекс.Метрике
1. В настройках счетчика добавьте исключения для внутренних переходов
2. Настройте фильтры для корректной атрибуции источников

### Настройка целей в Яндекс.Метрике
Создайте следующие цели в вашем счетчике Яндекс.Метрики:

**Основные цели:**
- `form_start` - Начало заполнения любой формы
- `form_submit` - Успешная отправка формы
- `form_field_focus` - Фокус на поле формы
- `form_error` - Ошибка отправки формы

**Ecommerce цели:**
- `purchase` - Покупка
- `add_to_cart` - Добавление в корзину
- `view_item` - Просмотр товара

**Специфичные цели:**
- `lead` - Лид (для VK Pixel)
- `newsletter_subscribe` - Подписка на рассылку

### Настройка воронок
1. **Воронка лидогенерации:**
   - Просмотр страницы → `form_start` → `form_submit`

2. **Воронка покупки:**
   - `view_item` → `add_to_cart` → `purchase`

3. **Воронка подписки:**
   - Просмотр страницы → `form_start` (newsletter) → `form_submit` (newsletter)

Теперь ваша аналитика работает корректно с интернационализацией и полным трекингом форм! 🎉
