# 🤖 Исправление AI модуля в Coolify

## ❌ Проблема
```
Module not found: Can't resolve 'ai'
```

## ✅ Причина
Coolify использует Docker кэш, который не содержит новые AI зависимости.

## 🔧 Решение

### 1. Все зависимости УЖЕ добавлены в код:
- ✅ `ai: ^4.3.16`
- ✅ `@ai-sdk/google: ^1.2.19`
- ✅ `@ai-sdk/openai: ^1.3.22`
- ✅ Код запушен в репозиторий

### 2. Нужно очистить Docker кэш в Coolify:

#### Вариант A: Через Coolify UI
1. Открыть https://coolify.flow-masters.ru
2. Войти: `ay.krasnodar@gmail.com` / `Shturmovik89@`
3. Перейти в FlowMasters приложение
4. Найти настройки сборки
5. Включить опцию **"Clear Docker cache"** или **"No cache"**
6. Запустить новый деплой

#### Вариант B: Через SSH (если есть доступ)
```bash
# Очистить Docker кэш
docker system prune -f
docker builder prune -f

# Перезапустить деплой
# (это делается через Coolify UI)
```

### 3. Альтернативное решение - принудительная переустановка:

Добавить в Dockerfile или build команды:
```dockerfile
# Принудительно переустановить зависимости
RUN rm -rf node_modules pnpm-lock.yaml
RUN pnpm install --no-frozen-lockfile
```

### 4. Проверить переменные окружения для AI:

В Coolify добавить (если планируется использовать):
```bash
# Google Vertex AI (если нужно)
GOOGLE_CLOUD_PROJECT_ID=ancient-figure-462211-t6
GOOGLE_CLOUD_LOCATION=us-central1

# Включить AI агентов
AGENTS_ENABLED=true
AGENTS_DEBUG=false
```

## 🧪 После исправления проверить:

1. **Сборка успешна**: Нет ошибок "Module not found"
2. **AI агенты работают**: https://flow-masters.ru/agents
3. **API тестирование**: https://flow-masters.ru/api-test

## 📊 Ожидаемый результат:

- ✅ Сборка проходит без ошибок
- ✅ AI модуль загружается корректно
- ✅ Агенты возвращают реальные ответы (не заглушки)
- ✅ Все функции FlowMasters работают

---

🎯 **Основная проблема: Docker кэш в Coolify. Нужно его очистить!**
