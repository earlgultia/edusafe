<#
Helper PowerShell script to build Android release APK.
Run from project root:
  .\scripts\build-android.ps1

This script checks for Java and the `android/key.properties` file and then runs Gradle to produce a release APK.
#>

function Abort($msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

Write-Host 'Building Android release APK' -ForegroundColor Cyan

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
  Abort 'Java is not available. Install a JDK and set JAVA_HOME before running this script.'
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$androidDir = Join-Path $projectRoot '..\android' | Resolve-Path -ErrorAction Stop
Set-Location $androidDir

if (-not (Test-Path './gradlew.bat')) {
  Abort 'gradlew.bat not found in android folder.'
}

if (-not (Test-Path './key.properties')) {
  Write-Host 'Warning: android/key.properties not found. Build will proceed but APK may be unsigned.' -ForegroundColor Yellow
}

Write-Host 'Running Gradle assembleRelease...' -ForegroundColor Green
.
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -ne 0) {
  Abort 'Gradle build failed. Check the output above for details.'
}

$apkPath = Join-Path (Get-Location) 'app\build\outputs\apk\release\app-release.apk'
if (Test-Path $apkPath) {
  Write-Host "Build succeeded. APK: $apkPath" -ForegroundColor Green
} else {
  Write-Host 'Build completed but APK not found at expected location.' -ForegroundColor Yellow
}
