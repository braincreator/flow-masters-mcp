# 🚀 Система максимального сбора метаданных для форм FlowMasters

## ✅ Что реализовано

### 1. Максимальный сбор метаданных
- **UTM-метки**: utm_source, utm_medium, utm_campaign, utm_term, utm_content
- **Рекламные ID**: gclid (Google), fbclid (Facebook), yclid (Yandex), msclkid (Microsoft)
- **Источники трафика**: referrer, landing_page, current_page, search_engine, organic_keyword
- **Информация об устройстве**: браузер, ОС, тип устройства, разрешение экрана, язык, временная зона
- **Поведенческие данные**: время на странице, глубина прокрутки, количество кликов, путь по сайту
- **Сессионные данные**: ID сессии, статус аутентификации, информация о пользователе
- **Технические метаданные**: время загрузки, поддержка JS/cookies, детекция ботов и блокировщиков

### 2. Новые компоненты и хуки

#### `useEnhancedFormSubmission`
Главный хук для обогащенной отправки форм:

```typescript
const {
  isLoading,
  isSuccess,
  error,
  submitForm,
  resetForm,
  handleFormStart,
  handleFieldInteraction,
} = useEnhancedFormSubmission({
  formName: 'contact_form',
  formType: 'contact',
  formLocation: 'header',
  apiEndpoint: '/api/form-submissions',
  collectLocation: false, // Запрос геолокации
  enableAnalytics: true,
  enableTracking: true,
})
```

#### Утилиты для сбора метаданных
- `src/utilities/formMetadata.ts` - сбор всех метаданных
- `src/utilities/userTracking.ts` - отслеживание поведения пользователя
- `src/types/formMetadata.ts` - типы для всех метаданных

### 3. Обновленные коллекции

#### FormSubmissions
Расширена для хранения полных метаданных:
- Основные данные формы
- UTM-данные и источники трафика
- Информация об устройстве и браузере
- Поведенческие данные пользователя
- Сессионная информация
- Контекст формы
- Технические метаданные
- Геолокация (опционально)

#### Forms
Обновлена для совместимости с новой системой.

### 4. Обновленные компоненты

#### ModalLeadForm
Полностью интегрирован с новой системой:
- Автоматический сбор всех метаданных
- Отслеживание взаимодействий с полями
- Интеграция с аналитикой

#### FormBlock
Обновлен для использования нового хука:
- Контекст отслеживания для полей
- Автоматический сбор метаданных
- Улучшенная обработка ошибок

## 🔧 Как использовать

### 1. Инициализация отслеживания

Добавьте компонент `MetadataTracker` в корневой layout:

```tsx
import MetadataTracker from '@/components/MetadataTracker'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MetadataTracker />
        {children}
      </body>
    </html>
  )
}
```

### 2. Использование в новых формах

```tsx
import { useEnhancedFormSubmission } from '@/hooks/useEnhancedFormSubmission'

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' })
  
  const {
    isLoading,
    isSuccess,
    error,
    submitForm,
    handleFieldInteraction,
  } = useEnhancedFormSubmission({
    formName: 'my_form',
    formType: 'contact',
    formLocation: 'footer',
    enableAnalytics: true,
    enableTracking: true,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await submitForm(formData)
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value })
          handleFieldInteraction('name', 'change', e.target.value)
        }}
        onFocus={() => handleFieldInteraction('name', 'focus')}
        onBlur={() => handleFieldInteraction('name', 'blur', formData.name)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  )
}
```

### 3. Настройка сбора метаданных

```typescript
const config: MetadataCollectionConfig = {
  collect_utm: true,
  collect_device_info: true,
  collect_location: false, // Требует разрешения пользователя
  collect_behavior: true,
  collect_technical: true,
  collect_marketing: true,
  anonymize_ip: true,
  respect_dnt: true, // Уважать Do Not Track
}

const { submitForm } = useEnhancedFormSubmission({
  formName: 'privacy_form',
  formType: 'contact',
  metadataConfig: config,
})
```

## 📊 Какие данные собираются

### UTM и реклама
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`, `yclid`, `msclkid`

### Источники трафика
- `referrer` - откуда пришел пользователь
- `landing_page` - первая страница сессии
- `current_page` - текущая страница
- `search_engine` - поисковая система
- `organic_keyword` - ключевое слово

### Устройство и браузер
- `user_agent`, `browser_name`, `browser_version`
- `os_name`, `os_version`, `device_type`
- `screen_resolution`, `viewport_size`
- `language`, `timezone`, `touch_support`

### Поведение пользователя
- `session_id` - уникальный ID сессии
- `time_on_page`, `time_on_site` - время на странице/сайте
- `scroll_depth`, `max_scroll_depth` - глубина прокрутки
- `pages_visited` - посещенные страницы
- `mouse_movements`, `clicks_count` - активность мыши
- `is_returning_visitor`, `visit_count` - статус посетителя

### Контекст формы
- `form_type`, `form_name`, `form_location`
- `form_trigger` - что вызвало показ формы
- `modal_context` - в модальном окне или нет
- `submission_attempt` - номер попытки отправки

### Технические данные
- `javascript_enabled`, `cookies_enabled`
- `local_storage_enabled`
- `ad_blocker_detected`, `bot_detected`
- `page_load_time`, `form_load_time`

## 🔒 Приватность и безопасность

### Настройки приватности
- **Do Not Track**: автоматическое ограничение сбора при включенном DNT
- **Анонимизация IP**: опция для анонимизации IP-адресов
- **Геолокация**: только с явного разрешения пользователя
- **Fingerprinting**: отключен по умолчанию

### GDPR совместимость
- Возможность отключения сбора метаданных
- Уважение настроек приватности браузера
- Прозрачность собираемых данных

## 🚀 API Endpoints

### POST /api/form-submissions
Основной endpoint для отправки форм с метаданными:

```json
{
  "form": "form_id", // опционально
  "submissionData": [
    { "field": "name", "value": "John Doe", "type": "string" },
    { "field": "email", "value": "john@example.com", "type": "email" }
  ],
  "metadata": {
    "utm_data": { "utm_source": "google", "utm_medium": "cpc" },
    "device_info": { "browser_name": "Chrome", "os_name": "Windows" },
    "user_behavior": { "time_on_page": 120, "scroll_depth": 75 }
  }
}
```

### GET /api/form-submissions
Получение отправок форм с фильтрацией:

```
GET /api/form-submissions?form=form_id&page=1&limit=10
```

## 📈 Аналитика и отчеты

### Интеграция с существующей аналитикой
- Автоматическая отправка событий в Яндекс.Метрику
- Интеграция с VK Pixel и Top.Mail.Ru
- Совместимость с Google Analytics

### Доступные метрики
- Конверсия форм по источникам трафика
- Время заполнения форм
- Популярные устройства и браузеры
- География пользователей
- Поведенческие паттерны

## 🔧 Настройка и развертывание

### 1. Обновление базы данных
Новые поля автоматически добавятся при следующем запуске Payload CMS.

### 2. Переменные окружения
Никаких дополнительных переменных не требуется.

### 3. Миграция существующих форм
Существующие формы продолжат работать. Для получения расширенных метаданных обновите их на использование `useEnhancedFormSubmission`.

## 🐛 Отладка

### Режим отладки
```typescript
const { submitForm } = useEnhancedFormSubmission({
  formName: 'debug_form',
  formType: 'test',
  metadataConfig: {
    // ... конфигурация
  },
})

// В консоли браузера будут логи сбора метаданных
```

### Проверка метаданных
```typescript
import { createFormMetadata } from '@/utilities/formMetadata'

// Получить текущие метаданные
const metadata = createFormMetadata({
  form_type: 'test',
  form_location: 'debug',
})

console.log('Current metadata:', metadata)
```

## 📝 Примеры использования

### Простая контактная форма
```tsx
function ContactForm() {
  const { submitForm, isLoading, error } = useEnhancedFormSubmission({
    formName: 'contact',
    formType: 'contact',
    formLocation: 'contact_page',
  })

  const handleSubmit = async (formData) => {
    await submitForm(formData)
  }

  // ... остальная логика формы
}
```

### Форма с кастомными метаданными
```tsx
function CustomForm() {
  const { submitForm } = useEnhancedFormSubmission({
    formName: 'custom',
    formType: 'lead',
    formLocation: 'landing_page',
    metadataConfig: {
      collect_location: true, // Запрашиваем геолокацию
      collect_fingerprint: false, // Не собираем отпечаток
    },
  })

  const handleSubmit = async (formData) => {
    await submitForm(formData, {
      additionalData: {
        campaign_id: 'summer_2024',
        landing_variant: 'A',
      },
    })
  }

  // ... остальная логика
}
```

## 🎯 Следующие шаги

1. **Добавить MetadataTracker** в корневой layout
2. **Обновить существующие формы** на новый хук
3. **Настроить аналитику** для новых метрик
4. **Создать дашборд** для анализа данных форм
5. **Настроить алерты** для важных событий

---

Система готова к использованию! Все формы теперь будут собирать максимальную информацию о пользователях и их поведении, что поможет улучшить конверсию и понять аудиторию.
