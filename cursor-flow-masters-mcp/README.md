# Flow Masters MCP Server

MCP сервер для интеграции Flow Masters API с Cursor.

## Возможности

- Легкая интеграция с Flow Masters API
- Автоматическое обновление
- Поддержка вебхуков
- Контроль состояния интеграций

## Установка

### Через Cursor MCP Installer

1. Откройте Cursor
2. Выберите "MCP Servers" в меню
3. Нажмите "Add MCP Server"
4. Выберите "Install from NPM" и введите `cursor-flow-masters-mcp`

### Ручная установка

```bash
# Глобальная установка
npm install -g cursor-flow-masters-mcp

# Запуск сервера
cursor-flow-masters-mcp
```

## Конфигурация

При первом запуске создается файл `config.json` с настройками по умолчанию.
Отредактируйте его, указав правильные параметры подключения к API.

```json
{
  "port": 3030,
  "host": "localhost",
  "apiConfig": {
    "apiUrl": "https://flow-masters-api.example.com",
    "apiKey": "your-api-key-here",
    "autoUpdate": true,
    "updateCheckInterval": 60
  }
}
```

### Параметры

- `port`: Порт для запуска сервера
- `host`: Хост для запуска сервера
- `apiConfig`:
  - `apiUrl`: URL API Flow Masters
  - `apiKey`: Ключ API для аутентификации
  - `autoUpdate`: Включить автоматическое обновление
  - `updateCheckInterval`: Интервал проверки обновлений в минутах

## Использование

После установки и настройки сервер будет автоматически взаимодействовать с API Flow Masters.
Вы можете использовать его в плагинах Cursor для доступа к данным Flow Masters.

### Доступные эндпоинты

- `/mcp/health` - Проверка статуса сервера
- `/mcp/version` - Информация о версии
- `/mcp/integrations` - Список доступных интеграций
- `/mcp/check-update` - Проверка обновлений

## Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

## Лицензия

ISC
