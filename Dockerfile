# Optimized Dockerfile for FlowMasters Next.js Application
# Enhanced version with security, performance, and size optimizations
# Updated for regular Next.js build mode (not standalone)

FROM node:22.12.0-alpine AS base

# Install security updates and essential packages
RUN apk update && apk upgrade && apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Set environment variables for memory optimization and E2BIG fix
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV NEXT_JEST_WORKER_THREADS=false
ENV UV_USE_IO_URING=0

# Create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Install dependencies with optimizations and E2BIG fix
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && \
    pnpm config set store-dir /tmp/.pnpm-store && \
    pnpm config set enable-pre-post-scripts false && \
    pnpm config set side-effects-cache false && \
    pnpm install --frozen-lockfile --production=false --ignore-scripts && \
    pnpm rebuild --filter @swc/core --filter esbuild --filter sharp; \
  elif [ -f yarn.lock ]; then \
    yarn config set cache-folder /tmp/.yarn-cache && \
    yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci --cache /tmp/.npm-cache; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# ================================
# Builder stage
# ================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding files via .dockerignore)
COPY . .

# Set build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_TELEMETRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application with optimizations for Docker
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build:docker; \
  elif [ -f yarn.lock ]; then \
    yarn run build:docker; \
  elif [ -f package-lock.json ]; then \
    npm run build:docker; \
  else \
    echo "Lockfile not found." && exit 1; \
  fi

# ================================
# Production stage
# ================================
FROM base AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_TELEMETRY_DISABLED=true
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy public assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create .next directory with correct permissions (will be overwritten by COPY)
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy built application files
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Set correct permissions for .next directory and create cache
RUN chown -R nextjs:nodejs .next && \
    chmod -R 755 .next && \
    mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next/cache

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application using Next.js start command
CMD ["npm", "start"]