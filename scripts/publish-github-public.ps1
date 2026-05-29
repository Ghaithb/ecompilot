# Publie EcomPilot sur GitHub en dépôt PUBLIC
# Prérequis : GitHub CLI connecté (gh auth login)

$ErrorActionPreference = 'Stop'
$repoPath = Split-Path -Parent $PSScriptRoot
$safeDir = $repoPath -replace '\\', '/'
$gh = "$env:ProgramFiles\GitHub CLI\gh.exe"

if (-not (Test-Path $gh)) {
  Write-Host 'Installez GitHub CLI : winget install GitHub.cli' -ForegroundColor Red
  exit 1
}

& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Connexion GitHub requise. Lancez : gh auth login' -ForegroundColor Yellow
  & $gh auth login -h github.com -p https -w
}

Set-Location $repoPath
$git = @{ 'core.safeDirectory' = $safeDir }

git -c "safe.directory=$safeDir" branch -M main

$remote = git -c "safe.directory=$safeDir" remote get-url origin 2>$null
if (-not $remote) {
  Write-Host 'Création du dépôt PUBLIC ecompilot sur GitHub...' -ForegroundColor Cyan
  & $gh repo create ecompilot --public --source=. --remote=origin --description "E-commerce COD & WhatsApp pour le Maghreb (Tunisie)" --push
} else {
  Write-Host "Remote existant : $remote" -ForegroundColor Cyan
  git -c "safe.directory=$safeDir" push -u origin main
}

Write-Host 'Terminé. Ouvrez : https://github.com/' -NoNewline
& $gh api user -q .login
Write-Host '/ecompilot'
