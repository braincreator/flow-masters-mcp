# 🏗️ Архитектура развертывания Flow Masters

## 📋 Обзор

Flow Masters состоит из двух независимых компонентов:

1. **Основное приложение** (Next.js + Payload CMS) - порт 3000
2. **MCP сервер** (Model Context Protocol) - порт 3030

Компоненты могут работать на одном сервере или быть распределены по разным хостам.

## 🌐 Сценарии развертывания

### 1. Локальная разработка

```
┌─────────────────────────────────────┐
│           Localhost                 │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │ Flow Masters│  │ MCP Server  │   │
│  │   :3000     │◄─┤   :3030     │   │
│  │             │  │             │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        MongoDB :27017           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Конфигурация MCP:**
```json
{
  "apiConfig": {
    "apiUrl": "http://localhost:3000",
    "apiKey": "dev-api-key"
  }
}
```

### 2. Продакшн на одном сервере

```
┌─────────────────────────────────────┐
│        Production Server            │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │ Flow Masters│  │ MCP Server  │   │
│  │   :3000     │◄─┤   :3030     │   │
│  │             │  │             │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │        MongoDB :27017           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Конфигурация MCP:**
```json
{
  "apiConfig": {
    "apiUrl": "http://localhost:3000",
    "apiKey": "production-api-key"
  }
}
```

### 3. Распределенное развертывание

```
┌─────────────────────┐    ┌─────────────────────┐
│   API Server        │    │   MCP Server        │
│   flow-masters.ru   │    │   mcp.example.com   │
├─────────────────────┤    ├─────────────────────┤
│  ┌─────────────┐    │    │  ┌─────────────┐    │
│  │ Flow Masters│    │    │  │ MCP Server  │    │
│  │   :3000     │    │◄───┤  │   :3030     │    │
│  │             │    │    │  │             │    │
│  └─────────────┘    │    │  └─────────────┘    │
│                     │    │                     │
│  ┌─────────────────┐│    │                     │
│  │   MongoDB       ││    │                     │
│  └─────────────────┘│    │                     │
└─────────────────────┘    └─────────────────────┘
```

**Конфигурация MCP:**
```json
{
  "apiConfig": {
    "apiUrl": "https://flow-masters.ru",
    "apiKey": "production-api-key"
  }
}
```

### 4. Docker Compose развертывание

```
┌─────────────────────────────────────┐
│           Docker Host               │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐   │
│  │flow-masters │  │ mcp-server  │   │
│  │ container   │  │ container   │   │
│  │   :3000     │◄─┤   :3030     │   │
│  └─────────────┘  └─────────────┘   │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │      mongodb container          │ │
│  │           :27017                │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Конфигурация MCP:**
```json
{
  "apiConfig": {
    "apiUrl": "http://flow-masters:3000",
    "apiKey": "container-api-key"
  }
}
```

## 🚀 Команды развертывания

### Основное приложение Flow Masters

```bash
# Локальная разработка
cd flow-masters
pnpm dev:fast

# Продакшн сборка
cd flow-masters
pnpm build
pnpm start

# Docker
cd flow-masters
docker-compose up -d
```

### MCP сервер

```bash
# Локальная разработка
cd flow-masters-mcp
npm run dev

# Продакшн
cd flow-masters-mcp
export API_KEY=your-api-key-here
./deploy-production.sh

# Разработка с Docker
cd flow-masters-mcp
./deploy-development.sh
```

## 🔧 Конфигурация по сценариям

### Переменные окружения для MCP

#### Локальная разработка
```bash
API_URL=http://localhost:3000
API_KEY=dev-api-key
PORT=3030
HOST=localhost
```

#### Продакшн (тот же сервер)
```bash
API_URL=http://localhost:3000
API_KEY=production-api-key
PORT=3030
HOST=0.0.0.0
```

#### Продакшн (разные серверы)
```bash
API_URL=https://flow-masters.ru
API_KEY=production-api-key
PORT=3030
HOST=0.0.0.0
```

#### Docker контейнер
```bash
API_URL=http://host.docker.internal:3000
API_KEY=container-api-key
PORT=3030
HOST=0.0.0.0
```

## 🧪 Тестирование

### Проверка основного приложения
```bash
curl http://localhost:3000/api/health
curl https://flow-masters.ru/api/health
```

### Проверка MCP сервера
```bash
curl http://localhost:3030/mcp/health
curl http://mcp.example.com:3030/mcp/health
```

### Комплексное тестирование
```bash
# Локальное тестирование
cd flow-masters-mcp
npm run test:migration

# Тестирование с внешним API
MCP_HOST=localhost MCP_PORT=3030 API_URL=https://flow-masters.ru npm run test:migration

# Тестирование удаленного MCP
MCP_HOST=mcp.example.com MCP_PORT=3030 API_URL=https://flow-masters.ru npm run test:migration
```

## 🔒 Безопасность

### API ключи
- Используйте разные API ключи для разных окружений
- Храните ключи в переменных окружения, не в коде
- Регулярно ротируйте API ключи

### Сетевая безопасность
- Используйте HTTPS для продакшн развертывания
- Настройте firewall для ограничения доступа к портам
- Используйте reverse proxy (nginx) для дополнительной безопасности

### Docker безопасность
- Запускайте контейнеры от непривилегированного пользователя
- Используйте multi-stage builds для минимизации размера образов
- Регулярно обновляйте базовые образы

## 📊 Мониторинг

### Health checks
```bash
# Основное приложение
curl -f http://localhost:3000/api/health

# MCP сервер
curl -f http://localhost:3030/mcp/health
```

### Логи
```bash
# Docker логи
docker-compose logs -f flow-masters-mcp

# Файловые логи
tail -f flow-masters-mcp/logs/mcp-server.log
```

### Метрики
- CPU и память использование контейнеров
- Время ответа API endpoints
- Количество запросов к MCP серверу
- Статус подключения между компонентами

## 🔄 Обновления

### Основное приложение
```bash
cd flow-masters
git pull
pnpm install
pnpm build
# Перезапуск сервера
```

### MCP сервер
```bash
cd flow-masters-mcp
git pull
npm install
npm run build
# Перезапуск через Docker Compose или PM2
```

### Автоматические обновления
MCP сервер поддерживает автоматическую проверку обновлений:
```json
{
  "apiConfig": {
    "autoUpdate": true,
    "updateCheckInterval": 60
  }
}
```

---

**Рекомендации:**
- Для продакшн используйте распределенное развертывание
- Настройте мониторинг и алерты
- Регулярно создавайте бэкапы конфигураций
- Тестируйте обновления на staging окружении