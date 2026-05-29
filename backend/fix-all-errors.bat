@echo off
echo ========================================
echo Installation des packages manquants
echo ========================================
echo.

echo Installation de @nestjs/cache-manager...
call npm install @nestjs/cache-manager cache-manager

echo.
echo Installation de cache-manager-redis-store...
call npm install cache-manager-redis-store

echo.
echo ========================================
echo Installation terminee !
echo ========================================
echo.
pause
