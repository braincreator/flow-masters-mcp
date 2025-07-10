#!/bin/bash

# Скрипт для развертывания Flow Masters MCP в режиме разработки

set -e

echo "🛠️  Развертывание Flow Masters MCP Server в режиме разработки..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Устанавливаем API_KEY для разработки если не установлен
if [ -z "$API_KEY" ]; then
    echo "⚠️  API_KEY не установлен, используем значение для разработки"
    export API_KEY="dev-api-key"
fi

# Создаем директории для логов
mkdir -p logs

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose -f docker-compose.development.yml down || true

# Собираем образ для разработки
echo "🔨 Сборка Docker образа для разработки..."
docker-compose -f docker-compose.development.yml build --no-cache

# Запускаем сервисы
echo "▶️  Запуск MCP сервера в режиме разработки..."
docker-compose -f docker-compose.development.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервера..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса сервера..."
if curl -f http://localhost:3030/mcp/health > /dev/null 2>&1; then
    echo "✅ MCP сервер успешно запущен в режиме разработки!"
    echo "📊 Статус сервисов:"
    docker-compose -f docker-compose.development.yml ps
    echo ""
    echo "🌐 MCP сервер доступен по адресу: http://localhost:3030"
    echo "📋 Проверка здоровья: http://localhost:3030/mcp/health"
    echo "📖 Версия: http://localhost:3030/mcp/version"
    echo "🔄 Автоперезагрузка включена при изменении файлов"
else
    echo "❌ Ошибка: MCP сервер не отвечает"
    echo "📋 Логи контейнера:"
    docker-compose -f docker-compose.development.yml logs flow-masters-mcp-dev
    exit 1
fi

echo ""
echo "🎉 Развертывание в режиме разработки завершено!"
echo ""
echo "📚 Полезные команды:"
echo "  Просмотр логов:     docker-compose -f docker-compose.development.yml logs -f"
echo "  Остановка:          docker-compose -f docker-compose.development.yml down"
echo "  Перезапуск:         docker-compose -f docker-compose.development.yml restart"
echo "  Статус:             docker-compose -f docker-compose.development.yml ps"
echo "  Тестирование:       npm run test:migration"