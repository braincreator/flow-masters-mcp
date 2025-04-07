#!/bin/bash

echo "Начинаю генерацию типов Payload..."

# Создаем временный каталог для копирования файлов
TEMP_DIR="$(mktemp -d)"
echo "Создан временный каталог: $TEMP_DIR"

# Функция для очистки при завершении
cleanup() {
  echo "Удаляю временный каталог..."
  rm -rf "$TEMP_DIR"
}

# Регистрируем функцию очистки для выполнения при выходе
trap cleanup EXIT

# Копируем весь проект во временный каталог
echo "Копирую исходные файлы во временную директорию..."
cp -r $(pwd)/* "$TEMP_DIR/"

# Перейдем во временный каталог
cd "$TEMP_DIR"

# Заменяем проблемные импорты во всех компонентах React
echo "Исправляю импорты в компонентах React..."
find src/components -name "*.tsx" -type f -exec sed -i '' 's/from '"'"'payload\/components\/utilities'"'"'/from '"'"'payload\/admin'"'"'/g' {} \;

# Создаем пустые модули для всех .scss и .css файлов
echo "Создаю заглушки для SCSS файлов..."
find src -name "*.scss" -o -name "*.css" | while read style_file; do
  # Создаем пустой JS файл рядом с каждым файлом стилей
  js_file="${style_file}.js"
  echo "export default {};" > "$js_file"
  
  # Создаем mapping в package.json для этого модуля
  echo "Создан файл: $js_file"
done

# Создаем пустые модули для React компонентов, которые не нужны при генерации типов
echo "Создаю заглушки для React компонентов admin UI..."
find src/components/admin -name "*.tsx" | while read tsx_file; do
  # Создаем пустой JS файл рядом с каждым компонентом
  js_file="${tsx_file}.js"
  echo "export default {};" > "$js_file"
  echo "Создан файл: $js_file"
done

# Запускаем генерацию типов
echo "Запускаю генерацию типов Payload..."
NODE_OPTIONS="--no-warnings" npx payload generate:types

# Копируем сгенерированный файл back в оригинальный проект
if [ -f "src/payload-types.ts" ]; then
  echo "Копирую сгенерированные типы обратно в проект..."
  cp "src/payload-types.ts" "$(pwd)/../src/payload-types.ts"
  echo "Типы успешно сгенерированы!"
else
  echo "Ошибка: файл с типами не был создан."
  exit 1
fi 