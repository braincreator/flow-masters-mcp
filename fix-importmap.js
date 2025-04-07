import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const importMapPath = path.resolve(__dirname, 'src/app/(payload)/admin/importMap.js')

// Функция для исправления файла importMap.js
async function fixImportMap() {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(importMapPath)) {
      console.log('importMap.js файл не найден. Ничего не делаем.')
      return
    }

    // Читаем содержимое файла
    let content = fs.readFileSync(importMapPath, 'utf8')

    // Проверяем наличие проблемного импорта
    const hasLexicalDiffComponent = content.includes('LexicalDiffComponent')

    if (hasLexicalDiffComponent) {
      // Удаляем импорт LexicalDiffComponent
      content = content.replace(
        /import \{ LexicalDiffComponent[^\}]+\} from ['"]@payloadcms\/richtext-lexical\/rsc['"];\n?/g,
        '',
      )

      // Удаляем элемент из объекта importMap
      content = content.replace(
        /"@payloadcms\/richtext-lexical\/rsc#LexicalDiffComponent":[^,]+,\n?/g,
        '',
      )

      // Записываем исправленное содержимое
      fs.writeFileSync(importMapPath, content)
      console.log(
        '✅ importMap.js успешно исправлен: удален несуществующий компонент LexicalDiffComponent',
      )
    } else {
      console.log('importMap.js уже исправлен или не содержит проблемных импортов.')
    }
  } catch (error) {
    console.error('❌ Ошибка при исправлении importMap.js:', error)
  }
}

// Запускаем функцию исправления
fixImportMap()
