import * as fs from 'fs'
import * as path from 'path'

// Базовые пути
const API_DIR = path.resolve(process.cwd(), 'src/app/api')
const API_V1_DIR = path.resolve(API_DIR, 'v1')

// Убедиться, что директория v1 существует
if (!fs.existsSync(API_V1_DIR)) {
  fs.mkdirSync(API_V1_DIR, { recursive: true })
  console.log('✅ Создана директория v1')
}

// Исключения - директории, которые не нужно перемещать или уже на месте
const EXCEPTIONS = ['v1', 'admin', '.DS_Store', 'revalidate', 'webhooks', 'docs']

// Получить все директории в api
const apiDirs = fs
  .readdirSync(API_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() && !EXCEPTIONS.includes(dirent.name))

console.log(`\n🚀 Начинаем миграцию API маршрутов в v1...\n`)
console.log(
  `Найдено ${apiDirs.length} директорий для миграции:\n${apiDirs.map((d) => '- ' + d.name).join('\n')}\n`,
)

apiDirs.forEach((dir) => {
  const srcDir = path.join(API_DIR, dir.name)
  const destDir = path.join(API_V1_DIR, dir.name)

  // Если директория уже существует в v1, скипаем
  if (fs.existsSync(destDir)) {
    console.log(`⚠️ ${dir.name} уже существует в v1, пропускаем`)
    return
  }

  // Создаем директорию если нужно
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // Копируем содержимое директории
  try {
    fs.cpSync(srcDir, destDir, { recursive: true })
    console.log(`✅ Скопирован ${dir.name} в v1/${dir.name}`)
  } catch (error) {
    console.error(`❌ Ошибка при копировании ${dir.name}:`, error)
    return
  }

  // Создаем редирект со старого пути на новый
  try {
    // Проверяем, есть ли route.ts в исходном каталоге
    const routeFiles = fs
      .readdirSync(srcDir)
      .filter((file) => file === 'route.ts' || file === 'route.js' || file === 'route.tsx')

    if (routeFiles.length > 0) {
      // Замена route.ts файла на редирект
      const redirectFile = path.join(srcDir, routeFiles[0])
      const redirectContent = `
import { NextResponse } from 'next/server';

// Этот файл автоматически создан скриптом миграции API
// Редирект со старого API пути на новый v1 путь

export function GET(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}\${url.pathname.replace('/api/${dir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function POST(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}\${url.pathname.replace('/api/${dir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function PUT(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}\${url.pathname.replace('/api/${dir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function DELETE(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}\${url.pathname.replace('/api/${dir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}
`
      fs.writeFileSync(redirectFile, redirectContent)
      console.log(`✅ Создан редирект для ${dir.name} (${routeFiles[0]})`)
    } else {
      // Проверяем подкаталоги на наличие route.ts
      const subdirs = fs
        .readdirSync(srcDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())

      for (const subdir of subdirs) {
        const subdirPath = path.join(srcDir, subdir.name)
        const subRouteFiles = fs
          .readdirSync(subdirPath)
          .filter((file) => file === 'route.ts' || file === 'route.js' || file === 'route.tsx')

        if (subRouteFiles.length > 0) {
          const redirectFile = path.join(subdirPath, subRouteFiles[0])
          const redirectContent = `
import { NextResponse } from 'next/server';

// Этот файл автоматически создан скриптом миграции API
// Редирект со старого API пути на новый v1 путь

export function GET(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}/${subdir.name}\${url.pathname.replace('/api/${dir.name}/${subdir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function POST(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}/${subdir.name}\${url.pathname.replace('/api/${dir.name}/${subdir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function PUT(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}/${subdir.name}\${url.pathname.replace('/api/${dir.name}/${subdir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}

export function DELETE(request: Request) {
  const url = new URL(request.url);
  const newUrl = \`\${url.origin}/api/v1/${dir.name}/${subdir.name}\${url.pathname.replace('/api/${dir.name}/${subdir.name}', '')}\${url.search}\`;
  return NextResponse.redirect(newUrl);
}
`
          fs.writeFileSync(redirectFile, redirectContent)
          console.log(`✅ Создан редирект для ${dir.name}/${subdir.name} (${subRouteFiles[0]})`)
        }
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при создании редиректа для ${dir.name}:`, error)
  }
})

console.log('\n✨ Миграция API маршрутов завершена!')
console.log('\nДалее рекомендуется:')
console.log('1. Протестировать API маршруты после миграции')
console.log('2. Обновить клиентский код для использования новых URL')
console.log('3. Создать API клиент для стандартизации запросов\n')
