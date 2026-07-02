param(
  [string]$ApkPath = "android/app/build/outputs/apk/debug/app-debug.apk",
  [string]$OutputDir = "tmp_apk"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-Not (Test-Path $ApkPath)) {
  Write-Host "APK_NOT_FOUND"
  exit 1
}

if (Test-Path $OutputDir) {
  Remove-Item $OutputDir -Recurse -Force
}

[IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $ApkPath).Path, $OutputDir)

Get-ChildItem -Path "$OutputDir\res\mipmap-*" -Filter '*ic_launcher*' -Recurse | Select-Object FullName,Length

if (Test-Path "$OutputDir\AndroidManifest.xml") {
  Write-Host "--- APK Manifest ---"
  Get-Content "$OutputDir\AndroidManifest.xml" -TotalCount 40
}
