# Limebo Environment Pack

Game-ready scenery and obstacles matching Limebo's handcrafted plush style.

## Contents

- Four 1920×1080 WebP backgrounds: meadow, forest, sunset village, and crystal cave.
- Sixteen transparent 512×512 WebP obstacle files.
- One transparent 2048×2048 obstacle atlas arranged as a 4×4 grid.
- `environment-pack.json` with ground positions, atlas indexes, pivots, collision boxes, hazards, damage, and slow-zone behavior.

## Placement

For a background, multiply `groundY` by the viewport height to obtain Limebo's foot baseline. Obstacle pivots use normalized coordinates and share a baseline at 480 pixels inside each 512×512 cell.

The atlas source rectangle for `atlasIndex` is:

```text
column = atlasIndex % 4
row = floor(atlasIndex / 4)
x = column * 512
y = row * 512
width = 512
height = 512
```

Collision boxes are `[x, y, width, height]` in the individual 512×512 obstacle image.
