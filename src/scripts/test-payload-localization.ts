#!/usr/bin/env node

/**
 * Тест локализации Payload CMS напрямую (без API)
 */

import { getPayloadClient } from '../utilities/payload/index'

async function testPayloadLocalization() {
  try {
    console.log('🚀 Initializing Payload...')
    const payload = await getPayloadClient()
    console.log('✅ Payload initialized\n')

    // Тест 1: Получение планов с русской локалью
    console.log('📡 Test 1: Fetching plans with RU locale')
    const ruResult = await payload.find({
      collection: 'subscription-plans',
      locale: 'ru',
      where: { isActive: { equals: true } },
      limit: 3
    })
    
    console.log(`  Found ${ruResult.docs.length} RU plans`)
    if (ruResult.docs.length > 0) {
      const plan = ruResult.docs[0]
      console.log(`  First plan name: "${plan.name}"`)
      console.log(`  First plan description: "${plan.description}"`)
      console.log(`  Price: ${plan.price} ${plan.currency}`)
    }

    // Тест 2: Получение планов с английской локалью
    console.log('\n📡 Test 2: Fetching plans with EN locale')
    const enResult = await payload.find({
      collection: 'subscription-plans',
      locale: 'en',
      where: { isActive: { equals: true } },
      limit: 3
    })
    
    console.log(`  Found ${enResult.docs.length} EN plans`)
    if (enResult.docs.length > 0) {
      const plan = enResult.docs[0]
      console.log(`  First plan name: "${plan.name}"`)
      console.log(`  First plan description: "${plan.description}"`)
      console.log(`  Price: ${plan.price} ${plan.currency}`)
    }

    // Тест 3: Получение планов без указания локали (должно использовать default)
    console.log('\n📡 Test 3: Fetching plans without locale (should use default)')
    const defaultResult = await payload.find({
      collection: 'subscription-plans',
      where: { isActive: { equals: true } },
      limit: 3
    })
    
    console.log(`  Found ${defaultResult.docs.length} default plans`)
    if (defaultResult.docs.length > 0) {
      const plan = defaultResult.docs[0]
      console.log(`  First plan name: "${plan.name}"`)
      console.log(`  First plan description: "${plan.description}"`)
      console.log(`  Price: ${plan.price} ${plan.currency}`)
    }

    // Тест 4: Получение одного плана с разными локалями
    if (ruResult.docs.length > 0) {
      const planId = ruResult.docs[0].id
      console.log(`\n📡 Test 4: Fetching same plan (${planId}) with different locales`)
      
      const ruPlan = await payload.findByID({
        collection: 'subscription-plans',
        id: planId,
        locale: 'ru'
      })
      
      const enPlan = await payload.findByID({
        collection: 'subscription-plans',
        id: planId,
        locale: 'en'
      })
      
      console.log(`  RU version: "${ruPlan.name}"`)
      console.log(`  EN version: "${enPlan.name}"`)
      
      if (ruPlan.name === enPlan.name) {
        console.log(`  ⚠️  WARNING: Names are identical - localization may not be working!`)
      } else {
        console.log(`  ✅ Names are different - localization is working!`)
      }
    }

    console.log('\n🎉 Payload localization test completed!')
    process.exit(0)
    
  } catch (error) {
    console.error('💥 Error:', error)
    process.exit(1)
  }
}

testPayloadLocalization()
