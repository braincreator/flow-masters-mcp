#!/bin/bash

# Build the application
echo "Building the application..."
pnpm build

# Copy the public directory to the standalone directory
echo "Copying public assets to standalone directory..."
mkdir -p .next/standalone/public
cp -R public/* .next/standalone/public/

# Start the application
echo "Starting the application..."
PORT=${PORT:-3000} node .next/standalone/server.js
