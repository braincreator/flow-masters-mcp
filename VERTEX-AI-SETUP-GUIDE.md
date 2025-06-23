# 🌟 Руководство по настройке Google Vertex AI для FlowMasters

## ⚠️ Важно: Включение API в Google Cloud Console

Для работы с Vertex AI необходимо включить соответствующие API в Google Cloud Console.

## 🔧 Пошаговая настройка

### 1. Откройте Google Cloud Console
Перейдите на: https://console.cloud.google.com/

### 2. Выберите проект
Убедитесь, что выбран проект: `ancient-figure-462211-t6`

### 3. Включите необходимые API

#### 3.1 Vertex AI API
1. Перейдите в **APIs & Services** > **Library**
2. Найдите "Vertex AI API"
3. Нажмите **Enable**

#### 3.2 Generative AI API
1. В том же разделе найдите "Generative Language API"
2. Нажмите **Enable**

#### 3.3 AI Platform API (опционально)
1. Найдите "AI Platform Training & Prediction API"
2. Нажмите **Enable**

### 4. Проверьте разрешения Service Account

#### 4.1 Перейдите в IAM & Admin > Service Accounts
1. Найдите: `flowmasters@ancient-figure-462211-t6.iam.gserviceaccount.com`
2. Убедитесь, что назначены роли:
   - **Vertex AI User**
   - **AI Platform Developer**
   - **Service Account Token Creator** (опционально)

#### 4.2 Если ролей нет, добавьте их:
1. Нажмите на email Service Account
2. Перейдите в **Permissions**
3. Нажмите **Grant Access**
4. Добавьте роли выше

### 5. Проверьте квоты

#### 5.1 Перейдите в IAM & Admin > Quotas
1. Найдите "Vertex AI API"
2. Убедитесь, что есть доступные квоты для:
   - **Generate Content requests per minute**
   - **Predict requests per minute**

## 🧪 Тестирование после настройки

После включения всех API подождите 5-10 минут и запустите тест:

```bash
cd /Users/braincreator/Projects/flow-masters/flow-masters
node test-vertex-ai-connection.js
```

## 🌍 Альтернативные регионы

Если `us-central1` недоступен, попробуйте другие регионы:

### Обновите .env.local:
```env
GOOGLE_CLOUD_LOCATION=us-east1
# или
GOOGLE_CLOUD_LOCATION=europe-west1
# или
GOOGLE_CLOUD_LOCATION=asia-southeast1
```

## 🔑 Проверка доступа к моделям

### Доступные модели Gemini:
- `gemini-1.5-pro` (рекомендуется)
- `gemini-1.5-flash` (быстрее, дешевле)
- `gemini-2.5-flash-vision` (для изображений)

### Обновите конфигурацию в .env.local:
```env
AGENTS_DEFAULT_MODEL=gemini-1.5-pro
```

## 🚨 Устранение проблем

### Ошибка 404 "Model not found"
1. ✅ Включите Vertex AI API
2. ✅ Проверьте регион (us-central1)
3. ✅ Убедитесь в правильности названия модели
4. ✅ Подождите 5-10 минут после включения API

### Ошибка 403 "Permission denied"
1. ✅ Проверьте роли Service Account
2. ✅ Убедитесь, что проект активен
3. ✅ Проверьте биллинг аккаунт

### Ошибка 429 "Quota exceeded"
1. ✅ Проверьте квоты в Console
2. ✅ Запросите увеличение квот
3. ✅ Попробуйте другой регион

## 📞 Быстрая помощь

### Команды для проверки:

```bash
# Проверить аутентификацию
gcloud auth list

# Проверить проект
gcloud config get-value project

# Проверить включенные API
gcloud services list --enabled

# Включить Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

## ✅ Готовность к работе

После успешной настройки вы увидите:

```
✅ Authentication: Working
✅ Gemini Pro: Working  
✅ Text Embeddings: Working
```

Тогда можно запускать FlowMasters:

```bash
./start-with-vertex-ai.sh
```

## 🌟 Результат

После настройки у вас будет:
- ✅ Полнофункциональный Vertex AI
- ✅ Доступ к моделям Gemini
- ✅ Мультимодальные возможности
- ✅ Более низкие затраты на AI
- ✅ Лучшая производительность для русского языка

---

**🚀 Удачной настройки Vertex AI для FlowMasters!**