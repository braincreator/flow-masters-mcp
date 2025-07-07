# 🔐 API Key аутентификация между MCP и Flow Masters

## 📋 Обзор

API key используется для аутентификации запросов от MCP сервера к основному приложению Flow Masters. Это обеспечивает безопасность и контроль доступа к API endpoints.

## 🔄 Схема взаимодействия

```
┌─────────────────┐                    ┌─────────────────┐
│   MCP Server    │                    │  Flow Masters   │
│    :3030        │                    │     :3000       │
├─────────────────┤                    ├─────────────────┤
│                 │  HTTP Request      │                 │
│  ApiClient      │ ──────────────────►│  API Routes     │
│                 │  Authorization:    │                 │
│                 │  ApiKey <key>      │                 │
│                 │                    │                 │
│                 │◄──────────────────│  verifyApiKey() │
│                 │  JSON Response     │                 │
└─────────────────┘                    └─────────────────┘
```

## 🔧 Реализация в MCP сервере

### 1. Конфигурация API ключа

**В config.json:**
```json
{
  "apiConfig": {
    "apiUrl": "https://flow-masters.ru",
    "apiKey": "your-secret-api-key-here",
    "basePath": "/api"
  }
}
```

**Через переменные окружения:**
```bash
API_URL=https://flow-masters.ru
API_KEY=your-secret-api-key-here
```

### 2. Отправка запросов с API ключом

**В ApiClient (flow-masters-mcp/src/api/client.ts):**
```typescript
export class ApiClient {
  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: this.buildApiUrl(config.apiUrl, config.basePath, config.apiVersion),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,  // ← API ключ в заголовке
        'X-Client': 'Cursor-MCP-Server',             // ← Идентификация клиента
      },
      timeout: 10000,
    })
  }
}
```

### 3. Примеры запросов

**Получение списка категорий:**
```http
GET /api/category-types HTTP/1.1
Host: flow-masters.ru
Authorization: Bearer your-secret-api-key-here
X-Client: Cursor-MCP-Server
Content-Type: application/json
```

**Прокси запрос через MCP:**
```typescript
const response = await apiClient.request('GET', '/category-types')
// Автоматически добавляет Authorization заголовок
```

## 🛡️ Проверка в основном приложении

### 1. Middleware для проверки API ключа

**В src/utilities/auth.ts:**
```typescript
export async function verifyApiKey(request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization')
  
  // Проверяем формат заголовка
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('Missing or invalid Authorization header (Bearer token expected)', 401)
  }
  
  const providedKey = authHeader.substring(7) // Убираем "Bearer "
  
  try {
    // Сравниваем с секретным ключом
    if (providedKey !== ENV.PAYLOAD_SECRET) {
      return errorResponse('Invalid API key', 403)
    }
    
    return null // Успешная аутентификация
  } catch (error) {
    return errorResponse('Failed to verify API key', 500)
  }
}
```

### 2. Использование в API routes

**Пример в src/app/api/category-types/route.ts:**
```typescript
export async function GET(request: NextRequest) {
  // Проверяем API ключ
  const authError = await verifyApiKey(request)
  if (authError) {
    return authError // Возвращаем ошибку аутентификации
  }
  
  // Продолжаем обработку запроса
  try {
    const payload = await getPayloadClient()
    const categories = await payload.find({
      collection: 'categories',
      // ... остальная логика
    })
    
    return NextResponse.json({
      success: true,
      data: categories.docs
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories'
    }, { status: 500 })
  }
}
```

## 🔒 Типы аутентификации

### 1. Простая аутентификация (текущая)

**MCP отправляет:**
```http
Authorization: Bearer your-secret-key
```

**Flow Masters проверяет:**
```typescript
const isValid = providedKey === process.env.PAYLOAD_SECRET
```

### 2. Расширенная аутентификация (будущая)

**С коллекцией ApiKeys:**
```typescript
// Проверка в базе данных
const apiKeyQuery = await payload.find({
  collection: 'apiKeys',
  where: {
    key: { equals: providedKey },
    isEnabled: { equals: true },
  },
  limit: 1,
})

const isValid = apiKeyQuery.docs.length > 0
```

## 🚨 Обработка ошибок аутентификации

### В MCP сервере

**ApiClient автоматически обрабатывает ошибки:**
```typescript
this.client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('API Key Authentication failed')
    } else if (error.response?.status === 403) {
      console.error('API Key is invalid or disabled')
    }
    return Promise.reject(error)
  },
)
```

### В основном приложении

**Возвращаются стандартные HTTP коды:**
- `401 Unauthorized` - отсутствует или неверный формат заголовка
- `403 Forbidden` - неверный API ключ
- `500 Internal Server Error` - ошибка при проверке

## 🔧 Настройка и управление

### 1. Генерация API ключа

```bash
# Генерация случайного ключа
openssl rand -hex 32

# Или через Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Установка в окружении

**Для основного приложения:**
```bash
# .env.local
PAYLOAD_SECRET=your-generated-secret-key-here
```

**Для MCP сервера:**
```bash
# .env или config.json
API_KEY=your-generated-secret-key-here
```

### 3. Ротация ключей

```bash
# 1. Генерируем новый ключ
NEW_KEY=$(openssl rand -hex 32)

# 2. Обновляем в основном приложении
echo "PAYLOAD_SECRET=$NEW_KEY" >> .env.local

# 3. Обновляем в MCP сервере
echo "API_KEY=$NEW_KEY" >> .env

# 4. Перезапускаем сервисы
```

## 🧪 Тестирование аутентификации

### 1. Проверка валидного ключа

```bash
curl -H "Authorization: Bearer your-valid-key" \
     http://localhost:3000/api/category-types
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "data": [...]
}
```

### 2. Проверка невалидного ключа

```bash
curl -H "Authorization: Bearer invalid-key" \
     http://localhost:3000/api/category-types
```

**Ожидаемый ответ:**
```json
{
  "error": "Invalid API key"
}
```

### 3. Проверка отсутствующего ключа

```bash
curl http://localhost:3000/api/category-types
```

**Ожидаемый ответ:**
```json
{
  "error": "Missing or invalid Authorization header (Bearer token expected)"
}
```

## 🔄 Автоматическое тестирование в MCP

**В test-api-migration.js:**
```javascript
// Тест с валидным ключом
const response = await makeRequest({
  hostname: CONFIG.MCP_HOST,
  port: CONFIG.MCP_PORT,
  path: '/mcp/proxy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
}, {
  method: 'GET',
  path: '/category-types',
})

if (response.statusCode === 200 && response.body?.success) {
  console.log('✅ API ключ работает корректно')
} else {
  console.log('❌ Проблема с API ключом')
}
```

## 🛡️ Безопасность

### Рекомендации:

1. **Никогда не храните ключи в коде** - только в переменных окружения
2. **Используйте разные ключи** для разных окружений (dev, staging, prod)
3. **Регулярно ротируйте ключи** (раз в 3-6 месяцев)
4. **Мониторьте использование** - логируйте неудачные попытки аутентификации
5. **Используйте HTTPS** в продакшн для защиты ключей в транзите

### Логирование:

```typescript
// В основном приложении
if (!isValid) {
  logWarn(`Invalid API key attempt from ${request.headers.get('x-forwarded-for') || 'unknown'}`)
}

// В MCP сервере
if (error.response?.status === 403) {
  console.error(`API authentication failed: ${error.response.data?.error}`)
}
```

---

**Итог:** API ключ обеспечивает простую и надежную аутентификацию между MCP сервером и основным приложением, позволяя контролировать доступ к API endpoints и обеспечивать безопасность системы.