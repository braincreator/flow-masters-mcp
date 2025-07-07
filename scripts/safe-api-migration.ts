#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

/**
 * Безопасная миграция API routes: удаление префикса v1
 *
 * Этот скрипт выполняет поэтапную миграцию API routes из /api/v1/ в /api/
 * с сохранением обратной совместимости и возможностью отката
 */

// Конфигурация
const CONFIG = {
  API_DIR: path.resolve(process.cwd(), 'src/app/api'),
  API_V1_DIR: path.resolve(process.cwd(), 'src/app/api/v1'),
  BACKUP_DIR: path.resolve(process.cwd(), '.migration-backup'),
  EXCLUDED_DIRS: [
    'v1',
    'admin',
    '.DS_Store',
    'webhooks', // Уже существует в корне
    'health', // Уже существует в корне
    'revalidate-sitemap', // Уже существует в корне
  ],
  DRY_RUN: process.argv.includes('--dry-run'),
  FORCE: process.argv.includes('--force'),
  ROLLBACK: process.argv.includes('--rollback'),
}

// Утилиты для логирования
const log = {
  info: (msg: string) => console.log(`ℹ️  ${msg}`),
  success: (msg: string) => console.log(`✅ ${msg}`),
  warning: (msg: string) => console.log(`⚠️  ${msg}`),
  error: (msg: string) => console.log(`❌ ${msg}`),
  step: (msg: string) => console.log(`\n🔄 ${msg}`),
}

// Проверка существования директорий
function checkDirectories(): boolean {
  if (!fs.existsSync(CONFIG.API_DIR)) {
    log.error('API директория не найдена')
    return false
  }

  if (!fs.existsSync(CONFIG.API_V1_DIR)) {
    log.error('API v1 директория не найдена')
    return false
  }

  return true
}

// Создание резервной копии
function createBackup(): void {
  log.step('Создание резервной копии...')

  if (fs.existsSync(CONFIG.BACKUP_DIR)) {
    if (!CONFIG.FORCE) {
      log.error('Резервная копия уже существует. Используйте --force для перезаписи')
      process.exit(1)
    }
    fs.rmSync(CONFIG.BACKUP_DIR, { recursive: true })
  }

  fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true })

  // Копируем текущее состояние API
  fs.cpSync(CONFIG.API_DIR, path.join(CONFIG.BACKUP_DIR, 'api'), { recursive: true })

  log.success('Резервная копия создана')
}

// Восстановление из резервной копии
function rollback(): void {
  log.step('Восстановление из резервной копии...')

  if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
    log.error('Резервная копия не найдена')
    process.exit(1)
  }

  // Удаляем текущую API директорию
  fs.rmSync(CONFIG.API_DIR, { recursive: true })

  // Восстанавливаем из бэкапа
  fs.cpSync(path.join(CONFIG.BACKUP_DIR, 'api'), CONFIG.API_DIR, { recursive: true })

  log.success('Восстановление завершено')
}

// Получение списка директорий для миграции
function getDirectoriesToMigrate(): string[] {
  const v1Dirs = fs
    .readdirSync(CONFIG.API_V1_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !CONFIG.EXCLUDED_DIRS.includes(name))

  return v1Dirs
}

// Проверка конфликтов
function checkConflicts(dirs: string[]): { conflicts: string[]; safe: string[] } {
  const conflicts: string[] = []
  const safe: string[] = []

  for (const dir of dirs) {
    const targetPath = path.join(CONFIG.API_DIR, dir)
    if (fs.existsSync(targetPath)) {
      conflicts.push(dir)
    } else {
      safe.push(dir)
    }
  }

  return { conflicts, safe }
}

// Копирование директории
function copyDirectory(dirName: string): void {
  const sourcePath = path.join(CONFIG.API_V1_DIR, dirName)
  const targetPath = path.join(CONFIG.API_DIR, dirName)

  if (CONFIG.DRY_RUN) {
    log.info(`[DRY RUN] Копирование ${dirName}: ${sourcePath} -> ${targetPath}`)
    return
  }

  try {
    fs.cpSync(sourcePath, targetPath, { recursive: true })
    log.success(`Скопирован ${dirName}`)
  } catch (error) {
    log.error(`Ошибка при копировании ${dirName}: ${error}`)
    throw error
  }
}

// Создание редиректа для старого пути
function createRedirect(dirName: string): void {
  const redirectPath = path.join(CONFIG.API_V1_DIR, dirName, 'route.ts')

  if (CONFIG.DRY_RUN) {
    log.info(`[DRY RUN] Создание редиректа для ${dirName}`)
    return
  }

  const redirectContent = `import { NextRequest, NextResponse } from 'next/server'

/**
 * Автоматически созданный редирект для миграции API
 * Перенаправляет запросы с /api/v1/${dirName} на /api/${dirName}
 */

function createRedirect(request: NextRequest) {
  const url = new URL(request.url)
  const newPath = url.pathname.replace('/api/v1/${dirName}', '/api/${dirName}')
  const newUrl = \`\${url.origin}\${newPath}\${url.search}\`
  
  return NextResponse.redirect(newUrl, 301) // Permanent redirect
}

export const GET = createRedirect
export const POST = createRedirect
export const PUT = createRedirect
export const DELETE = createRedirect
export const PATCH = createRedirect
export const OPTIONS = createRedirect
`

  try {
    fs.writeFileSync(redirectPath, redirectContent)
    log.success(`Создан редирект для ${dirName}`)
  } catch (error) {
    log.error(`Ошибка при создании редиректа для ${dirName}: ${error}`)
  }
}

// Основная функция миграции
function migrate(): void {
  log.step('Начало миграции API routes...')

  if (!checkDirectories()) {
    process.exit(1)
  }

  const dirsToMigrate = getDirectoriesToMigrate()
  log.info(`Найдено директорий для миграции: ${dirsToMigrate.length}`)

  const { conflicts, safe } = checkConflicts(dirsToMigrate)

  if (conflicts.length > 0) {
    log.warning(`Обнаружены конфликты (уже существуют в /api/): ${conflicts.join(', ')}`)
    if (!CONFIG.FORCE && !CONFIG.DRY_RUN) {
      log.error('Используйте --force для принудительной перезаписи')
      process.exit(1)
    }
  }

  if (safe.length > 0) {
    log.info(`Безопасные для миграции: ${safe.join(', ')}`)
  }

  if (!CONFIG.DRY_RUN) {
    createBackup()
  }

  // Копируем безопасные директории
  for (const dir of safe) {
    copyDirectory(dir)
    createRedirect(dir)
  }

  // Копируем конфликтующие директории (если --force)
  if (CONFIG.FORCE) {
    for (const dir of conflicts) {
      log.warning(`Перезаписываем существующую директорию: ${dir}`)
      copyDirectory(dir)
      createRedirect(dir)
    }
  }

  log.success('Миграция завершена!')
  log.info('Следующие шаги:')
  log.info('1. Обновите конфигурацию API путей')
  log.info('2. Протестируйте все endpoints')
  log.info('3. Обновите frontend код')
  log.info('4. Для отката используйте: npm run migrate:api -- --rollback')
}

// Главная функция
function main(): void {
  console.log('🚀 Безопасная миграция API routes\n')

  if (CONFIG.ROLLBACK) {
    rollback()
    return
  }

  if (CONFIG.DRY_RUN) {
    log.info('Режим DRY RUN - изменения не будут применены')
  }

  migrate()
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { migrate, rollback, checkDirectories }
