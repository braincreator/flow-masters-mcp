# RSS Feeds Documentation

Flow Masters поддерживает RSS feeds для подписки на обновления блога и услуг.

## Доступные RSS каналы

### 📰 Блог
- **Русский**: `/rss.xml` - Все статьи блога на русском языке
- **English**: `/rss-en.xml` - All blog articles in English
- **Atom**: `/atom.xml` - Альтернативный формат для RSS-читалок

### 🛠️ Услуги
- **Services**: `/services-rss.xml` - Обновления услуг и новые предложения

## Полные URL

В продакшене RSS feeds доступны по следующим адресам:

```
https://flow-masters.ru/rss.xml
https://flow-masters.ru/rss-en.xml
https://flow-masters.ru/services-rss.xml
https://flow-masters.ru/atom.xml
```

## Технические детали

### Кэширование
- RSS feeds кэшируются на 1 час (3600 секунд)
- Services RSS кэшируется на 2 часа (7200 секунд)
- Используется Next.js `unstable_cache` для оптимизации

### Содержимое feeds

#### Blog RSS (`/rss.xml`, `/rss-en.xml`)
- Заголовок поста
- Описание (excerpt или первые 300 символов)
- Полный контент в HTML формате
- Дата публикации
- Автор
- Категории
- Прямая ссылка на пост

#### Services RSS (`/services-rss.xml`)
- Название услуги
- Описание услуги
- Полный контент в HTML формате
- Дата создания/обновления
- Прямая ссылка на услугу

#### Atom Feed (`/atom.xml`)
- Стандартный Atom 1.0 формат
- Содержит ту же информацию что и RSS
- Совместим с большинством RSS-читалок

### Автоматическое обнаружение

RSS feeds автоматически добавляются в HTML `<head>` через SEO компонент:

```html
<link rel="alternate" type="application/rss+xml" title="Flow Masters - Блог" href="/rss.xml" />
<link rel="alternate" type="application/rss+xml" title="Flow Masters - Blog (English)" href="/rss-en.xml" />
<link rel="alternate" type="application/rss+xml" title="Flow Masters - Services" href="/services-rss.xml" />
<link rel="alternate" type="application/atom+xml" title="Flow Masters - Atom Feed" href="/atom.xml" />
```

## UI Компоненты

### RSSButton
Простая кнопка для подписки на RSS:

```tsx
import { RSSButton } from '@/components/RSS/RSSDiscovery'

// Для блога
<RSSButton type="blog" variant="outline" size="sm" />

// Для услуг
<RSSButton type="services" variant="outline" size="sm" />
```

### RSSDiscovery
Полный компонент с информацией о всех доступных RSS каналах:

```tsx
import { RSSDiscovery } from '@/components/RSS/RSSDiscovery'

// Полная версия
<RSSDiscovery showTitle={true} compact={false} />

// Компактная версия
<RSSDiscovery showTitle={false} compact={true} />
```

### RSSLinks
Простые ссылки для футера или заголовков:

```tsx
import { RSSLinks } from '@/components/RSS/RSSDiscovery'

<RSSLinks className="flex items-center gap-4" />
```

## Где используются RSS компоненты

1. **Страница блога** (`/posts`):
   - RSS кнопка в заголовке страницы
   - Полный RSS Discovery компонент в сайдбаре

2. **Страница поста** (`/posts/[slug]`):
   - RSS Discovery компонент в конце статьи

3. **Страница услуг** (`/[lang]/services`):
   - RSS кнопка в заголовке страницы

4. **Футер сайта**:
   - RSS ссылки в нижней части

## Популярные RSS-читалки

- **Feedly** - https://feedly.com
- **Inoreader** - https://www.inoreader.com
- **NewsBlur** - https://newsblur.com
- **The Old Reader** - https://theoldreader.com
- **Thunderbird** - Встроенная поддержка RSS

## robots.txt и sitemap

RSS feeds упоминаются в:
- `robots.txt` - комментарии с информацией о доступных feeds
- `sitemap-index.xml` - комментарии с URL feeds

## Разработка

### Добавление нового RSS feed

1. Создайте новый route файл в `src/app/(frontend)/`
2. Используйте утилиты из `src/utilities/rssHelpers.ts`
3. Добавьте кэширование с `unstable_cache`
4. Обновите `getRssFeedUrls` функцию
5. Добавьте ссылки в SEO метаданные

### Тестирование

RSS feeds можно тестировать:
- Открыв URL напрямую в браузере
- Используя онлайн валидаторы RSS
- Добавив в RSS-читалку для проверки

## Мониторинг

RSS feeds логируются через систему логирования проекта. Ошибки генерации feeds записываются в консоль с префиксом "Error generating RSS feed".
