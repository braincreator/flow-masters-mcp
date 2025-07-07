#!/bin/bash

# Скрипт для развертывания Flow Masters MCP в продакшн

set -e

echo "🚀 Развертывание Flow Masters MCP Server в продакшн..."

# Проверяем наличие API_KEY
if [ -z "$API_KEY" ]; then
    echo "❌ Ошибка: Переменная окружения API_KEY не установлена"
    echo "Установите её командой: export API_KEY=your-api-key-here"
    exit 1
fi

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

# Создаем директории для логов
mkdir -p logs

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose -f docker-compose.production.yml down || true

# Собираем образ
echo "🔨 Сборка Docker образа..."
docker-compose -f docker-compose.production.yml build --no-cache

# Запускаем сервисы
echo "▶️  Запуск MCP сервера..."
docker-compose -f docker-compose.production.yml up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервера..."
sleep 10

# Проверяем статус
echo "🔍 Проверка статуса сервера..."
if curl -f http://localhost:3030/mcp/health > /dev/null 2>&1; then
    echo "✅ MCP сервер успешно запущен!"
    echo "📊 Статус сервисов:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    echo "🌐 MCP сервер доступен по адресу: http://localhost:3030"
    echo "📋 Проверка здоровья: http://localhost:3030/mcp/health"
    echo "📖 Версия: http://localhost:3030/mcp/version"
else
    echo "❌ Ошибка: MCP сервер не отвечает"
    echo "📋 Логи контейнера:"
    docker-compose -f docker-compose.production.yml logs flow-masters-mcp
    exit 1
fi

echo ""
echo "🎉 Развертывание завершено успешно!"
echo ""
echo "📚 Полезные команды:"
echo "  Просмотр логов:     docker-compose -f docker-compose.production.yml logs -f"
echo "  Остановка:          docker-compose -f docker-compose.production.yml down"
echo "  Перезапуск:         docker-compose -f docker-compose.production.yml restart"
echo "  Статус:             docker-compose -f docker-compose.production.yml ps"