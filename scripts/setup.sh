#!/bin/bash

# GridConnect Development Setup Script
# This script sets up the complete local development environment

set -e

echo "🛠️  GridConnect Development Environment Setup"
echo "=============================================="
echo ""

# Check Python
echo "📍 Checking Python 3.11+..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.11+"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Python $PYTHON_VERSION found"
echo ""

# Check Node
echo "📍 Checking Node.js 18+..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check PostgreSQL
echo "📍 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Please install PostgreSQL 16"
    exit 1
fi
PSQL_VERSION=$(psql --version)
echo "✅ $PSQL_VERSION found"
echo ""

# Check if PostgreSQL server is running
echo "📍 Checking if PostgreSQL server is running..."
if ! psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL server may not be running"
    echo "   Try: brew services start postgresql@16 (macOS)"
    echo "   Try: sudo systemctl start postgresql (Linux)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo "✅ PostgreSQL server is accessible"
echo ""

# Create Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   Created venv"
fi
source venv/bin/activate
echo "✅ Virtual environment ready"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -q --upgrade pip setuptools wheel
pip install -q -r requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Check/create database
echo "🗄️  Setting up database..."

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw gridconnect_db; then
    echo "   Database 'gridconnect_db' exists"
else
    echo "   Creating database..."
    psql -U postgres << EOF
CREATE USER IF NOT EXISTS gridconnect WITH PASSWORD 'gridconnect_password';
CREATE DATABASE gridconnect_db OWNER gridconnect;
\c gridconnect_db
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
EOF
    echo "   Database and user created"
fi

# Initialize schema
echo "   Initializing database schema..."
psql -U gridconnect -d gridconnect_db < init-db.sql > /dev/null 2>&1
echo "✅ Database ready"
echo ""

# Setup frontend
echo "⚛️  Setting up React frontend..."
cd frontend
npm install --silent
cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.local .env
    echo "✅ Created .env file from .env.local"
else
    echo "✅ .env file already exists"
fi
echo ""

echo "════════════════════════════════════════════"
echo "✨ Setup Complete!"
echo "════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development servers:"
echo "   ./scripts/dev-start.sh"
echo ""
echo "2. Or start them manually:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   source venv/bin/activate"
echo "   python -m uvicorn app.api:app --reload"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "Happy coding! 🚀"
