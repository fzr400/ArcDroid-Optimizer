# ArcDroid Optimizer v1.0 PowerShell Installer
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ArcDroid Optimizer v1.0 Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This installer requires administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as administrator'" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Set QCAD installation path
$qcadPath = "C:\Program Files\QCADCAM"
if (-not (Test-Path $qcadPath)) {
    Write-Host "ERROR: QCAD/QCADCAM not found at $qcadPath" -ForegroundColor Red
    Write-Host "Please ensure QCAD is installed before running this installer." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found QCAD installation at: $qcadPath" -ForegroundColor Green
Write-Host ""

# Create scripts directory if it doesn't exist
$scriptsDir = Join-Path $qcadPath "scripts"
if (-not (Test-Path $scriptsDir)) {
    Write-Host "Creating scripts directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
}

# Install the optimizer
Write-Host "Installing ArcDroid Optimizer..." -ForegroundColor Yellow
$sourceFile = Join-Path $PSScriptRoot "ArcDroidOptimizer.js"
$destFile = Join-Path $scriptsDir "ArcDroidOptimizer.js"

try {
    Copy-Item $sourceFile $destFile -Force
    Write-Host "✓ ArcDroid Optimizer installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to copy optimizer file." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "INSTALLATION COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "How to use:" -ForegroundColor White
Write-Host "1. Open QCAD/QCADCAM" -ForegroundColor Gray
Write-Host "2. Open or create a DXF file" -ForegroundColor Gray
Write-Host "3. Press Ctrl+Alt+O to optimize" -ForegroundColor Gray
Write-Host ""
Write-Host "The optimizer will:" -ForegroundColor White
Write-Host "- Analyze your drawing entities" -ForegroundColor Gray
Write-Host "- Remove duplicate elements" -ForegroundColor Gray
Write-Host "- Merge connected segments" -ForegroundColor Gray
Write-Host "- Simplify polylines" -ForegroundColor Gray
Write-Host "- Optimize cutting order" -ForegroundColor Gray
Write-Host "- Check ArcDroid memory constraints" -ForegroundColor Gray
Write-Host ""
Write-Host "File location: $destFile" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"