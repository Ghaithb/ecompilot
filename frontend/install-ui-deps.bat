@echo off
echo ========================================
echo Installation des dependances UI
echo ========================================
echo.

echo Installation de Radix UI components...
call npm install @radix-ui/react-radio-group @radix-ui/react-checkbox @radix-ui/react-progress

echo.
echo Installation de lucide-react (si necessaire)...
call npm install lucide-react

echo.
echo ========================================
echo Installation terminee !
echo ========================================
echo.
echo Vous pouvez maintenant demarrer le serveur:
echo npm run dev
echo.
pause
