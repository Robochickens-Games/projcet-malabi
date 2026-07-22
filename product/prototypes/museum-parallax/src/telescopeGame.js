/* =====================================================================
   FOCUS THE STARS — the James Webb room's mini-game.

   Eighteen mirror segments means eighteen separate images of the same star.
   Drag the guidance pad to bring them together; when all eighteen land on top of
   one another the telescope is focused, the blur clears, and a galaxy comes out
   of the dark.

   This is what Webb's commissioning actually looked like: the first images were
   eighteen scattered blobs of the same star, nudged over weeks until they merged
   into a single sharp point. The mechanic is the science.

   No fail state and no timer — you can hunt for the sweet spot forever. The
   "sharpness" meter always tells you whether you're getting warmer.

   Webb sees INFRARED, light our eyes can't. Its real pictures are false colour —
   the game says so at the end rather than pretending that's how it looks.
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

let open = false
export const isTelescopeOpen = () => open

let overlay, canvas, ctx, closeBtn, hintEl
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1
let onCloseCb = null, onCompleteCb = null

// `off` is the misalignment, in units of the spread radius. (0,0) = focused.
let off = { x: 0, y: 0 }
let dragging = false
let hold = 0                 // seconds held inside the sweet spot
let won = false, t = 0
const TOL = 0.13             // how close counts as focused
const HOLD_NEEDED = 0.9      // must stay there briefly, so it isn't a lucky sweep

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
  } catch { /* fine */ }
}

// the 18 segments' fixed directions — each throws its image a different way
const DIRS = []
for (let i = 0; i < 18; i++) {
  const a = (Math.PI * 2 * i) / 18 + (i % 3) * 0.31
  const r = 0.55 + ((i * 7) % 5) * 0.11
  DIRS.push({ dx: Math.cos(a) * r, dy: Math.sin(a) * r })
}

function reset() {
  // start well off-focus, in a random direction so it isn't memorised
  const a = Math.random() * Math.PI * 2
  off = { x: Math.cos(a) * 0.78, y: Math.sin(a) * 0.78 }
  dragging = false; hold = 0; won = false; t = 0
}

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth; H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// the guidance pad, bottom-centre: dragging inside it sets the misalignment
function padGeom() {
  const r = Math.min(W, H) * 0.15
  return { cx: W / 2, cy: H * 0.80, r }
}

const errAmount = () => Math.hypot(off.x, off.y)

function setFromPointer(px, py) {
  const p = padGeom()
  let dx = (px - p.cx) / p.r, dy = (py - p.cy) / p.r
  const m = Math.hypot(dx, dy)
  if (m > 1) { dx /= m; dy /= m }
  off = { x: dx, y: dy }
}

function step(dt) {
  t += dt
  if (won) return
  if (errAmount() < TOL) {
    const before = hold
    hold = Math.min(HOLD_NEEDED, hold + dt)
    if (Math.floor(before * 4) !== Math.floor(hold * 4)) note(700 + hold * 400, 0.06, 'triangle', 0.03)
    if (hold >= HOLD_NEEDED) {
      won = true
      ;[660, 880, 1100, 1320].forEach((f, i) => note(f, 0.26, 'triangle', 0.05, i * 0.11))
      if (onCompleteCb) onCompleteCb()
      setTimeout(() => { if (open) closeTelescope() }, 3400)
    }
  } else {
    hold = Math.max(0, hold - dt * 0.6)   // eases away, never snaps to zero
  }
}

function draw() {
  const cx = W / 2, cy = H * 0.40
  const spread = Math.min(W, H) * 0.20
  const err = errAmount()
  const sharp = Math.max(0, 1 - err / 0.95)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#02040a'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(220,232,248,0.5)'
  for (let i = 0; i < 80; i++) ctx.fillRect((i * 181) % W, (i * 233) % H, 1.5, 1.5)

  // the galaxy behind, emerging as focus improves
  if (sharp > 0.25) {
    const a = (sharp - 0.25) / 0.75
    ctx.save()
    ctx.globalAlpha = a * 0.9
    ctx.translate(cx, cy); ctx.rotate(-0.3)
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, spread * 1.5)
    g.addColorStop(0, 'rgba(255,240,255,0.95)')
    g.addColorStop(0.35, 'rgba(201,160,232,0.55)')
    g.addColorStop(1, 'rgba(120,90,180,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.ellipse(0, 0, spread * 1.5, spread * 0.5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }

  // the 18 images of the same star, each thrown off by its own segment
  for (let i = 0; i < DIRS.length; i++) {
    const d = DIRS[i]
    const px = cx + (d.dx * off.x - d.dy * off.y * 0.35) * spread + off.x * spread * d.dx
    const py = cy + (d.dy * off.y + d.dx * off.x * 0.35) * spread + off.y * spread * d.dy
    const blur = 3 + err * 22
    const g = ctx.createRadialGradient(px, py, 0, px, py, blur)
    g.addColorStop(0, won ? 'rgba(255,255,255,0.95)' : 'rgba(255,246,214,0.85)')
    g.addColorStop(1, 'rgba(255,246,214,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(px, py, blur, 0, Math.PI * 2); ctx.fill()
  }
  if (won) {
    // one clean point of light
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26)
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2
    for (const a of [0, Math.PI / 3, -Math.PI / 3]) {
      ctx.beginPath()
      ctx.moveTo(cx - Math.cos(a) * 60, cy - Math.sin(a) * 60)
      ctx.lineTo(cx + Math.cos(a) * 60, cy + Math.sin(a) * 60)
      ctx.stroke()
    }
  }

  // the guidance pad
  const p = padGeom()
  ctx.strokeStyle = 'rgba(232,169,72,0.5)'; ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.arc(p.cx, p.cy, p.r, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(140,224,154,0.75)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(p.cx, p.cy, p.r * TOL, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = 'rgba(232,169,72,0.22)'
  ctx.beginPath(); ctx.moveTo(p.cx - p.r, p.cy); ctx.lineTo(p.cx + p.r, p.cy)
  ctx.moveTo(p.cx, p.cy - p.r); ctx.lineTo(p.cx, p.cy + p.r); ctx.stroke()
  const kx = p.cx + off.x * p.r, ky = p.cy + off.y * p.r
  ctx.fillStyle = err < TOL ? '#8ce09a' : '#e8a948'
  ctx.beginPath(); ctx.arc(kx, ky, 17, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#1b110a'; ctx.lineWidth = 2.5; ctx.stroke()

  // sharpness meter
  const bw = Math.min(W * 0.5, 380), bx = W / 2 - bw / 2, by = H * 0.965
  ctx.fillStyle = 'rgba(244,230,200,0.14)'
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 12, 6); ctx.fill()
  ctx.fillStyle = '#8ce09a'
  ctx.beginPath(); ctx.roundRect(bx, by, bw * sharp, 12, 6); ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4e6c8'
  ctx.font = `600 ${Math.min(19, W * 0.027)}px ${SERIF}`
  ctx.fillText(won ? 'Focused! Eighteen mirrors, one star. ✨'
    : (err < TOL ? 'Almost — hold it steady…' : 'Drag the pad to bring the eighteen images together'),
    W / 2, H * 0.075)
  if (won) {
    ctx.font = `400 ${Math.min(15, W * 0.021)}px ${SERIF}`
    ctx.fillStyle = 'rgba(244,230,200,0.8)'
    ctx.fillText('Webb sees infrared — light our eyes can’t. Its colours are added so we can look at them.',
      W / 2, H * 0.075 + 30)
  }
}

function frame(ts) {
  if (!open) return
  const dt = Math.min(0.05, lastT ? (ts - lastT) / 1000 : 0.016)
  lastT = ts
  step(dt); draw()
  raf = requestAnimationFrame(frame)
}

const onDown = (e) => { if (won) return; dragging = true; setFromPointer(e.clientX, e.clientY) }
const onMove = (e) => { if (dragging && !won) setFromPointer(e.clientX, e.clientY) }
const onUp = () => { dragging = false }

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #telescope-game { position: fixed; inset: 0; z-index: 200; background: #02040a;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #telescope-game.on { display: block; }
    #telescope-game canvas { width: 100%; height: 100%; display: block; cursor: grab; }
    #telescope-game canvas:active { cursor: grabbing; }
    #telescope-game .tg-close { position: absolute; top: 14px; left: 14px; z-index: 2;
      background: rgba(20,52,74,0.85); color: #f4e6c8; border: 1.5px solid rgba(232,169,72,0.6);
      font: 600 14px ${SERIF}; padding: 9px 18px; border-radius: 999px; cursor: pointer; min-height: 40px; }
    /* clear of the sharpness meter along the very bottom */
    #telescope-game .tg-hint { position: absolute; bottom: 56px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: rgba(244,230,200,0.6); font: 400 13px ${SERIF}; pointer-events: none;
      text-align: center; width: 92%; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'telescope-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'tg-close'
  closeBtn.textContent = '‹ Back to the mirror'
  hintEl = document.createElement('div')
  hintEl.className = 'tg-hint'
  hintEl.textContent = 'the green ring is the sweet spot · hold there for a moment to lock focus'
  overlay.append(canvas, closeBtn, hintEl)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeTelescope() })
  window.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') closeTelescope() })
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openTelescope(opts = {}) {
  if (open) return
  ensureDom()
  onCompleteCb = opts.onComplete || null
  onCloseCb = opts.onClose || null
  open = true
  overlay.classList.add('on')
  reset(); layout(); lastT = 0
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(frame)
}

export function closeTelescope() {
  if (!open) return
  open = false
  dragging = false
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

// test hooks
export function __focusSet(x, y) { if (open) off = { x, y } }
export function __focusState() { return { err: errAmount(), hold, won, tol: TOL } }
