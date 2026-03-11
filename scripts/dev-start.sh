#!/bin/bash

# GridConnect Development Startup Script
# This script starts both backend and frontend servers for local development

set -e

echo "🚀 GridConnect Development Server"
echo "=================================="
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if ! psql -U gridconnect -d gridconnect_db -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running or not accessible"
    echo "   Try: brew services start postgresql@16 (macOS)"
    echo "   Try: sudo systemctl start postgresql (Linux)"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Activate Python virtual environment
echo "🐍 Activating Python virtual environment..."
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Install/update dependencies
echo "📦 Installing Python dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing Node dependencies..."
cd frontend
npm install --silent
cd ..
echo "✅ Node dependencies installed"
echo ""

echo "🎉 All systems ready!"
echo ""
echo "Starting servers in 2 seconds..."
echo ""
sleep 2

# Start backend in background
echo "🔧 Starting FastAPI backend on http://localhost:8000..."
python -m uvicorn app.api:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "⚛️  Starting React frontend on http://localhost:3000..."
cd frontend
npm start
