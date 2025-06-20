#!/bin/bash

# FlowMasters with Vertex AI - Startup Script
echo "🌟 Starting FlowMasters with Google Vertex AI..."

# Set Google Cloud credentials
export GOOGLE_APPLICATION_CREDENTIALS="/Users/braincreator/Projects/flow-masters/flow-masters/google-service-account.json"

# Verify credentials
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Google Service Account JSON not found!"
    exit 1
fi

echo "✅ Google Cloud credentials loaded"
echo "📋 Project: ancient-figure-462211-t6"
echo "🤖 AI Provider: Vertex AI (Gemini Pro)"
echo "👁️  Vision Model: Gemini Pro Vision"
echo "🌍 Location: us-central1"
echo ""
echo "🚀 Starting development server..."

# Start the application
npm run dev