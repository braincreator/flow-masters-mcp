#!/usr/bin/env node

/**
 * Скрипт для конвертации SVG OG изображения в JPG
 * Использует sharp для конвертации
 */

const fs = require('fs')
const path = require('path')

console.log('🖼️  Конвертация OG изображения из SVG в JPG...\n')

// Проверяем наличие sharp
let sharp
try {
  sharp = require('sharp')
} catch (error) {
  console.log('❌ Sharp не установлен. Устанавливаем...')
  const { execSync } = require('child_process')
  try {
    execSync('npm install sharp', { stdio: 'inherit' })
    sharp = require('sharp')
    console.log('✅ Sharp успешно установлен\n')
  } catch (installError) {
    console.error('❌ Не удалось установить sharp:', installError.message)
    console.log('\n💡 Попробуйте установить вручную: npm install sharp')
    process.exit(1)
  }
}

const svgPath = path.join(__dirname, '../public/og-image.svg')
const jpgPath = path.join(__dirname, '../public/og-image.jpg')

async function convertSvgToJpg() {
  try {
    // Проверяем существование SVG файла
    if (!fs.existsSync(svgPath)) {
      console.error('❌ SVG файл не найден:', svgPath)
      process.exit(1)
    }

    console.log('📄 Исходный файл:', svgPath)
    console.log('🎯 Целевой файл:', jpgPath)

    // Конвертируем SVG в JPG
    await sharp(svgPath)
      .resize(1200, 630) // OG Image стандартный размер
      .jpeg({
        quality: 90,
        progressive: true,
        mozjpeg: true
      })
      .toFile(jpgPath)

    // Проверяем результат
    const stats = fs.statSync(jpgPath)
    const fileSizeKB = Math.round(stats.size / 1024)

    console.log('✅ Конвертация завершена успешно!')
    console.log(`📊 Размер файла: ${fileSizeKB} KB`)
    console.log(`📐 Размеры: 1200x630 пикселей`)
    console.log(`🎨 Качество: 90%`)

    // Удаляем SVG файл после конвертации (оставляем только JPG)
    fs.unlinkSync(svgPath)
    console.log('🗑️  SVG файл удален (оставлен только JPG)')

    console.log('\n🎉 OG изображение готово для использования!')
    console.log('   Файл: /public/og-image.jpg')
    console.log('   Размер: 1200x630 (стандарт для социальных сетей)')

  } catch (error) {
    console.error('❌ Ошибка при конвертации:', error.message)
    process.exit(1)
  }
}

// Запускаем конвертацию
convertSvgToJpg()
