#!/bin/sh
set -e

echo "Starting Flow Masters application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the application in the foreground
echo "Starting Next.js development server..."
exec npm run dev
