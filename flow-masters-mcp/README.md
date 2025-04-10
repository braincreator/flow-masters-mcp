# Flow Masters MCP Server

## Версия 2.0.0

Model Context Protocol (MCP) сервер для интеграции с Flow Masters API и поддержки LLM (Language Model) запросов.

## Особенности

- Единый базовый путь (/v1/) для всех API эндпоинтов
- Автоматическое индексирование API эндпоинтов
- Поддержка контекстных запросов для LLM
- Кеширование контекста для повышения производительности
- Проксирование запросов к API
- Автоматическое обновление
- Поддержка версионности API

## Установка

```bash
npm install
npm run build
npm start
```

Или через Docker:

```bash
docker build -t flow-masters-mcp -f Dockerfile .
docker run -p 3030:3030 flow-masters-mcp
```

## Конфигурация

Создайте файл `config.json` в корне проекта:

```json
{
  "port": 3030,
  "host": "0.0.0.0",
  "apiConfig": {
    "apiUrl": "https://your-api-url.com",
    "apiKey": "your-api-key-here",
    "autoUpdate": true,
    "updateCheckInterval": 60,
    "basePath": "/api",
    "apiVersion": "v1"
  },
  "llm": {
    "modelContextEnabled": true,
    "allowedModels": ["*"],
    "maxTokens": 8192,
    "contextWindow": 4096,
    "caching": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
```

### Переменные окружения

Вы также можете настроить сервер через переменные окружения:

```
PORT=3030
HOST=0.0.0.0
API_URL=https://your-api-url.com
API_KEY=your-api-key-here
AUTO_UPDATE=true
UPDATE_CHECK_INTERVAL=60
API_BASE_PATH=/api
API_VERSION=v1
MODEL_CONTEXT_ENABLED=true
ALLOWED_MODELS=*
MAX_TOKENS=8192
CONTEXT_WINDOW=4096
CACHE_ENABLED=true
CACHE_TTL=3600
```

## API Эндпоинты

### Основные эндпоинты

- `GET /` - Информация о сервере
- `GET /mcp/health` - Статус сервера и соединения с API
- `GET /mcp/version` - Версия сервера и API
- `GET /mcp/check-update` - Проверка обновлений

### Эндпоинты для работы с API

- `GET /mcp/endpoints` - Получить список доступных API эндпоинтов (с опциональным параметром `query`)
- `GET /mcp/endpoints/refresh` - Обновить список эндпоинтов
- `GET /mcp/integrations` - Получить список интеграций (с опциональным параметром `type`)
- `POST /mcp/proxy` - Прокси для API запросов

### LLM эндпоинты

- `POST /mcp/context` - Получить контекст для LLM запроса

## Примеры использования

### Получение контекста для LLM

```javascript
const response = await fetch('http://localhost:3030/mcp/context', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Как получить список продуктов?',
    model: 'gpt-4',
    options: {
      maxTokens: 4096,
      search: {
        query: 'продукты API',
      },
    },
  }),
})

const data = await response.json()
console.log(data.context) // Контекстная информация для LLM
```

### Прокси запрос к API

```javascript
const response = await fetch('http://localhost:3030/mcp/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    method: 'GET',
    path: '/products',
    params: {
      page: 1,
      limit: 10,
    },
  }),
})

const data = await response.json()
console.log(data) // Результаты запроса к API
```

## Интеграция с LLM

MCP сервер поддерживает интеграцию с Cursor через специальный плагин, который можно установить через команду:

```bash
npm run install-to-cursor
```

После установки плагина вы сможете использовать MCP сервер для получения контекста для LLM запросов прямо из Cursor.

## Лицензия

MIT
