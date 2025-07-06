# Flow Masters MCP Server

## Версия 2.0.0

Model Context Protocol (MCP) сервер для интеграции с Flow Masters API и поддержки LLM (Language Model) запросов.

## Особенности

- Унифицированный базовый путь (/api/) для всех API эндпоинтов
- Автоматическое индексирование API эндпоинтов
- Поддержка контекстных запросов для LLM
- Кеширование контекста для повышения производительности
- Проксирование запросов к API
- Автоматическое обновление
- Гибкая поддержка версионности API (опционально)

## Установка и развертывание

### Локальная установка

```bash
npm install
npm run build
npm start
```

### Docker развертывание

#### Продакшн (независимый сервер)
```bash
# Установите API_KEY
export API_KEY=your-api-key-here

# Запуск продакшн версии
./deploy-production.sh
```

#### Разработка (с локальным API)
```bash
# Запуск версии для разработки
./deploy-development.sh
```

#### Ручное развертывание через Docker Compose
```bash
# Продакшн
docker-compose -f docker-compose.production.yml up -d

# Разработка
docker-compose -f docker-compose.development.yml up -d
```

## Конфигурация

### Файл конфигурации

Создайте файл `config.json` в корне проекта:

```json
{
  "port": 3030,
  "host": "0.0.0.0",
  "apiConfig": {
    "apiUrl": "https://flow-masters.ru",
    "apiKey": "your-api-key-here",
    "autoUpdate": true,
    "updateCheckInterval": 60,
    "basePath": "/api",
    "apiVersion": ""
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

### Сценарии развертывания

#### 1. Локальная разработка (MCP и API на одной машине)
```json
{
  "apiConfig": {
    "apiUrl": "http://localhost:3000",
    "apiKey": "dev-api-key"
  }
}
```

#### 2. Продакшн (MCP на отдельном сервере)
```json
{
  "apiConfig": {
    "apiUrl": "https://flow-masters.ru",
    "apiKey": "production-api-key"
  }
}
```

#### 3. Docker контейнер (API в другом контейнере)
```json
{
  "apiConfig": {
    "apiUrl": "http://flow-masters-api:3000",
    "apiKey": "container-api-key"
  }
}
```

### Переменные окружения

Вы также можете настроить сервер через переменные окружения:

```bash
# MCP Server Configuration (независимый от основного приложения)
PORT=3030
HOST=0.0.0.0

# API Configuration (основное приложение Flow Masters)
API_URL=https://flow-masters.ru
API_KEY=your-api-key-here
API_BASE_PATH=/api
API_VERSION=

# Для локальной разработки:
# API_URL=http://localhost:3000

# Для Docker контейнера:
# API_URL=http://host.docker.internal:3000

# Остальные настройки
AUTO_UPDATE=true
UPDATE_CHECK_INTERVAL=60
MODEL_CONTEXT_ENABLED=true
ALLOWED_MODELS=*
MAX_TOKENS=8192
CONTEXT_WINDOW=4096
CACHE_ENABLED=true
CACHE_TTL=3600
```

### Тестирование с разными хостами

```bash
# Тестирование с локальным API
MCP_HOST=localhost MCP_PORT=3030 API_HOST=localhost API_PORT=3000 npm run test:migration

# Тестирование с внешним API
MCP_HOST=localhost MCP_PORT=3030 API_URL=https://flow-masters.ru npm run test:migration

# Тестирование удаленного MCP сервера
MCP_HOST=your-mcp-server.com MCP_PORT=3030 API_URL=https://flow-masters.ru npm run test:migration
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
