# Limebo Game Pack

This sidecar pack adds 18 game-ready animations without changing Limebo's Codex v2 pet atlas.

## Files

- `limebo-actions.webp`: combat, reactions, celebration, dance, and sleep.
- `limebo-emotes.webp`: expressive and special-action animations.
- `game-pack.json`: engine-neutral slicing, timing, loop, pivot, collision, and animation-event metadata.

## Import

Each atlas is an 8 by 9 grid. Every cell is 192 by 208 pixels. For a state at `row`, frame `i` uses this source rectangle:

```text
x = i * 192
y = row * 208
width = 192
height = 208
```

Use the normalized pivot `(0.5, 0.94)` so Limebo's feet remain grounded. Empty cells after `frames` must not be played.

The manifest is intentionally engine-neutral: Unity can slice it as a Multiple sprite texture, Godot can use an `AtlasTexture`/`SpriteFrames`, and Phaser can generate frame rectangles with the formula above.
