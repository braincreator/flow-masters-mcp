#!/usr/bin/env node

/**
 * Скрипт для исправления версий записей services
 * Создает версии для записей, которые были созданы напрямую в MongoDB
 */

import { getPayload } from 'payload'
import configPromise from '../../src/payload.config.ts'

async function fixServicesVersions() {
  console.log('🔧 Исправление версий записей services...\n')

  try {
    const payload = await getPayload({ config: configPromise })
    console.log('✅ Payload инициализирован\n')

    // 1. Получаем все записи services
    console.log('📋 1. Получение всех записей services:')
    const allServices = await payload.find({
      collection: 'services',
      limit: 100,
    })

    console.log(`   Найдено записей: ${allServices.totalDocs}`)

    let fixedCount = 0
    let errorCount = 0

    // 2. Проверяем и исправляем каждую запись
    for (const service of allServices.docs) {
      console.log(`\n📄 Обрабатываем: ${service.title} (ID: ${service.id})`)

      try {
        // Проверяем, есть ли версии у записи
        const versions = await payload.findVersions({
          collection: 'services',
          where: {
            parent: {
              equals: service.id,
            },
          },
          limit: 1,
        })

        if (versions.totalDocs === 0) {
          console.log(`   ⚠️  Нет версий - создаем версию`)

          // Создаем правильную структуру для richText поля description
          let description = service.description
          if (!description || typeof description === 'string') {
            // Если description отсутствует или является строкой, создаем правильную структуру
            description = {
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
                        text: service.shortDescription || service.title || 'Описание услуги',
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

          // Пересохраняем запись через Payload API, чтобы создать версию
          const updatedService = await payload.update({
            collection: 'services',
            id: service.id,
            data: {
              // Сохраняем все существующие данные
              title: service.title,
              serviceType: service.serviceType,
              description: description,
              shortDescription: service.shortDescription,
              price: service.price,
              isPriceStartingFrom: service.isPriceStartingFrom,
              duration: service.duration,
              thumbnail: service.thumbnail,
              features: service.features || [],
              gallery: service.gallery || [],
              requiresBooking: service.requiresBooking || false,
              bookingSettings: service.bookingSettings || {
                provider: 'calendly',
                hideEventTypeDetails: true,
                hideGdprBanner: true,
                enableAdditionalInfo: false,
                additionalInfoRequired: false,
                additionalInfoFields: [],
              },
              requiresPayment: service.requiresPayment !== false, // default true
              paymentSettings: service.paymentSettings || {
                paymentType: 'full_prepayment',
                prepaymentPercentage: 100,
              },
              status: service.status || 'published',
              publishedAt: service.publishedAt || new Date().toISOString(),
              meta: service.meta || {},
              slug: service.slug,
            },
          })

          console.log(`   ✅ Версия создана для: ${updatedService.title}`)
          fixedCount++
        } else {
          console.log(`   ✅ Версии уже есть (${versions.totalDocs})`)
        }
      } catch (error) {
        console.log(`   ❌ Ошибка при обработке: ${error.message}`)
        errorCount++
      }
    }

    // 3. Проверяем результат
    console.log('\n🔍 3. Проверка результата:')

    let totalWithVersions = 0
    let totalWithoutVersions = 0

    for (const service of allServices.docs) {
      try {
        const versions = await payload.findVersions({
          collection: 'services',
          where: {
            parent: {
              equals: service.id,
            },
          },
          limit: 1,
        })

        if (versions.totalDocs > 0) {
          totalWithVersions++
        } else {
          totalWithoutVersions++
        }
      } catch (error) {
        totalWithoutVersions++
      }
    }

    console.log(`   Записей с версиями: ${totalWithVersions}`)
    console.log(`   Записей без версий: ${totalWithoutVersions}`)

    // 4. Тестируем админ панель API
    console.log('\n🌐 4. Тестирование админ панели API:')

    try {
      const adminResponse = await payload.find({
        collection: 'services',
        limit: 100,
      })

      console.log(`   Обычный запрос: ${adminResponse.totalDocs} записей`)

      const adminDraftResponse = await payload.find({
        collection: 'services',
        draft: true,
        limit: 100,
      })

      console.log(`   С черновиками: ${adminDraftResponse.totalDocs} записей`)
    } catch (error) {
      console.log(`   ❌ Ошибка API: ${error.message}`)
    }

    // 5. Итоговая статистика
    console.log('\n📊 5. Итоговая статистика:')
    console.log(`   Исправлено записей: ${fixedCount}`)
    console.log(`   Ошибок: ${errorCount}`)
    console.log(`   Всего записей: ${allServices.totalDocs}`)

    if (totalWithoutVersions === 0) {
      console.log('\n🎉 Все записи теперь имеют версии!')
      console.log('🌐 Проверьте админ панель: http://localhost:3000/admin/collections/services')
    } else {
      console.log('\n⚠️  Некоторые записи все еще без версий')
    }

    console.log('\n✅ Исправление завершено!')
  } catch (error) {
    console.error('❌ Ошибка при исправлении:', error)
    process.exit(1)
  }
}

// Запускаем исправление
fixServicesVersions()
  .then(() => {
    console.log('\n🎉 Исправление успешно завершено')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Критическая ошибка:', error)
    process.exit(1)
  })
