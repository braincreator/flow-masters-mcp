export function load(url, context, defaultLoad) {
  // Если это SCSS или CSS файл, возвращаем пустой модуль
  if (url.endsWith('.scss') || url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    }
  }

  // Для всех остальных модулей используем стандартный механизм
  return defaultLoad(url, context)
}
