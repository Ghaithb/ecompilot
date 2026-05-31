# Plan de verification EcomPilot - Phase 0 + Phase 1
# Usage: powershell -ExecutionPolicy Bypass -File scripts/run-verification.ps1
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$api = if ($env:API_URL) { $env:API_URL } else { "http://127.0.0.1:3001/api/v1" }
$report = @()
$apiHealthy = $false

function Add-Result($phase, $name, $status, $detail = "") {
  $script:report += [PSCustomObject]@{ Phase = $phase; Test = $name; Status = $status; Detail = $detail }
  $color = switch ($status) { "OK" { "Green" } "WARN" { "Yellow" } default { "Red" } }
  $suffix = if ($detail) { " - $detail" } else { "" }
  Write-Host "[$status] $name$suffix" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " EcomPilot - Verification automatique" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "--- Phase 0 : Prerequis ---" -ForegroundColor Cyan

Push-Location (Join-Path $root "backend")
npm test 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Add-Result "0" "Backend unit tests" "OK" "39 tests" }
else { Add-Result "0" "Backend unit tests" "FAIL" "exit=$LASTEXITCODE" }
Pop-Location

Push-Location (Join-Path $root "frontend")
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) { Add-Result "0" "Frontend build" "OK" "vite build" }
else { Add-Result "0" "Frontend build" "FAIL" "exit=$LASTEXITCODE" }
Pop-Location

try {
  $health = Invoke-RestMethod -Uri "$api/health" -Method GET -TimeoutSec 5
  $status = if ($health.status) { $health.status } else { "up" }
  Add-Result "0" "API health" "OK" $status
  $apiHealthy = $true
} catch {
  Add-Result "0" "API health" "FAIL" $_.Exception.Message
  Write-Host "Backend non demarre sur $api - lancez: cd backend; npm run start:dev" -ForegroundColor Yellow
  Write-Host ""
}

Write-Host ""
Write-Host "--- Phase 1 : Smoke tests ---" -ForegroundColor Cyan

if ($apiHealthy) {
  & (Join-Path $root "scripts\e2e-smoke-test.ps1") 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -eq 0) { Add-Result "1" "e2e-smoke-test.ps1" "OK" "register to checkout" }
  else { Add-Result "1" "e2e-smoke-test.ps1" "FAIL" "exit=$LASTEXITCODE" }
} else {
  Add-Result "1" "e2e-smoke-test.ps1" "SKIP" "API down"
}

Push-Location $root
node (Join-Path $root "scripts\test-mvp-features.mjs") 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -eq 0) { Add-Result "1" "test-mvp-features.mjs" "OK" "MVP API" }
elseif (-not $apiHealthy) { Add-Result "1" "test-mvp-features.mjs" "SKIP" "API down" }
else { Add-Result "1" "test-mvp-features.mjs" "FAIL" "exit=$LASTEXITCODE" }

if ($apiHealthy) {
  node (Join-Path $root "scripts\verify-checkout-refresh.mjs") 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -eq 0) { Add-Result "1" "verify-checkout-refresh.mjs" "OK" "HTML checkout" }
  else { Add-Result "1" "verify-checkout-refresh.mjs" "WARN" "exit=$LASTEXITCODE" }
}
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host " RAPPORT" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
$report | Format-Table -AutoSize
$ok = ($report | Where-Object Status -eq "OK").Count
$fail = ($report | Where-Object Status -eq "FAIL").Count
$warn = ($report | Where-Object Status -eq "WARN").Count
$skip = ($report | Where-Object Status -eq "SKIP").Count
Write-Host "Total: $ok OK, $warn WARN, $skip SKIP, $fail FAIL / $($report.Count)"
Write-Host ""

if ($fail -gt 0) { exit 1 }
