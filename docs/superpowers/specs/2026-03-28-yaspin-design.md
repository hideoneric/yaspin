# Yaspin — Design Spec
_Date: 2026-03-28_

## Context

The user wants a browser-based tool to randomly pick a Yasuo skin using a spinning wheel. They want to be able to toggle which skins are included (i.e., only their owned skins) and see preview artwork. The output is a single HTML file that can be double-clicked to open — no server or build step required.

---

## Overview

A single `index.html` file. Split-panel layout: spinning wheel on the left, skin toggle sidebar on the right. After the wheel stops, a splash art reveal overlays the wheel area showing the selected skin's name and full artwork. Skin toggle state persists in `localStorage`.

---

## Visual Style

- **Color palette:** Deep dark background (`#130326` → `#0b0b22` → `#001428` gradient), muted purple accents (`#7a5aaa`), soft lavender text (`#d8c8f0`)
- **No saturated neons** — glows and shadows use low-opacity purple
- **Typography:** `Segoe UI`, wide letter-spacing, lightweight headings
- **Header:** Centered `YASPIN` title with subtitle `THE UNFORGIVEN • SKIN SELECTOR`

---

## Layout

Two-panel flex layout inside a full-viewport body:

### Left — Wheel Panel
- SVG spinning wheel, dynamically sized segments based on number of active skins
- Each segment alternates between two dark fills, separated by `#7a5aaa` strokes
- Skin name labels rendered as SVG `<text>` elements rotated to sit along each segment
- Small center circle with "YASUO" label
- Downward-pointing triangle pointer above the wheel (CSS triangle, purple)
- **SPIN** button below the wheel

### Right — Skin Sidebar (220px wide)
- Header row: "MY SKINS" label + "All / None" toggle button
- Scrollable list of all Yasuo skins
- Each row: loading-screen thumbnail (36×36, from Data Dragon) + skin name + active/inactive dot indicator
- Clicking a row toggles it in/out of the wheel
- Active rows have a subtle purple border and background; inactive rows are dimmed to 40% opacity

---

## Spin Behavior

1. User clicks **SPIN**
2. Wheel rotates with a CSS/JS animation — eases in fast, decelerates to a smooth stop over ~4 seconds
3. Final rotation is calculated so the pointer lands on the pre-selected random skin (pick random skin first, calculate the target angle, then animate to it)
4. After spin completes, the result card fades in over the wheel area:
   - Skin name in large spaced caps at the top
   - Full splash art image (`ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_{num}.jpg`)
   - **SPIN AGAIN** button to dismiss and return to the wheel

---

## Skin Data

Sourced from Riot's Data Dragon CDN. Skin list hardcoded in the HTML (no API call needed — Yasuo's skin list is stable and manually curated). Each skin entry:

```js
{ num: 0, name: "Default Yasuo" },
{ num: 1, name: "High Noon Yasuo" },
{ num: 2, name: "PROJECT: Yasuo" },
{ num: 3, name: "Blood Moon Yasuo" },
{ num: 4, name: "Nightbringer Yasuo" },
{ num: 5, name: "True Damage Yasuo" },
{ num: 6, name: "Odyssey Yasuo" },
{ num: 7, name: "Prestige True Damage Yasuo" },
{ num: 8, name: "Battle Academia Yasuo" },
{ num: 9, name: "Conqueror Yasuo" },
{ num: 10, name: "Infernal Yasuo" },
{ num: 11, name: "Sentinel Yasuo" },
{ num: 12, name: "Inkshadow Yasuo" },
{ num: 13, name: "Prestige Nightbringer Yasuo" },
{ num: 14, name: "Immortalized Legend Yasuo" },
```

Image URLs:
- Thumbnail: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/Yasuo_{num}.jpg`
- Splash art: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_{num}.jpg`

---

## State Persistence

- `localStorage` key: `yaspin_enabled_skins`
- Value: JSON array of enabled skin `num` values, e.g. `[0, 1, 3, 5]`
- On page load: read from localStorage and apply; if absent, default to all skins enabled
- On toggle: update localStorage immediately

---

## Edge Cases

- If the user disables all skins, show a warning inside the wheel ("Select at least one skin") and disable the SPIN button
- If only one skin is active, the wheel shows a single full-circle segment; spinning still works (always lands on it)

---

## File Structure

```
index.html   ← single self-contained file, all CSS and JS inline
```

---

## Verification

1. Open `index.html` directly in a browser (no server)
2. Click SPIN — wheel animates and pointer lands on a skin
3. Result card appears with correct skin name and splash art
4. Click SPIN AGAIN — result card disappears, wheel returns to resting state
5. Toggle skins in sidebar — wheel segments update dynamically
6. Disable a skin, spin — disabled skin never appears as result
7. Reload page — sidebar toggle state is preserved from localStorage
8. Disable all skins — SPIN button is disabled and warning is shown
