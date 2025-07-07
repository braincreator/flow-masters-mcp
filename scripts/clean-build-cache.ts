#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

/**
 * Скрипт для очистки всех кэшей сборки после миграции API
 * 
 * Очищает TypeScript, Next.js и другие кэши, которые могут содержать
 * ссылки на старые API пути
 */

// Конфигурация
const CONFIG = {
  PROJECT_ROOT: process.cwd(),
  CACHE_DIRS: [
    '.next',
    'node_modules/.cache',
    '.turbo',
  ],
  CACHE_FILES: [
    'tsconfig.tsbuildinfo',
    '.eslintcache',
  ],
  DRY_RUN: process.argv.includes('--dry-run'),
  VERBOSE: process.argv.includes('--verbose'),
}

// Утилиты для логирования
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  verbose: (msg: string) => CONFIG.VERBOSE && console.log(`🔍 ${msg}`),
}

// Функция для получения размера директории
function getDirectorySize(dirPath: string): number {
  let totalSize = 0
  
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name)
      
      if (item.isDirectory()) {
        totalSize += getDirectorySize(itemPath)
      } else if (item.isFile()) {
        const stats = fs.statSync(itemPath)
        totalSize += stats.size
      }
    }
  } catch (error) {
    // Игнорируем ошибки доступа
  }
  
  return totalSize
}

// Функция для форматирования размера
function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// Удаление директории
function removeDirectory(dirPath: string): boolean {
  const fullPath = path.resolve(CONFIG.PROJECT_ROOT, dirPath)
  
  if (!fs.existsSync(fullPath)) {
    log.verbose(`Директория не существует: ${dirPath}`)
    return false
  }
  
  const size = getDirectorySize(fullPath)
  
  if (CONFIG.DRY_RUN) {
    log.info(`[DRY RUN] Удаление директории: ${dirPath} (${formatSize(size)})`)
    return true
  }
  
  try {
    fs.rmSync(fullPath, { recursive: true, force: true })
    log.success(`Удалена директория: ${dirPath} (${formatSize(size)})`)
    return true
  } catch (error) {
    log.error(`Ошибка при удалении директории ${dirPath}: ${error}`)
    return false
  }
}

// Удаление файла
function removeFile(filePath: string): boolean {
  const fullPath = path.resolve(CONFIG.PROJECT_ROOT, filePath)
  
  if (!fs.existsSync(fullPath)) {
    log.verbose(`Файл не существует: ${filePath}`)
    return false
  }
  
  const stats = fs.statSync(fullPath)
  const size = stats.size
  
  if (CONFIG.DRY_RUN) {
    log.info(`[DRY RUN] Удаление файла: ${filePath} (${formatSize(size)})`)
    return true
  }
  
  try {
    fs.unlinkSync(fullPath)
    log.success(`Удален файл: ${filePath} (${formatSize(size)})`)
    return true
  } catch (error) {
    log.error(`Ошибка при удалении файла ${filePath}: ${error}`)
    return false
  }
}

// Поиск дополнительных кэш-файлов
function findAdditionalCacheFiles(): string[] {
  const additionalFiles: string[] = []
  
  try {
    // Поиск файлов с расширениями кэша
    const cacheExtensions = ['.cache', '.tmp', '.temp']
    const items = fs.readdirSync(CONFIG.PROJECT_ROOT, { withFileTypes: true })
    
    for (const item of items) {
      if (item.isFile()) {
        const ext = path.extname(item.name)
        if (cacheExtensions.includes(ext)) {
          additionalFiles.push(item.name)
        }
      }
    }
  } catch (error) {
    log.verbose(`Ошибка при поиске дополнительных кэш-файлов: ${error}`)
  }
  
  return additionalFiles
}

// Основная функция очистки
function cleanBuildCache(): void {
  log.info('🧹 Начало очистки кэшей сборки...')
  
  if (CONFIG.DRY_RUN) {
    log.info('Режим DRY RUN - изменения не будут применены')
  }
  
  let totalCleaned = 0
  let totalSize = 0
  
  // Очистка директорий кэша
  log.info('\n📁 Очистка директорий кэша:')
  for (const dir of CONFIG.CACHE_DIRS) {
    const fullPath = path.resolve(CONFIG.PROJECT_ROOT, dir)
    if (fs.existsSync(fullPath)) {
      const size = getDirectorySize(fullPath)
      totalSize += size
      
      if (removeDirectory(dir)) {
        totalCleaned++
      }
    } else {
      log.verbose(`Директория не найдена: ${dir}`)
    }
  }
  
  // Очистка файлов кэша
  log.info('\n📄 Очистка файлов кэша:')
  for (const file of CONFIG.CACHE_FILES) {
    const fullPath = path.resolve(CONFIG.PROJECT_ROOT, file)
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      totalSize += stats.size
      
      if (removeFile(file)) {
        totalCleaned++
      }
    } else {
      log.verbose(`Файл не найден: ${file}`)
    }
  }
  
  // Поиск и очистка дополнительных кэш-файлов
  const additionalFiles = findAdditionalCacheFiles()
  if (additionalFiles.length > 0) {
    log.info('\n🔍 Дополнительные кэш-файлы:')
    for (const file of additionalFiles) {
      const fullPath = path.resolve(CONFIG.PROJECT_ROOT, file)
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        totalSize += stats.size
        
        if (removeFile(file)) {
          totalCleaned++
        }
      }
    }
  }
  
  // Итоговая статистика
  log.info('\n📊 Результаты очистки:')
  log.success(`Очищено элементов: ${totalCleaned}`)
  log.success(`Освобождено места: ${formatSize(totalSize)}`)
  
  if (!CONFIG.DRY_RUN) {
    log.info('\n🔄 Рекомендуемые следующие шаги:')
    log.info('1. Перезапустите сервер разработки')
    log.info('2. Выполните полную пересборку: npm run build')
    log.info('3. Протестируйте API endpoints: npm run test:api')
  }
}

// Функция для проверки, что мы в правильной директории
function validateProjectRoot(): boolean {
  const packageJsonPath = path.resolve(CONFIG.PROJECT_ROOT, 'package.json')
  const nextConfigPath = path.resolve(CONFIG.PROJECT_ROOT, 'next.config.mjs')
  
  if (!fs.existsSync(packageJsonPath) || !fs.existsSync(nextConfigPath)) {
    log.error('Не найдены файлы package.json или next.config.mjs')
    log.error('Убедитесь, что вы находитесь в корневой директории проекта')
    return false
  }
  
  return true
}

// Главная функция
function main(): void {
  console.log('🧹 Очистка кэшей сборки после миграции API\n')
  
  if (!validateProjectRoot()) {
    process.exit(1)
  }
  
  cleanBuildCache()
  
  if (CONFIG.DRY_RUN) {
    log.info('\nДля выполнения реальной очистки запустите без флага --dry-run')
  } else {
    log.success('\n✅ Очистка кэшей завершена!')
  }
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { cleanBuildCache, removeDirectory, removeFile }