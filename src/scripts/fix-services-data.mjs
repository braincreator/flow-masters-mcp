#!/usr/bin/env node

/**
 * Скрипт для исправления данных в коллекции services
 * Исправляет проблемы с статусами и версиями
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function fixServicesData() {
  console.log('🔧 Исправление данных в коллекции services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    let fixedCount = 0
    let errorCount = 0

    // 1. Находим все записи без статуса или с некорректным статусом
    console.log('🔍 1. Поиск записей с проблемами статуса...')

    const problematicServices = await payload.find({
      collection: 'services',
      where: {
        or: [
          {
            status: {
              exists: false,
            },
          },
          {
            status: {
              not_in: ['published', 'draft', 'archived'],
            },
          },
        ],
      },
      limit: 100,
    })

    console.log(`   Найдено ${problematicServices.totalDocs} записей с проблемами статуса`)

    // 2. Исправляем записи без статуса
    for (const service of problematicServices.docs) {
      try {
        console.log(`   Исправляем запись: ${service.title} (ID: ${service.id})`)

        // Устанавливаем статус 'published' для записей без статуса
        const updateData = {
          status: 'published',
        }

        // Если нет publishedAt, устанавливаем текущую дату
        if (!service.publishedAt) {
          updateData.publishedAt = new Date().toISOString()
        }

        await payload.update({
          collection: 'services',
          id: service.id,
          data: updateData,
        })

        fixedCount++
        console.log(`   ✅ Исправлено: ${service.title}`)
      } catch (error) {
        errorCount++
        console.log(`   ❌ Ошибка при исправлении ${service.title}: ${error.message}`)
      }
    }

    // 3. Проверяем и исправляем записи с некорректными локализованными полями
    console.log('\n🌐 2. Проверка локализованных полей...')

    const allServices = await payload.find({
      collection: 'services',
      limit: 100,
    })

    for (const service of allServices.docs) {
      try {
        let needsUpdate = false
        const updateData = {}

        // Проверяем title
        if (typeof service.title === 'string') {
          // Если title - строка, а должен быть объект с локалями
          updateData.title = {
            en: service.title,
            ru: service.title,
          }
          needsUpdate = true
        }

        // Проверяем price
        if (typeof service.price === 'number') {
          // Если price - число, а должен быть объект с локалями
          updateData.price = {
            en: service.price,
            ru: service.price,
          }
          needsUpdate = true
        }

        if (needsUpdate) {
          console.log(`   Обновляем локализацию для: ${service.title}`)

          await payload.update({
            collection: 'services',
            id: service.id,
            data: updateData,
          })

          fixedCount++
          console.log(`   ✅ Локализация обновлена: ${service.title}`)
        }
      } catch (error) {
        errorCount++
        console.log(`   ❌ Ошибка при обновлении локализации ${service.title}: ${error.message}`)
      }
    }

    // 4. Создаем недостающие slug'и
    console.log("\n🔗 3. Проверка и создание slug'ов...")

    const servicesWithoutSlug = await payload.find({
      collection: 'services',
      where: {
        slug: {
          exists: false,
        },
      },
      limit: 100,
    })

    for (const service of servicesWithoutSlug.docs) {
      try {
        const title =
          typeof service.title === 'object' ? service.title.en || service.title.ru : service.title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')

        console.log(`   Создаем slug для: ${title} -> ${slug}`)

        await payload.update({
          collection: 'services',
          id: service.id,
          data: {
            slug: slug,
          },
        })

        fixedCount++
        console.log(`   ✅ Slug создан: ${slug}`)
      } catch (error) {
        errorCount++
        console.log(`   ❌ Ошибка при создании slug для ${service.title}: ${error.message}`)
      }
    }

    // 5. Итоговая статистика
    console.log('\n📊 Итоговая статистика:')
    console.log(`   ✅ Исправлено записей: ${fixedCount}`)
    console.log(`   ❌ Ошибок: ${errorCount}`)

    // 6. Проверяем результат
    console.log('\n🔍 Проверка результата...')

    const finalCheck = await payload.find({
      collection: 'services',
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 5,
    })

    console.log(`   Опубликованных записей: ${finalCheck.totalDocs}`)
    finalCheck.docs.forEach((service, index) => {
      console.log(
        `   ${index + 1}. ${service.title} (Status: ${service.status}, Slug: ${service.slug})`,
      )
    })

    console.log('\n✅ Исправление данных завершено!')
  } catch (error) {
    console.error('❌ Ошибка при исправлении данных:', error)
    process.exit(1)
  }
}

// Запускаем исправление
fixServicesData()
  .then(() => {
    console.log('\n🎉 Исправление данных успешно завершено')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
