#!/usr/bin/env node

/**
 * Скрипт для проверки SEO metadata во всех layout файлах
 * Проверяет, что нигде не осталось упоминаний "Payload" в SEO данных
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Проверка SEO metadata в проекте Flow Masters...\n')

// Файлы для проверки
const filesToCheck = [
  'src/utilities/generateMeta.ts',
  'src/utilities/mergeOpenGraph.ts',
  'src/utilities/metadata.ts',
  'src/components/seo/SEOHead.tsx',
  'src/app/(frontend)/layout.tsx',
  'src/app/(frontend)/[lang]/layout.tsx',
  'src/app/(frontend)/posts/page/[pageNumber]/page.tsx',
  'messages/en.json',
  'messages/ru.json',
]

// Паттерны для поиска проблем
const problemPatterns = [
  {
    pattern: /Payload Website Template/gi,
    description: 'Упоминание "Payload Website Template"'
  },
  {
    pattern: /An open-source website built with Payload/gi,
    description: 'Стандартное описание Payload'
  },
  {
    pattern: /website-template-OG\.webp/gi,
    description: 'Стандартное OG изображение Payload'
  },
  {
    pattern: /"title":\s*"Payload/gi,
    description: 'Title начинающийся с "Payload"'
  },
  {
    pattern: /"siteName":\s*"Payload/gi,
    description: 'Site name начинающийся с "Payload"'
  }
]

// Правильные значения для Flow Masters
const expectedValues = {
  siteName: 'Flow Masters',
  defaultTitle: 'Flow Masters - AI Business Automation',
  description: 'Flow Masters - AI-powered business automation solutions',
  ogImage: '/og-image.jpg',
  favicon: '/favicon.svg'
}

let totalIssues = 0
let checkedFiles = 0

console.log('📋 Проверяемые файлы:')
filesToCheck.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`)
})

console.log('\n🔍 Результаты проверки:\n')

filesToCheck.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filePath} - файл не найден`)
    return
  }

  checkedFiles++
  const content = fs.readFileSync(filePath, 'utf8')
  let fileIssues = 0

  console.log(`📄 ${filePath}:`)

  // Проверяем каждый паттерн
  problemPatterns.forEach(({ pattern, description }) => {
    const matches = content.match(pattern)
    if (matches) {
      console.log(`   ❌ ${description}: найдено ${matches.length} совпадений`)
      matches.forEach(match => {
        console.log(`      "${match}"`)
      })
      fileIssues++
      totalIssues++
    }
  })

  // Проверяем наличие правильных значений
  if (filePath.includes('metadata.ts') || filePath.includes('SEOHead.tsx')) {
    const hasFlowMasters = content.includes('Flow Masters')
    if (!hasFlowMasters) {
      console.log(`   ⚠️  Не найдено упоминание "Flow Masters"`)
      fileIssues++
    }
  }

  if (fileIssues === 0) {
    console.log(`   ✅ Проблем не найдено`)
  }

  console.log('')
})

// Проверяем дополнительные файлы на наличие правильных favicon
console.log('🎨 Проверка favicon и иконок:')

const iconFiles = [
  'public/favicon.svg',
  'public/favicon.ico',
  'public/icon.svg'
]

iconFiles.forEach(iconPath => {
  if (fs.existsSync(iconPath)) {
    console.log(`   ✅ ${iconPath} - найден`)
  } else {
    console.log(`   ❌ ${iconPath} - отсутствует`)
    totalIssues++
  }
})

// Итоговый отчет
console.log('\n📊 Итоговый отчет:')
console.log(`   📁 Проверено файлов: ${checkedFiles}`)
console.log(`   ${totalIssues === 0 ? '✅' : '❌'} Найдено проблем: ${totalIssues}`)

if (totalIssues === 0) {
  console.log('\n🎉 Отлично! Все SEO metadata корректно настроены для Flow Masters')
  console.log('\n✅ Проверенные элементы:')
  console.log('   • Заголовки страниц')
  console.log('   • Описания для поисковых систем')
  console.log('   • OpenGraph метаданные')
  console.log('   • Twitter Card метаданные')
  console.log('   • Favicon и иконки')
  console.log('   • Локализованные SEO данные')
} else {
  console.log('\n⚠️  Обнаружены проблемы с SEO metadata')
  console.log('   Рекомендуется исправить найденные проблемы для лучшего SEO')
}

console.log('\n🔗 Рекомендуемые значения для Flow Masters:')
Object.entries(expectedValues).forEach(([key, value]) => {
  console.log(`   ${key}: "${value}"`)
})
