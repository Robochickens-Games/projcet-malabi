/* =====================================================================
   PTERANODON FISH RUN — a one-tap "flappy" mini-game for the ptero room.

   Tap (anywhere / space) to FLAP upward; gravity pulls you back down.
   Fish leap out of the sea in real ballistic arcs and dive back in (hidden
   while submerged) — snatch them with your beak. You can dip into the water,
   but stay in for 1 second and you drown (game over). Hitting 5 / 10 / 20 / …
   fish fires a confetti celebration.

   Art: bright cartoon sea using Kenney's CC0 Fish Pack sprites (fish,
   bubbles, seaweed, rocks — kenney.nl, CC0). The flyer is drawn in the
   same flat cartoon style (Kenney has no pterosaur). Self-contained: owns
   its own full-screen DOM overlay, <canvas>, RAF loop, input + tiny SFX.
   ===================================================================== */

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

// ---- sprites (served from /public/game) ----
// pixel-art Pteranodon + three real fish (tuna, coelacanth, anglerfish)
const SPRITES = {
  bird: ['pterodactyl'],
  fish: ['tuna', 'coelacanth', 'anglerfish'],
}
// sprites whose source art faces RIGHT — flipped at draw time so they swim left
const NATIVE_RIGHT = { coelacanth: true }
const img = {}            // name -> HTMLImageElement
let assetsReady = false
function loadAssets() {
  if (Object.keys(img).length) return
  for (const list of Object.values(SPRITES)) {
    for (const name of list) {
      const im = new Image()
      im.src = `/game/${name}.png`
      img[name] = im
    }
  }
  Promise.all(Object.values(img).map((im) => im.decode().catch(() => {}))).then(() => { assetsReady = true })
}

let open = false
export const isPteroGameOpen = () => open

// completion goal: catch `goalFish` fish to "solve" the exhibit (fires once)
let goalFish = 0, goalReached = false, onCompleteCb = null

let overlay, canvas, ctx, closeBtn
let raf = 0, lastT = 0
let W = 0, H = 0, dpr = 1, U = 1
let onCloseCb = null

// ---- tiny audio ----
let actx = null
function note(freq, dur = 0.1, type = 'triangle', gain = 0.04, delay = 0) {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)()
    const t0 = actx.currentTime + delay
    const o = actx.createOscillator(), g = actx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g); g.connect(actx.destination)
    o.start(t0); o.stop(t0 + dur)
  } catch (_) { /* audio is optional */ }
}
const snd = {
  flap: () => note(440, 0.07, 'sine', 0.03),
  catch: () => [660, 990, 1320].forEach((f, i) => note(f, 0.12, 'triangle', 0.045, i * 0.05)),
  splash: () => note(220, 0.18, 'sine', 0.035),
  cheer: () => [659, 784, 988, 1319, 1568].forEach((f, i) => note(f, 0.22, 'triangle', 0.05, i * 0.06)),
  gameover: () => [392, 311, 233, 175].forEach((f, i) => note(f, 0.32, 'square', 0.045, i * 0.12)),
}

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ---- game state ----
let mode = 'ready'        // 'ready' | 'play' | 'over'
let bird, fishes, splashes, sparks, confetti, clouds
let score, best = 0, t, shake, overT
let celebrate = null      // { t, label } while a milestone flourish is playing

// milestone celebrations — flourish + confetti at these fish counts (then every +10)
const MILESTONES = [5, 10, 20]
const isMilestone = (n) => MILESTONES.includes(n) || (n > 20 && n % 10 === 0)

const DROWN_MS = 300                       // grace time the bird may stay in the water
const surfaceY = () => H - 122 * U        // the waterline
const beakX = () => bird.x + 46 * U       // beak tip (catch point)

function reset() {
  bird = { x: W * 0.27, y: H * 0.4, vy: 0, flapT: 0, waterT: 0 }
  fishes = []; splashes = []; sparks = []; confetti = []
  score = 0; t = 0; shake = 0; celebrate = null
  spawnT = 0.4
  clouds = Array.from({ length: 4 }, (_, i) => ({
    x: (i / 4) * W + rand(0, 180), y: rand(60, 200) * U, r: rand(70, 130) * U, sp: rand(0.12, 0.3),
  }))
}

let spawnT = 0.4

function layout() {
  const r = canvas.getBoundingClientRect()
  W = Math.max(1, Math.round(r.width))
  H = Math.max(1, Math.round(r.height))
  dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  U = H / 600
  if (bird) bird.x = W * 0.27
}

// ---- spawning ----
function spawnFish() {
  const speed = (2.4 + Math.random() * 1.2 + score * 0.02) * U
  fishes.push({
    x: W + 50 * U, vx: -speed,
    surf: surfaceY(),
    state: 'water',                 // 'water' (swimming below) | 'air' (leaping)
    timer: rand(0.15, 0.5),         // time until first leap
    y: surfaceY() + 14 * U, prevY: surfaceY() + 14 * U, vy: 0,
    g: rand(0.5, 0.62) * U,
    name: pick(SPRITES.fish),
    size: rand(52, 72) * U,         // drawn width; height follows the sprite's aspect
    caught: false, flyT: 0,
  })
}

function makeSplash(x, y, n = 9) {
  for (let i = 0; i < n; i++) {
    splashes.push({ x, y, vx: rand(-3.5, 3.5) * U, vy: -rand(1.5, 4.5) * U, life: 1, r: rand(2, 4.5) * U })
  }
}
function makeSparks(x, y) {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * 6.28, s = rand(1, 4) * U
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1 * U, life: 1, r: rand(2, 4) * U })
  }
}

const CONFETTI = ['#ff5a5a', '#ffd23f', '#36c5f0', '#6ddf6d', '#ff8fce', '#ffffff']
function burstConfetti(n = 52) {
  for (let i = 0; i < n; i++) {
    confetti.push({
      x: rand(W * 0.2, W * 0.8), y: rand(-30, H * 0.28),
      vx: rand(-3, 3) * U, vy: rand(1, 5) * U, life: 1,
      w: rand(6, 12) * U, h: rand(8, 16) * U, rot: rand(0, 6.28), vr: rand(-0.3, 0.3), c: pick(CONFETTI),
    })
  }
}
function fireCelebration(n) {
  celebrate = { t: 0, label: `${n} FISH!` }
  burstConfetti(52); snd.cheer(); shake = Math.max(shake, 0.7)
}
function gameOver() {
  if (mode !== 'play') return
  mode = 'over'; overT = t
  best = Math.max(best, score)
  makeSplash(bird.x + 10 * U, surfaceY(), 18); snd.gameover(); shake = 1
}

// ---- input ----
function flap() {
  if (mode === 'over') { if (t - overT < 0.5) return; reset(); mode = 'play' }   // brief guard so the death-tap doesn't instantly restart
  else if (mode === 'ready') { reset(); mode = 'play' }
  bird.vy = -8.6 * U
  bird.flapT = 1
  snd.flap()
}
function onTap(e) { e.preventDefault(); e.stopPropagation(); flap() }
function onKey(e) {
  if (!open) return
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap() }
  if (e.code === 'Escape') closePteroGame()
}

// ---- update ----
function update(dt) {
  const f = Math.min(2.2, dt / 16.667)
  t += dt / 1000
  if (shake > 0) shake = Math.max(0, shake - f * 0.06)
  for (const c of clouds) { c.x -= c.sp * f; if (c.x < -c.r * 1.3) c.x = W + c.r }
  if (celebrate) { celebrate.t += dt / 1000; if (celebrate.t > 1.4) celebrate = null }

  stepParticles(f)
  if (mode !== 'play') return

  // --- bird: flap + gravity, BOUNCE off water and ceiling (never dies) ---
  bird.vy += 0.5 * U * f
  bird.y += bird.vy * f
  bird.flapT = Math.max(0, bird.flapT - f * 0.1)
  const surf = surfaceY()
  if (bird.y + 20 * U > surf) {
    // in the water — you get a 1-second grace window to flap back out before drowning
    bird.waterT += dt
    if (bird.vy > 0) bird.vy *= 0.8                       // drag only the sink, not an escape flap
    const maxBelly = surf + 50 * U                         // bob near the surface, don't plummet
    if (bird.y + 20 * U > maxBelly) { bird.y = maxBelly - 20 * U; if (bird.vy > 0) bird.vy = 0 }
    if (Math.random() < 0.6) makeSplash(bird.x + rand(-16, 20) * U, surf, 3)
    shake = Math.max(shake, (bird.waterT / DROWN_MS) * 0.5)   // urgency builds as the timer runs out
    if (bird.waterT >= DROWN_MS) { gameOver(); return }
  } else {
    bird.waterT = 0
  }
  const topY = 38 * U
  if (bird.y < topY) { bird.y = topY; bird.vy = Math.max(bird.vy, 0.5 * U) }

  // --- fish: porpoise out of the water in real arcs, then dive back in ---
  spawnT -= dt / 1000
  if (spawnT <= 0) { spawnFish(); spawnT = Math.max(0.5, 1.2 - score * 0.015) }
  for (const fi of fishes) {
    if (fi.caught) { fi.flyT += f; fi.x += (bird.x - fi.x) * 0.2 * f; fi.y += (bird.y - 4 * U - fi.y) * 0.2 * f; continue }
    fi.prevY = fi.y
    fi.x += fi.vx * f
    if (fi.state === 'water') {
      fi.y = fi.surf + 14 * U
      fi.timer -= dt / 1000
      if (fi.timer <= 0) { fi.state = 'air'; fi.vy = -rand(9, 20) * U; makeSplash(fi.x, fi.surf, 8) }   // varied leap heights
    } else {
      fi.vy += fi.g * f
      fi.y += fi.vy * f
      if (fi.vy > 0 && fi.y >= fi.surf) {              // splash back into the sea
        fi.y = fi.surf + 14 * U; fi.vy = 0; fi.state = 'water'; fi.timer = rand(0.3, 0.8); makeSplash(fi.x, fi.surf, 8)
      }
    }
    // catch — generous radius, only while the fish is breaching (visible above water)
    if (!fi.caught && fi.y <= fi.surf + 6 * U) {
      const dx = fi.x - beakX(), dy = fi.y - bird.y
      if (dx * dx + dy * dy < (52 * U) * (52 * U)) {
        fi.caught = true; score++
        makeSparks(fi.x, fi.y); snd.catch()
        best = Math.max(best, score)
        if (isMilestone(score)) fireCelebration(score)
        if (goalFish && score >= goalFish && !goalReached) {
          goalReached = true
          celebrate = { t: 0, label: 'EXHIBIT SOLVED!' }   // override the milestone label
          onCompleteCb?.()
        }
      }
    }
  }
  fishes = fishes.filter((fi) => fi.x > -90 * U && fi.flyT < 26)
}

function stepParticles(f) {
  for (const s of splashes) { s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.2 * U * f; s.life -= 0.028 * f }
  splashes = splashes.filter((s) => s.life > 0)
  for (const s of sparks) { s.x += s.vx * f; s.y += s.vy * f; s.vy += 0.12 * U * f; s.life -= 0.03 * f }
  sparks = sparks.filter((s) => s.life > 0)
  for (const c of confetti) { c.x += c.vx * f; c.y += c.vy * f; c.vy += 0.05 * U * f; c.rot += c.vr * f; c.life -= 0.012 * f }
  confetti = confetti.filter((c) => c.life > 0 && c.y < H + 30 * U)
}

// ---- draw ----
// draw a centered sprite at width w, height following the sprite's aspect ratio
function blitW(name, w) {
  const im = img[name]
  if (!im || !im.complete || !im.naturalWidth) return
  const h = w * im.naturalHeight / im.naturalWidth
  ctx.drawImage(im, -w / 2, -h / 2, w, h)
}

function draw() {
  ctx.save()
  if (shake > 0) ctx.translate(rand(-1, 1) * 10 * shake, rand(-1, 1) * 10 * shake)

  // --- bright cartoon sky ---
  const sky = ctx.createLinearGradient(0, 0, 0, surfaceY())
  sky.addColorStop(0, '#7ec8ec'); sky.addColorStop(1, '#cdeefb')
  ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, surfaceY() + 40)
  // sun
  ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.2, 46 * U, 0, 7); ctx.fill()
  ctx.fillStyle = 'rgba(255,243,196,0.35)'; ctx.beginPath(); ctx.arc(W * 0.82, H * 0.2, 70 * U, 0, 7); ctx.fill()
  // clouds
  for (const c of clouds) drawCloud(c.x, c.y, c.r)

  // --- sea ---
  const sy = surfaceY()
  const sea = ctx.createLinearGradient(0, sy, 0, H)
  sea.addColorStop(0, '#3fb0e0'); sea.addColorStop(1, '#1f73b0')
  ctx.fillStyle = sea; ctx.fillRect(-20, sy, W + 40, H - sy + 20)
  // sun glints
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2 * U
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    for (let x = -10; x <= W + 10; x += 22) ctx.lineTo(x, sy + i * 24 * U + Math.sin(x * 0.03 + t * 1.4 + i) * 4 * U)
    ctx.stroke()
  }

  // fish — clipped to ABOVE the waterline, so they emerge from / dive into the
  // opaque sea and are completely hidden while submerged
  ctx.save()
  ctx.beginPath(); ctx.rect(-20, -20, W + 40, sy + 4 * U + 20); ctx.clip()
  for (const fi of fishes) drawFish(fi)
  ctx.restore()

  // foam waterline (drawn over the sea top, hides the clip seam)
  ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.85; ctx.lineWidth = 4 * U; ctx.lineCap = 'round'
  ctx.beginPath()
  for (let x = -10; x <= W + 10; x += 16) ctx.lineTo(x, sy + Math.sin(x * 0.045 + t * 2) * 4 * U)
  ctx.stroke(); ctx.globalAlpha = 1

  // splashes + sparks
  for (const s of splashes) { ctx.globalAlpha = clamp(s.life, 0, 1); ctx.fillStyle = '#eaf7ff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill() }
  for (const s of sparks) { ctx.globalAlpha = clamp(s.life, 0, 1); ctx.fillStyle = '#fff0a8'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill() }
  ctx.globalAlpha = 1

  drawBird()
  drawDrownMeter()
  drawConfetti()
  ctx.restore()
  drawHud()
}

// a depleting bar above the bird while it's in the water — how long until it drowns
function drawDrownMeter() {
  if (!bird || mode !== 'play' || bird.waterT <= 0) return
  const frac = clamp(1 - bird.waterT / DROWN_MS, 0, 1)
  const w = 80 * U, h = 12 * U
  const x = bird.x - w / 2, y = bird.y - 58 * U
  ctx.fillStyle = 'rgba(18,38,52,0.7)'                       // track
  roundRect(x, y, w, h, h / 2); ctx.fill()
  const col = frac > 0.5 ? '#5fd16a' : frac > 0.25 ? '#ffd23f' : '#ff5a5a'
  ctx.fillStyle = col                                       // remaining time (green→amber→red)
  roundRect(x, y, Math.max(h, w * frac), h, h / 2); ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.5 * U
  roundRect(x, y, w, h, h / 2); ctx.stroke()
  // tiny droplet marker so it reads as "water timer"
  ctx.fillStyle = '#eaf7ff'; ctx.font = `${Math.round(12 * U)}px ${SERIF}`
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('💧', x - 9 * U, y + h / 2)
}

function drawConfetti() {
  for (const c of confetti) {
    ctx.save(); ctx.globalAlpha = clamp(c.life, 0, 1)
    ctx.translate(c.x, c.y); ctx.rotate(c.rot)
    ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h)
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

function drawCloud(x, y, r) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.ellipse(x, y, r, r * 0.5, 0, 0, 7)
  ctx.ellipse(x - r * 0.5, y + r * 0.12, r * 0.5, r * 0.34, 0, 0, 7)
  ctx.ellipse(x + r * 0.5, y + r * 0.1, r * 0.55, r * 0.36, 0, 0, 7)
  ctx.fill()
}

function drawFish(fi) {
  ctx.save()
  ctx.translate(fi.x, fi.y)
  // tilt into the arc (nose up while rising, down while diving), in screen space
  const pitch = clamp((fi.y - fi.prevY) * 0.025, -0.5, 0.5)
  ctx.rotate(pitch)
  ctx.scale(NATIVE_RIGHT[fi.name] ? -1 : 1, 1)   // flip right-facing sprites so all swim left
  blitW(fi.name, fi.size)
  ctx.restore()
}

const WING_LINE = 0.52   // fraction of sprite height: above = wings, below = body/head
function drawBird() {
  ctx.save()
  ctx.translate(bird.x, bird.y)
  ctx.rotate(clamp(bird.vy * 0.03, -0.4, 0.6))
  const im = img['pterodactyl']
  const w = 124 * U
  if (im && im.complete && im.naturalWidth) {
    const nW = im.naturalWidth, nH = im.naturalHeight
    const h = w * nH / nW
    const splitSrc = WING_LINE * nH               // shoulder row in the source image
    const splitY = (WING_LINE - 0.5) * h          // shoulder line in dest space
    // body / head / beak / inner wing — STATIC (no transform)
    ctx.drawImage(im, 0, splitSrc, nW, nH - splitSrc, -w / 2, splitY, w, h * (1 - WING_LINE))
    // wings — only the upper band moves: vertical scale anchored at the shoulder
    // line, uniform width (no horizontal skew). Constant frequency = smooth beat.
    const beat = Math.sin(t * 11)
    const amp = 0.22 + 0.22 * bird.flapT
    const wingH = WING_LINE * h * (1 + beat * amp)
    ctx.drawImage(im, 0, 0, nW, splitSrc, -w / 2, splitY - wingH, w, wingH)
  }
  ctx.restore()
}

function panel(x, y, w, h, r) {
  ctx.fillStyle = 'rgba(20,52,74,0.66)'; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2
  roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke()
}
function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

function drawHud() {
  ctx.textBaseline = 'middle'
  panel(16, 16, 140, 44, 12)
  ctx.fillStyle = '#fff'; ctx.font = `600 22px ${SERIF}`; ctx.textAlign = 'left'
  ctx.fillText(`🐟 ${score}`, 32, 40)
  if (best > 0) {
    panel(W - 150, 16, 134, 44, 12)
    ctx.textAlign = 'right'; ctx.font = `500 19px ${SERIF}`
    ctx.fillText(`Best ${best}`, W - 30, 40)
  }
  drawCelebration()
  if (mode === 'ready') {
    centerCard('PTERANODON FISH RUN',
      ['Tap to flap and snatch the', 'leaping fish! 🐟', "Don't linger in the water! 🌊"],
      'TAP TO START')
  } else if (mode === 'over') {
    centerCard('SPLASH! 🌊',
      [`You caught ${score} fish 🐟`, best > 0 ? `Best: ${best}` : ''],
      'TAP TO PLAY AGAIN')
  } else if (score === 0 && t < 4) {
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(20,52,74,0.85)'; ctx.font = `500 18px ${SERIF}`
    ctx.fillText('Tap to flap ↑ — don’t linger in the water!', W / 2, H * 0.14)
  }
}

// big milestone flourish (pops in, scales up, fades) — fired at 5 / 10 / 20 / …
function drawCelebration() {
  if (!celebrate) return
  const p = clamp(celebrate.t / 1.4, 0, 1)
  const pop = 1 + 0.35 * Math.sin(Math.min(1, p * 4) * Math.PI / 2)
  ctx.save()
  ctx.globalAlpha = clamp(1.5 - p * 1.5, 0, 1)
  ctx.translate(W / 2, H * 0.3); ctx.scale(pop, pop)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'; ctx.lineWidth = 7 * U; ctx.strokeStyle = '#3a2616'; ctx.fillStyle = '#ffd23f'
  ctx.font = `800 ${Math.round(52 * U)}px ${SERIF}`
  ctx.strokeText(celebrate.label, 0, 0); ctx.fillText(celebrate.label, 0, 0)
  ctx.restore(); ctx.globalAlpha = 1
}

function centerCard(title, lines, cta) {
  const w = Math.min(W * 0.86, 540 * U + 120), h = 250 * U + 30
  const x = (W - w) / 2, y = (H - h) / 2
  panel(x, y, w, h, 18)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(30 * U + 8)}px ${SERIF}`
  ctx.fillText(title, W / 2, y + 50 * U + 8)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = `400 ${Math.round(16 * U + 4)}px ${SERIF}`
  let ly = y + 104 * U + 8
  for (const l of lines) { ctx.fillText(l, W / 2, ly); ly += 28 * U }
  const pulse = 0.5 + 0.5 * Math.sin(t * 3)
  ctx.fillStyle = `rgba(240,162,60,${0.7 + pulse * 0.3})`
  const pw = 240 * U + 20, ph = 48 * U
  roundRect(W / 2 - pw / 2, y + h - ph - 22 * U, pw, ph, ph / 2); ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
  ctx.fillStyle = '#3a2616'; ctx.font = `700 ${Math.round(16 * U + 3)}px ${SERIF}`
  ctx.fillText(cta, W / 2, y + h - ph / 2 - 22 * U)
}

// ---- loop ----
function frame(now) {
  if (!open) return
  const dt = Math.min(50, now - (lastT || now))
  lastT = now
  update(dt); draw()
  raf = requestAnimationFrame(frame)
}

// read-only snapshot for the prototype's headless feel-tests
export function __pteroDebug() {
  return {
    mode, score, best,
    bird: bird ? { x: bird.x, y: bird.y, vy: bird.vy, waterT: bird.waterT } : null,
    beakX: bird ? beakX() : 0, surfaceY: surfaceY(), W, H, assetsReady,
    celebrate: celebrate ? celebrate.label : null, confetti: confetti ? confetti.length : 0,
    fishes: fishes ? fishes.filter((f) => !f.caught).map((f) => ({ x: f.x, y: f.y, state: f.state })) : [],
  }
}

// ---- DOM / lifecycle ----
function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #ptero-game { position: fixed; inset: 0; z-index: 200; background: #7ec8ec;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #ptero-game.on { display: block; }
    #ptero-game canvas { width: 100%; height: 100%; display: block; cursor: pointer; }
    #ptero-game .pg-close { position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      z-index: 2; background: rgba(20,52,74,0.78); color: #fff; border: 1.5px solid rgba(255,255,255,0.6);
      font: 600 14px ${SERIF}; padding: 7px 16px; border-radius: 999px; cursor: pointer; letter-spacing: .03em; }
    #ptero-game .pg-close:hover { background: rgba(31,115,176,0.92); }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'ptero-game'
  canvas = document.createElement('canvas')
  closeBtn = document.createElement('button')
  closeBtn.className = 'pg-close'
  closeBtn.textContent = '‹ Back to the cliffs'
  overlay.append(canvas, closeBtn)
  document.body.appendChild(overlay)
  ctx = canvas.getContext('2d')

  canvas.addEventListener('pointerdown', onTap)
  closeBtn.addEventListener('pointerdown', (e) => e.stopPropagation())
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePteroGame() })
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', () => { if (open) layout() })
}

export function openPteroGame(opts = {}) {
  if (open) return
  ensureDom(); loadAssets()
  onCloseCb = opts.onClose || null
  goalFish = opts.goal || 0
  onCompleteCb = opts.onComplete || null
  open = true
  overlay.classList.add('on')
  mode = 'ready'; lastT = 0
  layout(); reset(); mode = 'ready'
  cancelAnimationFrame(raf); raf = requestAnimationFrame(frame)
}

export function closePteroGame() {
  if (!open) return
  open = false
  cancelAnimationFrame(raf)
  overlay.classList.remove('on')
  if (onCloseCb) { const cb = onCloseCb; onCloseCb = null; cb() }
}
