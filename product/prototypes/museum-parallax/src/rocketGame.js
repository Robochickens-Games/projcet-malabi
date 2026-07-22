/* =====================================================================
   BUILD-A-ROCKET — the Moon room's mini-game.

   Stack the real Saturn V. Four pieces, bottom to top: the huge first stage
   with its five F-1 engines, the second stage, the third stage, and the crew
   capsule with its escape tower on the very top. Tap a piece, tap a slot; press
   LAUNCH when the stack is full.

   Get it wrong and the rocket topples over instead of flying — which is the
   honest answer, and much more fun than an error message. Nothing is lost; the
   pieces come straight back. Get it right and it flies, and you win the last
   mission card.

   Why bottom-heavy is right (the thing this teaches): the biggest, heaviest
   stage has to be at the bottom doing the lifting, and the tiny capsule with
   the people rides on top where it can escape if anything goes wrong.
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

/* The real Saturn V, bottom (0) to top (3). `h` is drawn height in slot units,
   roughly true to the real proportions — the first stage really is the giant. */
const PIECES = [
  {
    id: 's1', order: 0, name: 'First stage', h: 1.45, color: '#f0e4cd',
    note: 'The giant at the bottom. Five F-1 engines — the most powerful ever flown.',
  },
  {
    id: 's2', order: 1, name: 'Second stage', h: 1.15, color: '#e2d3b6',
    note: 'Takes over once the first stage has done its work and dropped away.',
  },
  {
    id: 's3', order: 2, name: 'Third stage', h: 0.85, color: '#d3c2a0',
    note: 'Pushes the spacecraft out of Earth orbit and off toward the Moon.',
  },
  {
    id: 'capsule', order: 3, name: 'Crew capsule', h: 0.95, color: '#bcd6e2',
    note: 'The cone where the astronauts ride, with the escape tower on top.',
  },
]
const N = PIECES.length
const byId = Object.fromEntries(PIECES.map((p) => [p.id, p]))

let open = false
export const isRocketGameOpen = () => open

let overlay, canvas, ctx, closeBtn, launchBtn, hintEl
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1
let onCloseCb = null, onCompleteCb = null

let stack = []        // pieceId | null, index 0 = bottom
let tray = []
let picked = null
let phase = 'build'   // build | flying | toppling
let t = 0, won = false
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
  } catch { /* fine */ }
}

function reset() {
  stack = new Array(N).fill(null)
  tray = PIECES.map((p) => p.id).sort(() => Math.random() - 0.5)
  picked = null; phase = 'build'; t = 0; won = false
  message = ''
}

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth; H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/* The pad sits above the parts tray with a clear gap between them: an earlier
   layout had the bottom slot and the tray cards overlapping, which made the
   first stage look like it was already half-placed. The unit height is derived
   so the full 4.4-unit stack always fits between the title and the ground. */
function geom() {
  const padX = W * 0.36
  const groundY = H * 0.70
  const trayY = H * 0.93
  const unit = Math.min(H * 0.115, W * 0.085)   // one "slot unit" of height
  const bw = unit * 1.25                         // rocket body width
  const tw = Math.min(W * 0.19, 150)
  return { padX, groundY, unit, bw, trayY, tw }
}

function slotBounds(i) {
  const { padX, groundY, unit, bw } = geom()
  // slots stack upward from the ground; each is as tall as its piece expects
  let y = groundY
  for (let k = 0; k < i; k++) y -= PIECES[k].h * unit
  const h = PIECES[i].h * unit
  return { x: padX - bw / 2, y: y - h, w: bw, h }
}

function trayBounds(i) {
  const { trayY, tw } = geom()
  const gap = 12
  const total = tray.length * tw + (tray.length - 1) * gap
  const x0 = (W - total) / 2
  return { x: x0 + i * (tw + gap), y: trayY - tw * 0.62, w: tw, h: tw * 0.62 }
}

const inside = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h

function onTap(e) {
  if (!open || phase !== 'build') return
  const x = e.clientX, y = e.clientY
  for (let i = 0; i < tray.length; i++) {
    if (inside(trayBounds(i), x, y)) {
      picked = picked === tray[i] ? null : tray[i]
      note(560, 0.06, 'triangle', 0.03)
      return
    }
  }
  for (let i = 0; i < N; i++) {
    if (!inside(slotBounds(i), x, y)) continue
    if (picked) {
      if (stack[i]) tray.push(stack[i])
      stack[i] = picked
      tray = tray.filter((p) => p !== picked)
      picked = null
      note(700, 0.07, 'triangle', 0.035)
    } else if (stack[i]) {
      tray.push(stack[i]); stack[i] = null
      note(320, 0.07, 'triangle', 0.03)
    }
    message = ''
    return
  }
}

function launch() {
  if (phase !== 'build') return
  if (stack.some((s) => !s)) { message = 'Put all four pieces on the pad first.'; return }
  const right = stack.every((id, i) => byId[id].order === i)
  if (right) {
    phase = 'flying'; t = 0; won = true
    ;[440, 550, 660, 880].forEach((f, i) => note(f, 0.3, 'sawtooth', 0.04, i * 0.12))
    message = 'Lift-off! The heaviest stage does the lifting, and the crew rides on top.'
    if (onCompleteCb) onCompleteCb()
    setTimeout(() => { if (open) closeRocketGame() }, 3200)
  } else {
    phase = 'toppling'; t = 0
    note(150, 0.4, 'square', 0.05)
    message = 'It toppled over! The <b>biggest, heaviest</b> stage has to be at the bottom — and the crew capsule belongs on top.'
  }
}

function step(dt) {
  t += dt
  if (phase === 'toppling' && t > 1.5) {
    // hand every piece back and let them try again — nothing is lost
    tray = PIECES.map((p) => p.id).sort(() => Math.random() - 0.5)
    stack = new Array(N).fill(null)
    phase = 'build'; t = 0
  }
}

function drawPiece(p, b, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = p.color
  ctx.strokeStyle = '#3a2f22'
  ctx.lineWidth = 2.5
  if (p.id === 'capsule') {
    // cone + escape tower
    ctx.beginPath()
    ctx.moveTo(b.x, b.y + b.h)
    ctx.lineTo(b.x + b.w, b.y + b.h)
    ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.28)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.strokeStyle = '#8f6b3a'; ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(b.x + b.w * 0.5, b.y + b.h * 0.28); ctx.lineTo(b.x + b.w * 0.5, b.y)
    ctx.stroke()
  } else {
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 5); ctx.fill(); ctx.stroke()
    // the black roll pattern the real Saturn V wore
    ctx.fillStyle = 'rgba(50,40,32,0.75)'
    ctx.fillRect(b.x, b.y + b.h * 0.16, b.w, b.h * 0.12)
    if (p.id === 's1') {
      // five F-1 bells across the bottom
      ctx.fillStyle = '#5c4a38'
      for (let i = 0; i < 5; i++) {
        const ex = b.x + b.w * (0.12 + i * 0.19)
        ctx.beginPath()
        ctx.moveTo(ex, b.y + b.h)
        ctx.lineTo(ex + b.w * 0.055, b.y + b.h)
        ctx.lineTo(ex + b.w * 0.085, b.y + b.h + b.h * 0.11)
        ctx.lineTo(ex - b.w * 0.03, b.y + b.h + b.h * 0.11)
        ctx.closePath(); ctx.fill()
      }
    }
  }
  ctx.restore()
}

function draw() {
  const { padX, groundY, bw, tw } = geom()
  ctx.clearRect(0, 0, W, H)
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#0d1826'); sky.addColorStop(1, '#22344a')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(180,205,225,0.55)'
  for (let i = 0; i < 60; i++) ctx.fillRect((i * 211) % W, (i * 137) % (H * 0.6), 1.6, 1.6)

  // launch pad + gantry
  ctx.fillStyle = '#33475c'
  ctx.fillRect(0, groundY, W, H - groundY)
  ctx.strokeStyle = '#5d7e91'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke()
  ctx.strokeStyle = 'rgba(93,126,145,0.8)'; ctx.lineWidth = 6
  const gx = padX + bw * 0.95
  const gTop = groundY - geom().unit * 4.4
  ctx.beginPath(); ctx.moveTo(gx, groundY); ctx.lineTo(gx, gTop); ctx.stroke()
  ctx.lineWidth = 3
  for (let i = 0; i <= 5; i++) {
    const y = groundY - (groundY - gTop) * (i / 5)
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + bw * 0.28, y); ctx.stroke()
  }

  const flyDy = phase === 'flying' ? -Math.pow(t, 2) * H * 0.55 : 0
  const tilt = phase === 'toppling' ? Math.min(1, t / 1.2) * 1.15 : 0

  ctx.save()
  if (tilt) { ctx.translate(padX, groundY); ctx.rotate(tilt); ctx.translate(-padX, -groundY) }
  ctx.translate(0, flyDy)
  // empty slots, so it's obvious where pieces go
  for (let i = 0; i < N; i++) {
    const b = slotBounds(i)
    if (stack[i]) { drawPiece(byId[stack[i]], b); continue }
    if (phase !== 'build') continue
    ctx.strokeStyle = 'rgba(232,169,72,0.6)'; ctx.lineWidth = 2.5
    ctx.setLineDash([7, 6])
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 5); ctx.stroke()
    ctx.setLineDash([])
  }
  // exhaust
  if (phase === 'flying') {
    const b = slotBounds(0)
    ctx.fillStyle = 'rgba(255,190,90,0.85)'
    ctx.beginPath()
    ctx.moveTo(b.x + b.w * 0.2, b.y + b.h)
    ctx.lineTo(b.x + b.w * 0.8, b.y + b.h)
    ctx.lineTo(b.x + b.w * 0.5, b.y + b.h + b.h * (1.2 + Math.sin(t * 30) * 0.3))
    ctx.closePath(); ctx.fill()
  }
  ctx.restore()

  // the tray
  for (let i = 0; i < tray.length; i++) {
    const p = byId[tray[i]]
    const b = trayBounds(i)
    ctx.fillStyle = picked === p.id ? 'rgba(232,169,72,0.28)' : 'rgba(244,230,200,0.08)'
    ctx.strokeStyle = picked === p.id ? '#fff' : 'rgba(232,169,72,0.55)'
    ctx.lineWidth = picked === p.id ? 3 : 2
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.stroke()
    // a small upright of the piece inside its tray card
    const inner = { x: b.x + b.w * 0.5 - tw * 0.15, y: b.y + b.h * 0.16, w: tw * 0.3, h: b.h * 0.66 }
    drawPiece(p, inner)
    ctx.fillStyle = '#f4e6c8'; ctx.textAlign = 'center'
    ctx.font = `600 ${Math.max(11, Math.min(13, W * 0.011))}px ${SERIF}`
    ctx.fillText(p.name, b.x + b.w / 2, b.y + b.h - 6)
  }

  // copy
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4e6c8'
  ctx.font = `600 ${Math.min(18, W * 0.026)}px ${SERIF}`
  ctx.fillText(message.replace(/<\/?b>/g, '') || 'Tap a piece, then tap a slot. Build the Saturn V from the ground up.',
    W / 2, H * 0.075)
}

function frame(ts) {
  if (!open) return
  const dt = Math.min(0.05, lastT ? (ts - lastT) / 1000 : 0.016)
  lastT = ts
  step(dt); draw()
  raf = requestAnimationFrame(frame)
}

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #rocket-game { position: fixed; inset: 0; z-index: 200; background: #0d1826;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #rocket-game.on { display: block; }
    #rocket-game canvas { width: 100%; height: 100%; display: block; cursor: pointer; }
    #rocket-game .kg-close { position: absolute; top: 14px; left: 14px; z-index: 2;
      background: rgba(20,52,74,0.85); color: #f4e6c8; border: 1.5px solid rgba(232,169,72,0.6);
      font: 600 14px ${SERIF}; padding: 9px 18px; border-radius: 999px; cursor: pointer; min-height: 40px; }
    #rocket-game .kg-launch { position: absolute; top: 14px; right: 14px; z-index: 2;
      background: #e8a948; color: #1b110a; border: none; font: 700 17px ${SERIF};
      letter-spacing: .1em; padding: 12px 30px; border-radius: 999px; cursor: pointer; min-height: 46px; }
    #rocket-game .kg-hint { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: rgba(244,230,200,0.6); font: 400 12.5px ${SERIF}; pointer-events: none; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'rocket-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'kg-close'
  closeBtn.textContent = '‹ Back'
  launchBtn = document.createElement('button')
  launchBtn.className = 'kg-launch'
  launchBtn.textContent = 'LAUNCH ▴'
  hintEl = document.createElement('div')
  hintEl.className = 'kg-hint'
  hintEl.textContent = 'tap a piece already on the pad to take it back off'
  overlay.append(canvas, closeBtn, launchBtn, hintEl)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', onTap)
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeRocketGame() })
  launchBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  launchBtn.addEventListener('click', (e) => { e.stopPropagation(); launch() })
  window.addEventListener('keydown', (e) => {
    if (!open) return
    if (e.key === 'Escape') closeRocketGame()
    if (e.key === 'Enter') launch()
  })
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openRocketGame(opts = {}) {
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

export function closeRocketGame() {
  if (!open) return
  open = false
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

// test hooks: stack it correctly (or deliberately upside down) and launch
export function __rocketStack(correct = true) {
  if (!open) return false
  stack = correct ? PIECES.map((p) => p.id) : [...PIECES].reverse().map((p) => p.id)
  tray = []
  return true
}
export function __rocketLaunch() { launch() }
export function __rocketPhase() { return phase }
export function __rocketWon() { return won }
