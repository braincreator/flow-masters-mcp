# Интеграция Sitemap в процесс сборки

## Обзор

Система sitemap для Flow Masters теперь полностью интегрирована в процесс сборки и автоматически обновляется при изменении контента.

## 🔧 Архитектура решения

### 1. Автоматическая генерация при сборке

**Обновленные команды сборки:**
```json
{
  "build": "... && npm run generate:sitemap",
  "build:turbo": "... && npm run generate:sitemap", 
  "build:prod": "... && npm run generate:sitemap",
  "generate:sitemap": "node scripts/generate-sitemap.js"
}
```

**Что происходит:**
- При каждой сборке автоматически генерируется статический sitemap
- Скрипт проверяет наличие необходимых файлов
- Выводит информацию о созданных файлах и их размере

### 2. Динамические sitemap маршруты

**API маршруты для real-time sitemap:**
- `/sitemap.xml` - основной sitemap (всегда актуальный)
- `/pages-sitemap.xml` - страницы
- `/posts-sitemap.xml` - посты блога  
- `/services-sitemap.xml` - услуги
- `/sitemap-index.xml` - индекс всех sitemap

**Преимущества:**
- Всегда актуальные данные из базы
- Автоматическое кэширование (1 час)
- Fallback в случае ошибок

### 3. Автоматическая инвалидация кэша

**Payload CMS hooks:**
```typescript
// В каждой коллекции добавлены hooks
hooks: {
  afterChange: [existingHook, revalidateSitemap],
  afterDelete: [existingDeleteHook, revalidateSitemapDelete],
}
```

**Что происходит при изменении контента:**
1. Срабатывает hook после изменения/удаления
2. Инвалидируется соответствующий sitemap кэш
3. Отправляется webhook (в продакшене)
4. Логируется информация об обновлении

## 📁 Структура файлов

```
src/
├── app/(frontend)/
│   ├── sitemap.xml/route.ts          # Основной динамический sitemap
│   ├── robots.txt/route.ts           # Динамический robots.txt
│   ├── sitemap-index.xml/route.ts    # Индекс sitemap
│   └── (sitemaps)/
│       ├── pages-sitemap.xml/route.ts
│       ├── posts-sitemap.xml/route.ts
│       └── services-sitemap.xml/route.ts
├── api/revalidate-sitemap/route.ts   # Webhook для инвалидации
├── hooks/revalidateSitemap.ts        # Hooks для автообновления
└── components/seo/                   # SEO компоненты

scripts/
├── generate-sitemap.js               # Скрипт генерации sitemap
└── check-seo.sh                     # Скрипт проверки SEO

next-sitemap.config.cjs               # Конфигурация статического sitemap
```

## 🚀 Как это работает

### При разработке
```bash
npm run dev
# Динамические sitemap доступны сразу:
# http://localhost:3000/sitemap.xml
# http://localhost:3000/pages-sitemap.xml
```

### При сборке
```bash
npm run build
# 1. Собирается Next.js приложение
# 2. Автоматически генерируется статический sitemap
# 3. Создаются файлы в public/
```

### При изменении контента
```
Пользователь изменяет страницу в CMS
    ↓
Срабатывает afterChange hook
    ↓
Инвалидируется кэш pages-sitemap
    ↓
Следующий запрос получает обновленный sitemap
```

## 🔍 Проверка работы

### Локальная проверка
```bash
# Проверка всех sitemap
./scripts/check-seo.sh http://localhost:3000

# Ручная генерация
npm run generate:sitemap

# Проверка конкретного sitemap
curl http://localhost:3000/sitemap.xml
```

### Продакшн проверка
```bash
# Полная проверка SEO
./scripts/check-seo.sh https://flow-masters.ru

# Ручная инвалидация кэша
curl "https://flow-masters.ru/api/revalidate-sitemap?secret=YOUR_SECRET"
```

## ⚙️ Конфигурация

### Переменные окружения
```bash
# Основной URL (обязательно для продакшена)
NEXT_PUBLIC_SERVER_URL=https://flow-masters.ru

# Секрет для webhook (рекомендуется)
CRON_SECRET=your-secure-secret-here
```

### Настройка кэширования
```typescript
// В sitemap маршрутах
const cache = unstable_cache(
  async () => { /* генерация */ },
  ['sitemap-key'],
  {
    tags: ['sitemap-tag'],
    revalidate: 3600, // 1 час
  }
)
```

## 🛠 Отладка

### Проблемы с генерацией
```bash
# Проверить что проект собран
ls -la .next/

# Проверить конфигурацию
cat next-sitemap.config.cjs

# Запустить генерацию вручную
node scripts/generate-sitemap.js
```

### Проблемы с динамическими sitemap
```bash
# Проверить доступность
curl -I http://localhost:3000/sitemap.xml

# Проверить логи в консоли разработчика
# Ошибки будут видны в терминале Next.js
```

### Проблемы с кэшированием
```bash
# Ручная инвалидация всех кэшей
curl -X POST http://localhost:3000/api/revalidate-sitemap \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"collection":"manual","operation":"revalidate"}'
```

## 📊 Мониторинг

### Логи в Payload CMS
```
🗺️ Revalidated pages-sitemap for page: about
🗺️ Revalidated posts-sitemap for post: new-article
🔄 Sent sitemap revalidation webhook for services
```

### Метрики для отслеживания
- Время генерации sitemap
- Размер sitemap файлов
- Частота обновлений
- Ошибки генерации

## 🔄 Workflow для команды

### Разработчик
1. Изменяет контент в CMS
2. Sitemap обновляется автоматически
3. Проверяет изменения через `/sitemap.xml`

### DevOps
1. Деплой автоматически генерирует sitemap
2. Мониторинг доступности sitemap
3. Проверка в Google Search Console

### SEO специалист
1. Регулярная проверка через `check-seo.sh`
2. Анализ индексации в Search Console
3. Оптимизация приоритетов в конфигурации

## 🚨 Важные моменты

1. **Статический vs Динамический**: Используются оба подхода для максимальной надежности
2. **Кэширование**: Динамические sitemap кэшируются на 1 час
3. **Fallback**: При ошибках возвращается базовый sitemap
4. **Безопасность**: Webhook защищен секретным ключом
5. **Производительность**: Hooks не блокируют основные операции

## 📞 Поддержка

При проблемах с sitemap:
1. Проверить логи в консоли Next.js
2. Запустить `./scripts/check-seo.sh`
3. Проверить переменные окружения
4. Обратиться к документации в `/docs/SEO_OPTIMIZATION_GUIDE.md`
