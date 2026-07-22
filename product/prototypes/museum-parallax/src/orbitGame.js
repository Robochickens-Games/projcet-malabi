/* =====================================================================
   ORBIT BALANCE — the Solar System room's mini-game.

   A satellite is drifting out of its orbit. Hold LEFT to pull it in toward the
   Sun, RIGHT to push it out (tilt the phone, or use the arrow keys) and keep it
   inside the green band. Fill the bar to win the Venus model.

   The mechanic is the science: orbiting is a balance between falling toward the
   Sun and moving fast enough to miss it. Drift is UNSTABLE — the further out you
   are, the harder it pulls the other way — so it's a real balancing act rather
   than a hold-the-button test.

   There is no fail state. Leaving the band only stops the bar filling; it never
   empties and you never die. (Gameplay principle #4 — no dead ends.)

   Self-contained: owns its full-screen DOM overlay, canvas, RAF loop, input and
   tiny SFX, in the same shape as pteroGame.js / brachioGame.js.
   ===================================================================== */

import { onTilt, requestTilt, tiltNeedsPermission, tiltReady } from './tilt.js'

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

let open = false
export const isOrbitGameOpen = () => open

let overlay, canvas, ctx, closeBtn, hintEl, tiltBtn
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1
let onCloseCb = null, onCompleteCb = null
let goalSeconds = 8, won = false

// ---- world state ----
// `off` is how far the satellite is from its ideal orbit, in band-widths:
// 0 = dead centre, ±1 = the edge of the green band.
let off = 0, vel = 0, held = 0, tilt = 0, inBand = 0, angle = 0

/* Tuning, and why these numbers relate to each other.
   Drift is unstable — it grows with distance — so at the tether's limit it is at
   its strongest: MAX_OFF * DRIFT = 6.0. PUSH must comfortably EXCEED that, or a
   player who drifts to the wall can never get back and the game is unwinnable
   from there. The first version had PUSH 2.3 against a 3.41 wall drift: pinned
   forever, and it read as "the controls don't work" (they did — they were just
   losing). Keep PUSH > MAX_OFF * DRIFT with margin whenever these are touched.
   DAMP is the per-second velocity retention; lower = heavier damping, which is
   what keeps a 6.0 push from being twitchy. */
const DRIFT = 3.0          // outward acceleration per unit of offset
const PUSH = 9.0           // player's thruster authority
const DAMP = 0.02          // velocity retained per second
const MAX_OFF = 2.0        // the hard limit, in band-widths

// ---- tiny audio (a garnish; never block on it) ----
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
  } catch { /* no audio, no problem */ }
}

function reset() {
  off = 0.35 * (Math.random() < 0.5 ? -1 : 1)   // starts already drifting
  vel = 0; held = 0; inBand = 0; angle = 0; won = false
}

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth; H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function step(dt) {
  if (won) return
  // unstable drift: the further off you are, the harder it runs away
  vel += off * DRIFT * dt
  // player input pulls back toward the ring — always stronger than the drift,
  // so the satellite is recoverable from anywhere including the hard limit
  vel += Math.max(-1, Math.min(1, held + tilt)) * PUSH * dt
  vel *= Math.pow(DAMP, dt)         // drag, frame-rate independent
  off += vel * dt
  // a soft wall, so the satellite can never be lost off-screen; MAX_OFF and the
  // R/band ratio in draw() are chosen together so it stays inside the viewport
  if (off > MAX_OFF) { off = MAX_OFF; vel = Math.min(vel, 0) }
  if (off < -MAX_OFF) { off = -MAX_OFF; vel = Math.max(vel, 0) }

  angle += (0.9 - Math.abs(off) * 0.12) * dt

  if (Math.abs(off) < 1) {
    const before = inBand
    inBand = Math.min(goalSeconds, inBand + dt)
    // a tick on each whole second held, so progress is audible as well as visible
    if (Math.floor(inBand) !== Math.floor(before)) note(520 + Math.floor(inBand) * 60, 0.07, 'triangle', 0.03)
    if (inBand >= goalSeconds && !won) {
      won = true
      ;[660, 880, 1100, 1320].forEach((f, i) => note(f, 0.22, 'triangle', 0.05, i * 0.1))
      if (onCompleteCb) onCompleteCb()
      setTimeout(() => { if (open) closeOrbitGame() }, 1900)
    }
  }
  // NOTE: no `else` — the bar never drains. Drifting out costs time, not progress.
}

function draw() {
  const cx = W / 2, cy = H * 0.52
  const D = Math.min(W, H)
  const R = D * 0.25                       // the ideal orbit radius
  const band = D * 0.055                   // half-width of the green band

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#070f18'; ctx.fillRect(0, 0, W, H)

  // starfield (deterministic — a twinkling field would fight the motion)
  ctx.fillStyle = 'rgba(160,190,220,0.5)'
  for (let i = 0; i < 70; i++) {
    const x = (i * 197) % W, y = (i * 313) % H
    ctx.fillRect(x, y, 1.6, 1.6)
  }

  // the safe band — a translucent ring with its two edges drawn in, so a child
  // can see exactly where "in" stops rather than judging a soft gradient
  ctx.strokeStyle = won ? 'rgba(140,230,150,0.34)' : 'rgba(120,200,140,0.17)'
  ctx.lineWidth = band * 2
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(140,225,155,0.75)'; ctx.lineWidth = 2.5
  for (const edge of [R - band, R + band]) {
    ctx.beginPath(); ctx.arc(cx, cy, edge, 0, Math.PI * 2); ctx.stroke()
  }
  // the ideal line
  ctx.strokeStyle = 'rgba(210,245,215,0.8)'; ctx.lineWidth = 2
  ctx.setLineDash([7, 9])
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
  ctx.setLineDash([])

  // the Sun
  const sunR = Math.max(20, D * 0.045)
  const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, sunR * 2)
  g.addColorStop(0, '#ffd98a'); g.addColorStop(1, 'rgba(232,169,72,0)')
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, sunR * 2, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#e8a948'; ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill()

  // the satellite, on its actual (drifted) orbit
  const r = R + off * band
  const sx = cx + Math.cos(angle) * r, sy = cy + Math.sin(angle) * r
  // its current path, so the drift is legible as a whole orbit not just a dot
  ctx.strokeStyle = Math.abs(off) < 1 ? 'rgba(150,230,160,0.5)' : 'rgba(230,150,120,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()

  ctx.save()
  ctx.translate(sx, sy); ctx.rotate(angle + Math.PI / 2)
  ctx.fillStyle = '#f4e6c8'
  ctx.fillRect(-9, -12, 18, 24)
  ctx.fillStyle = '#7fb6c9'
  ctx.fillRect(-26, -7, 15, 14); ctx.fillRect(11, -7, 15, 14)
  ctx.restore()

  // progress bar
  const bw = Math.min(W * 0.6, 460), bx = cx - bw / 2, by = H - 78
  ctx.fillStyle = 'rgba(244,230,200,0.14)'
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 20, 10); ctx.fill()
  ctx.fillStyle = '#8ce09a'
  ctx.beginPath(); ctx.roundRect(bx, by, bw * (inBand / goalSeconds), 20, 10); ctx.fill()

  ctx.font = `600 16px ${SERIF}`
  ctx.fillStyle = '#f4e6c8'; ctx.textAlign = 'center'
  ctx.fillText(won ? 'Orbit stable! ✨' : (Math.abs(off) < 1 ? 'Holding steady…' : 'Bring it back to the green ring!'), cx, by - 14)

  if (won) {
    ctx.font = `700 ${Math.min(38, W * 0.055)}px ${SERIF}`
    ctx.fillStyle = '#ffd98a'
    ctx.fillText('You won the VENUS model! 🪐', cx, cy - R - 46)
  }
}

function frame(t) {
  if (!open) return
  const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016)
  lastT = t
  step(dt); draw()
  raf = requestAnimationFrame(frame)
}

/* ---------- input ----------
   Three ways in, because a five-year-old on a phone and an adult on a laptop
   should both find one immediately: hold either half of the screen, tilt the
   device, or use the arrow keys. */
function pointerAt(x) { held = x < window.innerWidth / 2 ? -1 : 1 }
const onDown = (e) => { pointerAt(e.touches ? e.touches[0].clientX : e.clientX) }
const onMove = (e) => { if (held) pointerAt(e.touches ? e.touches[0].clientX : e.clientX) }
const onUp = () => { held = 0 }
const onKey = (e, down) => {
  if (e.key === 'ArrowLeft') held = down ? -1 : 0
  if (e.key === 'ArrowRight') held = down ? 1 : 0
  if (e.key === 'Escape' && down) closeOrbitGame()
}
/* Tilt comes from the shared module, which owns the axis maths AND the iOS
   permission state. Previously this listened for raw `deviceorientation` and
   never asked permission, so on an iPhone the hint said "or tilt your phone"
   and tilting did nothing whatsoever. */
let tiltBase = null
onTilt((v) => {
  if (!open) return
  tiltBase ??= v
  tilt = Math.max(-1, Math.min(1, (v - tiltBase) / 20))
})

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #orbit-game { position: fixed; inset: 0; z-index: 200; background: #070f18;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #orbit-game.on { display: block; }
    #orbit-game canvas { width: 100%; height: 100%; display: block; cursor: pointer; }
    #orbit-game .og-close { position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      z-index: 2; background: rgba(20,52,74,0.8); color: #f4e6c8; border: 1.5px solid rgba(232,169,72,0.6);
      font: 600 14px ${SERIF}; padding: 9px 18px; border-radius: 999px; cursor: pointer;
      letter-spacing: .03em; min-height: 40px; }
    #orbit-game .og-tilt { position: absolute; bottom: 54px; left: 50%; transform: translateX(-50%);
      z-index: 2; background: #e8a948; color: #1b110a; border: none; font: 700 15px ${SERIF};
      padding: 11px 22px; border-radius: 999px; cursor: pointer; min-height: 44px; }
    #orbit-game .og-tilt.hidden { display: none; }
    #orbit-game .og-hint { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: rgba(244,230,200,0.65); font: 400 13px ${SERIF}; text-align: center;
      pointer-events: none; width: 92%; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'orbit-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'og-close'
  closeBtn.textContent = '‹ Back to the orrery'
  hintEl = document.createElement('div')
  hintEl.className = 'og-hint'
  hintEl.textContent = 'Hold the LEFT side to pull it in · the RIGHT side to push it out'
  // iOS only hands over tilt after a real tap, so offer one right here rather
  // than assuming the player already granted it back in the museum
  tiltBtn = document.createElement('button')
  tiltBtn.className = 'og-tilt hidden'
  tiltBtn.textContent = '✦ Enable tilt'
  tiltBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  tiltBtn.addEventListener('click', async (e) => {
    e.stopPropagation()
    tiltBase = null
    if (await requestTilt()) { tiltBtn.classList.add('hidden'); hintEl.textContent += ' · or tilt your phone' }
  })
  overlay.append(canvas, closeBtn, hintEl, tiltBtn)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  canvas.addEventListener('touchstart', onDown, { passive: true })
  canvas.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend', onUp, { passive: true })
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeOrbitGame() })
  window.addEventListener('keydown', (e) => onKey(e, true))
  window.addEventListener('keyup', (e) => onKey(e, false))
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openOrbitGame(opts = {}) {
  if (open) return
  ensureDom()
  goalSeconds = opts.goal ?? 7
  onCompleteCb = opts.onComplete || null
  onCloseCb = opts.onClose || null
  open = true
  tiltBase = null
  tiltBtn.classList.toggle('hidden', !tiltNeedsPermission() || tiltReady())
  if (tiltReady()) hintEl.textContent = 'Hold the LEFT side to pull it in · the RIGHT side to push it out · or tilt your phone'
  overlay.classList.add('on')
  reset(); layout(); lastT = 0
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(frame)
}

export function closeOrbitGame() {
  if (!open) return
  open = false
  held = 0; tilt = 0
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

// test hook: jump straight to the win, so the reward path is verifiable headlessly
export function __orbitForceWin() { if (open) inBand = goalSeconds - 0.001 }
export function __orbitState() { return { off, vel, held, tilt, inBand, maxOff: MAX_OFF } }

/* Run the REAL physics for a stretch of simulated time with a fixed input, and
   report where it ends up. Tests drive this instead of holding a key and waiting:
   requestAnimationFrame is throttled in a background page, so a wall-clock test
   measures the harness rather than the game — and a frozen simulation looks
   exactly like broken controls. Deterministic, instant, and it exercises the same
   step() the game runs. */
export function __orbitSim(heldValue, seconds, dt = 1 / 60) {
  if (!open) return null
  const saved = held
  held = heldValue
  for (let t = 0; t < seconds; t += dt) step(dt)
  held = saved
  return { off, vel, inBand, goal: goalSeconds }
}
export function __orbitPlace(o) { if (open) { off = o; vel = 0 } }
