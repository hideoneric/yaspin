# Spin Modes Design — 2026-03-30

## Overview

Add two new spin modes (3D Roulette and Plinko) to Yaspin alongside the existing wheel. A tab switcher above the wheel lets the user move between all three modes. The sidebar, theme system, preview panel, and result overlay are shared across all modes.

---

## Mode Switcher

- Three tabs rendered above the wheel panel: **Wheel · Roulette · Plinko**
- Active tab styled with theme `--accent` color; inactive tabs use `--border-md` border + `--text-dim` text
- Switching tabs swaps the center panel content only (wheel wrapper ↔ roulette board ↔ plinko board)
- Sidebar, `#skin-preview`, SPIN button, and `#result-card` overlay remain unchanged
- Active mode persisted to `localStorage` key `yaspin_mode`
- The SPIN button triggers whichever mode is currently active

### HTML structure addition
```html
<div id="mode-tabs">
  <button class="mode-tab active" data-mode="wheel">Wheel</button>
  <button class="mode-tab" data-mode="roulette">Roulette</button>
  <button class="mode-tab" data-mode="plinko">Plinko</button>
</div>
```
Sits inside `.wheel-panel`, above the wheel wrapper div.

---

## Mode 1 — 3D Roulette

### Visual
- A `<div class="roulette-perspective">` wraps the existing `#wheel-svg`
- CSS: `perspective: 500px; perspective-origin: 50% 10%`
- Inner wrapper: `transform: rotateX(52deg)` — gives top-down roulette table look
- The SVG `viewBox` and all segment rendering stay identical; `renderWheel()` is reused

### Ball Animation
- A `<div id="roulette-ball">` sits as a sibling to the perspective wrapper, positioned absolute over the wheel
- Ball: 10px circle, theme accent color, `border-radius: 50%`, subtle `box-shadow` glow
- During spin: ball orbits the rim via CSS `@keyframes rouletteBall` that animates `transform: rotate(Ndeg) translateX(rimRadius)` — creating an elliptical orbit effect when viewed through the perspective transform
- Ball starts fast (matches wheel acceleration) and decelerates using a matching `cubic-bezier`
- Duration matches the 4s spin transition
- On `transitionend`: ball plays a short "drop" animation — translates inward ~20px toward wheel center over 0.3s — then hides
- Ball is shown on spin start, hidden otherwise

### Integration
- `spin()` branches on `activeMode === 'roulette'`: sets wheel CSS transition as normal, additionally triggers ball animation
- `stopSpinTracking()` and `showResult()` unchanged

---

## Mode 2 — Plinko

### Board Structure (SVG, fills available panel height)
- `<svg id="plinko-svg">` replaces the wheel wrapper in the center panel
- `viewBox="0 0 300 500"` (fixed internal coordinate space); `width: 100%; height: 100%` so it scales to fill the panel
- **Drop slot**: small rounded rect at top center, arrow pointing down
- **Pegs**: staggered grid, ~6 columns × 8 rows, evenly spaced. Peg radius = 4px, styled with `--accent` fill
- **Slots**: row of rects at the bottom, one per enabled skin. Each slot shows:
  - Skin thumbnail (`<image>` element, cropped to slot width)
  - No label (too narrow) — preview panel handles identification
- Slot count = `activeSkins.length`; slot width = `boardWidth / activeSkins.length`

### Ball Physics (simulated, not real physics)
- Winner is chosen randomly upfront (same `Math.random()` logic)
- A path from the drop point to the winning slot is pre-calculated:
  - For each peg row, determine whether ball goes left or right (randomly, but biased to reach winning slot column)
  - Store path as array of `{x, y}` waypoints
- Ball animates through waypoints using `requestAnimationFrame`:
  - Constant fall speed (~60px per frame step scaled to board height)
  - Brief 150ms pause when passing near each peg (bounce visual) — 8 rows × 150ms = ~1.2s bouncing, total animation ~2.5s
  - Ball radius 6px, color `--accent`
- On reaching final slot: slot flashes (border animates to `--accent`, opacity pulse), then result overlay shows after 400ms

### Integration
- `spin()` branches on `activeMode === 'plinko'`: skips wheel rotation entirely, calls `runPlinko(winner)`
- `runPlinko(winner)` handles path generation + ball animation + calls `showResult()` on completion
- `renderPlinko()` called whenever active skins change (like `renderWheel()`) — redraws slots

---

## Shared Concerns

### renderWheel() theming
- All three modes call `themeColor()` for colors — no changes needed to the theme system

### Mode switching mid-spin
- Tabs are disabled (`pointer-events: none; opacity: 0.4`) while `isSpinning === true`

### Preview panel during Plinko
- During the drop, `updatePreview()` is called each time the ball passes a new column — showing the skin in that column as a teaser
- On landing, preview shows the winner (same as hover/spin behavior)

---

## File
All changes in `C:\Users\erik_\Desktop\Claude\Yaspin\index.html` — single file, inline CSS + JS.
