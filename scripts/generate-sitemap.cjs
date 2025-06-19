#!/usr/bin/env node

/**
 * Скрипт для генерации sitemap
 * Автоматически запускается после сборки проекта
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🗺️  Генерация sitemap...')

try {
  // Проверяем, что проект собран
  const buildDir = path.join(process.cwd(), '.next')
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Ошибка: Проект не собран. Запустите сначала "npm run build"')
    process.exit(1)
  }

  // Проверяем наличие конфигурации sitemap
  const configPath = path.join(process.cwd(), 'next-sitemap.config.cjs')
  if (!fs.existsSync(configPath)) {
    console.error('❌ Ошибка: Файл next-sitemap.config.cjs не найден')
    process.exit(1)
  }

  // Генерируем sitemap
  console.log('📄 Генерация sitemap файлов...')
  
  try {
    // Пытаемся использовать локальную установку next-sitemap
    execSync('npx next-sitemap --config next-sitemap.config.cjs', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
  } catch (error) {
    console.error('❌ Ошибка при генерации sitemap:', error.message)
    
    // Если next-sitemap не найден, пытаемся установить и запустить
    console.log('📦 Попытка установки next-sitemap...')
    try {
      execSync('npm install next-sitemap --save-dev', { stdio: 'inherit' })
      execSync('npx next-sitemap --config next-sitemap.config.cjs', { stdio: 'inherit' })
    } catch (installError) {
      console.error('❌ Не удалось установить или запустить next-sitemap:', installError.message)
      process.exit(1)
    }
  }

  // Проверяем, что файлы созданы
  const publicDir = path.join(process.cwd(), 'public')
  const sitemapFiles = [
    'sitemap.xml',
    'robots.txt'
  ]

  let allFilesExist = true
  sitemapFiles.forEach(file => {
    const filePath = path.join(publicDir, file)
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} создан успешно`)
    } else {
      console.log(`⚠️  ${file} не найден`)
      allFilesExist = false
    }
  })

  if (allFilesExist) {
    console.log('🎉 Sitemap успешно сгенерирован!')
    
    // Показываем информацию о созданных файлах
    const sitemapPath = path.join(publicDir, 'sitemap.xml')
    if (fs.existsSync(sitemapPath)) {
      const stats = fs.statSync(sitemapPath)
      console.log(`📊 Размер sitemap.xml: ${(stats.size / 1024).toFixed(2)} KB`)
    }
  } else {
    console.log('⚠️  Некоторые файлы sitemap не были созданы')
  }

  // Выводим URL для проверки
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  console.log('\n🔗 URL для проверки:')
  console.log(`   Sitemap: ${baseUrl}/sitemap.xml`)
  console.log(`   Robots:  ${baseUrl}/robots.txt`)
  console.log(`   Pages:   ${baseUrl}/pages-sitemap.xml`)
  console.log(`   Posts:   ${baseUrl}/posts-sitemap.xml`)
  console.log(`   Services: ${baseUrl}/services-sitemap.xml`)

} catch (error) {
  console.error('❌ Критическая ошибка при генерации sitemap:', error.message)
  process.exit(1)
}
