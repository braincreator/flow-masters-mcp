# Настройка Яндекс.Метрики

## Проблема была решена

Счетчик Яндекс.Метрики был перенесен из корневого layout в локализованный layout для корректной работы с редиректами на локаль.

## Что было исправлено:

### 1. Перемещение счетчика
- **Было**: Счетчик в `src/app/(frontend)/layout.tsx` (корневой layout)
- **Стало**: Счетчик в `src/app/(frontend)/[lang]/layout.tsx` (локализованный layout)

### 2. Проблема с редиректами
- Middleware делает автоматический редирект с `/` на `/ru/` или `/en/`
- В корневом layout счетчик мог не успевать инициализироваться
- Теперь счетчик загружается на финальных локализованных страницах

### 3. Добавлен трекинг SPA-переходов
- Создан компонент `YandexMetrikaTracker` для отслеживания навигации в Next.js
- Автоматически отправляет события при переходах между страницами

## Настройка:

### 1. Установите ID счетчика
В файле `.env.local` замените значение на ваш реальный ID:
```env
NEXT_PUBLIC_YANDEX_METRIKA_ID=ВАШ_РЕАЛЬНЫЙ_ID
```

### 2. Получите ID счетчика
1. Зайдите в [Яндекс.Метрику](https://metrika.yandex.ru/)
2. Выберите ваш сайт
3. Скопируйте числовой ID (например: 12345678)

### 3. Проверьте работу
1. Запустите сайт: `pnpm dev:fast`
2. Перейдите на `/ru/metrika-test` или `/en/metrika-test`
3. Откройте консоль браузера (F12)
4. Проверьте логи метрики и статус загрузки

## Что отслеживается:

### Автоматически:
- Просмотры страниц (включая SPA-переходы)
- Клики по ссылкам
- Карта кликов
- Вебвизор
- Точный показатель отказов

### Тестовые события:
- `page_loaded` - отправляется при загрузке страницы
- `test_button_click` - тестовое событие
- `custom_test_event` - кастомное событие с параметрами

## Файлы изменений:

### Добавлены:
- `src/components/YandexMetrika/YandexMetrikaTracker.tsx` - трекер SPA-переходов
- `src/app/(frontend)/[lang]/metrika-test/page.tsx` - тестовая страница

### Изменены:
- `src/app/(frontend)/[lang]/layout.tsx` - добавлен счетчик и трекер
- `src/app/(frontend)/layout.tsx` - удален счетчик
- `.env.local` - добавлена переменная NEXT_PUBLIC_YANDEX_METRIKA_ID
- `.env.example` - добавлен пример переменной

## Проверка в продакшене:

1. Убедитесь, что переменная `NEXT_PUBLIC_YANDEX_METRIKA_ID` установлена
2. Проверьте в Яндекс.Метрике появление данных (может занять до 30 минут)
3. Используйте расширение браузера "Яндекс.Метрика" для отладки

## Дополнительные возможности:

### Отправка кастомных событий:
```javascript
// В любом клиентском компоненте
if (typeof window !== 'undefined' && window.ym) {
  window.ym(METRIKA_ID, 'reachGoal', 'custom_event_name')
}
```

### Отслеживание электронной торговли:
```javascript
window.ym(METRIKA_ID, 'ecommerce', 'purchase', {
  currency: 'RUB',
  products: [...]
})
```
