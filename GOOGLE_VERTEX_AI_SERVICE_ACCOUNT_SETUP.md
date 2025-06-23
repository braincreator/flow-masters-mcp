# 🤖 Настройка Google Vertex AI с Service Account

## 🎯 Цель: Использовать существующий service account для Google Vertex AI

## 📝 У вас уже есть:
- **Google Cloud Project**: `ancient-figure-462211-t6`
- **Service Account**: `flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com`
- **Service Account JSON**: (нужно добавить в переменные окружения)

## 🔧 Настройка в Coolify:

### Вариант 1: Service Account JSON (рекомендуется)
```bash
# Google Cloud Service Account (JSON в одну строку)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"ancient-figure-462211-t6","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs/flowmasters%40ancient-figure-462211-t6.iam.gserviceaccount.com"}

# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=ancient-figure-462211-t6
GOOGLE_CLOUD_LOCATION=us-central1

# AI Agents
AGENTS_ENABLED=true
AGENTS_DEBUG=false
```

### Вариант 2: Google Generative AI API Key (альтернатива)
```bash
# Если service account не работает, можно использовать API ключ
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_from_makersuite

# AI Agents
AGENTS_ENABLED=true
AGENTS_DEBUG=false
```

## 🔑 Как получить Service Account JSON:

### 1. Перейти в Google Cloud Console:
🔗 **URL**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=ancient-figure-462211-t6

### 2. Найти service account:
- **Email**: `flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com`
- Нажать на service account

### 3. Создать новый ключ:
1. Перейти на вкладку **"Keys"**
2. Нажать **"Add Key"** → **"Create new key"**
3. Выбрать **"JSON"**
4. Скачать файл

### 4. Подготовить JSON для переменной окружения:
```bash
# Преобразовать JSON в одну строку (убрать переносы строк)
cat service-account.json | jq -c .
```

## 🚀 Настройка в Coolify:

### 1. Открыть FlowMasters в Coolify
- URL: https://coolify.flow-masters.ru
- Перейти в Environment Variables

### 2. Добавить переменные:
```bash
# Service Account (ОСНОВНОЙ способ)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT_ID=ancient-figure-462211-t6
GOOGLE_CLOUD_LOCATION=us-central1

# Остальные переменные
AGENTS_ENABLED=true
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYzFmNGY3Zi0zMzQ1LTRiNzQtOTM1OC1lYjEyZWU4MjdiNzUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUwMzE2MDk1fQ.54cWJ5_Lknv20HTq4mPspgHPFaLVcpAXLVFRRMgZ4tE
CRAWL4AI_API_TOKEN=braincoder_crawl4ai_token_2024
```

### 3. Перезапустить деплой

## 🧪 Тестирование:

### После настройки проверить:
1. **AI агенты**: https://flow-masters.ru/agents
2. **Логи**: Должно быть "Google Vertex AI initialized successfully"
3. **Ответы**: Реальные AI ответы от Google Gemini

## 🔧 Техническая информация:

### Как работает аутентификация:
1. Service Account JSON парсится из переменной окружения
2. Создается Google Auth клиент с credentials
3. Получается access token для Vertex AI
4. Используется Google Gemini Pro модель

### Fallback логика:
1. **Приоритет 1**: Service Account JSON
2. **Приоритет 2**: Google Generative AI API Key
3. **Ошибка**: Если ничего не настроено

## 🚨 Важные моменты:

### 1. Безопасность Service Account:
- ❌ НЕ коммитить JSON в git
- ✅ Хранить только в переменных окружения Coolify
- ✅ Использовать минимальные права доступа

### 2. Права доступа Service Account:
Убедиться, что service account имеет роли:
- `Vertex AI User`
- `AI Platform Developer`

### 3. Формат JSON:
- JSON должен быть в одну строку (без переносов)
- Все кавычки должны быть экранированы правильно

## 🎯 Ожидаемый результат:

- ✅ **AI агенты работают** с реальным Google Vertex AI
- ✅ **Аутентификация** через service account
- ✅ **Высокое качество** ответов от Gemini Pro
- ✅ **Стабильная работа** без ошибок API

---

🚀 **Service Account обеспечивает надежную аутентификацию для Vertex AI!**
