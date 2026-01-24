$ErrorActionPreference = 'Stop'
$version = 'v2.67.1'
$url = "https://github.com/supabase/cli/releases/download/$version/supabase_windows_amd64.tar.gz"
$outDir = "$env:LOCALAPPDATA\supabase-cli"
$tarFile = "$outDir\supabase.tar.gz"

Write-Host "Creating directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Downloading Supabase CLI $version..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $tarFile -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Cyan
# Use Windows built-in tar.exe
Push-Location $outDir
& "$env:SystemRoot\System32\tar.exe" -xzf supabase.tar.gz
Pop-Location

Write-Host "Cleaning up..." -ForegroundColor Cyan
Remove-Item $tarFile -ErrorAction SilentlyContinue

$exePath = "$outDir\supabase.exe"
if (Test-Path $exePath) {
    Write-Host "Supabase CLI installed at: $exePath" -ForegroundColor Green
    & $exePath --version
} else {
    Write-Host "Checking extracted files..." -ForegroundColor Yellow
    Get-ChildItem $outDir
}
