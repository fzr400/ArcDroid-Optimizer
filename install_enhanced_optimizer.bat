@echo off
echo ========================================
echo Installing Enhanced ArcDroid Optimizer
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

:: Install the enhanced optimizer
echo Installing Enhanced ArcDroid Optimizer with memory checking...
copy /Y "%~dp0src\ArcDroidOptimizer.js" "%SCRIPTS_DIR%\ArcDroidOptimizer.js"
if %errorLevel% neq 0 (
    echo ERROR: Failed to copy optimizer file.
    pause
    exit /b 1
)

echo ✓ Enhanced ArcDroid Optimizer installed successfully!
echo.
echo INSTALLATION COMPLETE
echo ========================================
echo.
echo NEW FEATURES ADDED:
echo - ArcDroid memory limit checking (15KB)
echo - G-code line count validation (2000 lines max)
echo - File size comparison (before/after)
echo - ArcDroid compatibility warnings
echo - Build area constraints (660x380mm)
echo.
echo How to use:
echo 1. Open QCAD/QCADCAM
echo 2. Open or create a DXF file
echo 3. Press Ctrl+Alt+A to optimize
echo.
echo You will now see:
echo - Original vs optimized file sizes
echo - Memory usage warnings if file is too large
echo - G-code line count estimates
echo - "Ready to cut" or "Too large" messages
echo.
echo Please restart QCAD to use the enhanced optimizer!
echo.
pause