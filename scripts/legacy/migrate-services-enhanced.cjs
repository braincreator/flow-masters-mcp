/**
 * Улучшенная миграция услуг с детальными описаниями и features
 */

const { MongoClient } = require('mongodb')
require('dotenv').config()

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters'
const DB_NAME = 'flow-masters'

// Функция для создания richText контента
function createRichText(text) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [
            {
              type: 'text',
              version: 1,
              text: text,
            },
          ],
        },
      ],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// Улучшенные данные услуг с детальными описаниями и features
const enhancedServicesData = [
  {
    title: {
      ru: 'Экспресс-консультация по ИИ',
      en: 'Express AI Consultation',
    },
    serviceType: 'consultation',
    description: {
      ru: createRichText(`Получите профессиональную оценку потенциала внедрения искусственного интеллекта в ваш бизнес всего за 30 минут. 

Наш эксперт проведет экспресс-анализ ваших бизнес-процессов, выявит наиболее перспективные точки для автоматизации и предоставит четкие рекомендации по приоритетам внедрения ИИ.

В результате консультации вы получите:
• Анализ текущих процессов с точки зрения автоматизации
• Список приоритетных направлений для внедрения ИИ
• Предварительную оценку ROI от автоматизации
• Рекомендации по следующим шагам
• Ответы на все ваши вопросы об ИИ

Идеально подходит для первичного знакомства с возможностями ИИ и принятия решения о дальнейших инвестициях в автоматизацию.`),
      en: createRichText(`Get a professional assessment of AI implementation potential for your business in just 30 minutes.

Our expert will conduct an express analysis of your business processes, identify the most promising automation points, and provide clear recommendations on AI implementation priorities.

As a result of the consultation, you will receive:
• Analysis of current processes from an automation perspective
• List of priority areas for AI implementation
• Preliminary ROI assessment from automation
• Recommendations for next steps
• Answers to all your AI questions

Perfect for initial familiarization with AI capabilities and making decisions about further automation investments.`),
    },
    shortDescription: {
      ru: 'Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации',
      en: 'Quick 30-minute AI potential assessment with identification of priority automation points',
    },
    features: {
      ru: [
        {
          name: 'Экспресс-анализ процессов',
          description: 'Быстрая оценка текущих бизнес-процессов на предмет автоматизации',
          included: true,
        },
        {
          name: 'Приоритизация направлений',
          description: 'Определение наиболее перспективных областей для внедрения ИИ',
          included: true,
        },
        {
          name: 'ROI-оценка',
          description: 'Предварительный расчет возврата инвестиций от автоматизации',
          included: true,
        },
        {
          name: 'Дорожная карта',
          description: 'Краткий план следующих шагов по внедрению ИИ',
          included: true,
        },
        {
          name: 'Q&A сессия',
          description: 'Ответы на все ваши вопросы об искусственном интеллекте',
          included: true,
        },
      ],
      en: [
        {
          name: 'Express Process Analysis',
          description: 'Quick assessment of current business processes for automation potential',
          included: true,
        },
        {
          name: 'Direction Prioritization',
          description: 'Identification of the most promising areas for AI implementation',
          included: true,
        },
        {
          name: 'ROI Assessment',
          description: 'Preliminary calculation of return on investment from automation',
          included: true,
        },
        {
          name: 'Roadmap',
          description: 'Brief plan of next steps for AI implementation',
          included: true,
        },
        {
          name: 'Q&A Session',
          description: 'Answers to all your questions about artificial intelligence',
          included: true,
        },
      ],
    },
    price: {
      ru: 3000,
      en: 33,
    },
    duration: 30,
    isPriceStartingFrom: false,
    requiresBooking: true,
    businessStatus: 'active',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: {
        ru: 'Экспресс-консультация по ИИ | Быстрая оценка потенциала автоматизации',
        en: 'Express AI Consultation | Quick Automation Potential Assessment',
      },
      description: {
        ru: '30-минутная консультация по внедрению ИИ с анализом процессов, приоритизацией направлений и ROI-оценкой.',
        en: '30-minute AI implementation consultation with process analysis, direction prioritization and ROI assessment.',
      },
    },
  },
  {
    title: {
      ru: 'Стандартная консультация по ИИ',
      en: 'Standard AI Consultation',
    },
    serviceType: 'consultation',
    description: {
      ru: createRichText(`Углубленная 90-минутная консультация для детального планирования внедрения искусственного интеллекта в ваш бизнес.

Наш эксперт проведет комплексный анализ ваших бизнес-процессов, создаст детальный план внедрения ИИ с техническими требованиями и экономическим обоснованием.

Что включает консультация:
• Детальный аудит текущих процессов и систем
• Анализ данных и их готовности для ИИ
• Разработка стратегии внедрения ИИ
• Создание технического задания
• Расчет ROI и бюджета проекта
• План поэтапного внедрения
• Рекомендации по команде и ресурсам
• Анализ рисков и способов их минимизации

После консультации вы получите готовый план действий, который можно сразу передать в разработку или использовать для поиска подрядчиков.`),
      en: createRichText(`In-depth 90-minute consultation for detailed planning of artificial intelligence implementation in your business.

Our expert will conduct a comprehensive analysis of your business processes, create a detailed AI implementation plan with technical requirements and economic justification.

What the consultation includes:
• Detailed audit of current processes and systems
• Data analysis and AI readiness assessment
• AI implementation strategy development
• Technical specification creation
• ROI calculation and project budget
• Phased implementation plan
• Team and resource recommendations
• Risk analysis and mitigation strategies

After the consultation, you will receive a ready action plan that can be immediately transferred to development or used to find contractors.`),
    },
    shortDescription: {
      ru: 'Углубленная 90-минутная консультация с детальным планом внедрения ИИ и техническим заданием',
      en: 'In-depth 90-minute consultation with detailed AI implementation plan and technical specification',
    },
    features: {
      ru: [
        {
          name: 'Комплексный аудит',
          description: 'Детальный анализ всех бизнес-процессов и IT-систем',
          included: true,
        },
        {
          name: 'Стратегия внедрения',
          description: 'Разработка пошаговой стратегии интеграции ИИ',
          included: true,
        },
        {
          name: 'Техническое задание',
          description: 'Готовое ТЗ для разработчиков или подрядчиков',
          included: true,
        },
        {
          name: 'ROI-расчеты',
          description: 'Детальный финансовый анализ и прогноз окупаемости',
          included: true,
        },
        {
          name: 'План внедрения',
          description: 'Поэтапный план с временными рамками и ресурсами',
          included: true,
        },
        {
          name: 'Анализ рисков',
          description: 'Выявление потенциальных рисков и стратегии их минимизации',
          included: true,
        },
      ],
      en: [
        {
          name: 'Comprehensive Audit',
          description: 'Detailed analysis of all business processes and IT systems',
          included: true,
        },
        {
          name: 'Implementation Strategy',
          description: 'Development of step-by-step AI integration strategy',
          included: true,
        },
        {
          name: 'Technical Specification',
          description: 'Ready technical specification for developers or contractors',
          included: true,
        },
        {
          name: 'ROI Calculations',
          description: 'Detailed financial analysis and payback forecast',
          included: true,
        },
        {
          name: 'Implementation Plan',
          description: 'Phased plan with timelines and resources',
          included: true,
        },
        {
          name: 'Risk Analysis',
          description: 'Identification of potential risks and mitigation strategies',
          included: true,
        },
      ],
    },
    price: {
      ru: 9000,
      en: 99,
    },
    duration: 90,
    isPriceStartingFrom: false,
    requiresBooking: true,
    businessStatus: 'active',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: {
        ru: 'Стандартная консультация по ИИ | Детальный план внедрения',
        en: 'Standard AI Consultation | Detailed Implementation Plan',
      },
      description: {
        ru: 'Углубленная 90-минутная консультация с детальным планом внедрения ИИ, ROI-расчетами и готовым техническим заданием.',
        en: 'In-depth 90-minute consultation with detailed AI implementation plan, ROI calculations and ready technical specification.',
      },
    },
  },
  {
    title: {
      ru: 'Разработка чат-бота для бизнеса',
      en: 'Business Chatbot Development',
    },
    serviceType: 'development',
    description: {
      ru: createRichText(`Создание интеллектуального чат-бота для автоматизации клиентского сервиса и повышения эффективности бизнес-процессов.

Наша команда разработает для вас современного чат-бота, который сможет:
• Отвечать на часто задаваемые вопросы клиентов 24/7
• Квалифицировать лиды и собирать контактную информацию
• Интегрироваться с вашими CRM и другими системами
• Обрабатывать заказы и бронирования
• Предоставлять персонализированные рекомендации
• Эскалировать сложные вопросы к живым операторам

Технологии и возможности:
• Обработка естественного языка (NLP)
• Машинное обучение для улучшения ответов
• Мультиканальность (сайт, Telegram, WhatsApp, VK)
• Аналитика и отчетность
• Интеграция с популярными платформами
• Обучение на ваших данных

Результат: готовый к работе чат-бот с административной панелью, документацией и обучением вашей команды.`),
      en: createRichText(`Development of an intelligent chatbot to automate customer service and improve business process efficiency.

Our team will develop a modern chatbot for you that can:
• Answer frequently asked customer questions 24/7
• Qualify leads and collect contact information
• Integrate with your CRM and other systems
• Process orders and bookings
• Provide personalized recommendations
• Escalate complex issues to live operators

Technologies and capabilities:
• Natural Language Processing (NLP)
• Machine learning for response improvement
• Multi-channel support (website, Telegram, WhatsApp, VK)
• Analytics and reporting
• Integration with popular platforms
• Training on your data

Result: a ready-to-work chatbot with admin panel, documentation and team training.`),
    },
    shortDescription: {
      ru: 'Создание умного чат-бота для автоматизации клиентского сервиса с интеграцией в ваши системы',
      en: 'Smart chatbot development for customer service automation with integration into your systems',
    },
    features: {
      ru: [
        {
          name: 'NLP-обработка',
          description: 'Понимание естественного языка и контекста диалога',
          included: true,
        },
        {
          name: 'Мультиканальность',
          description: 'Работа в Telegram, WhatsApp, на сайте и других платформах',
          included: true,
        },
        {
          name: 'CRM-интеграция',
          description: 'Подключение к вашим системам учета и управления',
          included: true,
        },
        {
          name: 'Обучение на данных',
          description: 'Настройка на специфику вашего бизнеса и продуктов',
          included: true,
        },
        {
          name: 'Аналитика',
          description: 'Детальная статистика работы и эффективности бота',
          included: true,
        },
        {
          name: 'Техподдержка',
          description: '3 месяца бесплатной технической поддержки',
          included: true,
        },
      ],
      en: [
        {
          name: 'NLP Processing',
          description: 'Natural language understanding and dialogue context',
          included: true,
        },
        {
          name: 'Multi-channel',
          description: 'Works on Telegram, WhatsApp, website and other platforms',
          included: true,
        },
        {
          name: 'CRM Integration',
          description: 'Connection to your accounting and management systems',
          included: true,
        },
        {
          name: 'Data Training',
          description: 'Customization for your business and product specifics',
          included: true,
        },
        {
          name: 'Analytics',
          description: 'Detailed statistics on bot performance and efficiency',
          included: true,
        },
        {
          name: 'Tech Support',
          description: '3 months of free technical support',
          included: true,
        },
      ],
    },
    price: {
      ru: 150000,
      en: 1650,
    },
    duration: 0,
    isPriceStartingFrom: true,
    requiresBooking: true,
    businessStatus: 'active',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: {
        ru: 'Разработка чат-бота для бизнеса | Автоматизация клиентского сервиса',
        en: 'Business Chatbot Development | Customer Service Automation',
      },
      description: {
        ru: 'Создание интеллектуального чат-бота с NLP, мультиканальностью и интеграцией в ваши системы.',
        en: 'Development of intelligent chatbot with NLP, multi-channel support and integration into your systems.',
      },
    },
  },
  {
    title: {
      ru: 'ИИ-агент для автоматизации процессов',
      en: 'AI Agent for Process Automation',
    },
    serviceType: 'automation',
    description: {
      ru: createRichText(`Разработка интеллектуального ИИ-агента для полной автоматизации сложных бизнес-процессов и рутинных задач.

Наш ИИ-агент - это продвинутое решение, которое может:
• Анализировать документы и извлекать ключевую информацию
• Принимать решения на основе заданных правил и ML-алгоритмов
• Взаимодействовать с множеством систем и API
• Обрабатывать email, файлы, базы данных
• Генерировать отчеты и уведомления
• Обучаться на исторических данных
• Работать в режиме 24/7 без перерывов

Области применения:
• Обработка заявок и документооборот
• Финансовая аналитика и отчетность
• Управление складом и логистикой
• HR-процессы и рекрутинг
• Маркетинговая автоматизация
• Контроль качества и аудит

Технологии: машинное обучение, обработка естественного языка, компьютерное зрение, RPA, API-интеграции.

Результат: полностью автономный ИИ-агент, который заменит ручную работу и повысит эффективность в разы.`),
      en: createRichText(`Development of an intelligent AI agent for complete automation of complex business processes and routine tasks.

Our AI agent is an advanced solution that can:
• Analyze documents and extract key information
• Make decisions based on predefined rules and ML algorithms
• Interact with multiple systems and APIs
• Process emails, files, databases
• Generate reports and notifications
• Learn from historical data
• Work 24/7 without breaks

Application areas:
• Request processing and document workflow
• Financial analytics and reporting
• Warehouse and logistics management
• HR processes and recruitment
• Marketing automation
• Quality control and audit

Technologies: machine learning, natural language processing, computer vision, RPA, API integrations.

Result: a fully autonomous AI agent that will replace manual work and increase efficiency many times over.`),
    },
    shortDescription: {
      ru: 'Создание автономного ИИ-агента для полной автоматизации сложных бизнес-процессов',
      en: 'Creation of autonomous AI agent for complete automation of complex business processes',
    },
    features: {
      ru: [
        {
          name: 'Документооборот',
          description: 'Автоматическая обработка и анализ любых документов',
          included: true,
        },
        {
          name: 'Принятие решений',
          description: 'ИИ-логика для автономного принятия бизнес-решений',
          included: true,
        },
        {
          name: 'API-интеграции',
          description: 'Подключение к любым внешним системам и сервисам',
          included: true,
        },
        {
          name: 'Машинное обучение',
          description: 'Самообучение и улучшение на основе данных',
          included: true,
        },
        {
          name: '24/7 работа',
          description: 'Непрерывная работа без выходных и перерывов',
          included: true,
        },
        {
          name: 'Масштабируемость',
          description: 'Возможность обработки любых объемов данных',
          included: true,
        },
      ],
      en: [
        {
          name: 'Document Processing',
          description: 'Automatic processing and analysis of any documents',
          included: true,
        },
        {
          name: 'Decision Making',
          description: 'AI logic for autonomous business decision making',
          included: true,
        },
        {
          name: 'API Integrations',
          description: 'Connection to any external systems and services',
          included: true,
        },
        {
          name: 'Machine Learning',
          description: 'Self-learning and improvement based on data',
          included: true,
        },
        {
          name: '24/7 Operation',
          description: 'Continuous operation without weekends and breaks',
          included: true,
        },
        {
          name: 'Scalability',
          description: 'Ability to process any volume of data',
          included: true,
        },
      ],
    },
    price: {
      ru: 300000,
      en: 3300,
    },
    duration: 0,
    isPriceStartingFrom: true,
    requiresBooking: true,
    businessStatus: 'active',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: {
        ru: 'ИИ-агент для автоматизации | Автономная обработка процессов',
        en: 'AI Agent for Automation | Autonomous Process Handling',
      },
      description: {
        ru: 'Разработка интеллектуального ИИ-агента для полной автоматизации бизнес-процессов с машинным обучением.',
        en: 'Development of intelligent AI agent for complete business process automation with machine learning.',
      },
    },
  },
  {
    title: {
      ru: 'Интеграция ИИ в существующие системы',
      en: 'AI Integration into Existing Systems',
    },
    serviceType: 'integration',
    description: {
      ru: createRichText(`Профессиональная интеграция решений искусственного интеллекта в ваши существующие бизнес-системы и процессы.

Наши эксперты помогут вам:
• Провести аудит текущей IT-инфраструктуры
• Определить оптимальные точки интеграции ИИ
• Разработать архитектуру интеграции
• Реализовать подключение ИИ-сервисов
• Обеспечить совместимость с существующими системами
• Настроить мониторинг и логирование
• Провести тестирование и оптимизацию

Типы интеграций:
• CRM и ERP системы
• E-commerce платформы
• Системы документооборота
• Аналитические платформы
• Мобильные приложения
• Веб-сервисы и API

Технологии: REST API, GraphQL, WebHooks, микросервисы, облачные платформы, контейнеризация.

Результат: бесшовная интеграция ИИ-возможностей в ваши рабочие процессы без нарушения существующей функциональности.`),
      en: createRichText(`Professional integration of artificial intelligence solutions into your existing business systems and processes.

Our experts will help you:
• Conduct an audit of current IT infrastructure
• Identify optimal AI integration points
• Develop integration architecture
• Implement AI service connections
• Ensure compatibility with existing systems
• Set up monitoring and logging
• Conduct testing and optimization

Integration types:
• CRM and ERP systems
• E-commerce platforms
• Document management systems
• Analytics platforms
• Mobile applications
• Web services and APIs

Technologies: REST API, GraphQL, WebHooks, microservices, cloud platforms, containerization.

Result: seamless integration of AI capabilities into your workflows without disrupting existing functionality.`),
    },
    shortDescription: {
      ru: 'Бесшовная интеграция ИИ-решений в ваши существующие системы и процессы',
      en: 'Seamless integration of AI solutions into your existing systems and processes',
    },
    features: {
      ru: [
        {
          name: 'Аудит инфраструктуры',
          description: 'Полный анализ текущих систем и возможностей интеграции',
          included: true,
        },
        {
          name: 'Архитектура решения',
          description: 'Проектирование оптимальной схемы интеграции',
          included: true,
        },
        {
          name: 'API-разработка',
          description: 'Создание надежных интерфейсов для подключения ИИ',
          included: true,
        },
        {
          name: 'Тестирование',
          description: 'Комплексное тестирование интеграции и производительности',
          included: true,
        },
        {
          name: 'Документация',
          description: 'Подробная техническая документация и инструкции',
          included: true,
        },
        {
          name: 'Обучение команды',
          description: 'Обучение вашей IT-команды работе с интеграцией',
          included: true,
        },
      ],
      en: [
        {
          name: 'Infrastructure Audit',
          description: 'Complete analysis of current systems and integration capabilities',
          included: true,
        },
        {
          name: 'Solution Architecture',
          description: 'Design of optimal integration scheme',
          included: true,
        },
        {
          name: 'API Development',
          description: 'Creation of reliable interfaces for AI connection',
          included: true,
        },
        {
          name: 'Testing',
          description: 'Comprehensive integration and performance testing',
          included: true,
        },
        {
          name: 'Documentation',
          description: 'Detailed technical documentation and instructions',
          included: true,
        },
        {
          name: 'Team Training',
          description: 'Training your IT team to work with the integration',
          included: true,
        },
      ],
    },
    price: {
      ru: 200000,
      en: 2200,
    },
    duration: 0,
    isPriceStartingFrom: true,
    requiresBooking: true,
    businessStatus: 'active',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meta: {
      title: {
        ru: 'Интеграция ИИ в системы | Подключение AI к существующей инфраструктуре',
        en: 'AI Systems Integration | Connecting AI to Existing Infrastructure',
      },
      description: {
        ru: 'Профессиональная интеграция ИИ-решений в существующие бизнес-системы с полным аудитом и тестированием.',
        en: 'Professional AI solution integration into existing business systems with complete audit and testing.',
      },
    },
  },
]

async function migrateServices() {
  console.log('🚀 Запуск улучшенной миграции услуг...')

  const client = new MongoClient(DATABASE_URI)

  try {
    await client.connect()
    console.log('✅ Подключение к MongoDB установлено')

    const db = client.db(DB_NAME)

    // Обновляем существующие записи или создаем новые
    console.log(`📝 Обновляем ${enhancedServicesData.length} услуг...`)

    for (let i = 0; i < enhancedServicesData.length; i++) {
      const serviceData = enhancedServicesData[i]

      try {
        // Ищем существующую услугу по title
        const existingService = await db.collection('services').findOne({
          $or: [{ 'title.ru': serviceData.title.ru }, { 'title.en': serviceData.title.en }],
        })

        if (existingService) {
          // Обновляем существующую услугу
          await db
            .collection('services')
            .updateOne({ _id: existingService._id }, { $set: serviceData })
          console.log(`✅ Обновлена услуга ${i + 1}: ${serviceData.title.ru}`)
        } else {
          // Создаем новую услугу
          await db.collection('services').insertOne(serviceData)
          console.log(`✅ Создана услуга ${i + 1}: ${serviceData.title.ru}`)
        }
      } catch (error) {
        console.error(`❌ Ошибка обработки услуги ${i + 1}:`, error.message)
      }
    }

    // Проверяем результат
    const count = await db.collection('services').countDocuments()
    console.log(`📊 Всего услуг в коллекции: ${count}`)

    console.log('\n🎯 Миграция завершена!')
    console.log('🌐 Проверьте результат: http://localhost:3000/admin/collections/services')
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
  } finally {
    await client.close()
  }
}

// Запускаем миграцию
migrateServices()
