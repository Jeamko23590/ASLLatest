#!/bin/bash

# Quick start script for local development

echo "🚀 Starting SenyaMatika Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please update it with your database credentials."
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL"
    echo "  - JWT_SECRET"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "✅ Starting server..."
npm start
