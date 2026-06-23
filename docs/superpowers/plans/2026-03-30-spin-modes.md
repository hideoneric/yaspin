# Spin Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3D Roulette and Plinko as two additional spin modes alongside the existing wheel, switchable via tabs above the wheel.

**Architecture:** All changes are inside the single `index.html` file. The mode switcher shows/hides the wheel-roulette panel vs plinko panel. Roulette reuses the existing SVG wheel with a 3D CSS perspective tilt + a ball orbit animation. Plinko renders a separate SVG board with a simulated ball-drop path.

**Tech Stack:** Vanilla JS, SVG, CSS transforms/animations, `requestAnimationFrame`, `setTimeout`

---

## File

- Modify: `C:\Users\erik_\Desktop\Claude\Yaspin\index.html` (all tasks)

---

### Task 1: Mode Switcher — HTML + CSS

**Files:**
- Modify: `index.html` (CSS `<style>` block + HTML `.wheel-panel`)

- [ ] **Step 1: Add tab CSS** — inside the `<style>` block, before the closing `</style>`:

```css
/* ── MODE TABS ── */
#mode-tabs {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.mode-tab {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 9px;
  letter-spacing: 2px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.15s;
}
.mode-tab:hover { border-color: var(--border-md); color: var(--text); }
.mode-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.mode-tab:disabled { opacity: 0.35; cursor: not-allowed; }
```

- [ ] **Step 2: Add tab HTML** — inside `.wheel-panel`, as the very first child (before `.wheel-wrapper`):

```html
<div id="mode-tabs">
  <button class="mode-tab active" data-mode="wheel">Wheel</button>
  <button class="mode-tab" data-mode="roulette">Roulette</button>
  <button class="mode-tab" data-mode="plinko">Plinko</button>
</div>
```

- [ ] **Step 3: Verify** — open `http://localhost:8080`, confirm three tabs appear above the wheel. Clicking them does nothing yet (JS not wired).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add mode switcher tabs (UI only)"
```

---

### Task 2: Mode Switcher — JS + Panel Show/Hide

**Files:**
- Modify: `index.html` (HTML structure + `<script>` block)

- [ ] **Step 1: Wrap existing wheel wrapper** — in the HTML, wrap the `.wheel-wrapper` div in a new container:

```html
<div id="wheel-roulette-panel">
  <div class="wheel-wrapper">
    <div class="wheel-pointer"></div>
    <svg id="wheel-svg" viewBox="0 0 360 360"></svg>
  </div>
</div>
```

- [ ] **Step 2: Add plinko panel** — directly after `#wheel-roulette-panel`, still inside `.wheel-panel`:

```html
<div id="plinko-panel" style="display:none; width:100%; flex:1; min-height:0;">
  <svg id="plinko-svg" viewBox="0 0 300 500" width="100%" height="100%"
       style="display:block;"></svg>
</div>
```

- [ ] **Step 3: Add mode JS** — in `<script>`, near the top (after `THEMES` and before `SKINS`):

```js
// ── MODE ──
let activeMode = 'wheel';
try { const m = localStorage.getItem('yaspin_mode'); if (m) activeMode = m; } catch(_) {}

function setMode(mode) {
  activeMode = mode;
  try { localStorage.setItem('yaspin_mode', mode); } catch(_) {}

  document.querySelectorAll('.mode-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.mode === mode));

  document.getElementById('wheel-roulette-panel').style.display =
    mode === 'plinko' ? 'none' : 'flex';
  document.getElementById('plinko-panel').style.display =
    mode === 'plinko' ? 'flex' : 'none';

  if (mode === 'plinko') renderPlinko();
  else renderWheel();

  // Roulette tilt
  const wrPanel = document.getElementById('wheel-roulette-panel');
  wrPanel.classList.toggle('roulette-active', mode === 'roulette');
}

document.getElementById('mode-tabs').addEventListener('click', e => {
  const tab = e.target.closest('.mode-tab');
  if (tab && !isSpinning) setMode(tab.dataset.mode);
});
```

- [ ] **Step 4: Add `#wheel-roulette-panel` CSS** — in `<style>`:

```css
#wheel-roulette-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
}
```

- [ ] **Step 5: Call `setMode` on init** — replace the existing init block:

```js
applyTheme(activeTheme);
setMode(activeMode);   // ← add this line
renderSidebar();
updateSpinBtn();
```

Remove the bare `renderWheel()` call that was previously here — `setMode` now calls it.

- [ ] **Step 6: Disable tabs while spinning** — in the existing `spin()` function, at the start after `spinBtn.disabled = true`, add:

```js
document.querySelectorAll('.mode-tab').forEach(t => t.disabled = true);
```

And in `hideResult()` before `updateSpinBtn()`, add:

```js
document.querySelectorAll('.mode-tab').forEach(t => t.disabled = false);
```

Also add it in the `transitionend` handler (wheel/roulette path) after `isSpinning = false`:

```js
document.querySelectorAll('.mode-tab').forEach(t => t.disabled = false);
```

- [ ] **Step 7: Verify** — tabs switch between wheel panel (SVG visible) and plinko panel (empty for now). Switching back shows the wheel. Mode persists on refresh.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat: mode switcher JS, panel show/hide, localStorage persistence"
```

---

### Task 3: 3D Roulette — Perspective Tilt

**Files:**
- Modify: `index.html` (`<style>` block)

- [ ] **Step 1: Add perspective CSS** — in `<style>`:

```css
/* ── ROULETTE 3D ── */
#wheel-roulette-panel.roulette-active {
  perspective: 500px;
  perspective-origin: 50% 5%;
}
#wheel-roulette-panel.roulette-active .wheel-wrapper {
  transform: rotateX(52deg);
}
#wheel-roulette-panel.roulette-active .wheel-pointer {
  /* pointer floats above the tilted wheel — keep it flat */
  transform: translateX(-50%) rotateX(-52deg);
}
```

- [ ] **Step 2: Verify** — switch to Roulette tab. The wheel should appear tilted like a roulette table viewed from above. The pointer should stay flat/readable. Switch back to Wheel — normal flat view returns.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: 3D roulette perspective tilt via CSS"
```

---

### Task 4: 3D Roulette — Ball Animation

**Files:**
- Modify: `index.html` (HTML, `<style>`, `<script>`)

- [ ] **Step 1: Add ball HTML** — inside `.wheel-wrapper`, after `#wheel-svg`:

```html
<div id="roulette-ball"></div>
```

- [ ] **Step 2: Add ball CSS** — in `<style>`:

```css
#roulette-ball {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text);
  box-shadow: 0 0 6px var(--glow), 0 0 2px #fff;
  top: 50%;
  left: 50%;
  margin: -5px 0 0 -5px;
  transform-origin: 0 0;
  display: none;
  z-index: 5;
  pointer-events: none;
}
@keyframes rouletteOrbit {
  from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
}
```

- [ ] **Step 3: Add roulette ball JS** — in `<script>`, after the `stopSpinTracking` function:

```js
// ── ROULETTE BALL ──
const rouletteBall = document.getElementById('roulette-ball');

function startRouletteOrbit() {
  // Orbit radius = ~88% of the wrapper's half-width (near the rim)
  // The wrapper is CSS-sized; we use a percentage-based translateX
  rouletteBall.style.setProperty('--orbit-r', '138px');
  rouletteBall.style.display = 'block';
  rouletteBall.style.animation = 'none';
  rouletteBall.style.transform = 'rotate(0deg) translateX(138px) rotate(0deg)';

  // Force reflow to restart animation
  void rouletteBall.offsetWidth;

  // Spin starts fast and slows — use a single long animation with ease-out
  rouletteBall.style.animation =
    'rouletteOrbit 4s cubic-bezier(0.17, 0.67, 0.12, 1.0) forwards';
}

function stopRouletteOrbit() {
  rouletteBall.style.animation = 'none';
  // Drop inward: translate toward center over 0.3s
  rouletteBall.style.transition = 'transform 0.3s ease-in';
  rouletteBall.style.transform = 'rotate(0deg) translateX(60px) rotate(0deg)';
  setTimeout(() => {
    rouletteBall.style.display = 'none';
    rouletteBall.style.transition = '';
    rouletteBall.style.transform = '';
  }, 350);
}
```

- [ ] **Step 4: Wire ball into `spin()`** — in the `spin()` function, find the line `startSpinTracking(activeSkins)` and add below it:

```js
if (activeMode === 'roulette') startRouletteOrbit();
```

And in the `transitionend` handler, before `stopSpinTracking()`:

```js
if (activeMode === 'roulette') stopRouletteOrbit();
```

- [ ] **Step 5: Fix orbit count** — the ball needs to orbit multiple times (matching the wheel's 5-8 full rotations). Replace the `rouletteOrbit` keyframes animation call with an iteration approach. Update `startRouletteOrbit()`:

```js
function startRouletteOrbit() {
  rouletteBall.style.setProperty('--orbit-r', '138px');
  rouletteBall.style.display = 'block';
  rouletteBall.style.animation = 'none';
  void rouletteBall.offsetWidth;
  // 6 full orbits in 4s matching wheel spin duration
  rouletteBall.style.animation =
    'rouletteOrbit 0.65s linear 0s 6 forwards, rouletteOrbit 1.7s ease-out 3.9s 1 forwards';
}
```

Note: this gives fast uniform orbits for 3.9s, then one slow final orbit over 1.7s as the wheel decelerates. Total ~5.6s but `transitionend` fires at 4s and `stopRouletteOrbit` takes over.

- [ ] **Step 6: Verify** — switch to Roulette, click SPIN. Ball orbits the rim while wheel spins, then drops inward when the winner is selected. Result card appears.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: roulette ball orbit + drop animation"
```

---

### Task 5: Plinko — Board Rendering

**Files:**
- Modify: `index.html` (`<style>`, `<script>`)

- [ ] **Step 1: Add plinko CSS** — in `<style>`:

```css
/* ── PLINKO ── */
#plinko-panel {
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
}
#plinko-svg {
  max-height: 100%;
  max-width: 100%;
}
```

- [ ] **Step 2: Add `renderPlinko()` function** — in `<script>`, after `renderWheel()`:

```js
function renderPlinko() {
  const svg = document.getElementById('plinko-svg');
  svg.innerHTML = '';
  const activeSkins = SKINS.filter(s => enabled.has(s.num));
  if (!activeSkins.length) return;

  const W = 300, H = 500;
  const SLOT_H = 70;
  const PEG_ROWS = 8, PEG_COLS = 7;
  const pegStartY = 60, pegEndY = H - SLOT_H - 30;
  const pegSpacingY = (pegEndY - pegStartY) / (PEG_ROWS - 1);
  const pegSpacingX = W / (PEG_COLS + 1);
  const slotW = W / activeSkins.length;
  const acc = themeColor('--accent');
  const seg1 = themeColor('--seg1');
  const seg2 = themeColor('--seg2');
  const borderMd = themeColor('--border-md');
  const textColor = themeColor('--text');

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    for (const [k,v] of Object.entries(attrs)) e.setAttribute(k,v);
    return e;
  }

  // defs block first (clipPaths added below)
  const defs = document.createElementNS(SVG_NS, 'defs');
  svg.appendChild(defs);

  // Board background
  svg.appendChild(el('rect', { x:0, y:0, width:W, height:H, fill:seg2, rx:6 }));

  // Drop chute at top center
  svg.appendChild(el('rect', { x: W/2-10, y:4, width:20, height:16, rx:3,
    fill: seg1, stroke: acc, 'stroke-width':'1' }));
  // Arrow down
  const arrow = document.createElementNS(SVG_NS, 'polygon');
  arrow.setAttribute('points', `${W/2-5},20 ${W/2+5},20 ${W/2},28`);
  arrow.setAttribute('fill', acc);
  svg.appendChild(arrow);

  // Pegs (staggered)
  for (let row = 0; row < PEG_ROWS; row++) {
    const cols = row % 2 === 0 ? PEG_COLS : PEG_COLS - 1;
    const offsetX = row % 2 === 0 ? pegSpacingX : pegSpacingX * 1.5;
    const y = pegStartY + row * pegSpacingY;
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * pegSpacingX;
      svg.appendChild(el('circle', { cx: x, cy: y, r: 4,
        fill: acc, opacity: '0.85' }));
    }
  }

  // Slots at bottom
  const slotY = H - SLOT_H;
  activeSkins.forEach((skin, i) => {
    const x = i * slotW;
    const fill = i % 2 === 0 ? seg1 : seg2;
    svg.appendChild(el('rect', {
      id: `plinko-slot-${i}`,
      x, y: slotY, width: slotW, height: SLOT_H,
      fill, stroke: borderMd, 'stroke-width': '0.5', rx: 2,
    }));
    // Thumbnail clipped to slot
    const clipId = `pslot-clip-${i}`;
    // defs already created above
    const cp = el('clipPath', { id: clipId });
    cp.appendChild(el('rect', { x, y: slotY + 2, width: slotW, height: SLOT_H - 2, rx: 2 }));
    defs.appendChild(cp);
    svg.appendChild(el('image', {
      href: thumbUrl(skin.num),
      x, y: slotY + 2,
      width: slotW, height: SLOT_H - 2,
      preserveAspectRatio: 'xMidYMid slice',
      'clip-path': `url(#${clipId})`,
      opacity: '0.55',
    }));
  });

  // Plinko ball (hidden initially)
  svg.appendChild(el('circle', {
    id: 'plinko-ball',
    cx: W/2, cy: 20, r: 7,
    fill: textColor, opacity: '0.95',
    style: 'display:none',
  }));
}
```

- [ ] **Step 3: Call `renderPlinko()` on skin change** — in `afterEnabledChange()`, after `if (!isSpinning) renderWheel()`:

```js
if (!isSpinning) renderWheel();
if (!isSpinning && activeMode === 'plinko') renderPlinko();
```

- [ ] **Step 4: Verify** — switch to Plinko tab. A board appears with pegs, a drop chute at top, and skin slots at the bottom. Toggle skins in the sidebar — slots update. The board fills the available panel height.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: plinko board rendering — pegs, slots, thumbnails"
```

---

### Task 6: Plinko — Ball Drop + Path Animation

**Files:**
- Modify: `index.html` (`<script>`)

- [ ] **Step 1: Add path calculation function** — in `<script>`, after `renderPlinko()`:

```js
function calcPlinkoPath(winnerIdx, numSlots) {
  const W = 300;
  const SLOT_H = 70;
  const PEG_ROWS = 8;
  const pegStartY = 60;
  const pegEndY = 500 - SLOT_H - 30;
  const pegSpacingY = (pegEndY - pegStartY) / (PEG_ROWS - 1);
  const slotW = W / numSlots;
  const winnerX = slotW * (winnerIdx + 0.5);
  const margin = slotW * 0.5;

  const waypoints = [];
  let x = W / 2;

  for (let row = 0; row < PEG_ROWS; row++) {
    const remaining = PEG_ROWS - 1 - row;
    const needed = winnerX - x;
    // Bias toward winner, with random jitter
    const bias = remaining > 0 ? needed / (remaining + 1) : needed;
    const jitter = (Math.random() - 0.5) * slotW * 0.8;
    x = Math.max(margin, Math.min(W - margin, x + bias + jitter));
    const y = pegStartY + row * pegSpacingY;
    waypoints.push({ x, y, pause: 150 });
  }

  // Final landing in slot
  waypoints.push({ x: winnerX, y: 500 - SLOT_H + 10, pause: 0 });
  return waypoints;
}
```

- [ ] **Step 2: Add `runPlinko()` function** — directly after `calcPlinkoPath`:

```js
function runPlinko(winner) {
  const activeSkins = SKINS.filter(s => enabled.has(s.num));
  const winnerIdx = activeSkins.findIndex(s => s.num === winner.num);
  const numSlots = activeSkins.length;
  const W = 300;

  renderPlinko(); // ensure fresh board

  const svg = document.getElementById('plinko-svg');
  const ball = svg.querySelector('#plinko-ball');
  ball.style.display = '';

  const waypoints = calcPlinkoPath(winnerIdx, numSlots);
  let wpIdx = 0;

  function step() {
    if (wpIdx >= waypoints.length) {
      // Flash winning slot
      const slot = svg.querySelector(`#plinko-slot-${winnerIdx}`);
      if (slot) {
        slot.setAttribute('stroke', themeColor('--accent'));
        slot.setAttribute('stroke-width', '2');
        slot.setAttribute('fill', themeColor('--accent') + '44');
      }
      setTimeout(() => {
        ball.style.display = 'none';
        isSpinning = false;
        document.querySelectorAll('.mode-tab').forEach(t => t.disabled = false);
        updateSpinBtn();   // re-enables SPIN button
        showResult(winner);
      }, 400);
      return;
    }

    const wp = waypoints[wpIdx++];
    ball.setAttribute('cx', wp.x);
    ball.setAttribute('cy', wp.y);

    // Update preview to column the ball is over
    const colIdx = Math.max(0, Math.min(
      Math.floor(wp.x / (W / numSlots)),
      numSlots - 1
    ));
    updatePreview(activeSkins[colIdx]);

    setTimeout(step, wp.pause || 120);
  }

  step();
}
```

- [ ] **Step 3: Wire plinko into `spin()`** — find the line `isSpinning = true;` in `spin()`. After it, add a plinko branch. The function should look like:

```js
function spin() {
  if (isSpinning) return;
  const activeSkins = SKINS.filter(s => enabled.has(s.num));
  if (!activeSkins.length) return;

  isSpinning = true;
  spinBtn.disabled = true;
  document.querySelectorAll('.mode-tab').forEach(t => t.disabled = true);

  const winnerIdx = Math.floor(Math.random() * activeSkins.length);
  const winner    = activeSkins[winnerIdx];

  // ── PLINKO PATH ──
  if (activeMode === 'plinko') {
    runPlinko(winner);
    return;
  }

  // ── WHEEL / ROULETTE ──
  const segAngle  = 360 / activeSkins.length;
  const winnerMid = winnerIdx * segAngle + segAngle / 2;
  const extraSpins= (5 + Math.floor(Math.random() * 3)) * 360;
  const toWinner  = ((360 - winnerMid - currentRotation % 360) + 360) % 360;
  const target    = currentRotation + extraSpins + toWinner;

  wheelSvg.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 1.0)';
  wheelSvg.style.transform  = `rotate(${target}deg)`;
  currentRotation = target;

  startSpinTracking(activeSkins);
  if (activeMode === 'roulette') startRouletteOrbit();

  wheelSvg.addEventListener('transitionend', () => {
    if (activeMode === 'roulette') stopRouletteOrbit();
    stopSpinTracking();
    isSpinning = false;
    document.querySelectorAll('.mode-tab').forEach(t => t.disabled = false);
    showResult(winner);
  }, { once: true });
}
```

- [ ] **Step 4: Verify plinko end-to-end**
  1. Switch to Plinko tab
  2. Click SPIN — ball appears at top, bounces through pegs, reaches winner slot
  3. Winner slot flashes
  4. Result overlay appears with correct skin
  5. "Spin Again" closes overlay, tabs re-enable
  6. Toggle skins off and spin again — fewer slots, ball still reaches winner

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: plinko ball path, drop animation, preview tracking, result"
```

---

### Task 7: Polish + Edge Cases

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Handle `afterEnabledChange` correctly** — verify the existing guard reads:

```js
if (!isSpinning) renderWheel();
if (!isSpinning && activeMode === 'plinko') renderPlinko();
```

Also update `renderWheel()` calls in `applyTheme()` to also re-render plinko if active:

```js
function applyTheme(key) {
  // ... existing code ...
  renderWheel();
  if (activeMode === 'plinko') renderPlinko();  // ← add this line
}
```

- [ ] **Step 3: Roulette orbit radius scales with wheel size** — the orbit radius is hardcoded as `138px`. This works when the wheel is ~280px wide. Compute it dynamically in `startRouletteOrbit()`:

```js
function startRouletteOrbit() {
  const r = Math.round(wheelSvg.getBoundingClientRect().width * 0.49);
  rouletteBall.style.setProperty('--orbit-r', `${r}px`);
  rouletteBall.style.display = 'block';
  rouletteBall.style.animation = 'none';
  void rouletteBall.offsetWidth;
  rouletteBall.style.animation =
    'rouletteOrbit 0.65s linear 0s 6 forwards, rouletteOrbit 1.7s ease-out 3.9s 1 forwards';
}
```

- [ ] **Step 4: Final verification checklist**
  - [ ] Wheel mode: spins normally, hover preview works, result overlay appears
  - [ ] Roulette mode: wheel tilts 3D, ball orbits during spin, drops on finish, result appears
  - [ ] Plinko mode: board renders, ball drops through pegs, lands in winner, result appears
  - [ ] Switching modes mid-session: each mode renders correctly
  - [ ] Toggling skins: plinko re-renders with correct slot count
  - [ ] Theme change: all three modes respect the new theme colors
  - [ ] Mode persists on page refresh
  - [ ] 1 skin enabled (edge case): all three modes handle gracefully

- [ ] **Step 5: Final commit**

```bash
git add index.html
git commit -m "feat: spin modes polish — roulette orbit scaling, plinko theme sync"
```
