#!/bin/bash

echo "Запускаю генерацию типов Payload (упрощенный скрипт)..."

# Set environment variable to modify config during generation and run directly
IS_GENERATING_TYPES=true NODE_OPTIONS="--no-warnings" npx payload generate:types --config-path src/payload.config.ts

# Check the exit code of the command
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "Типы успешно сгенерированы!"
else
  echo "Ошибка: Генерация типов завершилась с кодом ошибки $EXIT_CODE."
  exit $EXIT_CODE
fi