# Custom launcher icon generator with hexagon + house design for Android 12+
param(
  [string]$ResRoot = "android/app/src/main/res"
)

Add-Type -AssemblyName System.Drawing

function DrawHexagon {
  param(
    [System.Drawing.Graphics]$graphics,
    [int]$centerX,
    [int]$centerY,
    [int]$radius,
    [System.Drawing.Color]$color
  )
  
  $brush = New-Object System.Drawing.SolidBrush($color)
  $points = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  
  for ($i = 0; $i -lt 6; $i++) {
    $angle = [Math]::PI / 3 * $i - [Math]::PI / 2
    $x = $centerX + $radius * [Math]::Cos($angle)
    $y = $centerY + $radius * [Math]::Sin($angle)
    $pt = New-Object System.Drawing.PointF -ArgumentList ([float]$x, [float]$y)
    $points.Add($pt)
  }
  
  $graphics.FillPolygon($brush, $points.ToArray())
  $brush.Dispose()
}

function DrawHouse {
  param(
    [System.Drawing.Graphics]$graphics,
    [int]$centerX,
    [int]$centerY,
    [int]$size,
    [System.Drawing.Color]$color
  )
  
  $brush = New-Object System.Drawing.SolidBrush($color)
  
  $halfSize = $size / 2
  $quarterSize = $size / 4
  
  # Draw house body (rectangle)
  $bodyX = $centerX - $halfSize
  $bodyY = $centerY - $quarterSize
  $graphics.FillRectangle($brush, $bodyX, $bodyY, $size, $halfSize)
  
  # Draw roof (triangle)
  $roofPoints = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  $roofPoints.Add((New-Object System.Drawing.PointF -ArgumentList ([float]($centerX - $halfSize), [float]($centerY - $quarterSize))))
  $roofPoints.Add((New-Object System.Drawing.PointF -ArgumentList ([float]($centerX + $halfSize), [float]($centerY - $quarterSize))))
  $roofPoints.Add((New-Object System.Drawing.PointF -ArgumentList ([float]$centerX, [float]($centerY - $halfSize - $quarterSize))))
  $graphics.FillPolygon($brush, $roofPoints.ToArray())
  
  # Draw left window
  $windowSize = [int]($quarterSize / 2)
  $graphics.FillRectangle($brush, $centerX - $halfSize + $windowSize, $bodyY + $windowSize, $windowSize, $windowSize)
  
  # Draw right window
  $graphics.FillRectangle($brush, $centerX + $halfSize - $windowSize * 2, $bodyY + $windowSize, $windowSize, $windowSize)
  
  # Draw door
  $doorWidth = [int]($quarterSize / 1.5)
  $doorHeight = [int]$quarterSize
  $graphics.FillRectangle($brush, $centerX - $doorWidth / 2, $centerY + $quarterSize / 2, $doorWidth, $doorHeight)
  
  $brush.Dispose()
}

$densities = @{
  "mipmap-anydpi"  = 192
  "mipmap-mdpi"    = 48
  "mipmap-hdpi"    = 72
  "mipmap-xhdpi"   = 96
  "mipmap-xxhdpi"  = 144
  "mipmap-xxxhdpi" = 192
}

# Colors
$backgroundColor = [System.Drawing.Color]::FromArgb(15, 118, 110)    # Teal background
$hexagonColor = [System.Drawing.Color]::White                         # White hexagon
$houseColor = [System.Drawing.Color]::FromArgb(0, 102, 102)          # Darker teal house

Write-Host "Generating custom launcher icons..."

foreach ($density in $densities.GetEnumerator()) {
  $dir = Join-Path $ResRoot $density.Key
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  
  $size = $density.Value
  
  # Create background bitmap (solid teal)
  $bgBitmap = New-Object System.Drawing.Bitmap($size, $size)
  $bgGraphics = [System.Drawing.Graphics]::FromImage($bgBitmap)
  $bgGraphics.Clear($backgroundColor)
  $bgGraphics.Dispose()
  
  # Create foreground bitmap with hexagon + house
  $fgBitmap = New-Object System.Drawing.Bitmap($size, $size)
  $fgGraphics = [System.Drawing.Graphics]::FromImage($fgBitmap)
  $fgGraphics.Clear([System.Drawing.Color]::Transparent)
  $fgGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  
  $centerX = $size / 2
  $centerY = $size / 2
  $hexRadius = [int]($size * 0.35)
  
  # Draw white hexagon
  DrawHexagon $fgGraphics $centerX $centerY $hexRadius $hexagonColor
  
  # Draw house inside hexagon
  $houseSize = [int]($size * 0.25)
  DrawHouse $fgGraphics $centerX $centerY $houseSize $houseColor
  
  $fgGraphics.Dispose()
  
  # Save background image
  $launcherPath = Join-Path $dir "ic_launcher.png"
  $bgBitmap.Save($launcherPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bgBitmap.Dispose()
  
  # Save foreground image
  $foregroundPath = Join-Path $dir "ic_launcher_foreground.png"
  $fgBitmap.Save($foregroundPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $fgBitmap.Dispose()
  
  Write-Host "OK: $($density.Key) ($size x $size)"
}

Write-Host ""
Write-Host "Done! Custom launcher icons generated."
Write-Host ""
Write-Host "Next: gradlew clean app:assembleRelease"
