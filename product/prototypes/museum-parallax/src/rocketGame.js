/* =====================================================================
   BUILD-A-ROCKET — the Moon room's mini-game.

   Four parts, each labelled with the JOB it does: a BOOSTER that pushes, a
   SEPARATOR that lets go of what's below it, STEERING that points, and the
   LUNAR MODULE that lands. Tap a part, tap a slot, press LAUNCH.

   Get it wrong and the rocket doesn't just fail — it fails FUNNILY, in the way
   that part's job implies. Put the separator on the bottom and it does its one
   job immediately, dropping the rocket off the rocket. Put steering on the
   bottom and it starts pointing before anything pushes, so the whole thing
   wanders off sideways. Put the lander underneath and it strains to lift
   everything with its little landing engine and manages about a metre.

   That's the teaching: you learn what a part is for by watching it do its job at
   completely the wrong moment. Nothing is lost — every part comes straight back.
   (Gidi, 2026-07-22: the previous version was accurate Saturn V staging and
   boring; the parts are named for their purpose now.)
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

/* Four parts, each with an obvious JOB, bottom (0) to top (3). Naming them by
   what they DO — booster, separator, steering, lander — instead of "first stage,
   second stage" is the whole point: a child can reason about where a thing that
   pushes belongs without knowing anything about Saturn V staging. */
const PIECES = [
  {
    id: 'booster', order: 0, name: 'Booster', h: 1.5, color: '#f0e4cd',
    job: 'All of the push. Shoves everything above it upward.',
  },
  {
    id: 'separator', order: 1, name: 'Separator', h: 0.7, color: '#d8a24a',
    job: 'Lets go of whatever is underneath, once that part is finished.',
  },
  {
    id: 'steering', order: 2, name: 'Steering', h: 0.9, color: '#9ec9a8',
    job: 'Little thrusters that point the rocket where it should go.',
  },
  {
    id: 'lander', order: 3, name: 'Lunar Module', h: 1.0, color: '#bcd6e2',
    job: 'The bit that actually lands on the Moon. Has to ride on top.',
  },
]

/* What happens when it's built wrong. The gag is chosen by what ended up at the
   BOTTOM, because that's the piece whose job fires first and the mistake a child
   can see the consequence of. Each one is a small physical joke with its own
   animation — funnier than an error message, and it teaches the part's job by
   showing it doing that job at exactly the wrong moment. */
const GAGS = {
  separator: { anim: 'pop',
    text: 'The <b>Separator</b> was on the bottom — so it did its one job straight away and let go of the rocket. The rocket let go of the rocket.' },
  steering: { anim: 'spin',
    text: 'The <b>Steering</b> was on the bottom, so it started pointing before anything started pushing. The rocket wandered off sideways looking for somewhere to be.' },
  lander: { anim: 'hop',
    text: 'The <b>Lunar Module</b> was underneath everything, trying to lift the whole rocket with its little landing engine. It managed about a metre.' },
  buried: { anim: 'flop',
    text: 'The <b>Lunar Module</b> ended up buried in the middle. It’s the part that lands — it has to be able to get out.' },
  default: { anim: 'flop',
    text: 'It toppled over. The <b>heaviest</b> part has to be at the bottom doing the pushing, and the lander rides on top.' },
}
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
let phase = 'build'   // build | flying | flop | pop | spin | hop
let gagSeed = []      // per-piece scatter for the 'pop' gag
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
  const groundY = H * 0.66
  const trayY = H * 0.965
  const unit = Math.min(H * 0.115, W * 0.085)   // one "slot unit" of height
  const bw = unit * 1.25                         // rocket body width
  const tw = Math.min(W * 0.21, 170)
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
  return { x: x0 + i * (tw + gap), y: trayY - tw * 0.94, w: tw, h: tw * 0.94 }
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
  if (stack.some((s) => !s)) { message = 'Put all four parts on the pad first.'; return }
  const right = stack.every((id, i) => byId[id].order === i)
  if (right) {
    phase = 'flying'; t = 0; won = true
    ;[440, 550, 660, 880].forEach((f, i) => note(f, 0.3, 'sawtooth', 0.04, i * 0.12))
    message = 'Lift-off! Booster pushing, separator ready to let go, steering pointing the way — and the lander riding safely on top.'
    if (onCompleteCb) onCompleteCb()
    setTimeout(() => { if (open) closeRocketGame() }, 3200)
  } else {
    const bottom = stack[0]
    const gag = GAGS[bottom] ?? (stack[N - 1] !== 'lander' ? GAGS.buried : GAGS.default)
    phase = gag.anim; t = 0
    gagSeed = stack.map((_, i) => ({
      dx: (i - 1.5) * 70 + (Math.random() - 0.5) * 40,
      dy: -60 - Math.random() * 90,
      rot: (Math.random() - 0.5) * 3,
    }))
    note(150, 0.4, 'square', 0.05)
    message = gag.text
  }
}

const GAG_PHASES = ['flop', 'pop', 'spin', 'hop']

function step(dt) {
  t += dt
  if (GAG_PHASES.includes(phase) && t > 2.1) {
    // hand every piece back and let them try again — nothing is ever lost
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
  // each part is drawn as the job it does, so its place is guessable on sight
  if (p.id === 'lander') {
    ctx.beginPath()                                   // a squat cone on legs
    ctx.moveTo(b.x + b.w * 0.12, b.y + b.h * 0.72)
    ctx.lineTo(b.x + b.w * 0.88, b.y + b.h * 0.72)
    ctx.lineTo(b.x + b.w * 0.66, b.y + b.h * 0.26)
    ctx.lineTo(b.x + b.w * 0.34, b.y + b.h * 0.26)
    ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.roundRect(b.x + b.w * 0.36, b.y + b.h * 0.04, b.w * 0.28, b.h * 0.24, 5)
    ctx.fill(); ctx.stroke()
    ctx.lineWidth = 3.5
    for (const dx of [0.14, 0.86]) {                  // landing legs
      ctx.beginPath()
      ctx.moveTo(b.x + b.w * (dx > 0.5 ? 0.82 : 0.18), b.y + b.h * 0.72)
      ctx.lineTo(b.x + b.w * dx, b.y + b.h)
      ctx.stroke()
    }
  } else if (p.id === 'steering') {
    ctx.beginPath(); ctx.roundRect(b.x + b.w * 0.16, b.y, b.w * 0.68, b.h, 5); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#5c7a63'                          // four little thruster nozzles
    for (const [dx, dy] of [[0.06, 0.22], [0.82, 0.22], [0.06, 0.62], [0.82, 0.62]]) {
      ctx.beginPath(); ctx.roundRect(b.x + b.w * dx, b.y + b.h * dy, b.w * 0.12, b.h * 0.16, 3); ctx.fill()
    }
    ctx.strokeStyle = 'rgba(40,60,45,0.6)'; ctx.lineWidth = 2.5
    ctx.beginPath()                                    // a little compass cross
    ctx.moveTo(b.x + b.w * 0.5, b.y + b.h * 0.28); ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.72)
    ctx.moveTo(b.x + b.w * 0.3, b.y + b.h * 0.5); ctx.lineTo(b.x + b.w * 0.7, b.y + b.h * 0.5)
    ctx.stroke()
  } else if (p.id === 'separator') {
    ctx.beginPath(); ctx.roundRect(b.x, b.y + b.h * 0.16, b.w, b.h * 0.68, 4); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(60,45,25,0.8)'               // a ring of release bolts
    for (let i = 0; i < 7; i++) {
      ctx.beginPath()
      ctx.arc(b.x + b.w * (0.1 + i * 0.133), b.y + b.h * 0.5, Math.max(2.4, b.w * 0.035), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = '#8f6b3a'; ctx.lineWidth = 3
    ctx.beginPath()                                    // the split line it opens on
    ctx.moveTo(b.x, b.y + b.h * 0.84); ctx.lineTo(b.x + b.w, b.y + b.h * 0.84); ctx.stroke()
  } else {
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 5); ctx.fill(); ctx.stroke()
    ctx.fillStyle = 'rgba(50,40,32,0.75)'
    ctx.fillRect(b.x, b.y + b.h * 0.14, b.w, b.h * 0.1)
    ctx.fillStyle = '#5c4a38'                          // a row of fat engine bells
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
  // each way of getting it wrong has its own small physical joke
  const tilt = phase === 'flop' ? Math.min(1, t / 1.2) * 1.15
    : phase === 'spin' ? t * 5.5 : 0
  const slideX = phase === 'spin' ? Math.pow(t, 2) * W * 0.5 : 0
  const hopDy = phase === 'hop' ? Math.max(0, Math.sin(Math.min(Math.PI, t * 2.6))) * -46 : 0

  ctx.save()
  if (tilt) { ctx.translate(padX, groundY); ctx.rotate(tilt); ctx.translate(-padX, -groundY) }
  ctx.translate(slideX, flyDy + hopDy)
  // empty slots, so it's obvious where pieces go
  for (let i = 0; i < N; i++) {
    const b = slotBounds(i)
    if (stack[i]) {
      if (phase === 'pop') {
        // the whole stack lets go of itself and scatters
        const g = gagSeed[i] ?? { dx: 0, dy: 0, rot: 0 }
        const k = Math.min(1, t / 1.1)
        ctx.save()
        ctx.translate(b.x + b.w / 2 + g.dx * k, b.y + b.h / 2 + (g.dy * k + 240 * k * k))
        ctx.rotate(g.rot * k)
        drawPiece(byId[stack[i]], { x: -b.w / 2, y: -b.h / 2, w: b.w, h: b.h })
        ctx.restore()
      } else {
        drawPiece(byId[stack[i]], b)
      }
      continue
    }
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
    // a small upright of the piece, then its name and — the actual clue — its JOB
    const inner = { x: b.x + b.w * 0.5 - tw * 0.15, y: b.y + b.h * 0.08, w: tw * 0.3, h: b.h * 0.42 }
    drawPiece(p, inner)
    ctx.fillStyle = '#f4e6c8'; ctx.textAlign = 'center'
    const nameSize = Math.max(11, Math.min(13, W * 0.011))
    ctx.font = `700 ${nameSize}px ${SERIF}`
    ctx.fillText(p.name, b.x + b.w / 2, b.y + b.h * 0.62)
    const jobSize = Math.max(9, Math.min(11, W * 0.0092))
    ctx.font = `400 ${jobSize}px ${SERIF}`
    ctx.fillStyle = 'rgba(244,230,200,0.75)'
    wrap(p.job, b.w - 14).slice(0, 3)
      .forEach((ln, i) => ctx.fillText(ln, b.x + b.w / 2, b.y + b.h * 0.62 + 14 + i * (jobSize + 2)))
  }

  // copy — the gag lines are long, so wrap rather than run off the screen
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4e6c8'
  const copySize = Math.min(18, W * 0.026)
  ctx.font = `600 ${copySize}px ${SERIF}`
  const line = message.replace(/<\/?b>/g, '')
    || 'Tap a part, then tap a slot. Build a rocket that will actually fly.'
  wrap(line, W * 0.86).forEach((ln, i) => ctx.fillText(ln, W / 2, H * 0.075 + i * (copySize + 8)))
}

// break `text` into lines that fit `maxW` at the CURRENT ctx font
function wrap(text, maxW) {
  const out = []
  let cur = ''
  for (const word of text.split(' ')) {
    const test = cur ? `${cur} ${word}` : word
    if (cur && ctx.measureText(test).width > maxW) { out.push(cur); cur = word } else cur = test
  }
  if (cur) out.push(cur)
  return out
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
      z-index: 2; color: rgba(244,230,200,0.6); font: 400 12.5px ${SERIF}; pointer-events: none;
      text-align: center; width: 92%; }
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
  hintEl.textContent = 'each part says what it does · tap a part on the pad to take it back off'
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
// put a named part at the bottom, to check that gag fires
export function __rocketStackWith(bottomId) {
  if (!open) return false
  const rest = PIECES.map((p) => p.id).filter((id) => id !== bottomId)
  stack = [bottomId, ...rest]
  tray = []
  return true
}
export function __rocketMessage() { return message }
export function __rocketLaunch() { launch() }
export function __rocketPhase() { return phase }
export function __rocketWon() { return won }
