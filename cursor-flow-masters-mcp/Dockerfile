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
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# Build the application
RUN pnpm run build

# --- Runner --- 
FROM base AS runner
WORKDIR /usr/src/app

# Copy necessary artifacts from the build stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./

# Expose the port the app runs on (adjust if different)
EXPOSE 3030

# Define the command to run the app
CMD ["pnpm", "start"] 