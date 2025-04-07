// Пустой загрузчик для файлов SCSS и CSS в Node.js
import { URL, pathToFileURL } from 'url'

export function resolve(specifier, context, nextResolve) {
  // Если это SCSS или CSS файл, возвращаем пустой модуль
  if (specifier.endsWith('.scss') || specifier.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      url: new URL('./src/types/empty-module.js', pathToFileURL(process.cwd())).href,
    }
  }

  // Для всех остальных модулей используем стандартный механизм
  return nextResolve(specifier, context)
}
