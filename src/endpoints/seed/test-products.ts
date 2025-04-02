export const testProducts = ({ technologyCategory, softwareCategory, designCategory }) => [
  {
    title: {
      en: 'Digital Course Bundle',
      ru: 'Пакет цифровых курсов',
    },
    description: {
      en: 'Complete digital course bundle with lifetime access',
      ru: 'Полный пакет цифровых курсов с пожизненным доступом',
    },
    category: technologyCategory.id,
    productType: 'digital',
    price: 99.99,
    slug: 'digital-course-bundle',
  },
  {
    title: {
      en: 'Pro Subscription',
      ru: 'Про подписка',
    },
    description: {
      en: 'Monthly subscription with premium features',
      ru: 'Ежемесячная подписка с премиум функциями',
    },
    category: softwareCategory.id,
    productType: 'subscription',
    price: 19.99,
    slug: 'pro-subscription',
  },
  {
    title: {
      en: 'AI Chatbot Development Course',
      ru: 'Курс по разработке AI чат-ботов',
    },
    description: {
      en: 'Learn how to build advanced AI chatbots using modern frameworks and LLMs. Includes practical examples and source code.',
      ru: 'Научитесь создавать продвинутых AI чат-ботов с использованием современных фреймворков и LLM. Включает практические примеры и исходный код.',
    },
    category: technologyCategory.id,
    price: 149.99,
    slug: 'ai-chatbot-development-course',
  },
  {
    title: {
      en: 'Business Process Automation Consulting',
      ru: 'Консультация по автоматизации бизнес-процессов',
    },
    description: {
      en: '2-hour consultation session to analyze your business processes and provide automation recommendations.',
      ru: '2-часовая консультация для анализа ваших бизнес-процессов и предоставления рекомендаций по автоматизации.',
    },
    category: designCategory.id,
    price: 299.99,
    slug: 'business-process-automation-consulting',
  },
  {
    title: {
      en: 'Custom GPT Development Guide',
      ru: 'Руководство по разработке Custom GPT',
    },
    description: {
      en: 'Comprehensive guide on developing custom GPT models for business applications. Includes best practices and implementation tips.',
      ru: 'Подробное руководство по разработке пользовательских GPT моделей для бизнес-приложений. Включает лучшие практики и советы по внедрению.',
    },
    category: softwareCategory.id,
    price: 89.99,
    slug: 'custom-gpt-development-guide',
  },
]
