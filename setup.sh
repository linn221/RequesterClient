#!/bin/bash

echo "🔧 Setting up Bug Hunting Record & Analysis Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if backend is running
echo "🔍 Checking backend connection..."
if curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Backend is running on http://localhost:8081"
else
    echo "⚠️  Backend is not running. Please start the backend server on http://localhost:8081"
    echo "   You'll need to authenticate at: http://localhost:8081/start_session?secret=your_secret"
fi

# Build the application to check for errors
echo "🏗️  Building application to check for errors..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 To start the development server:"
    echo "   npm run dev"
    echo ""
    echo "🌐 The application will be available at:"
    echo "   http://localhost:3000"
    echo ""
    echo "🔑 Don't forget to authenticate first:"
    echo "   http://localhost:8081/start_session?secret=your_secret"
else
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi
