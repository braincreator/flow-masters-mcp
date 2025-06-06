// Скрипт для создания тестовой услуги
import payload from 'payload'
import dotenv from 'dotenv'
import config from './src/payload.config.js'
dotenv.config()

async function createTestService() {
  try {
    // Инициализируем Payload
    await payload.init({
      config,
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/flow-masters',
      local: true,
    })

    console.log('Payload инициализирован')

    // Создаем тестовую услугу
    const testService = await payload.create({
      collection: 'services',
      data: {
        title: {
          ru: 'Тестовая консультация по ИИ',
          en: 'Test AI Consultation',
        },
        serviceType: 'consultation',
        description: {
          ru: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Это тестовая услуга для проверки работы системы.',
                    },
                  ],
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          },
          en: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'This is a test service to check system functionality.',
                    },
                  ],
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        shortDescription: {
          ru: 'Тестовая консультация для проверки системы',
          en: 'Test consultation to check the system',
        },
        price: {
          ru: 5000,
          en: 100,
        },
        isPriceStartingFrom: true,
        duration: 60,
        requiresBooking: true,
        requiresPayment: true,
        status: 'published',
      },
    })

    console.log('Тестовая услуга создана:', testService.id)

    // Проверяем, что услуга создалась
    const services = await payload.find({
      collection: 'services',
      limit: 10,
    })

    console.log(`Всего услуг в базе: ${services.totalDocs}`)
    console.log(
      'Услуги:',
      services.docs.map((s) => ({ id: s.id, title: s.title })),
    )

    process.exit(0)
  } catch (error) {
    console.error('Ошибка:', error)
    process.exit(1)
  }
}

createTestService()
