$jsonPath = "kage.json"
$jsonData = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json

foreach ($file in $jsonData.files) {
    $targetPath = $file.path
    $dir = Split-Path -Parent $targetPath
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    # Ensure correct encoding (UTF8 without BOM is good for JS/TS/HTML)
    [System.IO.File]::WriteAllText($targetPath, $file.code, [System.Text.Encoding]::UTF8)
    Write-Host "Created $targetPath"
}

$assets = @(
    "public/landing-pages/secret-pathways-assets/generated/kage-sanmon-preview.webp",
    "public/landing-pages/secret-pathways-assets/generated/kage-approach.webp",
    "public/landing-pages/secret-pathways-assets/generated/kage-lantern-court.webp",
    "public/landing-pages/secret-pathways-assets/generated/kage-moonwater.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/temple-wall.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/pine-tree.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/tall-grass.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/maple-leaves.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/stone-lantern.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/garden-bush.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/basalt-stones.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/hill.webp",
    "public/landing-pages/secret-pathways-assets/foreground/png/shrine-ruins.webp"
)

foreach ($asset in $assets) {
    $url = "https://threeui.com/" + $asset
    $dir = Split-Path -Parent $asset
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Invoke-WebRequest -Uri $url -OutFile $asset
    
    # Calculate SHA256
    $hash = (Get-FileHash -Path $asset -Algorithm SHA256).Hash.ToLower()
    Write-Host "Downloaded $asset - Hash: $hash"
}
