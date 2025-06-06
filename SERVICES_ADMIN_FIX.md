# Решение проблемы с отображением услуг в админ панели

## Проблема
Услуги (services) не отображаются в админ панели Payload CMS, хотя данные есть в базе данных и отображаются на фронтенде.

## Обнаруженные проблемы и исправления

### ✅ 1. Исправлена конфигурация defaultColumns
**Проблема**: Различия между исходным и скомпилированным файлом в defaultColumns
**Исправление**: Обновлен `src/collections/Services/index.ts`
```typescript
defaultColumns: ['title', 'serviceType', 'price', 'status', 'publishedAt']
```

### ✅ 2. Исправлен URL предпросмотра
**Проблема**: Использовался 'products' вместо 'services' для предпросмотра
**Исправление**: Обновлен preview URL в конфигурации коллекции
```typescript
preview: (doc, { locale }) => formatPreviewURL('services', doc, locale)
```

### ✅ 3. Добавлена поддержка services в утилиты
**Исправления**:
- Обновлен `src/utilities/formatPreviewURL.ts` для поддержки 'services'
- Обновлен `src/utilities/generatePreviewPath.ts` для поддержки 'services'

### ✅ 4. Включены базовые компоненты админ панели
**Проблема**: Все кастомные компоненты были отключены
**Исправление**: Частично включены компоненты в `src/payload.config.ts`

## Шаги для применения исправлений

### 1. Проверка текущего состояния
```bash
# Проверить базу данных и конфигурацию
node scripts/full-services-check.mjs

# Проверить конфигурацию Payload
node scripts/check-payload-config.mjs

# Проверить доступ админов
node scripts/test-admin-access.mjs
```

### 2. Пересборка проекта
```bash
# Удалить старые скомпилированные файлы
rm -rf dist
rm -rf .next

# Пересобрать проект
npm run build
# или
pnpm build
```

### 3. Запуск и проверка
```bash
# Запустить сервер
npm run dev
# или
pnpm dev

# Проверить API
node scripts/test-payload-api.mjs
```

### 4. Проверка админ панели
1. Откройте `http://localhost:3000/admin`
2. Войдите под админом (ay.krasnodar@gmail.com или alexxudin@gmail.com)
3. Проверьте раздел "E-commerce" → "Services"

## Возможные дополнительные проблемы

### Если услуги все еще не отображаются:

1. **Проблемы с правами доступа**
   - Проверьте, что пользователь имеет роль 'admin'
   - Проверьте функцию `isAdmin` в `src/access/isAdmin.ts`

2. **Проблемы с компиляцией**
   - Убедитесь, что нет ошибок TypeScript
   - Проверьте, что все импорты корректны

3. **Проблемы с базой данных**
   - Убедитесь, что MongoDB запущен
   - Проверьте подключение к базе данных

4. **Проблемы с локализацией**
   - Проверьте, что поля с `localized: true` корректно обрабатываются

## Команды для диагностики

```bash
# Полная проверка
node scripts/full-services-check.mjs

# Проверка API
curl "http://localhost:3000/api/v1/services?status=published&limit=5"

# Проверка админ панели
curl -I "http://localhost:3000/admin"
```

## Контакты для поддержки
- Email: alexxudin@gmail.com
- Telegram: @braincreator

## Статус исправлений
- [x] Конфигурация defaultColumns
- [x] URL предпросмотра
- [x] Поддержка services в утилитах
- [x] Базовые компоненты админ панели
- [ ] Тестирование в продакшене
- [ ] Документация обновлена
