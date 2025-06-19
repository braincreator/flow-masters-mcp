# SEO Оптимизация Flow Masters

## Обзор

Этот документ описывает полную SEO стратегию и реализацию для сайта Flow Masters, включая техническую настройку, структурированные данные и рекомендации по оптимизации.

## 🎯 Текущее состояние SEO

### ✅ Реализовано

1. **Sitemap генерация**
   - Основной sitemap через next-sitemap
   - Динамические sitemap для страниц, постов и услуг
   - Правильная настройка приоритетов и частоты обновления
   - Поддержка мультиязычности (hreflang)

2. **Robots.txt**
   - Динамический robots.txt с правильными директивами
   - Блокировка административных разделов
   - Разрешения для поисковых ботов
   - Ссылки на все sitemap файлы

3. **Мета-теги и Open Graph**
   - Полная система мета-тегов через metadata.ts
   - Open Graph и Twitter карточки
   - Canonical URLs
   - Верификация для Google и Yandex

4. **Структурированные данные**
   - JSON-LD разметка для организации
   - Схемы для статей и услуг
   - Поддержка различных типов контента

## 📁 Структура файлов

```
src/
├── app/(frontend)/(sitemaps)/
│   ├── pages-sitemap.xml/route.ts
│   ├── posts-sitemap.xml/route.ts
│   └── services-sitemap.xml/route.ts
├── app/(frontend)/
│   ├── robots.txt/route.ts
│   └── sitemap-index.xml/route.ts
├── components/seo/
│   ├── StructuredData.tsx
│   ├── SEOHead.tsx
│   └── index.ts
└── utilities/
    └── metadata.ts
```

## 🔧 Конфигурация

### Переменные окружения

```bash
# Основной URL сайта
NEXT_PUBLIC_SERVER_URL=https://flow-masters.ru

# SEO верификация
GOOGLE_SITE_VERIFICATION=your-google-verification-code
YANDEX_VERIFICATION=your-yandex-verification-code

# Аналитика
GOOGLE_ANALYTICS_ID=your-ga-id
YANDEX_METRICA_ID=your-metrica-id
```

### next-sitemap.config.cjs

Конфигурация включает:
- Правильные приоритеты для разных типов страниц
- Исключение административных разделов
- Поддержка мультиязычности
- Настройка robots.txt

## 🚀 Использование SEO компонентов

### Базовое использование

```tsx
import { generateSEOMetadata } from '@/components/seo'

export const metadata = generateSEOMetadata({
  title: 'Заголовок страницы',
  description: 'Описание страницы',
  canonical: 'https://flow-masters.ru/page',
  type: 'website'
})
```

### Для статей блога

```tsx
import { createArticleSEO } from '@/components/seo'

export const metadata = createArticleSEO({
  title: 'Заголовок статьи',
  description: 'Описание статьи',
  author: 'Автор',
  publishedTime: '2024-01-01T00:00:00Z',
  modifiedTime: '2024-01-02T00:00:00Z',
  image: 'https://flow-masters.ru/article-image.jpg'
})
```

### Структурированные данные

```tsx
import { SEOHead } from '@/components/seo'

export default function Page() {
  return (
    <>
      <SEOHead
        title="Заголовок"
        description="Описание"
        structuredDataType="service"
        structuredData={{
          name: 'Название услуги',
          description: 'Описание услуги',
          provider: 'Flow Masters'
        }}
      />
      {/* Контент страницы */}
    </>
  )
}
```

## 📊 Мониторинг и аналитика

### Рекомендуемые инструменты

1. **Google Search Console**
   - Мониторинг индексации
   - Анализ поисковых запросов
   - Проверка sitemap

2. **Yandex Webmaster**
   - Индексация в Яндексе
   - Анализ российского трафика

3. **Google Analytics / Yandex Metrica**
   - Отслеживание органического трафика
   - Анализ поведения пользователей

### Ключевые метрики

- Количество проиндексированных страниц
- Позиции по ключевым запросам
- Органический трафик
- Показатели Core Web Vitals

## 🔍 Проверка SEO

### Автоматические проверки

```bash
# Генерация sitemap
npm run postbuild

# Проверка доступности sitemap
curl https://flow-masters.ru/sitemap.xml
curl https://flow-masters.ru/robots.txt
```

### Ручные проверки

1. **Валидация sitemap**
   - https://www.xml-sitemaps.com/validate-xml-sitemap.html

2. **Проверка robots.txt**
   - https://support.google.com/webmasters/answer/6062598

3. **Структурированные данные**
   - https://search.google.com/test/rich-results

4. **Open Graph**
   - https://developers.facebook.com/tools/debug/

## 📈 Рекомендации по улучшению

### Краткосрочные (1-2 недели)

1. Настроить Google Search Console и Yandex Webmaster
2. Добавить Google Analytics и Yandex Metrica
3. Проверить индексацию всех важных страниц
4. Оптимизировать заголовки и описания

### Среднесрочные (1-2 месяца)

1. Создать контент-план для блога
2. Оптимизировать изображения (alt-теги, размеры)
3. Улучшить внутреннюю перелинковку
4. Добавить FAQ разделы с структурированными данными

### Долгосрочные (3-6 месяцев)

1. Построить стратегию внешних ссылок
2. Создать локальные лендинги для разных регионов
3. Оптимизировать для голосового поиска
4. Внедрить AMP для мобильных страниц

## 🛠 Техническая поддержка

### Обновление sitemap

Sitemap обновляется автоматически при:
- Публикации новых страниц
- Изменении существующего контента
- Сборке проекта

### Кэширование

- Sitemap кэшируется на 1 час
- Robots.txt кэшируется на 24 часа
- Мета-теги генерируются динамически

### Отладка

```bash
# Проверка генерации sitemap
npm run postbuild

# Локальная проверка
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

## 📞 Контакты

При возникновении вопросов по SEO оптимизации обращайтесь к разработчику или SEO специалисту команды.
