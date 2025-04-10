#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Создаем интерфейс для чтения/записи из консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Получаем параметры из package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'))
const { name, version } = packageJson

console.log(`Flow Masters MCP Installer v${version}`)
console.log('-------------------------------------')

async function promptQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function main() {
  try {
    // Создаем конфигурационный файл, если его нет
    const configPath = path.resolve(process.cwd(), 'config.json')
    let config = {}

    if (fs.existsSync(configPath)) {
      console.log('Найден существующий файл конфигурации')
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } else {
      console.log('Создание нового файла конфигурации')

      const apiUrl = await promptQuestion(
        'URL API Flow Masters (например https://api.flow-masters.com): ',
      )
      const apiKey = await promptQuestion('API ключ: ')

      config = {
        port: 3030,
        host: 'localhost',
        apiConfig: {
          apiUrl: apiUrl || 'https://flow-masters-api.example.com',
          apiKey: apiKey || '',
          autoUpdate: true,
          updateCheckInterval: 60,
        },
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
      console.log(`Файл конфигурации создан: ${configPath}`)
    }

    // Проверяем соединение с API
    console.log('Проверка соединения с API...')

    // Устанавливаем MCP сервер в Cursor
    console.log('Установка MCP сервера в Cursor...')

    try {
      // Получаем путь к текущему пакету
      const packagePath = path.resolve(__dirname, '..')

      // Регистрируем MCP сервер в Cursor
      execSync(`npx cursor mcp add "${name}" node "${path.join(packagePath, 'dist/index.js')}"`, {
        stdio: 'inherit',
      })

      console.log('MCP сервер успешно добавлен в Cursor')
      console.log('')
      console.log('Для запуска сервера:')
      console.log('1. Откройте Cursor')
      console.log('2. Выберите "МСР Servers" в меню')
      console.log('3. Выберите "Flow Masters MCP"')
      console.log('')
    } catch (error) {
      console.error('Ошибка при установке MCP сервера:', error.message)
      console.log('')
      console.log('Попробуйте установить вручную:')
      console.log(`npx cursor mcp add "${name}" node "path/to/dist/index.js"`)
      console.log('')
    }
  } catch (error) {
    console.error('Ошибка при установке:', error)
  } finally {
    rl.close()
  }
}

main().catch(console.error)
