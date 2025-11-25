@echo off
REM Setup script for test database (Windows)

echo Setting up test database...

REM Check if Docker is running
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not running. Please start Docker first.
    exit /b 1
)

REM Check if postgres container exists
docker ps -a | findstr postgres_db >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: postgres_db container not found. Please run 'docker-compose up -d' first.
    exit /b 1
)

REM Start postgres if not running
docker ps | findstr postgres_db >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting PostgreSQL container...
    docker start postgres_db
    timeout /t 3 /nobreak >nul
)

REM Drop existing test database if exists
echo Dropping existing test database (if exists)...
docker exec -i postgres_db psql -U postgres -c "DROP DATABASE IF EXISTS eventplatform_test;" >nul 2>&1

REM Create test database
echo Creating test database...
docker exec -i postgres_db psql -U postgres -c "CREATE DATABASE eventplatform_test;"

REM Initialize schema
echo Initializing database schema...
docker exec -i postgres_db psql -U postgres -d eventplatform_test < ..\database\init.sql

echo.
echo Test database setup complete!
echo.
echo You can now run:
echo   npm test              - Run all tests
echo   npm run test:unit     - Run unit tests only
echo   npm run test:integration - Run integration tests only
echo   npm run test:coverage - Run tests with coverage
