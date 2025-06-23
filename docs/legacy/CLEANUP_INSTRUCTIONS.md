# Инструкции по очистке старых записей subscription-plans

## Способ 1: Через веб-интерфейс (Рекомендуется)

1. Откройте в браузере: http://localhost:3000/ru/admin-tools/subscription-plans
2. Нажмите кнопку "Delete All Plans" для удаления всех старых планов
3. Нажмите кнопку "Create AI Agency Plans" для создания новых планов
4. Нажмите "Refresh" для обновления списка

## Способ 2: Через MongoDB Shell

1. Откройте терминал и подключитесь к MongoDB:
```bash
mongosh flow-masters
```

2. Удалите все старые планы:
```javascript
db.getCollection('subscription-plans').deleteMany({})
```

3. Создайте новые AI Agency планы:
```javascript
db.getCollection('subscription-plans').insertMany([
  {
    name: {
      ru: 'Стартер',
      en: 'Starter'
    },
    description: {
      ru: 'Идеальное решение для малого бизнеса',
      en: 'Perfect solution for small business'
    },
    features: {
      ru: [
        { feature: 'ИИ-чатбот для 1 платформы', _id: new ObjectId() },
        { feature: 'Базовая интеграция с CRM', _id: new ObjectId() },
        { feature: 'Автоответчик и FAQ-бот', _id: new ObjectId() },
        { feature: 'Техподдержка 30 дней', _id: new ObjectId() },
        { feature: 'Обучение команды (4 часа)', _id: new ObjectId() },
        { feature: 'Настройка включена', _id: new ObjectId() }
      ],
      en: [
        { feature: 'AI chatbot for 1 platform', _id: new ObjectId() },
        { feature: 'Basic CRM integration', _id: new ObjectId() },
        { feature: 'Auto-responder and FAQ bot', _id: new ObjectId() },
        { feature: '30 days technical support', _id: new ObjectId() },
        { feature: 'Team training (4 hours)', _id: new ObjectId() },
        { feature: 'Setup included', _id: new ObjectId() }
      ]
    },
    price: {
      ru: 89000,
      en: 999
    },
    currency: {
      ru: 'RUB',
      en: 'USD'
    },
    period: 'monthly',
    isActive: true,
    isPopular: false,
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    metadata: {
      category: 'ai-agency',
      prepaymentPercentage: 50
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: {
      ru: 'Профессионал',
      en: 'Professional'
    },
    description: {
      ru: 'Для растущего бизнеса с полной автоматизацией',
      en: 'For growing business with complete automation'
    },
    features: {
      ru: [
        { feature: 'ИИ-чатботы для 3 платформ', _id: new ObjectId() },
        { feature: 'Продвинутая интеграция CRM/ERP', _id: new ObjectId() },
        { feature: 'Автоматизация email и SMS', _id: new ObjectId() },
        { feature: 'Аналитика в реальном времени', _id: new ObjectId() },
        { feature: 'Лид-скоринг и сегментация', _id: new ObjectId() },
        { feature: 'Техподдержка 90 дней', _id: new ObjectId() },
        { feature: 'Обучение команды (12 часов)', _id: new ObjectId() },
        { feature: 'Настройка бизнес-процессов', _id: new ObjectId() }
      ],
      en: [
        { feature: 'AI chatbots for 3 platforms', _id: new ObjectId() },
        { feature: 'Advanced CRM/ERP integration', _id: new ObjectId() },
        { feature: 'Email and SMS marketing automation', _id: new ObjectId() },
        { feature: 'Real-time analytics and reports', _id: new ObjectId() },
        { feature: 'Lead scoring and segmentation', _id: new ObjectId() },
        { feature: '90 days technical support', _id: new ObjectId() },
        { feature: 'Team training (12 hours)', _id: new ObjectId() },
        { feature: 'Business process setup', _id: new ObjectId() }
      ]
    },
    price: {
      ru: 189000,
      en: 2099
    },
    currency: {
      ru: 'RUB',
      en: 'USD'
    },
    period: 'monthly',
    isActive: true,
    isPopular: true,
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    metadata: {
      category: 'ai-agency',
      prepaymentPercentage: 30
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: {
      ru: 'Корпоративный',
      en: 'Enterprise'
    },
    description: {
      ru: 'Максимальное решение для крупного бизнеса',
      en: 'Maximum solution for large business'
    },
    features: {
      ru: [
        { feature: 'Неограниченные ИИ-решения', _id: new ObjectId() },
        { feature: 'Индивидуальная разработка', _id: new ObjectId() },
        { feature: 'Полная автоматизация процессов', _id: new ObjectId() },
        { feature: 'Выделенный менеджер проекта', _id: new ObjectId() },
        { feature: 'Приоритетная поддержка 24/7', _id: new ObjectId() },
        { feature: 'Продвинутая аналитика и BI', _id: new ObjectId() },
        { feature: 'Обучение команды (40 часов)', _id: new ObjectId() },
        { feature: 'Консультации по ИИ-стратегии', _id: new ObjectId() },
        { feature: 'SLA гарантии 99.9%', _id: new ObjectId() },
        { feature: 'API доступ и интеграции', _id: new ObjectId() }
      ],
      en: [
        { feature: 'Unlimited AI solutions', _id: new ObjectId() },
        { feature: 'Custom development for specific needs', _id: new ObjectId() },
        { feature: 'Complete automation of all processes', _id: new ObjectId() },
        { feature: 'Dedicated project manager', _id: new ObjectId() },
        { feature: 'Priority 24/7 support', _id: new ObjectId() },
        { feature: 'Advanced analytics and BI', _id: new ObjectId() },
        { feature: 'Team training (40 hours)', _id: new ObjectId() },
        { feature: 'AI strategy consultations', _id: new ObjectId() },
        { feature: '99.9% SLA guarantees', _id: new ObjectId() },
        { feature: 'API access and integrations', _id: new ObjectId() }
      ]
    },
    price: {
      ru: 399000,
      en: 4399
    },
    currency: {
      ru: 'RUB',
      en: 'USD'
    },
    period: 'monthly',
    isActive: true,
    isPopular: false,
    trialPeriodDays: 0,
    maxSubscriptionMonths: 0,
    autoRenew: false,
    allowCancel: true,
    metadata: {
      category: 'ai-agency',
      prepaymentPercentage: 20
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

4. Проверьте результат:
```javascript
db.getCollection('subscription-plans').find({}).pretty()
```

## Способ 3: Через готовый скрипт

Запустите готовый скрипт:
```bash
mongosh flow-masters scripts/mongo-cleanup.js
```

## Способ 4: Через Payload Admin Panel

1. Откройте админ панель: http://localhost:3000/admin
2. Перейдите в раздел "Subscriptions" → "Subscription Plans"
3. Удалите все старые записи вручную
4. Создайте новые записи через интерфейс

## Проверка результата

После выполнения любого из способов:

1. Откройте тестовую страницу: http://localhost:3000/ru/test-plans
2. Проверьте API: http://localhost:3000/api/v1/subscription/plans?status=active&category=ai-agency
3. Убедитесь, что хук useAIAgencyPlans загружает данные из API, а не fallback

## Структура новых планов

Каждый план содержит:
- ✅ Локализованные поля (name, description, features, price, currency)
- ✅ Правильные типы полей (trialPeriodDays вместо trialDays)
- ✅ Метаданные с категорией 'ai-agency'
- ✅ Процент предоплаты в metadata.prepaymentPercentage
- ✅ Корректные цены в рублях и долларах
