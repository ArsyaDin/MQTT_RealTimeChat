#!/bin/bash

# MQTT Chat System Setup Script

echo "🚀 Starting MQTT Chat System Setup..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
fi

echo "✓ Environment files created"
echo ""

# Build and start containers
echo "Building and starting containers..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up --build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Access the application:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔧 To stop the services, press Ctrl+C"
echo ""
