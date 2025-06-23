# AI Agency Landing Page - Form Integration Setup

## ✅ Реализованные функции

### 1. Коллекции CMS

- ✅ **FormSubmissions** - коллекция для хранения заявок
- ✅ **Forms** - коллекция для настройки форм
- ✅ Интеграция с ServiceRegistry и TelegramService

### 2. API Endpoints

- ✅ `/api/form-submissions` - новый API для обработки форм
- ✅ `/api/v1/leads` - legacy API (обновлен для совместимости)
- ✅ Автоматическое определение формы AI Agency

### 3. Frontend Components

- ✅ **ModalLeadForm** - обновленный компонент формы
- ✅ Автоматическая загрузка ID формы из CMS
- ✅ Анимированное модальное окно успеха
- ✅ Кнопка перехода в Telegram бот
- ✅ Обработка ошибок и состояний загрузки

### 4. Интеграции

- ✅ Telegram уведомления (требует настройки токенов)
- ✅ Интеграционные события через ServiceRegistry
- ✅ Сохранение в CMS с автоматической обработкой

## 🚀 Как использовать

### 1. Тестирование формы

Откройте тестовую страницу: `http://localhost:3001/ru/test-form`

### 2. Использование в компонентах

```tsx
import { ModalLeadForm } from './ModalLeadForm'

// В вашем компоненте
;<ModalLeadForm
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  title="Оставьте заявку"
  description="Мы свяжемся с вами в ближайшее время"
  actionType="pricing" // или другой тип
/>
```

### 3. API использование

```javascript
// Прямое обращение к API
const response = await fetch('/api/form-submissions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    form: 'FORM_ID', // ID формы из CMS
    submissionData: [
      { field: 'name', value: 'Имя пользователя' },
      { field: 'phone', value: '+7 999 123 45 67' },
      { field: 'email', value: 'user@example.com' },
      { field: 'comment', value: 'Комментарий' },
      { field: 'actionType', value: 'test' },
    ],
  }),
})
```

## ⚙️ Настройка Telegram уведомлений

### 1. Создайте Telegram бота

1. Напишите @BotFather в Telegram
2. Создайте нового бота командой `/newbot`
3. Получите токен бота

### 2. Получите Chat ID

1. Добавьте бота в группу или напишите ему лично
2. Отправьте сообщение боту
3. Откройте `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Найдите `chat.id` в ответе

### 3. Обновите .env.local

```env
TELEGRAM_BOT_TOKEN=your_real_bot_token_here
TELEGRAM_CHAT_ID=your_real_chat_id_here
```

### 4. Перезапустите сервер

```bash
pnpm dev:fast
```

## 📊 Мониторинг

### Логи сервера

Следите за логами в консоли:

- `Processing event form.submitted` - обработка заявки
- `Telegram service is not configured` - нужна настройка Telegram
- `No active integrations found` - нормально, если нет дополнительных интеграций

### Проверка в CMS

1. Откройте админ панель Payload CMS
2. Перейдите в раздел "Content" → "Form Submissions"
3. Проверьте сохраненные заявки

## 🔧 Дополнительные настройки

### Изменение URL Telegram бота

В файле `ModalLeadForm.tsx` найдите строку:

```tsx
href = 'https://t.me/flow_masters_bot'
```

Замените на URL вашего бота.

### Кастомизация сообщений

В файле `FormSubmissions/index.ts` можно изменить формат Telegram сообщения:

```typescript
const message = `🚀 Новая заявка с AI Agency лендинга!\n\n${submissionText}\n\nВремя: ${new Date(doc.createdAt).toLocaleString('ru-RU')}`
```

## 🎯 Статус реализации

- ✅ Коллекции CMS созданы и настроены
- ✅ API эндпоинты работают
- ✅ Frontend компоненты обновлены
- ✅ Анимации и UX реализованы
- ✅ Интеграция с Telegram подготовлена
- ⚠️ Требуется настройка реальных Telegram токенов
- ✅ Тестирование завершено

## 📝 ID созданной формы

Form ID: `683d9c39e6e7cfc7c9c76881`
Название: "AI Agency — Основная заявка (v3)"

### История версий:

- v1 (`683d7604d27ebdeff3742023`): Первая версия с проблемой confirmationMessage
- v2 (`683d810de6e7cfc7c9c7681e`): Исправленная версия с корректным richText полем
- v3 (`683d9c39e6e7cfc7c9c76881`): Финальная версия с правильной структурой Lexical редактора

### ✅ Проблемы решены:

- Ошибка "parseEditorState: type undefined + not found" исправлена
- confirmationMessage теперь корректно отображается в админ панели
- Lexical редактор работает без ошибок
- Добавлены удобные кнопки форматирования в редактор

### 🎨 Возможности Lexical редактора:

**Базовое форматирование:**

- **Жирный текст** (Bold) - кнопка B или Ctrl+B
- _Курсив_ (Italic) - кнопка I или Ctrl+I
- <u>Подчеркивание</u> (Underline) - кнопка U или Ctrl+U

**Структура документа:**

- Заголовки H1-H4 - выпадающий список типов блоков
- Параграфы - стандартный текст

**Дополнительные элементы:**

- Ссылки - кнопка вставки ссылки с возможностью связи с другими страницами

**Панели инструментов:**

- Фиксированная панель инструментов сверху редактора
- Всплывающая панель при выделении текста
- Удобные горячие клавиши для быстрого форматирования

**Примечание:** Редактор настроен с базовым набором функций для стабильной работы. При необходимости можно добавить дополнительные возможности (списки, цитаты, выравнивание) после проверки совместимости с текущей версией Payload CMS.
