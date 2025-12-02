@echo off
REM MQTT Chat System Setup Script for Windows

echo.
echo 🚀 Starting MQTT Chat System Setup...
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✓ Docker and Docker Compose are installed
echo.

REM Create .env files if they don't exist
if not exist "backend\.env" (
    echo Creating backend\.env...
    copy backend\.env.example backend\.env
)

if not exist "frontend\.env" (
    echo Creating frontend\.env...
    copy frontend\.env.example frontend\.env
)

echo ✓ Environment files created
echo.

REM Build and start containers
echo Building and starting containers...
echo This may take a few minutes on first run...
echo.

docker-compose up --build

echo.
echo 🎉 Setup complete!
echo.
echo 📝 Access the application:
echo    Frontend: http://localhost:3001
echo    Backend:  http://localhost:3000
echo.
echo 🔧 To stop the services, press Ctrl+C
echo.
pause
