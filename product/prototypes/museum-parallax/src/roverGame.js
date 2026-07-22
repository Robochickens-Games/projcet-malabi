/* =====================================================================
   ROVER ROUTE — the Mars room's mini-game.

   Plan a path across the crater plain, then press DRIVE and watch the rover
   follow it. Two things have to go right:

     1. THE ROUTE. Soft sand and sharp rocks stop the rover. You plan the whole
        path first and only then drive it — which is exactly how real rovers
        work, because a command takes many minutes to reach Mars and the rover
        is crawling at a few centimetres a second. The mechanic IS the science.

     2. THE ROCK. Three rocks sit at the far edge. Only one is the iron-rich red
        rock the exhibit wants. The Star Atlas says what to look for; the game
        never labels them. Driving to the wrong one scans it, tells you what it
        actually is, and lets you try again.

   No fail state anywhere: a blocked route or a wrong rock costs a retry and
   teaches something, never progress. (Gameplay principle #4.)

   Self-contained overlay + canvas + RAF, same shape as pteroGame/orbitGame.
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

const COLS = 7
const ROWS = 5

// the three candidate rocks. `right` is the iron-rich one the exhibit needs —
// reddish and rusty, per the Star Atlas. The others are real Martian rock types
// too, so a wrong scan still teaches something true.
const ROCKS = [
  { id: 'basalt', label: 'grey, glassy', color: '#6f6a66', right: false,
    scan: 'Scanned: dark grey <b>basalt</b> — volcanic rock. Not the rusty one.' },
  { id: 'ironRich', label: 'rusty red', color: '#a4472b', right: true,
    scan: 'Scanned: <b>iron-rich red rock</b> — full of iron oxide. That’s rust, and that’s what makes Mars red!' },
  { id: 'dust', label: 'pale, powdery', color: '#c9ad86', right: false,
    scan: 'Scanned: pale, powdery <b>dust crust</b> — light and loose. Not the rusty one.' },
]

let open = false
export const isRoverGameOpen = () => open

let overlay, canvas, ctx, closeBtn, driveBtn, hintEl
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1
let onCloseCb = null, onCompleteCb = null
let won = false

// grid state
let hazards = []          // [{c, r, kind}]
let rockCells = []        // [{c, r, rock}]
let path = []             // [{c, r}] chosen by the player, starting at the rover
let driving = false, driveT = 0, driveIdx = 0
let message = ''

let actx = null
function note(freq, dur = 0.1, type = 'triangle', gain = 0.04, delay = 0) {
  try {
    actx ??= new (window.AudioContext || window.webkitAudioContext)()
    const t0 = actx.currentTime + delay
    const o = actx.createOscillator(); const g = actx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02)
  } catch { /* silent is fine */ }
}

/* Lay out a fresh plain. Hazards are placed at random but never in the rover's
   starting column, and the three rocks always sit in the last column in a
   shuffled order — so a child can't learn "the red one is always in the middle"
   and skip the reasoning. Solvability is guaranteed by construction: every row
   keeps at least one clear cell per column. */
/* Shortest clear route from the rover's start to a target cell, or null.
   The far column may only be ENTERED at the target: every cell there is a rock,
   and driving onto one scans it, so you can't pass through the others.
   Used both to validate a freshly generated board and by the test hook. */
function routeTo(target) {
  const key = (c, r) => `${c},${r}`
  const prev = new Map([[key(0, 2), null]])
  const queue = [{ c: 0, r: 2 }]
  let found = false
  while (queue.length && !found) {
    const cur = queue.shift()
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = cur.c + dc, r = cur.r + dr
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue
      if (prev.has(key(c, r)) || hazardAt(c, r)) continue
      if (c === COLS - 1 && !(c === target.c && r === target.r)) continue
      prev.set(key(c, r), cur)
      if (c === target.c && r === target.r) { found = true; break }
      queue.push({ c, r })
    }
  }
  if (!found) return null
  const route = []
  for (let cur = target; cur; cur = prev.get(key(cur.c, cur.r))) route.unshift({ c: cur.c, r: cur.r })
  return route
}

function scatter() {
  hazards = []
  for (let c = 1; c < COLS - 1; c++) {
    const blocked = new Set()
    const n = 1 + Math.floor(Math.random() * 2)      // 1-2 hazards per column
    while (blocked.size < n) blocked.add(Math.floor(Math.random() * ROWS))
    for (const r of blocked) {
      hazards.push({ c, r, kind: Math.random() < 0.5 ? 'sand' : 'rock' })
    }
  }
  const order = [...ROCKS].sort(() => Math.random() - 0.5)
  const rows = [0, 2, 4]
  rockCells = order.map((rock, i) => ({ c: COLS - 1, r: rows[i], rock }))
}

function buildBoard() {
  /* Scatter, then PROVE every rock is reachable before showing the board.
     Hazards in the second-to-last column can otherwise wall a rock off
     completely — including the right one, which would be a dead end: the child
     could plan forever and never arrive. Rejection sampling is the cheap,
     obviously-correct fix; a board is generated in well under a millisecond and
     the loop has a hard cap so it can never spin. */
  for (let attempt = 0; attempt < 40; attempt++) {
    scatter()
    if (rockCells.every((k) => routeTo(k))) break
    if (attempt === 39) hazards = []   // give up gracefully: an empty plain is still playable
  }
  path = [{ c: 0, r: 2 }]
  driving = false; driveIdx = 0; driveT = 0; won = false
  message = ''
}

const hazardAt = (c, r) => hazards.find((h) => h.c === c && h.r === r)
const rockAt = (c, r) => rockCells.find((k) => k.c === c && k.r === r)

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth; H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// board geometry, recomputed each frame so resizing is free
function geom() {
  const pad = Math.min(W, H) * 0.06
  const availW = W - pad * 2
  const availH = H * 0.62
  const cell = Math.min(availW / COLS, availH / ROWS)
  const bw = cell * COLS, bh = cell * ROWS
  return { cell, x0: (W - bw) / 2, y0: H * 0.20, bw, bh }
}

function cellAt(px, py) {
  const { cell, x0, y0 } = geom()
  const c = Math.floor((px - x0) / cell)
  const r = Math.floor((py - y0) / cell)
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return null
  return { c, r }
}

/* Tapping extends the planned path. You may only step to a neighbour of the
   last cell (no diagonals), and tapping the last cell again takes a step back —
   so a misplaced tap is always undoable without a separate undo button. */
function onTap(e) {
  if (!open || driving || won) return
  const hit = cellAt(e.clientX, e.clientY)
  if (!hit) return
  const last = path[path.length - 1]
  if (hit.c === last.c && hit.r === last.r) {
    if (path.length > 1) { path.pop(); note(300, 0.06, 'triangle', 0.03) }
    return
  }
  const already = path.findIndex((p) => p.c === hit.c && p.r === hit.r)
  if (already >= 0) { path.length = already + 1; note(300, 0.06, 'triangle', 0.03); return }
  const adjacent = Math.abs(hit.c - last.c) + Math.abs(hit.r - last.r) === 1
  if (!adjacent) { message = 'Tap a square right next to the end of your path.'; return }
  path.push(hit)
  message = ''
  note(560 + path.length * 18, 0.05, 'triangle', 0.03)
}

function startDrive() {
  if (driving || won || path.length < 2) {
    if (path.length < 2) message = 'Plan a path first — tap squares to draw the rover’s route.'
    return
  }
  driving = true; driveIdx = 0; driveT = 0; message = ''
}

function step(dt) {
  if (!driving) return
  // rovers are SLOW — driving the plan takes real seconds, on purpose
  driveT += dt * 2.2
  while (driveT >= 1 && driveIdx < path.length - 1) {
    driveT -= 1
    driveIdx++
    const at = path[driveIdx]
    const hz = hazardAt(at.c, at.r)
    if (hz) {
      driving = false
      note(150, 0.3, 'square', 0.05)
      message = hz.kind === 'sand'
        ? 'The wheels sank into <b>soft sand</b>. Plan a route around it and try again.'
        : 'A <b>sharp rock</b> blocked the way. Plan a route around it and try again.'
      path.length = 1; driveIdx = 0; driveT = 0
      return
    }
    const rk = rockAt(at.c, at.r)
    if (rk) {
      driving = false
      if (rk.rock.right) {
        won = true
        ;[660, 880, 1100, 1320].forEach((f, i) => note(f, 0.22, 'triangle', 0.05, i * 0.1))
        message = rk.rock.scan
        if (onCompleteCb) onCompleteCb()
        setTimeout(() => { if (open) closeRoverGame() }, 2600)
      } else {
        note(220, 0.25, 'square', 0.04)
        message = `${rk.rock.scan} Drive back out and try another.`
        path.length = 1; driveIdx = 0; driveT = 0
      }
      return
    }
  }
  if (driveIdx >= path.length - 1) { driving = false; driveT = 0 }
}

function draw() {
  const { cell, x0, y0 } = geom()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#3a2016'; ctx.fillRect(0, 0, W, H)

  // the plain
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const x = x0 + c * cell, y = y0 + r * cell
      ctx.fillStyle = (c + r) % 2 ? '#7d4a33' : '#6f4029'
      ctx.fillRect(x, y, cell, cell)
      ctx.strokeStyle = 'rgba(201,138,99,0.35)'; ctx.lineWidth = 1
      ctx.strokeRect(x, y, cell, cell)
    }
  }

  // hazards
  for (const h of hazards) {
    const x = x0 + h.c * cell + cell / 2, y = y0 + h.r * cell + cell / 2
    if (h.kind === 'sand') {
      ctx.fillStyle = '#c9ad86'
      ctx.beginPath(); ctx.ellipse(x, y, cell * 0.34, cell * 0.22, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(90,60,40,0.5)'; ctx.lineWidth = 2
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.ellipse(x, y + i * cell * 0.1, cell * 0.22, cell * 0.07, 0, 0, Math.PI); ctx.stroke()
      }
    } else {
      ctx.fillStyle = '#4e433c'
      ctx.beginPath()
      ctx.moveTo(x - cell * 0.3, y + cell * 0.22); ctx.lineTo(x - cell * 0.1, y - cell * 0.26)
      ctx.lineTo(x + cell * 0.16, y - cell * 0.08); ctx.lineTo(x + cell * 0.3, y + cell * 0.22)
      ctx.closePath(); ctx.fill()
    }
  }

  // the three candidate rocks — drawn by their LOOK, never labelled by name
  for (const k of rockCells) {
    const x = x0 + k.c * cell + cell / 2, y = y0 + k.r * cell + cell / 2
    ctx.fillStyle = k.rock.color
    ctx.beginPath(); ctx.ellipse(x, y, cell * 0.3, cell * 0.24, 0, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.beginPath(); ctx.ellipse(x - cell * 0.09, y - cell * 0.08, cell * 0.09, cell * 0.06, 0, 0, Math.PI * 2); ctx.fill()
  }

  // the planned path
  if (path.length > 1) {
    ctx.strokeStyle = 'rgba(255,217,138,0.85)'; ctx.lineWidth = Math.max(4, cell * 0.09)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'
    ctx.beginPath()
    path.forEach((p, i) => {
      const x = x0 + p.c * cell + cell / 2, y = y0 + p.r * cell + cell / 2
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    })
    ctx.stroke()
  }
  // the next tappable squares, so it's always obvious where you may go
  if (!driving && !won) {
    const last = path[path.length - 1]
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = last.c + dc, r = last.r + dr
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue
      const x = x0 + c * cell + cell / 2, y = y0 + r * cell + cell / 2
      ctx.strokeStyle = 'rgba(255,217,138,0.5)'; ctx.lineWidth = 2.5
      ctx.setLineDash([5, 5])
      ctx.beginPath(); ctx.arc(x, y, cell * 0.33, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // the rover
  const from = path[Math.min(driveIdx, path.length - 1)]
  const to = path[Math.min(driveIdx + 1, path.length - 1)]
  const t = driving ? Math.min(1, driveT) : 0
  const rx = x0 + (from.c + (to.c - from.c) * t) * cell + cell / 2
  const ry = y0 + (from.r + (to.r - from.r) * t) * cell + cell / 2
  const s = cell * 0.34
  ctx.fillStyle = '#e8d5b8'
  ctx.fillRect(rx - s * 0.7, ry - s * 0.45, s * 1.4, s * 0.9)
  ctx.fillStyle = '#4e433c'
  for (const dx of [-0.55, 0.55]) {
    for (const dy of [-0.6, 0.6]) ctx.fillRect(rx + dx * s - s * 0.16, ry + dy * s - s * 0.16, s * 0.32, s * 0.32)
  }
  ctx.fillStyle = '#7fb6c9'
  ctx.fillRect(rx - s * 0.16, ry - s * 1.0, s * 0.32, s * 0.5)

  // copy
  ctx.textAlign = 'center'
  ctx.font = `600 ${Math.min(19, W * 0.028)}px ${SERIF}`
  ctx.fillStyle = '#f4e6c8'
  const line = message.replace(/<\/?b>/g, '')
  ctx.fillText(line || (won ? '' : 'Tap squares to plan a route to the rusty red rock, then DRIVE.'),
    W / 2, y0 + ROWS * cell + Math.min(52, H * 0.07))
}

function frame(t) {
  if (!open) return
  const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016)
  lastT = t
  step(dt); draw()
  raf = requestAnimationFrame(frame)
}

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #rover-game { position: fixed; inset: 0; z-index: 200; background: #3a2016;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #rover-game.on { display: block; }
    #rover-game canvas { width: 100%; height: 100%; display: block; cursor: pointer; }
    #rover-game .rg-close { position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      z-index: 2; background: rgba(74,42,29,0.9); color: #f4e6c8; border: 1.5px solid rgba(232,169,72,0.6);
      font: 600 14px ${SERIF}; padding: 9px 18px; border-radius: 999px; cursor: pointer; min-height: 40px; }
    #rover-game .rg-drive { position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
      z-index: 2; background: #e8a948; color: #1b110a; border: none;
      font: 700 19px ${SERIF}; letter-spacing: .1em; padding: 14px 46px; border-radius: 999px;
      cursor: pointer; min-height: 54px; box-shadow: 0 6px 20px rgba(0,0,0,.45); }
    #rover-game .rg-drive:active { transform: translateX(-50%) scale(.96); }
    #rover-game .rg-hint { position: absolute; top: 62px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: rgba(244,230,200,0.7); font: 400 13px ${SERIF}; text-align: center;
      pointer-events: none; width: 92%; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'rover-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'rg-close'
  closeBtn.textContent = '‹ Back to the rover bay'
  driveBtn = document.createElement('button')
  driveBtn.className = 'rg-drive'
  driveBtn.textContent = 'DRIVE ▸'
  hintEl = document.createElement('div')
  hintEl.className = 'rg-hint'
  hintEl.textContent = 'Soft sand and sharp rocks stop the rover · tap the last square again to undo'
  overlay.append(canvas, closeBtn, driveBtn, hintEl)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', onTap)
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeRoverGame() })
  driveBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  driveBtn.addEventListener('click', (e) => { e.stopPropagation(); startDrive() })
  window.addEventListener('keydown', (e) => {
    if (!open) return
    if (e.key === 'Escape') closeRoverGame()
    if (e.key === 'Enter' || e.key === ' ') startDrive()
  })
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openRoverGame(opts = {}) {
  if (open) return
  ensureDom()
  onCompleteCb = opts.onComplete || null
  onCloseCb = opts.onClose || null
  open = true
  overlay.classList.add('on')
  buildBoard(); layout(); lastT = 0
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(frame)
}

export function closeRoverGame() {
  if (!open) return
  open = false
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

/* Test hooks. __roverDriveTo(which) plans a clear route to a named rock and
   drives it, so both the right-rock and wrong-rock paths are checkable
   headlessly without simulating taps across a randomised board. */
export function __roverPlanTo(which) {
  if (!open) return false
  const target = rockCells.find((k) => (which === 'right' ? k.rock.right : !k.rock.right))
  const route = target && routeTo(target)
  if (!route) return false
  path = route
  return true
}
export function __roverDrive() { startDrive() }
// true while the rover is mid-route — tests wait on this instead of the clock
export function __roverDriving() { return driving }
// regenerate the plain — lets a test sample many boards for reachability
export function __roverReroll() { if (open) buildBoard() }
export function __roverWon() { return won }
