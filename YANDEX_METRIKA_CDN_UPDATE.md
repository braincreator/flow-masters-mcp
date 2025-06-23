# 🔄 Обновление CDN для аналитики и рекламы

## ✅ Выполненные изменения

Настроил обход блокировщиков рекламы для основных аналитических сервисов:
- **Яндекс Метрика**: заменил `mc.yandex.ru` на `mc.webvisor.org`
- **VK Pixel**: настроил проксирование через `/vk-pixel/`

### 📁 Обновленные файлы:

#### 1. **PixelManager** (`src/components/PixelManager/index.tsx`)
- ✅ Заменил `https://mc.yandex.ru/metrika/tag.js` → `https://mc.webvisor.org/metrika/tag_ww.js`
- ✅ Обновил noscript img: `https://mc.yandex.ru/watch/` → `https://mc.webvisor.org/watch/`

#### 2. **Middleware** (`src/middleware.ts`)
- ✅ Обновил проксирование: `/metrika/tag.js` → `https://mc.webvisor.org/metrika/tag_ww.js`
- ✅ Обновил проксирование: `/metrika/watch` → `https://mc.webvisor.org/watch`

#### 3. **API тест** (`src/app/api/test/metrika/route.ts`)
- ✅ Заменил URL для проверки доступности на `https://mc.webvisor.org/metrika/tag_ww.js`

#### 4. **Next.js конфигурация** (`next.config.mjs`)
- ✅ Добавил `mc.webvisor.org` в разрешенные домены для изображений
- ✅ Обновил Content Security Policy для поддержки нового CDN
- ✅ Обновил rewrites для проксирования на новый CDN

#### 5. **Debug компонент** (`src/components/YandexMetrika/YandexMetrikaDebug.tsx`)
- ✅ Добавил проверку скриптов с `mc.webvisor.org`

#### 6. **Backup файлы**
- ✅ `src/app/(frontend)/[lang]/layout.backup.tsx`
- ✅ `src/app/(frontend)/[lang]/layout.old.tsx`

#### 7. **Тестовый компонент** (`src/components/YandexMetrikaTest.tsx`)
- ✅ Обновил инструкции для проверки

#### 8. **VK Pixel обход блокировок**
- ✅ Обновил `src/components/PixelManager/index.tsx` для использования `/vk-pixel/` прокси
- ✅ Настроил middleware для проксирования VK запросов
- ✅ Добавил VK домены в Next.js конфигурацию
- ✅ Создал API тест для VK Pixel (`/api/test/vk-pixel`)
- ✅ Создал компонент для тестирования VK Pixel

#### 9. **Документация** (`docs/legacy/FINAL_IMPLEMENTATION_GUIDE.md`)
- ✅ Обновил примеры кода

## 🎯 Преимущества альтернативного CDN

### ✅ **Яндекс Метрика (mc.webvisor.org)**
- Официальный альтернативный домен Яндекса
- Обходит большинство блокировщиков рекламы
- Полная совместимость с оригинальным API
- Стабильная работа

### ✅ **VK Pixel (проксирование)**
- Проксирование через собственный домен `/vk-pixel/`
- Обход блокировщиков рекламы
- Сохранение всех функций VK Retargeting
- Автоматическое перенаправление запросов

### 🔧 **Технические детали**
- Используется `tag_ww.js` вместо `tag.js` (специальная версия для обхода блокировок)
- Все функции Яндекс Метрики работают без изменений
- Сохранена обратная совместимость

## 🚀 Проверка работы

1. **Запустите проект:**
   ```bash
   npm run dev
   ```

2. **Откройте DevTools → Network:**
   - Должны появиться запросы к `mc.webvisor.org` (Яндекс Метрика)
   - Должны появиться запросы к `/vk-pixel/` (VK Pixel)
   - Скрипт `tag_ww.js` должен загружаться успешно

3. **Проверьте консоль:**
   - Не должно быть ошибок загрузки Яндекс Метрики
   - Функция `ym()` должна быть доступна
   - Не должно быть ошибок загрузки VK Pixel
   - Объект `VK.Retargeting` должен быть доступен

4. **Тестовые API:**
   - `/api/test/metrika` - проверка Яндекс Метрики
   - `/api/test/vk-pixel` - проверка VK Pixel

## 📊 Мониторинг

- Данные продолжат поступать в тот же счетчик Яндекс Метрики
- Никаких изменений в настройках счетчика не требуется
- Статистика будет отображаться как обычно

## 🔄 Откат (если потребуется)

Для возврата к оригинальному CDN замените во всех файлах:
- `mc.webvisor.org/metrika/tag_ww.js` → `mc.yandex.ru/metrika/tag.js`
- `mc.webvisor.org/watch` → `mc.yandex.ru/watch`

---

**Статус:** ✅ Готово к использованию  
**Дата обновления:** $(date)  
**Версия:** 1.0
