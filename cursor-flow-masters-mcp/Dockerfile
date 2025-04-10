# Use an official Node.js runtime as a parent image
# Using Alpine for a smaller image size
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set the working directory
WORKDIR /usr/src/app

# --- Dependencies --- 
FROM base AS deps
# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./
# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# --- Build --- 
FROM base AS builder
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY src ./src

# Сборка проекта
RUN npm run build

# --- Runner --- 
FROM base AS runner
WORKDIR /usr/src/app

# Copy necessary artifacts from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

# Expose the port the app runs on (adjust if different)
EXPOSE 3030

# Define the command to run the app
CMD ["node", "dist/index.js"]

# Создаем финальный образ
FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --omit=dev

# Копируем собранный код и конфигурацию
COPY --from=builder /app/dist ./dist
COPY config.sample.json ./config.json

# Создаем папки для данных
RUN mkdir -p /app/data

# Метаданные образа
LABEL description="Flow Masters Model Context Protocol (MCP) server for LLM integration"
LABEL version="2.0.0"
LABEL maintainer="Flow Masters Team"

# Переменные окружения по умолчанию
ENV PORT=3030 \
    HOST=0.0.0.0 \
    API_URL=http://payload:3000 \
    API_KEY=your-api-key-here \
    AUTO_UPDATE=true \
    UPDATE_CHECK_INTERVAL=60 \
    API_BASE_PATH=/api \
    API_VERSION=v1 \
    MODEL_CONTEXT_ENABLED=true \
    ALLOWED_MODELS=* \
    MAX_TOKENS=8192 \
    CONTEXT_WINDOW=4096 \
    CACHE_ENABLED=true \
    CACHE_TTL=3600

# Открываем порт
EXPOSE ${PORT}

# Запускаем сервер
CMD ["node", "dist/index.js"] 