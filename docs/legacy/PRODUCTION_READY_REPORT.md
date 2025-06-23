# 🚀 PRODUCTION READY: Яндекс.Метрика + API Интеграции

## ✅ Что готово для продакшена

### 1. 📊 Яндекс.Метрика (исправлена для production)
- ✅ **YandexMetrikaRobust** компонент с fallback режимом
- ✅ **CSP заголовки** настроены в next.config.mjs
- ✅ **Middleware** для проксирования запросов
- ✅ **Debug режим** автоматически отключается в production
- ✅ **Standalone режим** включен для Docker

### 2. 🔗 API Ключи настроены
- ✅ **n8n API**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ **Crawl4AI API**: `braincoder_crawl4ai_token_2024`
- ✅ **Яндекс.Метрика ID**: `98849829`

### 3. 🧪 Тестирование API
- ✅ Создан компонент `ApiTestComponent`
- ✅ API роуты для тестирования: `/api/test/n8n`, `/api/test/crawl4ai`, `/api/test/metrika`
- ✅ Тестовая страница: `/api-test`

## 🔧 Переменные окружения для продакшена

### В Coolify добавить:
```bash
# Яндекс.Метрика
NEXT_PUBLIC_YANDEX_METRIKA_ID=98849829
NEXT_PUBLIC_METRIKA_DEBUG=false

# n8n API
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYzFmNGY3Zi0zMzQ1LTRiNzQtOTM1OC1lYjEyZWU4MjdiNzUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUwMzE2MDk1fQ.54cWJ5_Lknv20HTq4mPspgHPFaLVcpAXLVFRRMgZ4tE
N8N_BASE_URL=https://n8n.flow-masters.ru

# Crawl4AI API
CRAWL4AI_API_TOKEN=braincoder_crawl4ai_token_2024
CRAWL4AI_BASE_URL=https://crawl4ai.flow-masters.ru
CRAWL4AI_INTERNAL_URL=http://192.168.0.4:11235

# Public URLs for client-side
NEXT_PUBLIC_N8N_BASE_URL=https://n8n.flow-masters.ru
NEXT_PUBLIC_CRAWL4AI_BASE_URL=https://crawl4ai.flow-masters.ru
```

## 🚀 Деплой в продакшн

### 1. Через Coolify (автоматический)
```bash
# Код уже в репозитории, Coolify подхватит изменения автоматически
# Или принудительно запустить деплой в Coolify панели
```

### 2. Ручной деплой (если нужно)
```bash
# На сервере
cd /path/to/flowmasters
git pull origin main
npm run build
npm start
```

## 🧪 Проверка после деплоя

### 1. Основная проверка
1. Открыть https://flow-masters.ru
2. Открыть DevTools (F12) → Console
3. Проверить отсутствие ошибок `ERR_CONNECTION_REFUSED`
4. Найти сообщение: `✅ Yandex Metrika initialized successfully`

### 2. Тестирование API
1. Открыть https://flow-masters.ru/api-test
2. Нажать "🚀 Запустить тесты"
3. Все API должны показать ✅ статус

### 3. Проверка в Яндекс.Метрике
1. Войти в [Яндекс.Метрику](https://metrika.yandex.ru)
2. Счетчик 98849829
3. **Отчеты** → **Посещаемость** → проверить данные в реальном времени

## 🔍 Диагностика проблем

### Если Яндекс.Метрика не работает:
```bash
# Проверить CSP заголовки
curl -I https://flow-masters.ru | grep -i content-security

# Проверить проксирование
curl https://flow-masters.ru/metrika/tag.js

# Проверить переменные окружения
docker exec container_name env | grep METRIKA
```

### Если API не работают:
```bash
# Проверить API роуты
curl https://flow-masters.ru/api/test/n8n
curl https://flow-masters.ru/api/test/crawl4ai
curl https://flow-masters.ru/api/test/metrika

# Проверить логи контейнера
docker logs container_name --tail 50
```

## 📊 Мониторинг

### Метрики для отслеживания:
- ✅ Отсутствие ошибок `ERR_CONNECTION_REFUSED` в логах
- ✅ Успешные запросы к `/api/test/*` endpoints
- ✅ Данные в Яндекс.Метрике поступают
- ✅ API интеграции работают стабильно

### Алерты настроить на:
- HTTP 5xx ошибки на API endpoints
- Отсутствие данных в Яндекс.Метрике > 1 часа
- Недоступность n8n или Crawl4AI API

## 🎯 Результат

### ✅ В production будет работать:
1. **Яндекс.Метрика** без ошибок `ERR_CONNECTION_REFUSED`
2. **Обход блокировщиков** через проксирование
3. **Fallback режим** при критических проблемах
4. **API интеграции** с n8n и Crawl4AI
5. **Автоматическое тестирование** через `/api-test`

### 🔧 Особенности production:
- Debug режим автоматически отключен
- CSP заголовки оптимизированы для безопасности
- Standalone режим для Docker
- Кэширование и оптимизация включены

---

🎉 **Все готово для стабильной работы в продакшене!**

### 📞 Поддержка
- Тестовая страница: https://flow-masters.ru/api-test
- Логи: `docker logs container_name`
- Мониторинг: Яндекс.Метрика + API endpoints
