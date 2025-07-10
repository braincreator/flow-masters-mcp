# Multi-stage build для Flow Masters MCP Server

# --- Base stage ---
FROM node:20-alpine AS base
WORKDIR /app

# Устанавливаем curl для healthcheck и pnpm
RUN apk add --no-cache curl && \
    npm install -g pnpm

# --- Dependencies stage ---
FROM base AS deps
# Копируем файлы зависимостей
COPY package.json pnpm-lock.yaml ./
# Устанавливаем все зависимости
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM deps AS builder
# Копируем исходный код и конфигурацию
COPY tsconfig.json ./
COPY src ./src
# Сборка проекта
RUN pnpm run build

# --- Development stage ---
FROM deps AS development
# Копируем исходный код для разработки
COPY tsconfig.json ./
COPY src ./src
# Открываем порт для разработки
EXPOSE 3030
# Команда для разработки
CMD ["pnpm", "run", "dev"]

# --- Production stage ---
FROM base AS production
# Копируем только production зависимости
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune

# Копируем собранный код
COPY --from=builder /app/dist ./dist

# Копируем конфигурацию
COPY config.sample.json ./config.json

# Создаем директории
RUN mkdir -p /app/logs /app/data

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001 -G nodejs

# Устанавливаем права доступа
RUN chown -R mcp:nodejs /app
USER mcp

# Метаданные образа
LABEL description="Flow Masters Model Context Protocol (MCP) server for LLM integration"
LABEL version="2.0.0"
LABEL maintainer="Flow Masters Team"

# Переменные окружения по умолчанию
ENV PORT=3030 \
    HOST=0.0.0.0 \
    API_URL=https://flow-masters.ru \
    API_KEY=your-api-key-here \
    AUTO_UPDATE=true \
    UPDATE_CHECK_INTERVAL=60 \
    API_BASE_PATH=/api \
    API_VERSION= \
    MODEL_CONTEXT_ENABLED=true \
    ALLOWED_MODELS=* \
    MAX_TOKENS=8192 \
    CONTEXT_WINDOW=4096 \
    CACHE_ENABLED=true \
    CACHE_TTL=3600 \
    NODE_ENV=production

# Открываем порт
EXPOSE 3030

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3030/mcp/health || exit 1

# Запускаем сервер
CMD ["node", "dist/index.js"] 