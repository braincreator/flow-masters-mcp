# 🤖 FlowMasters AI Agents

Система умных AI агентов для автоматизации бизнес-процессов, интегрированная в платформу FlowMasters.

## 🚀 Быстрый старт

### 1. Установка и настройка

```bash
# Сделать скрипт исполняемым
chmod +x setup-ai-agents.sh

# Запустить установку
./setup-ai-agents.sh
```

### 2. Настройка API ключей

Отредактируйте `.env.local` и добавьте ваши API ключи:

```env
# Обязательно
OPENAI_API_KEY=sk-your-openai-key-here

# Опционально (для расширенных функций)
QDRANT_API_KEY=your-qdrant-key
N8N_API_KEY=your-n8n-key
```

### 3. Запуск

```bash
npm run dev
```

Перейдите на http://localhost:3000/agents

## 🎯 Доступные агенты

### 🤖 FlowMasters Assistant
**URL:** `/agents/assistant`
**API:** `/api/agents/assistant`

Персональный помощник по платформе FlowMasters.

**Возможности:**
- Объяснение функций платформы
- Пошаговые инструкции
- Рекомендации по настройке
- Решение технических вопросов

**Примеры запросов:**
- "Как создать автоматизацию в n8n?"
- "Объясни возможности AI агентов"
- "Помоги настроить интеграцию с CRM"

### 📚 Smart Documentation Search
**URL:** `/agents/search`
**API:** `/api/agents/search`

Умный поиск по документации с использованием RAG.

**Возможности:**
- Векторный поиск по документации
- Анализ множественных источников
- Точные ответы с источниками
- Предложение связанных тем

**Примеры запросов:**
- "Как настроить webhook в n8n?"
- "Документация по Qdrant API"
- "Примеры интеграции с Flowise"

### 🔄 Quick Automation Builder
**URL:** `/agents/automation`
**API:** `/api/agents/automation`

Быстрое создание автоматизированных workflow.

**Возможности:**
- Создание workflow из описания
- Готовые шаблоны автоматизации
- Настройка интеграций
- Мониторинг выполнения

**Примеры запросов:**
- "Автоматизировать обработку новых лидов"
- "Создать email уведомления"
- "Синхронизировать данные между системами"

## 🏗️ Архитектура

### Структура файлов

```
src/
├── lib/agents/                     # Основная логика агентов
│   ├── types.ts                   # TypeScript типы
│   ├── clients.ts                 # Клиенты AI сервисов
│   ├── base-agent.ts             # Базовый класс агента
│   └── implementations/           # Конкретные агенты
│       ├── assistant-agent.ts
│       ├── search-agent.ts
│       └── automation-agent.ts
├── app/api/agents/                # API endpoints
│   ├── route.ts                  # Главный API
│   ├── assistant/route.ts
│   ├── search/route.ts
│   └── automation/route.ts
├── components/agents/             # React компоненты
│   ├── AgentChat.tsx
│   ├── AgentSelector.tsx
│   └── AgentInterface.tsx
└── app/(frontend)/[lang]/agents/  # Страницы
    ├── page.tsx
    ├── assistant/page.tsx
    ├── search/page.tsx
    └── automation/page.tsx
```

### Технологический стек

- **Frontend:** Next.js 15, React 19, TypeScript
- **AI:** OpenAI GPT-4, AI SDK
- **Vector DB:** Qdrant, Weaviate
- **Automation:** n8n, Flowise
- **Web Scraping:** Crawl4AI
- **UI:** Tailwind CSS, Lucide React

## 🔧 API Reference

### Главный API endpoint

```typescript
POST /api/agents
{
  "agentType": "assistant" | "search" | "automation",
  "message": "Ваш запрос",
  "context": {
    "currentPage": "/some-page",
    "userPreferences": {...}
  },
  "history": [...],
  "userId": "user-id",
  "sessionId": "session-id"
}
```

### Ответ API

```typescript
{
  "success": true,
  "data": {
    "type": "text" | "search_results" | "workflow_template",
    "content": "Ответ агента",
    "sources": [...],
    "suggestions": [...],
    "actions": [...],
    "metadata": {
      "processingTime": 1500,
      "confidence": 0.9,
      "sources": 3
    }
  }
}
```

## 🔌 Интеграции

### Настроенные сервисы

- **OpenWebUI:** https://ai.flow-masters.ru
- **n8n:** https://n8n.flow-masters.ru
- **Flowise:** https://flowise.flow-masters.ru
- **Qdrant:** http://192.168.0.5:6333
- **Weaviate:** http://192.168.0.5:8080
- **Crawl4AI:** https://crawl.flow-masters.ru

### Доступные интеграции для автоматизации

- **CRM:** Salesforce, HubSpot, Pipedrive
- **Email:** Gmail, Outlook, SendGrid
- **Мессенджеры:** Slack, Telegram, WhatsApp
- **Базы данных:** MySQL, PostgreSQL, MongoDB
- **Облачные хранилища:** Google Drive, Dropbox
- **Платежи:** Stripe, PayPal, YooMoney
- **Социальные сети:** Facebook, LinkedIn, Twitter

## 🎨 Кастомизация

### Добавление нового агента

1. Создайте класс агента в `src/lib/agents/implementations/`:

```typescript
export class MyCustomAgent extends BaseAgent {
  constructor() {
    super('custom', 'My Agent', 'Description', 'System prompt')
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    // Ваша логика
  }
}
```

2. Добавьте API endpoint в `src/app/api/agents/custom/route.ts`

3. Зарегистрируйте агента в главном API (`src/app/api/agents/route.ts`)

4. Создайте страницу в `src/app/(frontend)/[lang]/agents/custom/page.tsx`

### Настройка промптов

Промпты агентов находятся в конструкторах классов агентов. Вы можете изменить их для адаптации под ваши потребности.

### Добавление новых интеграций

Расширьте `AgentClients` класс в `src/lib/agents/clients.ts` для добавления новых API интеграций.

## 📊 Мониторинг и аналитика

### Логирование

Все взаимодействия с агентами логируются для аналитики:

```typescript
{
  agentType: 'assistant',
  userId: 'user-123',
  query: 'Как создать автоматизацию?',
  response: 'Для создания автоматизации...',
  processingTime: 1500,
  success: true,
  timestamp: '2024-01-20T10:30:00Z'
}
```

### Метрики производительности

- Время отклика агентов
- Количество запросов
- Успешность обработки
- Удовлетворенность пользователей

## 🚨 Устранение неполадок

### Частые проблемы

1. **Ошибка "Agent not found"**
   - Проверьте, что агент зарегистрирован в `/api/agents/route.ts`

2. **Ошибка OpenAI API**
   - Убедитесь, что `OPENAI_API_KEY` правильно настроен в `.env.local`

3. **Ошибка подключения к Qdrant**
   - Проверьте доступность `QDRANT_URL` и правильность `QDRANT_API_KEY`

4. **Проблемы с навигацией**
   - Запустите `node update-navigation.js` для обновления навигации

### Отладка

Включите режим отладки в `.env.local`:

```env
AGENTS_DEBUG=true
AGENTS_LOG_LEVEL=debug
```

## 🔒 Безопасность

### Рекомендации

- Никогда не коммитьте API ключи в репозиторий
- Используйте переменные окружения для всех секретов
- Ограничьте доступ к API endpoints при необходимости
- Регулярно ротируйте API ключи

### Rate Limiting

API endpoints имеют встроенное ограничение скорости. Настройте в `.env.local`:

```env
AGENTS_RATE_LIMIT=100  # запросов в минуту
```

## 📈 Производительность

### Оптимизация

- Агенты используют streaming для быстрых ответов
- Векторный поиск кэшируется для повторных запросов
- Автоматическое управление токенами OpenAI

### Масштабирование

Система спроектирована для горизонтального масштабирования:
- Stateless агенты
- Внешние AI сервисы
- Кэширование результатов

## 🤝 Поддержка

### Документация

- [FlowMasters Documentation](https://docs.flow-masters.ru)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [n8n Documentation](https://docs.n8n.io)

### Контакты

- Email: support@flow-masters.ru
- Telegram: @flowmasters_support

---

**Создано с помощью AI агентов для быстрой разработки 🚀**