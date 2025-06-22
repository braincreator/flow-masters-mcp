# 📊 Примеры использования аналитических компонентов FlowMasters

## 🚀 Быстрый старт

Система аналитики уже интегрирована в layout и работает автоматически! Но вы можете использовать специальные компоненты для более точного отслеживания.

## 🎯 Готовые компоненты для отслеживания

### 1. TrackableButton - Кнопки с отслеживанием

```tsx
import { TrackableButton, CTAButton, BuyButton, ContactButton } from '@/components/Analytics'

// Обычная кнопка с отслеживанием
<TrackableButton 
  trackEvent="custom_click"
  trackData={{ section: 'hero', position: 'top' }}
  onClick={() => console.log('Clicked!')}
>
  Нажми меня
</TrackableButton>

// CTA кнопка (автоматически отслеживает как cta_click)
<CTAButton 
  conversionType="lead"
  conversionValue={3000}
  trackData={{ campaign: 'summer_promo' }}
>
  Получить консультацию
</CTAButton>

// Кнопка покупки (автоматически отслеживает как purchase_intent)
<BuyButton 
  conversionValue={15000}
  trackData={{ product: 'premium_course' }}
>
  Купить курс
</BuyButton>

// Кнопка контакта (автоматически отслеживает как contact_intent)
<ContactButton 
  trackData={{ source: 'pricing_page' }}
>
  Связаться с нами
</ContactButton>
```

### 2. TrackableLink - Ссылки с отслеживанием

```tsx
import { TrackableLink } from '@/components/Analytics'

// Обычная ссылка
<TrackableLink 
  href="/about"
  trackData={{ section: 'navigation' }}
>
  О нас
</TrackableLink>

// Внешняя ссылка (автоматически определяется как external)
<TrackableLink 
  href="https://example.com"
  trackData={{ partner: 'example' }}
>
  Партнер
</TrackableLink>

// Телефон (автоматически определяется как phone)
<TrackableLink 
  href="tel:+79991234567"
  trackData={{ location: 'header' }}
>
  +7 999 123-45-67
</TrackableLink>

// Email (автоматически определяется как email)
<TrackableLink 
  href="mailto:info@flowmasters.ru"
  trackData={{ location: 'footer' }}
>
  info@flowmasters.ru
</TrackableLink>
```

### 3. TrackableForm - Формы с отслеживанием

```tsx
import { TrackableForm, LeadForm } from '@/components/Analytics/TrackableButton'

// Обычная форма
<TrackableForm 
  formName="Contact Form"
  conversionType="lead"
  conversionValue={5000}
  trackData={{ page: 'contact', source: 'organic' }}
  onSubmit={handleSubmit}
>
  <input type="text" name="name" placeholder="Имя" />
  <input type="email" name="email" placeholder="Email" />
  <button type="submit">Отправить</button>
</TrackableForm>

// Готовая форма лидов
<LeadForm 
  formName="Consultation Request"
  conversionValue={3000}
  trackData={{ campaign: 'google_ads' }}
  onSubmit={handleLeadSubmit}
>
  <input type="text" name="name" placeholder="Ваше имя" />
  <input type="tel" name="phone" placeholder="Телефон" />
  <textarea name="message" placeholder="Сообщение"></textarea>
  <button type="submit">Получить консультацию</button>
</LeadForm>
```

### 4. VisibilityTracker - Отслеживание видимости

```tsx
import { VisibilityTracker } from '@/components/Analytics/TrackableButton'

// Отслеживание просмотра секции
<VisibilityTracker 
  trackEvent="section_viewed"
  trackData={{ section: 'pricing', position: 'middle' }}
  threshold={0.7} // 70% элемента должно быть видно
>
  <div className="pricing-section">
    <h2>Наши тарифы</h2>
    {/* контент секции */}
  </div>
</VisibilityTracker>

// Отслеживание просмотра продукта
<VisibilityTracker 
  trackEvent="product_viewed"
  trackData={{ 
    product_id: 'course-123',
    product_name: 'React курс',
    price: 15000 
  }}
>
  <div className="product-card">
    {/* карточка продукта */}
  </div>
</VisibilityTracker>
```

### 5. FormTracker - Автоматическое отслеживание форм

```tsx
import FormTracker from '@/components/Analytics/FormTracker'

// Отслеживание конкретной формы по ID
<div>
  <form id="newsletter-form">
    <input type="email" name="email" />
    <button type="submit">Подписаться</button>
  </form>
  
  <FormTracker 
    formId="newsletter-form"
    formName="Newsletter Subscription"
    conversionType="registration"
  />
</div>

// Отслеживание всех форм на странице
<FormTracker 
  formName="Page Forms"
  conversionType="lead"
  conversionValue={2000}
/>
```

## 🎛️ Автоматическое отслеживание

Система автоматически отслеживает:

### ✅ Что отслеживается автоматически:
- **Просмотры страниц** - при переходе между страницами
- **Клики по кнопкам** - элементы с `data-track` атрибутом
- **Внешние ссылки** - автоматически определяются
- **Скролл страницы** - глубина прокрутки (25%, 50%, 75%, 100%)
- **Время на странице** - пороги 30с, 1мин, 2мин, 5мин
- **CTA кнопки** - элементы с классами `.cta-button`, `[data-cta]`
- **Телефоны и email** - клики по `tel:` и `mailto:` ссылкам

### 📱 Добавление data-атрибутов для отслеживания:

```html
<!-- Простое отслеживание клика -->
<button data-track>Кнопка</button>

<!-- Отслеживание с дополнительными данными -->
<button 
  data-track
  data-track-category="hero"
  data-track-action="cta_click"
  data-track-value="5000"
>
  Получить консультацию
</button>

<!-- CTA кнопка (отслеживается автоматически) -->
<button class="cta-button">Заказать звонок</button>
<button data-cta>Купить сейчас</button>

<!-- Кнопка покупки (отслеживается автоматически) -->
<button data-buy>Добавить в корзину</button>
<button class="buy-button">Оформить заказ</button>
```

## 🔧 Ручное отслеживание событий

```tsx
import { usePixelEvents } from '@/hooks/usePixelEvents'
import { useFormTracking } from '@/components/Analytics/FormTracker'

function MyComponent() {
  const { 
    trackEvent, 
    trackPurchase, 
    trackLead, 
    trackViewContent 
  } = usePixelEvents()
  
  const { trackFormSubmit } = useFormTracking()

  const handleProductView = async () => {
    await trackViewContent({
      content_name: 'React Course',
      content_category: 'Programming',
      content_ids: ['course-123'],
      value: 15000,
      currency: 'RUB'
    })
  }

  const handlePurchase = async () => {
    await trackPurchase({
      value: 15000,
      currency: 'RUB',
      orderId: 'order-456',
      items: [
        { id: 'course-123', name: 'React Course', price: 15000 }
      ]
    })
  }

  const handleCustomEvent = async () => {
    await trackEvent('video_play', {
      video_title: 'Course Introduction',
      video_duration: 120,
      video_position: 0
    })
  }

  const handleFormSubmit = async (formData: any) => {
    await trackFormSubmit({
      formName: 'Custom Form',
      conversionType: 'lead',
      conversionValue: 3000,
      additionalData: {
        source: 'landing_page',
        campaign: 'google_ads'
      }
    })
  }

  return (
    <div>
      <button onClick={handleProductView}>Посмотреть курс</button>
      <button onClick={handlePurchase}>Купить</button>
      <button onClick={handleCustomEvent}>Воспроизвести видео</button>
    </div>
  )
}
```

## 🎯 Готовые сценарии

### E-commerce магазин

```tsx
// Страница товара
<VisibilityTracker 
  trackEvent="product_impression"
  trackData={{ product_id: product.id, category: product.category }}
>
  <div className="product-details">
    <h1>{product.name}</h1>
    <p>Цена: {product.price} ₽</p>
    
    <BuyButton 
      conversionValue={product.price}
      trackData={{ 
        product_id: product.id,
        product_name: product.name,
        category: product.category 
      }}
      onClick={() => addToCart(product)}
    >
      Добавить в корзину
    </BuyButton>
  </div>
</VisibilityTracker>

// Страница оформления заказа
<TrackableForm 
  formName="Checkout Form"
  conversionType="purchase"
  conversionValue={cartTotal}
  trackData={{ 
    cart_items: cartItems.length,
    cart_value: cartTotal 
  }}
>
  {/* поля формы */}
</TrackableForm>
```

### Лендинг услуг

```tsx
// Главный экран
<section className="hero">
  <h1>Разработка сайтов</h1>
  <p>Создаем современные веб-решения</p>
  
  <CTAButton 
    conversionType="lead"
    conversionValue={50000}
    trackData={{ 
      section: 'hero',
      offer: 'website_development' 
    }}
  >
    Получить расчет стоимости
  </CTAButton>
</section>

// Секция с ценами
<VisibilityTracker 
  trackEvent="pricing_viewed"
  trackData={{ section: 'pricing' }}
>
  <section className="pricing">
    {/* тарифы */}
  </section>
</VisibilityTracker>

// Форма контактов
<LeadForm 
  formName="Contact Form"
  conversionValue={30000}
  trackData={{ 
    page: 'landing',
    service: 'web_development' 
  }}
>
  {/* поля формы */}
</LeadForm>
```

### Образовательная платформа

```tsx
// Карточка курса
<VisibilityTracker 
  trackEvent="course_viewed"
  trackData={{ 
    course_id: course.id,
    course_category: course.category,
    price: course.price 
  }}
>
  <div className="course-card">
    <h3>{course.title}</h3>
    <p>Цена: {course.price} ₽</p>
    
    <TrackableButton 
      trackEvent="course_interest"
      conversionType="lead"
      trackData={{ course_id: course.id }}
      onClick={() => showCourseDetails(course)}
    >
      Подробнее
    </TrackableButton>
    
    <BuyButton 
      conversionValue={course.price}
      trackData={{ 
        course_id: course.id,
        course_name: course.title 
      }}
    >
      Записаться на курс
    </BuyButton>
  </div>
</VisibilityTracker>
```

## 📊 GDPR и согласие на cookies

Система автоматически:
- Показывает баннер согласия на cookies
- Загружает пиксели только после согласия пользователя
- Учитывает категории cookies (аналитика, маркетинг, функциональные)
- Сохраняет выбор пользователя

```tsx
import { useCookieConsent } from '@/components/CookieConsent'

function MyComponent() {
  const { consent } = useCookieConsent()

  // Проверяем согласие перед отслеживанием
  if (consent?.marketing) {
    // Можно отслеживать маркетинговые события
  }

  if (consent?.analytics) {
    // Можно отслеживать аналитические события
  }
}
```

---

Все компоненты готовы к использованию! Просто импортируйте нужные компоненты и добавляйте отслеживание к своим элементам. Система автоматически отправит события во все настроенные пиксели. 🚀
