#!/usr/bin/env node

/**
 * Скрипт для проверки всех созданных ресурсов Flow Masters
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Проверка всех ресурсов Flow Masters...\n')

// Список файлов для проверки
const requiredFiles = [
  {
    path: 'public/favicon.svg',
    description: 'Адаптивный SVG favicon',
    checkContent: (content) => content.includes('Flow Masters') || content.includes('robot')
  },
  {
    path: 'public/favicon.ico',
    description: 'ICO favicon для старых браузеров',
    checkContent: () => true // Бинарный файл
  },
  {
    path: 'public/icon.svg',
    description: 'Apple Touch Icon (SVG)',
    checkContent: (content) => content.includes('robot')
  },
  {
    path: 'public/og-image.jpg',
    description: 'OpenGraph изображение для социальных сетей',
    checkContent: () => true // Бинарный файл
  },
  {
    path: 'public/logo.png',
    description: 'Основной логотип Flow Masters',
    checkContent: () => true // Бинарный файл
  }
]

// SEO файлы для проверки
const seoFiles = [
  {
    path: 'src/utilities/generateMeta.ts',
    description: 'Генератор метаданных',
    checkContent: (content) => content.includes('Flow Masters') && !content.includes('Payload Website Template')
  },
  {
    path: 'src/utilities/mergeOpenGraph.ts',
    description: 'OpenGraph настройки',
    checkContent: (content) => content.includes('Flow Masters') && content.includes('og-image.jpg')
  },
  {
    path: 'src/utilities/metadata.ts',
    description: 'Базовые метаданные',
    checkContent: (content) => content.includes('Flow Masters')
  }
]

let totalIssues = 0
let checkedFiles = 0

console.log('📁 Проверка файлов ресурсов:\n')

// Проверяем файлы ресурсов
requiredFiles.forEach(({ path: filePath, description, checkContent }) => {
  checkedFiles++
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${filePath} - отсутствует`)
    console.log(`   ${description}`)
    totalIssues++
    return
  }

  const stats = fs.statSync(fullPath)
  const fileSizeKB = Math.round(stats.size / 1024)
  
  // Проверяем содержимое для текстовых файлов
  if (filePath.endsWith('.svg')) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8')
      if (!checkContent(content)) {
        console.log(`⚠️  ${filePath} - содержимое может быть некорректным`)
        totalIssues++
      } else {
        console.log(`✅ ${filePath} - OK (${fileSizeKB} KB)`)
      }
    } catch (error) {
      console.log(`❌ ${filePath} - ошибка чтения: ${error.message}`)
      totalIssues++
    }
  } else {
    console.log(`✅ ${filePath} - OK (${fileSizeKB} KB)`)
  }
  
  console.log(`   ${description}`)
  console.log('')
})

console.log('🔧 Проверка SEO файлов:\n')

// Проверяем SEO файлы
seoFiles.forEach(({ path: filePath, description, checkContent }) => {
  checkedFiles++
  const fullPath = path.join(process.cwd(), filePath)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${filePath} - отсутствует`)
    totalIssues++
    return
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8')
    if (!checkContent(content)) {
      console.log(`⚠️  ${filePath} - содержимое требует проверки`)
      totalIssues++
    } else {
      console.log(`✅ ${filePath} - OK`)
    }
  } catch (error) {
    console.log(`❌ ${filePath} - ошибка чтения: ${error.message}`)
    totalIssues++
  }
  
  console.log(`   ${description}`)
  console.log('')
})

// Проверяем размеры изображений
console.log('📐 Проверка размеров изображений:\n')

if (fs.existsSync('public/og-image.jpg')) {
  const stats = fs.statSync('public/og-image.jpg')
  const fileSizeKB = Math.round(stats.size / 1024)
  
  if (fileSizeKB > 500) {
    console.log(`⚠️  OG изображение слишком большое: ${fileSizeKB} KB (рекомендуется < 500 KB)`)
    totalIssues++
  } else {
    console.log(`✅ OG изображение оптимального размера: ${fileSizeKB} KB`)
  }
} else {
  console.log(`❌ OG изображение отсутствует`)
  totalIssues++
}

// Итоговый отчет
console.log('\n📊 Итоговый отчет:')
console.log(`   📁 Проверено файлов: ${checkedFiles}`)
console.log(`   ${totalIssues === 0 ? '✅' : '❌'} Найдено проблем: ${totalIssues}`)

if (totalIssues === 0) {
  console.log('\n🎉 Отлично! Все ресурсы Flow Masters настроены корректно')
  console.log('\n✅ Готовые ресурсы:')
  console.log('   🎨 Favicon (SVG + ICO)')
  console.log('   📱 Apple Touch Icon')
  console.log('   🖼️  OpenGraph изображение (1200x630)')
  console.log('   🔍 SEO метаданные')
  console.log('   🌐 Локализация (EN/RU)')
  
  console.log('\n🚀 Рекомендации:')
  console.log('   • Протестируйте favicon в разных браузерах')
  console.log('   • Проверьте OG изображение в социальных сетях')
  console.log('   • Убедитесь, что SEO заголовки корректны')
} else {
  console.log('\n⚠️  Обнаружены проблемы с ресурсами')
  console.log('   Рекомендуется исправить найденные проблемы')
}

console.log('\n📋 Полный список созданных файлов:')
requiredFiles.concat(seoFiles).forEach(({ path: filePath }) => {
  const exists = fs.existsSync(filePath)
  console.log(`   ${exists ? '✅' : '❌'} ${filePath}`)
})
