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
    $source = "node_modules/@designcodeio/threeui/$asset"
    $dest = "$asset"
    $dir = Split-Path -Parent $dest
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Copy-Item -Path $source -Destination $dest -Force
    
    # Calculate SHA256
    $hash = (Get-FileHash -Path $dest -Algorithm SHA256).Hash.ToLower()
    Write-Host "Copied $dest - Hash: $hash"
}
