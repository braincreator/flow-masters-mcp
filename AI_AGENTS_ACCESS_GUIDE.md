# 🤖 AI Агенты FlowMasters - Руководство по доступу

## 📋 Обзор AI агентов

FlowMasters включает 4 специализированных AI агента на базе Google Vertex AI:

### 1. 🤝 FlowMasters Assistant Agent
**URL**: `/agents/assistant` или `/api/agents` (type: "assistant")
**Назначение**: Общий помощник по платформе FlowMasters
**Возможности**:
- Помощь в настройке платформы
- Объяснение функций и возможностей
- Руководство по интеграциям
- Решение проблем пользователей

### 2. 🔍 Smart Documentation Search Agent  
**URL**: `/agents/search` или `/api/agents` (type: "search")
**Назначение**: Умный поиск по документации
**Возможности**:
- Поиск в документации n8n, Qdrant, Weaviate, Flowise
- Поиск примеров кода и конфигураций
- Поиск решений проблем
- Контекстуальные ответы из документации

### 3. ⚡ Quick Automation Builder Agent
**URL**: `/agents/automation` или `/api/agents` (type: "automation")  
**Назначение**: Создание автоматизаций
**Возможности**:
- Генерация n8n workflows
- Создание автоматизаций для бизнес-процессов
- Интеграция между сервисами
- Настройка уведомлений и мониторинга

### 4. 🎨 Multimodal Agent
**URL**: `/agents/multimodal` или `/api/agents` (type: "multimodal")
**Назначение**: Работа с мультимедиа контентом
**Возможности**:
- Анализ изображений
- Обработка документов
- Генерация контента
- Мультимодальные задачи

## 🚀 Способы доступа к агентам

### 1. 🌐 Веб-интерфейс
```
https://flow-masters.ru/agents
```
- Интерактивный чат с выбором агента
- Готовые примеры запросов
- История диалогов
- Настройки агентов

### 2. 📱 Прямые ссылки на агентов
```
https://flow-masters.ru/agents/assistant    # Помощник
https://flow-masters.ru/agents/search       # Поиск
https://flow-masters.ru/agents/automation   # Автоматизация  
https://flow-masters.ru/agents/multimodal   # Мультимодальный
```

### 3. 🔌 REST API
**Endpoint**: `POST /api/agents`

**Пример запроса**:
```javascript
const response = await fetch('/api/agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    agentType: 'assistant',
    message: 'Как настроить интеграцию с CRM?',
    context: {
      userRole: 'admin',
      currentPage: '/dashboard'
    },
    userId: 'user123',
    sessionId: 'session456'
  })
})

const data = await response.json()
```

**Ответ**:
```json
{
  "success": true,
  "data": {
    "response": "Для настройки интеграции с CRM...",
    "agentType": "assistant",
    "timestamp": "2024-06-20T19:30:00Z",
    "processingTime": 1250,
    "suggestions": [
      "Покажи пример настройки webhook",
      "Какие CRM поддерживаются?"
    ]
  }
}
```

### 4. 🔗 Специализированные API endpoints
```
POST /api/agents/assistant     # Прямой доступ к помощнику
POST /api/agents/search        # Прямой доступ к поиску
POST /api/agents/automation    # Прямой доступ к автоматизации
POST /api/agents/multimodal    # Прямой доступ к мультимодальному
```

## ⚙️ Конфигурация агентов

### Переменные окружения:
```bash
# Основные настройки
AGENTS_ENABLED=true
AGENTS_DEBUG=true
AGENTS_PROVIDER=vertex-ai
AGENTS_DEFAULT_MODEL=gemini-pro

# Лимиты и производительность
AGENTS_MAX_TOKENS=4000
AGENTS_TEMPERATURE=0.7
AGENTS_MAX_CONCURRENT=10
AGENTS_RATE_LIMIT=100
AGENTS_SESSION_TIMEOUT=3600

# Google Vertex AI
GOOGLE_CLOUD_PROJECT_ID=ancient-figure-462211-t6
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Интеграции
QDRANT_URL=http://192.168.0.5:6333
WEAVIATE_URL=http://192.168.0.5:8080
N8N_BASE_URL=https://n8n.flow-masters.ru
FLOWISE_API_URL=https://flowise.flow-masters.ru/api
CRAWL4AI_BASE_URL=https://crawl4ai.flow-masters.ru
```

## 🧪 Тестирование агентов

### Через веб-интерфейс:
1. Откройте https://flow-masters.ru/agents
2. Выберите агента
3. Введите тестовый запрос
4. Проверьте ответ и время обработки

### Через API:
```bash
# Тест Assistant Agent
curl -X POST https://flow-masters.ru/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "assistant",
    "message": "Привет! Как дела?"
  }'

# Тест Search Agent  
curl -X POST https://flow-masters.ru/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "search", 
    "message": "Как настроить Qdrant?"
  }'
```

## 🔧 Интеграция в приложение

### React компонент:
```tsx
import { useState } from 'react'

export function AgentChat() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  
  const sendMessage = async () => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentType: 'assistant',
        message: message
      })
    })
    
    const data = await res.json()
    setResponse(data.data.response)
  }
  
  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Задайте вопрос агенту..."
      />
      <button onClick={sendMessage}>Отправить</button>
      <div>{response}</div>
    </div>
  )
}
```

### Next.js API Route:
```typescript
// pages/api/my-agent.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentType: 'assistant',
      message: req.body.message
    })
  })
  
  const data = await response.json()
  res.json(data)
}
```

## 📊 Мониторинг и аналитика

### Метрики агентов:
- Количество запросов по типам агентов
- Время обработки запросов
- Успешность ответов
- Популярные запросы
- Ошибки и их частота

### Логирование:
```bash
# Просмотр логов агентов
docker logs flowmasters_container | grep "AGENT"

# Мониторинг производительности
curl https://flow-masters.ru/api/agents/health
```

## 🔒 Безопасность

### Аутентификация:
- Агенты доступны только авторизованным пользователям
- Rate limiting: 100 запросов в час на пользователя
- Session timeout: 1 час

### Валидация:
- Проверка входящих данных
- Санитизация пользовательского ввода
- Ограничение длины сообщений

## 🚨 Устранение проблем

### Частые проблемы:

1. **Агент не отвечает**:
   - Проверьте переменные окружения
   - Убедитесь, что Vertex AI настроен
   - Проверьте лимиты API

2. **Медленные ответы**:
   - Проверьте AGENTS_MAX_TOKENS
   - Оптимизируйте AGENTS_TEMPERATURE
   - Увеличьте AGENTS_MAX_CONCURRENT

3. **Ошибки аутентификации**:
   - Проверьте GOOGLE_APPLICATION_CREDENTIALS
   - Убедитесь в правильности service account

### Диагностика:
```bash
# Проверка статуса агентов
curl https://flow-masters.ru/api/agents/health

# Тест конфигурации
curl https://flow-masters.ru/api/agents/config
```

---

🤖 **AI агенты FlowMasters готовы помочь в автоматизации ваших бизнес-процессов!**
