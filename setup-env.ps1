# setup-env.ps1
# This script helps set up the local development environment

# Check if .env.local already exists
if (Test-Path .env.local) {
    Write-Host ".env.local already exists. Backing up to .env.local.bak..." -ForegroundColor Yellow
    if (Test-Path .env.local.bak) {
        Remove-Item .env.local.bak -Force
    }
    Rename-Item -Path .env.local -NewName .env.local.bak
}

# Copy .env.example to .env.local
if (Test-Path .env.example) {
    Copy-Item .env.example -Destination .env.local
    Write-Host "Created .env.local from .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please edit the .env.local file and update the values as needed." -ForegroundColor Cyan
    Write-Host "Then run the following commands to start the development server:" -ForegroundColor Cyan
    Write-Host "npm install" -ForegroundColor White -BackgroundColor Black
    Write-Host "npm run dev" -ForegroundColor White -BackgroundColor Black
} else {
    Write-Host "Error: .env.example file not found!" -ForegroundColor Red
    exit 1
}
