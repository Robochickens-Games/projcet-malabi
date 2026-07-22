/* =====================================================================
   SPACEWALK DRIFT — the Space Station room's mini-game.

   Work your way along the outside of the station to the airlock, collecting the
   three tools that floated off. HOLD to fire the thruster and rise; let go and
   the safety tether eases you back down toward the handrail.

   Two things this gets right that space games usually don't:

     · There is no "down". You are not falling toward anything — what pulls you
       back to the handrail is the TETHER, and it pulls harder the further out
       you drift, the way a real line goes taut.
     · You cannot be lost. Real spacewalkers are tethered and also wear a SAFER
       jetpack as a backup, so drifting away is not how astronauts die in the
       actual job. Here the tether simply reels you in — there is no fail state,
       only lost time. (Gameplay principle #4.)

   Bumping the station is a soft bounce, never damage. The hatch only opens once
   all three tools are aboard, so the goal is legible the whole way.
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

let open = false
export const isSpacewalkOpen = () => open

let overlay, canvas, ctx, closeBtn, hintEl
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1
let onCloseCb = null, onCompleteCb = null

// world state. `y` is the astronaut's offset from the handrail line, in px.
let y = 0, vy = 0, thrusting = false
let dist = 0                 // how far along the station we've travelled
let tools = []               // [{at, dy, taken}]
let taken = 0, won = false
let bump = 0
const TOTAL = 3
const RUN = 2600             // station length before the airlock

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
  y = 0; vy = 0; thrusting = false
  dist = 0; taken = 0; won = false; bump = 0
  /* All three float ABOVE the handrail: the thruster only pushes one way and the
     tether returns you to the rail, so anything below it would be unreachable.
     Heights sit inside the full-thrust hold equilibrium (~195px), with the
     highest needing a little momentum. */
  tools = [
    { at: RUN * 0.22, dy: -80, taken: false },
    { at: RUN * 0.52, dy: -150, taken: false },
    { at: RUN * 0.80, dy: -196, taken: false },
  ]
}

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth; H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

const railY = () => H * 0.62
const REACH = 230            // how far the tether lets you go before it's taut

function step(dt) {
  if (won) return
  dist += 190 * dt           // you pull yourself along the handrail at a steady rate

  /* Thruster pushes you away from the rail; the tether pulls you BACK, harder the
     further out you are (a line going taut, not gravity). The restoring term is
     -k*y: with the sign flipped it accelerated the astronaut outward instead, so
     letting go never brought them home and only the hard clamp hid it. */
  if (thrusting) vy -= 760 * dt
  vy -= (y / REACH) * 900 * dt
  vy *= Math.pow(0.5, dt)
  y += vy * dt
  // the tether's hard limit — you simply cannot go further, and you never detach
  if (y < -REACH) { y = -REACH; vy = Math.max(vy, 0); bump = 0.25 }
  if (y > REACH * 0.5) { y = REACH * 0.5; vy = Math.min(vy, 0); bump = 0.25 }
  if (bump > 0) bump -= dt

  for (const t of tools) {
    if (t.taken) continue
    if (Math.abs(dist - t.at) < 46 && Math.abs(y - t.dy) < 54) {
      t.taken = true; taken++
      note(660 + taken * 110, 0.14, 'triangle', 0.05)
    }
  }

  if (dist >= RUN && taken >= TOTAL && !won) {
    won = true
    ;[660, 880, 1100, 1320].forEach((f, i) => note(f, 0.24, 'triangle', 0.05, i * 0.11))
    if (onCompleteCb) onCompleteCb()
    setTimeout(() => { if (open) closeSpacewalk() }, 2400)
  }
  // still missing tools at the end? come round the station again. Anything
  // already collected stays collected, so each lap can only make things better.
  if (dist >= RUN && taken < TOTAL) dist = 0
}

function draw() {
  const rail = railY()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, W, H)

  // stars, scrolling slowly
  ctx.fillStyle = 'rgba(220,235,250,0.6)'
  for (let i = 0; i < 90; i++) {
    const sx = ((i * 173) - dist * 0.12) % (W + 40)
    ctx.fillRect(sx < 0 ? sx + W + 40 : sx, (i * 227) % H, 1.7, 1.7)
  }

  // Earth's limb below — you are only about 400 km up
  ctx.fillStyle = '#1f4f7a'
  ctx.beginPath()
  ctx.moveTo(-200, H + 40)
  ctx.quadraticCurveTo(W / 2, H * 0.62, W + 200, H + 40)
  ctx.closePath(); ctx.fill()
  ctx.strokeStyle = 'rgba(127,196,232,0.85)'; ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(-200, H + 40); ctx.quadraticCurveTo(W / 2, H * 0.62, W + 200, H + 40)
  ctx.stroke()

  // the station's handrail, scrolling past
  const ax = W * 0.28
  ctx.strokeStyle = '#b9cbd8'; ctx.lineWidth = 9
  ctx.beginPath(); ctx.moveTo(0, rail); ctx.lineTo(W, rail); ctx.stroke()
  ctx.lineWidth = 4
  for (let i = -1; i < W / 120 + 1; i++) {
    const hx = i * 120 - (dist % 120)
    ctx.beginPath(); ctx.moveTo(hx, rail); ctx.lineTo(hx, rail + 34); ctx.stroke()
    ctx.beginPath(); ctx.arc(hx, rail + 40, 7, 0, Math.PI * 2); ctx.stroke()
  }
  // module bodies behind the rail
  ctx.fillStyle = '#24313d'
  for (let i = -1; i < W / 420 + 2; i++) {
    const mx = i * 420 - (dist % 420)
    ctx.beginPath(); ctx.roundRect(mx, rail + 56, 330, 130, 40); ctx.fill()
  }

  // the airlock, once it's in range
  const hatchX = ax + (RUN - dist)
  if (hatchX < W + 200) {
    ctx.fillStyle = taken >= TOTAL ? '#2f6f9e' : '#24313d'
    ctx.beginPath(); ctx.roundRect(hatchX - 90, rail - 130, 180, 250, 26); ctx.fill()
    ctx.strokeStyle = taken >= TOTAL ? '#8ce09a' : '#b9cbd8'
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.arc(hatchX, rail - 6, 60, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = ctx.strokeStyle
    ctx.font = `600 15px ${SERIF}`; ctx.textAlign = 'center'
    ctx.fillText(taken >= TOTAL ? 'OPEN' : 'LOCKED', hatchX, rail + 2)
  }

  // the tools still floating
  for (const t of tools) {
    if (t.taken) continue
    const tx = ax + (t.at - dist)
    if (tx < -60 || tx > W + 60) continue
    const ty = rail + t.dy
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(dist * 0.004)
    ctx.fillStyle = '#e8a948'
    ctx.fillRect(-16, -5, 32, 10)
    ctx.fillRect(-6, -16, 12, 32)
    ctx.restore()
    ctx.strokeStyle = 'rgba(232,169,72,0.45)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(tx, ty, 26, 0, Math.PI * 2); ctx.stroke()
  }

  // the tether, from the rail anchor to the astronaut
  const py = rail + y
  ctx.strokeStyle = Math.abs(y) > REACH * 0.85 ? '#e8a948' : 'rgba(232,169,72,0.65)'
  ctx.lineWidth = Math.abs(y) > REACH * 0.85 ? 4 : 2.5
  ctx.beginPath()
  ctx.moveTo(ax - 60, rail)
  ctx.quadraticCurveTo(ax - 30, rail + y * 0.35, ax, py)
  ctx.stroke()

  // the astronaut
  ctx.save()
  ctx.translate(ax, py)
  ctx.rotate(Math.max(-0.4, Math.min(0.4, vy / 900)))
  ctx.fillStyle = '#f0f2f5'
  ctx.beginPath(); ctx.roundRect(-16, -22, 32, 44, 12); ctx.fill()
  ctx.fillStyle = '#2b3a48'
  ctx.beginPath(); ctx.roundRect(-11, -18, 22, 16, 6); ctx.fill()   // visor
  ctx.fillStyle = '#d7dde4'
  ctx.fillRect(-24, -12, 9, 22); ctx.fillRect(15, -12, 9, 22)       // arms
  ctx.fillRect(-13, 22, 10, 16); ctx.fillRect(3, 22, 10, 16)        // legs
  ctx.fillStyle = '#8fa4b6'
  ctx.fillRect(-20, -20, 6, 30)                                     // the PLSS backpack
  if (thrusting) {
    ctx.fillStyle = 'rgba(160,220,255,0.85)'
    ctx.beginPath()
    ctx.moveTo(-8, 24); ctx.lineTo(8, 24)
    ctx.lineTo(0, 24 + 18 + Math.sin(dist * 0.6) * 6)
    ctx.closePath(); ctx.fill()
  }
  ctx.restore()
  if (bump > 0) {
    ctx.strokeStyle = `rgba(255,217,138,${bump * 3})`
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(ax, py, 34, 0, Math.PI * 2); ctx.stroke()
  }

  // HUD
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f4e6c8'
  ctx.font = `600 ${Math.min(19, W * 0.027)}px ${SERIF}`
  ctx.fillText(won ? 'Airlock reached — you’re back inside! ✨'
    : `Tools recovered  ${taken} / ${TOTAL}${taken >= TOTAL ? '  ·  head for the hatch' : ''}`,
    W / 2, H * 0.09)
  if (!won) {
    ctx.font = `400 ${Math.min(14, W * 0.02)}px ${SERIF}`
    ctx.fillStyle = 'rgba(244,230,200,0.65)'
    ctx.fillText('the tether always pulls you back — you can’t drift away', W / 2, H * 0.09 + 26)
  }
}

function frame(ts) {
  if (!open) return
  const dt = Math.min(0.05, lastT ? (ts - lastT) / 1000 : 0.016)
  lastT = ts
  step(dt); draw()
  raf = requestAnimationFrame(frame)
}

const down = () => { thrusting = true }
const up = () => { thrusting = false }

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #spacewalk-game { position: fixed; inset: 0; z-index: 200; background: #040810;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #spacewalk-game.on { display: block; }
    #spacewalk-game canvas { width: 100%; height: 100%; display: block; cursor: pointer; }
    /* top-LEFT, not centred: the tools-recovered readout lives across the top
       middle and the two collided */
    #spacewalk-game .sw-close { position: absolute; top: 14px; left: 14px;
      z-index: 2; background: rgba(20,52,74,0.85); color: #f4e6c8; border: 1.5px solid rgba(232,169,72,0.6);
      font: 600 14px ${SERIF}; padding: 9px 18px; border-radius: 999px; cursor: pointer; min-height: 40px; }
    #spacewalk-game .sw-hint { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
      z-index: 2; color: rgba(244,230,200,0.7); font: 400 13.5px ${SERIF}; text-align: center;
      pointer-events: none; width: 92%; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'spacewalk-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'sw-close'
  closeBtn.textContent = '‹ Back to the station'
  hintEl = document.createElement('div')
  hintEl.className = 'sw-hint'
  hintEl.textContent = 'HOLD anywhere to fire your thruster and rise · let go to be drawn back to the handrail'
  overlay.append(canvas, closeBtn, hintEl)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  canvas.addEventListener('touchstart', down, { passive: true })
  window.addEventListener('touchend', up, { passive: true })
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeSpacewalk() })
  window.addEventListener('keydown', (e) => {
    if (!open) return
    if (e.key === 'Escape') closeSpacewalk()
    if (e.key === ' ' || e.key === 'ArrowUp') down()
  })
  window.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'ArrowUp') up() })
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openSpacewalk(opts = {}) {
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

export function closeSpacewalk() {
  if (!open) return
  open = false
  thrusting = false
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

// test hooks
export function __spacewalkGrabAll() {
  if (!open) return false
  for (const t of tools) { if (!t.taken) { t.taken = true; taken++ } }
  return true
}
export function __spacewalkToHatch() { if (open) dist = RUN - 1 }
export function __spacewalkState() {
  return { taken, total: TOTAL, dist, won, y, reach: REACH }
}
