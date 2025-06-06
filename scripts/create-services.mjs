import { getPayload } from 'payload'
import config from '../dist/payload.config.js'

// Инициализируем Payload
const start = async () => {
  const payload = await getPayload({ config })
  console.log('Payload initialized')

  // Данные услуг
  const services = [
    {
      title: {
        ru: 'Экспресс-консультация по ИИ',
        en: 'Express AI Consultation'
      },
      serviceType: 'consultation',
      description: {
        ru: {
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
                    text: 'За 30 минут определим наиболее перспективные направления для внедрения искусственного интеллекта в ваши бизнес-процессы. Получите четкое понимание возможностей и приоритетов автоматизации.'
                  }
                ]
              }
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1
          }
        },
        en: {
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
                    text: 'In 30 minutes, we\'ll identify the most promising areas for implementing artificial intelligence in your business processes. Get a clear understanding of automation opportunities and priorities.'
                  }
                ]
              }
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1
          }
        }
      },
      shortDescription: {
        ru: 'Быстрая 30-минутная оценка потенциала ИИ с выявлением приоритетных точек автоматизации',
        en: 'Quick 30-minute AI potential assessment with identification of priority automation points'
      },
      price: {
        ru: 3000,
        en: 33
      },
      isPriceStartingFrom: false,
      duration: 30,
      status: 'published',
      slug: 'express-ai-consultation',
      requiresBooking: true,
      requiresPayment: true,
      features: {
        ru: [
          {
            name: 'Экспресс-анализ процессов',
            description: 'Быстрая оценка 2-3 ключевых бизнес-процессов на предмет автоматизации',
            included: true
          },
          {
            name: 'Приоритизация возможностей',
            description: 'Определение наиболее перспективных направлений для внедрения ИИ',
            included: true
          },
          {
            name: 'Предварительная оценка ROI',
            description: 'Ориентировочный расчет эффекта от автоматизации',
            included: true
          },
          {
            name: 'Рекомендации по инструментам',
            description: 'Краткий обзор подходящих ИИ-решений',
            included: true
          }
        ],
        en: [
          {
            name: 'Express Process Analysis',
            description: 'Quick assessment of 2-3 key business processes for automation',
            included: true
          },
          {
            name: 'Opportunity Prioritization',
            description: 'Identifying the most promising areas for AI implementation',
            included: true
          },
          {
            name: 'Preliminary ROI Assessment',
            description: 'Approximate calculation of automation effects',
            included: true
          },
          {
            name: 'Tool Recommendations',
            description: 'Brief overview of suitable AI solutions',
            included: true
          }
        ]
      },
      bookingSettings: {
        provider: 'calendly',
        calendlyUsername: 'flow-masters',
        calendlyEventType: 'express-consulting',
        hideEventTypeDetails: true,
        hideGdprBanner: true,
        enableAdditionalInfo: false,
        additionalInfoFields: [],
        additionalInfoRequired: false
      },
      paymentSettings: {
        paymentType: 'full_prepayment',
        prepaymentPercentage: 100
      },
      meta: {
        title: {
          ru: 'Экспресс-консультация по ИИ | Быстрая оценка потенциала автоматизации',
          en: 'Express AI Consultation | Quick Automation Potential Assessment'
        },
        description: {
          ru: 'Быстрая 30-минутная консультация по возможностям ИИ. Выявление приоритетных точек автоматизации, предварительная оценка ROI, рекомендации по инструментам.',
          en: 'Quick 30-minute AI consultation. Identifying priority automation points, preliminary ROI assessment, tool recommendations.'
        }
      }
    },
    {
      title: {
        ru: 'Стандартная консультация по ИИ',
        en: 'Standard AI Consultation'
      },
      serviceType: 'consultation',
      description: {
        ru: {
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
                    text: 'Комплексная консультация с глубоким анализом бизнес-процессов, детальным планом внедрения ИИ и точными расчетами эффективности.'
                  }
                ]
              }
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1
          }
        },
        en: {
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
                    text: 'Comprehensive consultation with deep business process analysis, detailed AI implementation plan and accurate efficiency calculations.'
                  }
                ]
              }
            ],
            direction: null,
            format: '',
            indent: 0,
            version: 1
          }
        }
      },
      shortDescription: {
        ru: 'Углубленный 90-минутный анализ с детальным планом внедрения и ROI-расчетами',
        en: 'In-depth 90-minute analysis with detailed implementation plan and ROI calculations'
      },
      price: {
        ru: 8000,
        en: 89
      },
      isPriceStartingFrom: false,
      duration: 90,
      status: 'published',
      slug: 'standard-ai-consultation',
      requiresBooking: true,
      requiresPayment: true,
      features: {
        ru: [
          {
            name: 'Глубокий анализ процессов',
            description: 'Детальное изучение всех бизнес-процессов компании',
            included: true
          },
          {
            name: 'План внедрения ИИ',
            description: 'Пошаговый план реализации с временными рамками',
            included: true
          },
          {
            name: 'ROI-расчеты',
            description: 'Точные расчеты окупаемости инвестиций',
            included: true
          },
          {
            name: 'Техническое задание',
            description: 'Готовое ТЗ для разработчиков',
            included: true
          }
        ],
        en: [
          {
            name: 'Deep Process Analysis',
            description: 'Detailed study of all company business processes',
            included: true
          },
          {
            name: 'AI Implementation Plan',
            description: 'Step-by-step implementation plan with timelines',
            included: true
          },
          {
            name: 'ROI Calculations',
            description: 'Accurate return on investment calculations',
            included: true
          },
          {
            name: 'Technical Specification',
            description: 'Ready technical specification for developers',
            included: true
          }
        ]
      },
      bookingSettings: {
        provider: 'calendly',
        calendlyUsername: 'flow-masters',
        calendlyEventType: 'standard-consulting',
        hideEventTypeDetails: true,
        hideGdprBanner: true,
        enableAdditionalInfo: true,
        additionalInfoFields: [
          {
            fieldName: 'company_size',
            fieldLabel: {
              ru: 'Размер компании',
              en: 'Company Size'
            },
            fieldType: 'select',
            required: true,
            options: [
              {
                label: {
                  ru: '1-10 сотрудников',
                  en: '1-10 employees'
                },
                value: 'small'
              },
              {
                label: {
                  ru: '11-50 сотрудников',
                  en: '11-50 employees'
                },
                value: 'medium'
              },
              {
                label: {
                  ru: '51+ сотрудников',
                  en: '51+ employees'
                },
                value: 'large'
              }
            ]
          }
        ],
        additionalInfoRequired: true
      },
      paymentSettings: {
        paymentType: 'full_prepayment',
        prepaymentPercentage: 100
      },
      meta: {
        title: {
          ru: 'Стандартная консультация по ИИ | Детальный план внедрения',
          en: 'Standard AI Consultation | Detailed Implementation Plan'
        },
        description: {
          ru: 'Углубленная 90-минутная консультация с детальным планом внедрения ИИ, ROI-расчетами и готовым техническим заданием.',
          en: 'In-depth 90-minute consultation with detailed AI implementation plan, ROI calculations and ready technical specification.'
        }
      }
    }
  ]

  // Создаем услуги
  for (const serviceData of services) {
    try {
      const service = await payload.create({
        collection: 'services',
        data: serviceData,
      })
      console.log(`Created service: ${service.title.ru}`)
    } catch (error) {
      console.error(`Error creating service ${serviceData.title.ru}:`, error)
    }
  }

  console.log('All services created successfully!')
  process.exit(0)
}

start().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
