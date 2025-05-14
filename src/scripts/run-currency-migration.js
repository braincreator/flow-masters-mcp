#!/usr/bin/env node
/**
 * Скрипт для запуска миграции валют
 */

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const readline = require('readline')

// Создаем интерфейс для чтения ввода пользователя
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Функция для запроса подтверждения от пользователя
function askForConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

// Основная функция
async function main() {
  console.log('\n\x1b[33m=== Миграция модели цен ===\x1b[0m')
  console.log('\nЭтот скрипт выполнит миграцию структуры цен в вашем проекте:')
  console.log('1. Заменит базовую цену в USD на локализованные цены для каждой локали')
  console.log('2. Удалит поля localizedPrices, которые больше не нужны')
  console.log('3. Обновит все компоненты для работы с новой моделью цен\n')

  console.log(
    '\x1b[31mВНИМАНИЕ: Рекомендуется сделать резервную копию базы данных перед миграцией!\x1b[0m\n',
  )

  const confirmed = await askForConfirmation('Вы уверены, что хотите продолжить? (y/n): ')

  if (!confirmed) {
    console.log('\nМиграция отменена.')
    rl.close()
    return
  }

  console.log('\n\x1b[36mЗапускаем миграцию...\x1b[0m\n')

  try {
    // Запускаем скрипт миграции
    execSync('npm run migrate:currency-model', { stdio: 'inherit' })

    console.log('\n\x1b[32mМиграция успешно завершена!\x1b[0m')
    console.log('\nТеперь вам нужно:')
    console.log('1. Проверить корректность цен в админ-панели')
    console.log('2. Убедиться, что все компоненты отображают цены правильно')
    console.log('3. Проверить работу платежной системы с новой моделью цен\n')
  } catch (error) {
    console.error('\n\x1b[31mОшибка при выполнении миграции:\x1b[0m', error.message)
    console.log('\nПроверьте логи для получения дополнительной информации.\n')
  }

  rl.close()
}

// Запускаем основную функцию
main().catch((error) => {
  console.error('Непредвиденная ошибка:', error)
  process.exit(1)
})
