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

function New-ShieldPath {
  param(
    [float]$size,
    [float]$scale,
    [float]$offsetY
  )

  $cx = $size * 0.5
  $top = $size * $offsetY
  $w = $size * $scale
  $h = $size * ($scale * 0.92)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.StartFigure()
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx, $top),
    [System.Drawing.PointF]::new($cx + $w * 0.24, $top + $h * 0.15),
    [System.Drawing.PointF]::new($cx + $w * 0.38, $top + $h * 0.20),
    [System.Drawing.PointF]::new($cx + $w * 0.50, $top + $h * 0.23)
  )
  $path.AddLine($cx + $w * 0.50, $top + $h * 0.23, $cx + $w * 0.50, $top + $h * 0.45)
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx + $w * 0.50, $top + $h * 0.45),
    [System.Drawing.PointF]::new($cx + $w * 0.48, $top + $h * 0.70),
    [System.Drawing.PointF]::new($cx + $w * 0.24, $top + $h * 0.85),
    [System.Drawing.PointF]::new($cx, $top + $h)
  )
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx, $top + $h),
    [System.Drawing.PointF]::new($cx - $w * 0.24, $top + $h * 0.85),
    [System.Drawing.PointF]::new($cx - $w * 0.48, $top + $h * 0.70),
    [System.Drawing.PointF]::new($cx - $w * 0.50, $top + $h * 0.45)
  )
  $path.AddLine($cx - $w * 0.50, $top + $h * 0.45, $cx - $w * 0.50, $top + $h * 0.23)
  $path.AddBezier(
    [System.Drawing.PointF]::new($cx - $w * 0.50, $top + $h * 0.23),
    [System.Drawing.PointF]::new($cx - $w * 0.38, $top + $h * 0.20),
    [System.Drawing.PointF]::new($cx - $w * 0.24, $top + $h * 0.15),
    [System.Drawing.PointF]::new($cx, $top)
  )
  $path.CloseFigure()
  return $path
}

function Add-Shadow {
  param(
    [System.Drawing.Graphics]$graphics,
    [System.Drawing.Drawing2D.GraphicsPath]$path,
    [int]$size,
    [int]$alpha = 55
  )

  $matrix = New-Object System.Drawing.Drawing2D.Matrix
  $matrix.Translate(0, [float]($size * 0.018))
  $shadowPath = $path.Clone()
  $shadowPath.Transform($matrix)
  $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($alpha, 0, 84, 70))
  $graphics.FillPath($shadowBrush, $shadowPath)
  $shadowBrush.Dispose()
  $shadowPath.Dispose()
  $matrix.Dispose()
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

  $white = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
  $mint = [System.Drawing.Color]::FromArgb(255, 160, 235, 210)
  $darkTeal = [System.Drawing.Color]::FromArgb(255, 4, 132, 112)

  $logoState = $g.Save()
  $logoScale = 0.86
  $g.TranslateTransform($size * 0.5, $size * 0.5)
  $g.ScaleTransform($logoScale, $logoScale)
  $g.TranslateTransform(-$size * 0.5, -$size * 0.5)

  $shieldOuter = New-ShieldPath $size 0.62 0.14
  Add-Shadow $g $shieldOuter $size 70
  $g.FillPath([System.Drawing.SolidBrush]::new($white), $shieldOuter)

  $shieldInner = New-ShieldPath $size 0.48 0.22
  $innerRect = [System.Drawing.RectangleF]::new($size * 0.26, $size * 0.20, $size * 0.48, $size * 0.52)
  $innerBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $innerRect,
    [System.Drawing.Color]::FromArgb(255, 5, 142, 121),
    [System.Drawing.Color]::FromArgb(255, 20, 196, 159),
    90
  )
  $g.FillPath($innerBrush, $shieldInner)

  $headBrush = [System.Drawing.SolidBrush]::new($white)
  $g.FillEllipse($headBrush, [System.Drawing.RectangleF]::new($size * 0.445, $size * 0.285, $size * 0.11, $size * 0.11))

  $leafLeft = New-Object System.Drawing.Drawing2D.GraphicsPath
  $leafLeft.AddBezier(
    [System.Drawing.PointF]::new($size * 0.50, $size * 0.50),
    [System.Drawing.PointF]::new($size * 0.42, $size * 0.40),
    [System.Drawing.PointF]::new($size * 0.33, $size * 0.39),
    [System.Drawing.PointF]::new($size * 0.26, $size * 0.43)
  )
  $leafLeft.AddBezier(
    [System.Drawing.PointF]::new($size * 0.26, $size * 0.43),
    [System.Drawing.PointF]::new($size * 0.36, $size * 0.45),
    [System.Drawing.PointF]::new($size * 0.45, $size * 0.53),
    [System.Drawing.PointF]::new($size * 0.50, $size * 0.62)
  )
  $leafLeft.CloseFigure()
  $g.FillPath([System.Drawing.SolidBrush]::new($mint), $leafLeft)

  $leafRight = $leafLeft.Clone()
  $mirror = New-Object System.Drawing.Drawing2D.Matrix
  $mirror.Translate($size, 0)
  $mirror.Scale(-1, 1)
  $leafRight.Transform($mirror)
  $g.FillPath([System.Drawing.SolidBrush]::new($mint), $leafRight)

  $bookLeft = New-Object System.Drawing.Drawing2D.GraphicsPath
  $bookLeft.StartFigure()
  $bookLeft.AddLine($size * 0.32, $size * 0.47, $size * 0.49, $size * 0.52)
  $bookLeft.AddLine($size * 0.49, $size * 0.52, $size * 0.49, $size * 0.76)
  $bookLeft.AddBezier(
    [System.Drawing.PointF]::new($size * 0.49, $size * 0.76),
    [System.Drawing.PointF]::new($size * 0.43, $size * 0.66),
    [System.Drawing.PointF]::new($size * 0.36, $size * 0.61),
    [System.Drawing.PointF]::new($size * 0.33, $size * 0.60)
  )
  $bookLeft.CloseFigure()
  $g.FillPath([System.Drawing.SolidBrush]::new($white), $bookLeft)

  $bookRight = New-Object System.Drawing.Drawing2D.GraphicsPath
  $bookRight.StartFigure()
  $bookRight.AddLine($size * 0.68, $size * 0.47, $size * 0.51, $size * 0.52)
  $bookRight.AddLine($size * 0.51, $size * 0.52, $size * 0.51, $size * 0.76)
  $bookRight.AddBezier(
    [System.Drawing.PointF]::new($size * 0.51, $size * 0.76),
    [System.Drawing.PointF]::new($size * 0.57, $size * 0.66),
    [System.Drawing.PointF]::new($size * 0.64, $size * 0.61),
    [System.Drawing.PointF]::new($size * 0.67, $size * 0.60)
  )
  $bookRight.CloseFigure()
  $g.FillPath([System.Drawing.SolidBrush]::new($mint), $bookRight)

  $bookPen = New-Object System.Drawing.Pen($white, [int][Math]::Max(2, [Math]::Floor($size * 0.025)))
  $bookPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawPath($bookPen, $bookLeft)
  $g.DrawPath($bookPen, $bookRight)

  $handPen = New-Object System.Drawing.Pen($white, [int][Math]::Max(5, [Math]::Floor($size * 0.052)))
  $handPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $handPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $handPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $g.DrawBezier($handPen, $size * 0.17, $size * 0.58, $size * 0.19, $size * 0.78, $size * 0.33, $size * 0.82, $size * 0.47, $size * 0.94)
  $g.DrawBezier($handPen, $size * 0.31, $size * 0.71, $size * 0.36, $size * 0.82, $size * 0.45, $size * 0.79, $size * 0.50, $size * 0.89)
  $g.DrawBezier($handPen, $size * 0.83, $size * 0.58, $size * 0.81, $size * 0.78, $size * 0.67, $size * 0.82, $size * 0.53, $size * 0.94)
  $g.DrawBezier($handPen, $size * 0.69, $size * 0.71, $size * 0.64, $size * 0.82, $size * 0.55, $size * 0.79, $size * 0.50, $size * 0.89)

  $g.Restore($logoState)

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
