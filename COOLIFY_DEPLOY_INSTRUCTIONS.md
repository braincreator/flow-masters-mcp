# 🚀 Инструкции для деплоя в Coolify

## ❌ Проблема
```
Module not found: Can't resolve 'ai'
```

## ✅ Решение

### 1. Изменения уже запушены в репозиторий
- ✅ Добавлены зависимости в package.json
- ✅ Обновлен pnpm-lock.yaml
- ✅ Коммиты запушены в flowmasters/develop

### 2. Запустить новый деплой в Coolify

#### Вариант A: Автоматический деплой
1. Открыть https://coolify.flow-masters.ru
2. Войти (ay.krasnodar@gmail.com / Shturmovik89@)
3. Перейти в FlowMasters приложение
4. Coolify должен автоматически подхватить изменения

#### Вариант B: Принудительный деплой
1. В Coolify панели найти FlowMasters приложение
2. Нажать кнопку "Deploy" или "Redeploy"
3. Дождаться завершения сборки

### 3. Добавить переменные окружения (если не добавлены)

В Coolify → FlowMasters → Environment Variables:

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

# Public URLs
NEXT_PUBLIC_N8N_BASE_URL=https://n8n.flow-masters.ru
NEXT_PUBLIC_CRAWL4AI_BASE_URL=https://crawl4ai.flow-masters.ru
```

### 4. Проверить после деплоя

1. **Основной сайт**: https://flow-masters.ru
2. **API тестирование**: https://flow-masters.ru/api-test
3. **Консоль браузера**: Отсутствие ошибок ERR_CONNECTION_REFUSED
4. **AI агенты**: https://flow-masters.ru/agents

## 🔧 Если проблема остается

### Проверить логи сборки в Coolify:
1. Перейти в Deployments
2. Найти последний деплой
3. Проверить логи на наличие ошибок

### Возможные проблемы:
1. **Кэш Docker**: Очистить кэш в Coolify
2. **Старая версия кода**: Убедиться, что Coolify использует develop ветку
3. **Переменные окружения**: Проверить, что все переменные добавлены

## 📞 Поддержка

Если деплой не работает:
1. Проверить статус GitHub webhook в Coolify
2. Убедиться, что используется правильная ветка (develop)
3. Проверить логи сборки на наличие других ошибок

---

🎯 **После успешного деплоя все проблемы будут исправлены!**
