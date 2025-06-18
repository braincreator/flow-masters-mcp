# Optimized Dockerfile for FlowMasters Next.js Application
# Enhanced version with security, performance, and size optimizations

FROM node:22.12.0-alpine AS base

# Install security updates and essential packages
RUN apk update && apk upgrade && apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user early
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Install dependencies with optimizations
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && \
    pnpm config set store-dir /tmp/.pnpm-store && \
    pnpm i --frozen-lockfile --production=false; \
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

# Build the application with optimizations
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm run build; \
  elif [ -f yarn.lock ]; then \
    yarn run build; \
  elif [ -f package-lock.json ]; then \
    npm run build; \
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

# Create .next directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy built application using output file tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create cache directory
RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs .next && \
    chmod -R 755 .next

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]