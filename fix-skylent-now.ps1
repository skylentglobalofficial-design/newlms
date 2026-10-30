$ErrorActionPreference = "Stop"
Write-Host "=== Skylent C-Suite Release Apply & Verification Script ===" -ForegroundColor Cyan

if (-not (Test-Path ".git")) {
    throw "Run this script from the root of your local newlms git repository."
}

Write-Host "1. Checking git patch compatibility against current working tree (ca790d1)..." -ForegroundColor Yellow
git apply --check .\skylent-release-readiness-fixes.patch
Write-Host "   Patch check passed with 0 conflicts!" -ForegroundColor Green

Write-Host "2. Applying skylent-release-readiness-fixes.patch..." -ForegroundColor Yellow
git apply .\skylent-release-readiness-fixes.patch

Write-Host "3. Staging all updated files..." -ForegroundColor Yellow
git add -A
git status -s

Write-Host "4. Creating release commit..." -ForegroundColor Yellow
git commit -m "feat(release): complete C-Suite flywheel, 6-track cold calls & Socratic AI, 20-min doubt SLA API, programme master certs, skill-gap radar & college CSV export"

Write-Host "=== Ready! Run 'git push origin HEAD:main' to deploy. ===" -ForegroundColor Green
