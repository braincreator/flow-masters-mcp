// MongoDB cleanup script
// Запустить через: mongosh flow-masters scripts/mongo-cleanup.js

print("🧹 Starting cleanup of subscription plans...");

// Подключаемся к базе данных
db = db.getSiblingDB('flow-masters');

// Получаем все существующие планы
const existingPlans = db.getCollection('subscription-plans').find({}).toArray();
print(`Found ${existingPlans.length} existing plans:`);
existingPlans.forEach(plan => {
  print(`  - ${plan._id}: ${plan.name} (${plan.price} ${plan.currency})`);
});

// Удаляем все старые планы
if (existingPlans.length > 0) {
  print("\n🗑️  Deleting old plans...");
  const deleteResult = db.getCollection('subscription-plans').deleteMany({});
  print(`  ✅ Deleted ${deleteResult.deletedCount} plans`);
}

// Создаем новые AI Agency планы
print("\n🆕 Creating new AI Agency plans...");

const newPlans = [
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
];

// Вставляем новые планы
const insertResult = db.getCollection('subscription-plans').insertMany(newPlans);
print(`  ✅ Created ${insertResult.insertedIds.length} new plans`);

print("\n🎉 Cleanup completed successfully!");
print(`📊 Summary:`);
print(`  - Deleted: ${existingPlans.length} old plans`);
print(`  - Created: ${newPlans.length} new AI Agency plans`);

// Показываем новые планы
print("\n📋 New plans created:");
const newCreatedPlans = db.getCollection('subscription-plans').find({}).toArray();
newCreatedPlans.forEach(plan => {
  print(`  - ${plan._id}: ${plan.name.ru} / ${plan.name.en} (${plan.price.ru} ${plan.currency.ru} / ${plan.price.en} ${plan.currency.en})`);
});
