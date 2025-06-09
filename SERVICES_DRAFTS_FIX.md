# Решение проблемы с черновиками в коллекции Services

## Описание проблемы

Пользователь не мог удалить черновики записей в коллекции `services` в админ панели Payload CMS. При анализе выяснилось, что проблема была в неправильной конфигурации системы versions/drafts.

## Корень проблемы

1. **Конфликт полей status**: В коллекции `services` было пользовательское поле `status` с опциями `['draft', 'published', 'archived']`, которое конфликтовало с системным полем `_status` Payload CMS для управления черновиками.

2. **Неправильная работа versions**: Payload CMS с настройкой `versions: { drafts: true }` создает отдельную коллекцию `_services_versions` для хранения черновиков, но из-за конфликта полей черновики не создавались.

3. **Пустая коллекция versions**: В коллекции `_services_versions` было 0 документов, хотя должны были создаваться черновики.

## Решение

### 1. Переименование пользовательского поля status

**Было:**
```typescript
{
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  options: [
    { label: 'Черновик', value: 'draft' },
    { label: 'Опубликовано', value: 'published' },
    { label: 'Архив', value: 'archived' },
  ],
}
```

**Стало:**
```typescript
{
  name: 'businessStatus',
  type: 'select',
  required: true,
  defaultValue: 'active',
  options: [
    { label: 'Активно', value: 'active' },
    { label: 'Архив', value: 'archived' },
    { label: 'Скрыто', value: 'hidden' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Бизнес-статус услуги (отдельно от черновиков/публикации)',
  },
}
```

### 2. Улучшение конфигурации versions

**Было:**
```typescript
versions: {
  drafts: true,
}
```

**Стало:**
```typescript
versions: {
  drafts: {
    autosave: {
      interval: 100, // Автосохранение каждые 100мс для live preview
    },
    schedulePublish: true, // Возможность запланировать публикацию
  },
  maxPerDoc: 50, // Максимум 50 версий на документ
}
```

### 3. Обновление API endpoints

Обновлены все API endpoints для использования системного поля `_status` вместо пользовательского `status`:

**src/app/api/v1/services/route.ts:**
```typescript
// Используем системное поле _status для фильтрации по статусу публикации
where._status = {
  equals: _status,
}

// Дополнительно фильтруем по бизнес-статусу
where.businessStatus = {
  not_equals: 'hidden',
}
```

**src/services/service.service.ts:**
```typescript
where: {
  ...where,
  // Используем системное поле _status для проверки публикации
  _status: where._status || { equals: 'published' },
  // Дополнительно проверяем бизнес-статус
  businessStatus: where.businessStatus || { not_equals: 'hidden' },
}
```

### 4. Миграция данных

Создан и выполнен скрипт миграции `src/scripts/migrate-services-status.cjs`:

- Переименовал поле `status` в `businessStatus`
- Установил `_status = 'published'` для всех записей в основной коллекции
- Очистил коллекцию `_services_versions` для свежего старта
- Обновил 11 записей без ошибок

### 5. Обновление компонентов

Обновлен компонент `ServicesList.tsx` для использования нового API:
```typescript
let url = `/api/v1/services?_status=published&locale=${locale}`
```

## Результат

✅ **Все проверки пройдены:**
- Все записи имеют корректный `_status = 'published'`
- Все записи имеют `businessStatus = 'active'`
- Коллекция `_services_versions` готова к работе
- API работает корректно
- Индексы настроены правильно

## Теперь доступно

1. **Создание черновиков** в админ панели
2. **Редактирование черновиков** без влияния на опубликованную версию
3. **Удаление черновиков** (решена исходная проблема)
4. **Публикация черновиков** одним кликом
5. **Планирование публикации** на определенное время
6. **Автосохранение** черновиков каждые 100мс

## Различия между полями

| Поле | Назначение | Значения | Где хранится |
|------|------------|----------|--------------|
| `_status` | Системное поле Payload для управления публикацией | `published`, `draft` | Основная коллекция + versions |
| `businessStatus` | Пользовательское поле для бизнес-логики | `active`, `archived`, `hidden` | Основная коллекция |

## Файлы изменены

1. `src/collections/Services/index.ts` - конфигурация коллекции
2. `src/app/api/v1/services/route.ts` - API endpoint
3. `src/services/service.service.ts` - сервис для работы с услугами
4. `src/components/services/ServicesList.tsx` - компонент списка услуг
5. `src/scripts/migrate-services-status.cjs` - скрипт миграции (выполнен)

## Тестирование

Созданы и выполнены скрипты для тестирования:
- `src/scripts/check-services-drafts.cjs` - проверка состояния
- `src/scripts/test-draft-functionality.cjs` - тестирование функциональности
- `src/scripts/verify-draft-fix.cjs` - финальная проверка

Все тесты пройдены успешно ✅
