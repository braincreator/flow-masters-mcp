#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

/**
 * Скрипт для добавления команд миграции в package.json
 */

const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json')

const MIGRATION_COMMANDS = {
  'migrate:api': 'tsx scripts/safe-api-migration.ts',
  'migrate:api:dry-run': 'tsx scripts/safe-api-migration.ts --dry-run',
  'migrate:api:force': 'tsx scripts/safe-api-migration.ts --force',
  'migrate:api:rollback': 'tsx scripts/safe-api-migration.ts --rollback',
  'test:api': 'tsx scripts/test-api-endpoints.ts',
  'test:api:verbose': 'tsx scripts/test-api-endpoints.ts --verbose',
  'test:api:legacy': 'tsx scripts/test-api-endpoints.ts --test-legacy',
  'test:api:errors': 'tsx scripts/test-api-endpoints.ts --only-errors',
}

function updatePackageJson(): void {
  try {
    // Читаем package.json
    const packageJsonContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8')
    const packageJson = JSON.parse(packageJsonContent)

    // Добавляем команды в scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    let addedCommands = 0
    for (const [command, script] of Object.entries(MIGRATION_COMMANDS)) {
      if (!packageJson.scripts[command]) {
        packageJson.scripts[command] = script
        addedCommands++
        console.log(`✅ Добавлена команда: ${command}`)
      } else {
        console.log(`⚠️  Команда уже существует: ${command}`)
      }
    }

    if (addedCommands > 0) {
      // Записываем обновленный package.json
      fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n')
      console.log(`\n✅ Добавлено ${addedCommands} новых команд в package.json`)
    } else {
      console.log('\n✅ Все команды уже существуют в package.json')
    }

    console.log('\n📋 Доступные команды для миграции API:')
    console.log('  npm run migrate:api:dry-run    - Предварительный просмотр миграции')
    console.log('  npm run migrate:api            - Выполнить миграцию')
    console.log('  npm run migrate:api:force      - Принудительная миграция')
    console.log('  npm run migrate:api:rollback   - Откат миграции')
    console.log('  npm run test:api               - Тестирование API endpoints')
    console.log('  npm run test:api:verbose       - Подробное тестирование')
    console.log('  npm run test:api:legacy        - Тестирование legacy путей')
    console.log('  npm run test:api:errors        - Показать только ошибки')
  } catch (error) {
    console.error('❌ Ошибка при обновлении package.json:', error)
    process.exit(1)
  }
}

// Запуск
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Настройка команд для миграции API...\n')
  updatePackageJson()
}

export { updatePackageJson }
