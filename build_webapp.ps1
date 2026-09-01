# VTracer Webapp Build Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host ">>> 1. Building Rust WASM module..." -ForegroundColor Cyan
Push-Location webapp
npx wasm-pack build --target bundler --release
Pop-Location

Write-Host ">>> 2. Building frontend production bundle..." -ForegroundColor Cyan
Push-Location webapp/app
npm install
npm run build
Pop-Location

Write-Host ">>> [SUCCESS] Webapp build completed! Static bundle is located at webapp/app/dist/" -ForegroundColor Green
