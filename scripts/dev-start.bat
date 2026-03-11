@echo off
REM GridConnect Development Startup Script for Windows

echo.
echo 🚀 GridConnect Development Server
echo ==================================
echo.

REM Activate virtual environment
echo 🐍 Activating Python virtual environment...
if not exist "venv" (
    echo ❌ Virtual environment not found!
    echo    Run scripts\setup.bat first
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

REM Check PostgreSQL
echo 📊 Checking PostgreSQL...
psql -U gridconnect -d gridconnect_db -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not running or not accessible
    echo    Make sure PostgreSQL service is running
    pause
    exit /b 1
)
echo ✅ PostgreSQL is running
echo.

echo 🎉 All systems ready!
echo.
echo Starting servers...
echo.
echo 🔧 Starting FastAPI backend on http://localhost:8000...
echo    (Press Ctrl+C to stop backend)
echo.

REM Start backend
python -m uvicorn app.api:app --reload --host 0.0.0.0 --port 8000

REM When backend stops, ask about frontend
echo.
echo Backend stopped. Start frontend? (Open new terminal and run):
echo    cd frontend
echo    npm start
echo.
pause
