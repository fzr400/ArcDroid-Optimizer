@echo off
echo ========================================
echo ArcDroid Optimizer v1.0 Installer
echo ========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

:: Set QCAD installation path
set "QCAD_PATH=C:\Program Files\QCADCAM"
if not exist "%QCAD_PATH%" (
    echo ERROR: QCAD/QCADCAM not found at %QCAD_PATH%
    echo Please ensure QCAD is installed before running this installer.
    echo.
    pause
    exit /b 1
)

echo Found QCAD installation at: %QCAD_PATH%
echo.

:: Create scripts directory if it doesn't exist
set "SCRIPTS_DIR=%QCAD_PATH%\scripts"
if not exist "%SCRIPTS_DIR%" (
    echo Creating scripts directory...
    mkdir "%SCRIPTS_DIR%"
)

:: Install the optimizer
echo Installing ArcDroid Optimizer...
copy /Y "%~dp0ArcDroidOptimizer.js" "%SCRIPTS_DIR%\ArcDroidOptimizer.js"
if %errorLevel% neq 0 (
    echo ERROR: Failed to copy optimizer file.
    pause
    exit /b 1
)

echo ✓ ArcDroid Optimizer installed successfully!
echo.
echo INSTALLATION COMPLETE
echo ========================================
echo.
echo How to use:
echo 1. Open QCAD/QCADCAM
echo 2. Open or create a DXF file
echo 3. Press Ctrl+Alt+O to optimize
echo.
echo The optimizer will:
echo - Analyze your drawing entities
echo - Remove duplicate elements
echo - Merge connected segments
echo - Simplify polylines
echo - Optimize cutting order
echo - Check ArcDroid memory constraints
echo.
echo File location: %SCRIPTS_DIR%\ArcDroidOptimizer.js
echo.
echo Press any key to exit...
pause >nul