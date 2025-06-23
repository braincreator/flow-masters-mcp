# 🤖 Простая настройка Google Vertex AI

## 🎯 Два способа настройки:

### Способ 1: Service Account JSON (рекомендуется)
```bash
# Service Account JSON в переменной окружения
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"ancient-figure-462211-t6",...}

# Дополнительные настройки
GOOGLE_CLOUD_PROJECT_ID=ancient-figure-462211-t6
AGENTS_ENABLED=true
```

### Способ 2: API Key (проще)
```bash
# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# Дополнительные настройки  
AGENTS_ENABLED=true
```

## 🔑 Как получить API Key (быстрый способ):

1. Перейти на https://makersuite.google.com/app/apikey
2. Войти в Google аккаунт
3. Нажать "Create API key"
4. Скопировать ключ
5. Добавить в Coolify как `GOOGLE_GENERATIVE_AI_API_KEY`

## 🚀 Настройка в Coolify:

### Минимальные переменные для работы AI:
```bash
# Выберите ОДИН из способов:

# Способ 1: API Key (проще)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here

# ИЛИ Способ 2: Service Account
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Общие настройки
AGENTS_ENABLED=true
AGENTS_DEBUG=false

# Остальные переменные FlowMasters
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYzFmNGY3Zi0zMzQ1LTRiNzQtOTM1OC1lYjEyZWU4MjdiNzUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUwMzE2MDk1fQ.54cWJ5_Lknv20HTq4mPspgHPFaLVcpAXLVFRRMgZ4tE
CRAWL4AI_API_TOKEN=braincoder_crawl4ai_token_2024
```

## 🧪 Тестирование:

После деплоя проверить:
1. **AI агенты**: https://flow-masters.ru/agents
2. **Ответы**: Должны быть реальные AI ответы от Google Gemini

---

🎯 **Выберите любой способ - оба работают!**
