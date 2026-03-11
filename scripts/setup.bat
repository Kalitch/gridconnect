@echo off
REM GridConnect Development Setup Script for Windows

echo.
echo 🛠️  GridConnect Development Environment Setup
echo ==============================================
echo.

REM Check Python
echo 📍 Checking Python 3.11+...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.11+
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found
echo.

REM Check Node
echo 📍 Checking Node.js 18+...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Check PostgreSQL
echo 📍 Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL client not found. Please install PostgreSQL 16
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('psql --version') do set PSQL_VERSION=%%i
echo ✅ %PSQL_VERSION% found
echo.

REM Create Python virtual environment
echo 🐍 Setting up Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo    Created venv
)
call venv\Scripts\activate.bat
echo ✅ Virtual environment ready
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
python -m pip install -q --upgrade pip setuptools wheel
pip install -q -r requirements.txt
echo ✅ Python dependencies installed
echo.

REM Setup frontend
echo ⚛️  Setting up React frontend...
cd frontend
call npm install --silent
cd ..
echo ✅ Frontend dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    copy .env.local .env >nul
    echo ✅ Created .env file from .env.local
) else (
    echo ✅ .env file already exists
)
echo.

echo ════════════════════════════════════════════
echo ✨ Setup Complete!
echo ════════════════════════════════════════════
echo.
echo Next steps:
echo.
echo 1. Start the development servers:
echo.
echo    Terminal 1 (Backend):
echo    venv\Scripts\activate.bat
echo    python -m uvicorn app.api:app --reload
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend
echo    npm start
echo.
echo 2. Access the application:
echo    Frontend: http://localhost:3000
echo    API Docs: http://localhost:8000/docs
echo    Health:   http://localhost:8000/health
echo.
echo Happy coding! 🚀
echo.
pause
