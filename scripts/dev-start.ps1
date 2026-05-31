# Demarre backend + frontend pour le dev local EcomPilot
# Usage: powershell -ExecutionPolicy Bypass -File scripts/dev-start.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$api = "http://127.0.0.1:3001/api/v1/health"

function Test-Port($port) {
  return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

Write-Host ""
Write-Host "EcomPilot — demarrage dev local" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Port 27017)) {
  Write-Host "WARN: MongoDB ne repond pas sur le port 27017." -ForegroundColor Yellow
  Write-Host "      Demarrez MongoDB avant le backend (Docker ou service Windows)." -ForegroundColor Yellow
  Write-Host ""
}

if (-not (Test-Port 3001)) {
  Write-Host ">> Backend :3001 ..." -ForegroundColor Green
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\backend'; Write-Host 'Backend NestJS — http://localhost:3001/api/v1' -ForegroundColor Cyan; npm run start:dev"
  ) | Out-Null
  $deadline = (Get-Date).AddSeconds(45)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    try {
      $h = Invoke-RestMethod -Uri $api -TimeoutSec 3
      if ($h.status -eq "ok" -or $h.status -eq "up") { break }
    } catch { }
  }
} else {
  Write-Host "OK Backend deja actif sur :3001" -ForegroundColor Green
}

try {
  $health = Invoke-RestMethod -Uri $api -TimeoutSec 5
  Write-Host "OK API health: $($health.status)" -ForegroundColor Green
} catch {
  Write-Host "ERREUR: Backend inaccessible sur http://localhost:3001" -ForegroundColor Red
  Write-Host "       Verifiez MongoDB et la fenetre backend pour les erreurs." -ForegroundColor Red
  exit 1
}

if (-not (Test-Port 5173)) {
  Write-Host ">> Frontend :5173 ..." -ForegroundColor Green
  Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\frontend'; Write-Host 'Frontend Vite — http://localhost:5173' -ForegroundColor Cyan; npm run dev"
  ) | Out-Null
} else {
  Write-Host "OK Frontend deja actif sur :5173" -ForegroundColor Green
}

Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  Admin   http://localhost:5173/login"
Write-Host "  API     http://localhost:3001/api/v1/health"
Write-Host ""
