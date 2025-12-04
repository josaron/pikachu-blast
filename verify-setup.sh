#!/bin/bash

echo "🔍 Verifying Pika-Blast setup..."

# Check if Pikachu image exists
if [ ! -f "public/pikachu.png" ]; then
    echo "⚠️  WARNING: public/pikachu.png not found!"
    echo "   Please add a Pikachu image to public/pikachu.png"
    echo "   See public/GET_PIKACHU_IMAGE.md for instructions"
    exit 1
else
    echo "✅ Pikachu image found"
fi

# Check if node_modules exists (for local dev)
if [ ! -d "node_modules" ]; then
    echo "ℹ️  node_modules not found (run 'npm install' for local development)"
else
    echo "✅ Node modules installed"
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
else
    echo "⚠️  Docker not found (required for containerized deployment)"
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo "✅ Docker Compose is available"
else
    echo "⚠️  Docker Compose not found (required for docker-compose)"
fi

echo ""
echo "✅ Setup verification complete!"
echo "🚀 To start the app: docker-compose up --build"

