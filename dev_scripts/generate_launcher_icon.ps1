param(
  [string]$ResRoot = "android/app/src/main/res"
)

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
  param(
    [int]$x,
    [int]$y,
    [int]$width,
    [int]$height,
    [int]$radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($radius -le 0) {
    $path.AddRectangle([System.Drawing.Rectangle]::new($x, $y, $width, $height))
    return $path
  }

  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()

  return $path
}

function Create-LauncherIcon {
  param(
    [int]$size,
    [string]$filePath,
    [bool]$includeBackground = $true
  )

  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  $cornerRadius = [int][Math]::Floor($size * 0.18)
  if ($includeBackground) {
    $bgRect = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      $bgRect,
      [System.Drawing.Color]::FromArgb(255, 52, 211, 153),
      [System.Drawing.Color]::FromArgb(255, 15, 118, 110),
      135
    )
    $bgPath = New-RoundedRectPath 0 0 $size $size $cornerRadius
    $g.FillPath($bgBrush, $bgPath)
  }

  $highlightRect = [System.Drawing.Rectangle]::new(
    [int][Math]::Floor($size * 0.08),
    [int][Math]::Floor($size * 0.08),
    [int][Math]::Floor($size * 0.84),
    [int][Math]::Floor($size * 0.42)
  )
  $highlightBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $highlightRect,
    [System.Drawing.Color]::FromArgb(140, 255, 255, 255),
    [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
    90
  )
  $highlightRadius = [int][Math]::Floor($cornerRadius * 0.6)
  $highlightPath = New-RoundedRectPath $highlightRect.X $highlightRect.Y $highlightRect.Width $highlightRect.Height $highlightRadius
  $g.FillPath($highlightBrush, $highlightPath)

  $shieldWidth = [int][Math]::Floor($size * 0.54)
  $shieldHeight = [int][Math]::Floor($size * 0.60)
  $shieldX = [int][Math]::Floor(($size - $shieldWidth) / 2)
  $shieldY = [int][Math]::Floor($size * 0.16)
  $shieldPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($size * 0.5, $shieldY),
    [System.Drawing.PointF]::new($shieldX, $shieldY + $shieldHeight * 0.22),
    [System.Drawing.PointF]::new($shieldX, $shieldY + $shieldHeight * 0.63),
    [System.Drawing.PointF]::new($size * 0.5, $shieldY + $shieldHeight),
    [System.Drawing.PointF]::new($shieldX + $shieldWidth, $shieldY + $shieldHeight * 0.63),
    [System.Drawing.PointF]::new($shieldX + $shieldWidth, $shieldY + $shieldHeight * 0.22)
  )
  $shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $shieldPath.AddLines($shieldPoints)
  $shieldPath.CloseFigure()
  $shieldFill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
  $g.FillPath($shieldFill, $shieldPath)
  $shieldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), [int][Math]::Floor($size * 0.08))
  $shieldPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawPath($shieldPen, $shieldPath)

  $schoolWidth = [int][Math]::Floor($shieldWidth * 0.52)
  $schoolHeight = [int][Math]::Floor($shieldHeight * 0.32)
  $schoolX = [int][Math]::Floor($size * 0.5 - $schoolWidth / 2)
  $schoolY = [int][Math]::Floor($shieldY + $shieldHeight * 0.38)
  $schoolBody = [System.Drawing.RectangleF]::new($schoolX, $schoolY, $schoolWidth, $schoolHeight)
  $g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 15, 118, 110)), $schoolBody)

  $roofHeight = [int][Math]::Floor($schoolHeight * 0.4)
  $roofPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($schoolX - [int][Math]::Floor($schoolWidth * 0.05), $schoolY),
    [System.Drawing.PointF]::new($schoolX + $schoolWidth / 2, $schoolY - $roofHeight),
    [System.Drawing.PointF]::new($schoolX + $schoolWidth + [int][Math]::Floor($schoolWidth * 0.05), $schoolY)
  )
  $g.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), $roofPoints)

  $windowSize = [int][Math]::Floor($schoolWidth * 0.20)
  $windowGap = [int][Math]::Floor($schoolWidth * 0.10)
  $windowY = $schoolY + [int][Math]::Floor($schoolHeight * 0.16)
  $windowX1 = $schoolX + $windowGap
  $windowX2 = $schoolX + $schoolWidth - $windowGap - $windowSize
  $g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), [System.Drawing.RectangleF]::new($windowX1, $windowY, $windowSize, $windowSize))
  $g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), [System.Drawing.RectangleF]::new($windowX2, $windowY, $windowSize, $windowSize))

  $doorWidth = [int][Math]::Floor($schoolWidth * 0.18)
  $doorHeight = [int][Math]::Floor($schoolHeight * 0.40)
  $doorX = [int][Math]::Floor($size * 0.5 - $doorWidth / 2)
  $doorY = $schoolY + $schoolHeight - $doorHeight - [int][Math]::Floor($schoolHeight * 0.05)
  $g.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), [System.Drawing.RectangleF]::new($doorX, $doorY, $doorWidth, $doorHeight))

  $flagPoleX = $schoolX + [int][Math]::Floor($schoolWidth * 0.88)
  $flagPoleY1 = $schoolY - [int][Math]::Floor($schoolHeight * 0.35)
  $flagPoleY2 = $schoolY + [int][Math]::Floor($schoolHeight * 0.05)
  $polePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), [int][Math]::Floor($size * 0.03))
  $g.DrawLine($polePen, $flagPoleX, $flagPoleY1, $flagPoleX, $flagPoleY2)

  $flagWidth = [int][Math]::Floor($schoolWidth * 0.20)
  $flagHeight = [int][Math]::Floor($schoolHeight * 0.17)
  $flagPoints = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new($flagPoleX, $flagPoleY1),
    [System.Drawing.PointF]::new($flagPoleX + $flagWidth, $flagPoleY1 + [int][Math]::Floor($flagHeight * 0.55)),
    [System.Drawing.PointF]::new($flagPoleX, $flagPoleY1 + $flagHeight)
  )
  $g.FillPolygon([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255)), $flagPoints)

  $g.Dispose()
  $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$dirMap = @{
  "mdpi" = 48
  "hdpi" = 72
  "xhdpi" = 96
  "xxhdpi" = 144
  "xxxhdpi" = 192
  "anydpi" = 192
}

foreach ($entry in $dirMap.GetEnumerator()) {
  $dir = $entry.Key
  $size = $entry.Value
  $path = Join-Path $ResRoot "mipmap-$dir/ic_launcher.png"
  Create-LauncherIcon -size $size -filePath $path -includeBackground $true
  Write-Host "Created $path"

  $foregroundPath = Join-Path $ResRoot "mipmap-$dir/ic_launcher_foreground.png"
  Create-LauncherIcon -size $size -filePath $foregroundPath -includeBackground $false
  Write-Host "Created $foregroundPath"
}

$rootIconPath = Join-Path $PSScriptRoot "..\android\app-icon.png"
Create-LauncherIcon -size 512 -filePath $rootIconPath -includeBackground $true
Write-Host "Created $rootIconPath"
