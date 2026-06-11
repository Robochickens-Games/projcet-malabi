import { Application, Container, Sprite, Graphics, Texture } from 'pixi.js'
import { gsap } from 'gsap'
import {
  lobbyBack, lobbyMid, lobbyFore, hallBack, hallFore,
  dioramaSVG, floorToothSVG, toothSVG, catalogCardArt,
  DINOS, DIORAMA_W, DIORAMA_H,
} from './art.js'

/* ---------- constants ---------- */
const DESIGN_W = 1920
const DESIGN_H = 1080
const MAX_X = 200 // max parallax shift at depth 1
const MAX_Y = 80

const $ = (id) => document.getElementById(id)

/* ---------- tiny synth (no assets needed) ---------- */
let AC = null
function note(freq, dur = 0.12, type = 'triangle', gain = 0.05, when = 0) {
  try {
    AC ??= new (window.AudioContext || window.webkitAudioContext)()
    const t0 = AC.currentTime + when
    const o = AC.createOscillator()
    const g = AC.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g).connect(AC.destination)
    o.start(t0)
    o.stop(t0 + dur + 0.02)
  } catch { /* audio is a garnish — never block on it */ }
}
const sfx = {
  tap: () => note(520, 0.08, 'triangle', 0.035),
  pickup: () => [660, 880, 1100].forEach((f, i) => note(f, 0.14, 'triangle', 0.05, i * 0.07)),
  wrong: () => note(150, 0.25, 'square', 0.04),
  success: () => [523, 659, 784, 1047].forEach((f, i) => note(f, 0.3, 'triangle', 0.06, i * 0.12)),
  whoosh: () => note(300, 0.25, 'sine', 0.03),
}

/* ---------- svg → texture ---------- */
async function svgTexture(svg) {
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  img.src = url
  await img.decode()
  const tex = Texture.from(img)
  URL.revokeObjectURL(url)
  return tex
}

/* ---------- parallax input (mouse hover / touch drag / device tilt) ---------- */
const parallax = {
  tx: 0, ty: 0, // target, -1..1
  x: 0, y: 0,   // smoothed
  tiltX: 0, tiltY: 0,
  dragX: 0, dragY: 0,
  update() {
    this.tx = Math.max(-1, Math.min(1, this.tiltX + this.dragX))
    this.ty = Math.max(-1, Math.min(1, this.tiltY + this.dragY))
    this.x += (this.tx - this.x) * 0.055
    this.y += (this.ty - this.y) * 0.055
  },
}

function setupInput() {
  // mouse hover → absolute position
  window.addEventListener('mousemove', (e) => {
    parallax.dragX = (e.clientX / window.innerWidth) * 2 - 1
    parallax.dragY = (e.clientY / window.innerHeight) * 2 - 1
  })

  // touch drag → pan around
  let touch = null
  window.addEventListener('touchstart', (e) => {
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: parallax.dragX, dy: parallax.dragY }
  }, { passive: true })
  window.addEventListener('touchmove', (e) => {
    if (!touch) return
    parallax.dragX = touch.dx + (e.touches[0].clientX - touch.x) / (window.innerWidth * 0.35)
    parallax.dragY = touch.dy + (e.touches[0].clientY - touch.y) / (window.innerHeight * 0.5)
  }, { passive: true })

  // device tilt
  let base = null
  const onTilt = (e) => {
    if (e.gamma == null || e.beta == null) return
    base ??= { g: e.gamma, b: e.beta }
    parallax.tiltX = Math.max(-1, Math.min(1, (e.gamma - base.g) / 22))
    parallax.tiltY = Math.max(-1, Math.min(1, (e.beta - base.b) / 22))
  }
  const needsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  if (needsPermission) {
    const btn = $('tilt-btn')
    btn.classList.remove('hidden')
    btn.addEventListener('click', async () => {
      try {
        if ((await DeviceOrientationEvent.requestPermission()) === 'granted') {
          window.addEventListener('deviceorientation', onTilt)
        }
      } finally { btn.classList.add('hidden') }
    })
  } else if ('ontouchstart' in window) {
    window.addEventListener('deviceorientation', onTilt)
  }
}

/* ---------- toast ---------- */
let toastTimer = null
function toast(msg, ms = 4200) {
  const el = $('toast')
  el.textContent = msg
  el.classList.remove('hidden')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.add('hidden'), ms)
}

/* ---------- game state ---------- */
const state = { hasTooth: false, solved: false, scene: 'lobby', triedWrong: 0 }

/* ---------- scene helpers ---------- */
// place a child at design-space coords (0..1920, 0..1080) inside a centered layer
function placeAt(child, dx, dy) {
  child.position.set(dx - DESIGN_W / 2, dy - DESIGN_H / 2)
  return child
}

function makeLayer(tex, depth) {
  const c = new Container()
  const s = new Sprite(tex)
  s.anchor.set(0.5)
  c.addChild(s)
  c._depth = depth
  return c
}

function makeDust(scene, count, tint = 0xf4e6c8) {
  for (let i = 0; i < count; i++) {
    const g = new Graphics().circle(0, 0, 1 + Math.random() * 2.2).fill({ color: tint, alpha: 0.12 + Math.random() * 0.3 })
    g._p = {
      x: (Math.random() - 0.5) * DESIGN_W * 1.1,
      y: (Math.random() - 0.5) * DESIGN_H * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
      depth: 0.15 + Math.random() * 0.7,
      amp: 8 + Math.random() * 22,
    }
    scene._dust.push(g)
    scene.addChild(g)
  }
}

function hitRect(dx, dy, w, h, onTap) {
  const g = new Graphics().rect(0, 0, w, h).fill({ color: 0xffffff, alpha: 0.0001 })
  placeAt(g, dx, dy)
  g.eventMode = 'static'
  g.cursor = 'pointer'
  g.on('pointertap', onTap)
  return g
}

/* ---------- boot ---------- */
// NOTE: no top-level await here — with Vite/Rollup chunking, a top-level await
// in the entry chunk deadlocks against pixi's dynamically-imported renderer
// chunks (they import back from the paused entry chunk). Hence boot() at the end.
let app, root, lobby, hall
let toothSprite, sparkle, archGlow
const dioramas = {}

function layout() {
  const s = Math.max(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
  root.scale.set(s)
  root.position.set(window.innerWidth / 2, window.innerHeight / 2)
}

async function buildLobby() {
  const [back, mid, fore, toothTex] = await Promise.all(
    [lobbyBack(), lobbyMid(), lobbyFore(), floorToothSVG()].map(svgTexture),
  )

  const backL = makeLayer(back, 0.06)
  const shaftL = new Container(); shaftL._depth = 0.12
  const midL = makeLayer(mid, 0.28)
  const toothL = new Container(); toothL._depth = 0.5
  const foreL = makeLayer(fore, 0.82)

  // light shafts from the windows (design x: 360 / 960 / 1560)
  for (const wx of [360, 960, 1560]) {
    const shaft = new Graphics()
      .poly([wx - 70, 100, wx + 80, 100, wx - 110, DESIGN_H, wx - 330, DESIGN_H])
      .fill({ color: 0xffdf9e, alpha: 0.055 })
    shaft.position.set(-DESIGN_W / 2, -DESIGN_H / 2)
    shaft.blendMode = 'add'
    gsap.to(shaft, { alpha: 0.55, duration: 3 + Math.random() * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    shaftL.addChild(shaft)
  }

  // the tooth on the floor — half hidden behind the foreground planter;
  // tilt / move to reveal it (the parallax "find things behind things" beat)
  toothSprite = new Sprite(toothTex)
  toothSprite.anchor.set(0.5)
  placeAt(toothSprite, 1485, 988)
  toothSprite.eventMode = 'static'
  toothSprite.cursor = 'pointer'
  toothSprite.on('pointertap', pickUpTooth)
  toothL.addChild(toothSprite)

  // its sparkle
  sparkle = new Graphics()
  const star = (g, r) => g.poly([0, -r, r * 0.3, -r * 0.3, r, 0, r * 0.3, r * 0.3, 0, r, -r * 0.3, r * 0.3, -r, 0, -r * 0.3, -r * 0.3]).fill({ color: 0xffe9b0 })
  star(sparkle, 16)
  sparkle.blendMode = 'add'
  placeAt(sparkle, 1505, 950)
  gsap.to(sparkle, { alpha: 0.15, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  gsap.to(sparkle.scale, { x: 1.5, y: 1.5, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  toothL.addChild(sparkle)

  // arch glow — wakes up once the tooth is collected
  archGlow = new Graphics().ellipse(0, 0, 230, 60).fill({ color: 0xe8a948, alpha: 0.3 })
  placeAt(archGlow, 710, 980)
  archGlow.blendMode = 'add'
  archGlow.alpha = 0
  midL.addChild(archGlow)

  // archway → dinosaur hall
  midL.addChild(hitRect(505, 320, 410, 660, enterHall))

  lobby.addChild(backL, shaftL, midL, toothL, foreL)
  lobby._layers = [backL, shaftL, midL, toothL, foreL]
  makeDust(lobby, 26)
}

/* ---------- build HALL ---------- */
async function buildHall() {
  const [back, fore] = await Promise.all([hallBack(), hallFore()].map(svgTexture))
  const dioTexs = await Promise.all(DINOS.map((d) => svgTexture(dioramaSVG(d))))

  const backL = makeLayer(back, 0.06)
  const dioL = new Container(); dioL._depth = 0.35
  const foreL = makeLayer(fore, 0.82)

  const xs = [330, 960, 1590]
  DINOS.forEach((dino, i) => {
    const c = new Container()
    const s = new Sprite(dioTexs[i])
    s.anchor.set(0.5)
    c.addChild(s)

    const glow = new Graphics()
      .roundRect(-DIORAMA_W / 2 - 14, -DIORAMA_H / 2 - 8, DIORAMA_W + 28, DIORAMA_H + 16, 26)
      .stroke({ color: 0xffd98a, width: 12, alpha: 0.9 })
    glow.alpha = 0
    glow.blendMode = 'add'
    c.addChild(glow)
    c._glow = glow

    placeAt(c, xs[i], 580)
    c.eventMode = 'static'
    c.cursor = 'pointer'
    c.on('pointertap', () => tryDiorama(dino, c))
    dioL.addChild(c)
    dioramas[dino.id] = c
  })

  hall.addChild(backL, dioL, foreL)
  hall._layers = [backL, dioL, foreL]
  makeDust(hall, 22, 0xbfe3ef)
}

/* ---------- game beats ---------- */
let lobbyHintTimer = null

function pickUpTooth() {
  if (state.hasTooth) return
  state.hasTooth = true
  clearTimeout(lobbyHintTimer)
  sfx.pickup()

  // fly a DOM clone of the tooth into the HUD slot
  const gp = toothSprite.getGlobalPosition()
  const slot = $('tooth-slot').getBoundingClientRect()
  const fly = document.createElement('div')
  fly.style.cssText = 'position:fixed;left:0;top:0;z-index:40;pointer-events:none;will-change:transform'
  fly.innerHTML = floorToothSVG()
  document.body.appendChild(fly)
  gsap.fromTo(fly,
    { x: gp.x - 60, y: gp.y - 60, scale: 1 },
    {
      x: slot.left + slot.width / 2 - 60, y: slot.top + slot.height / 2 - 60, scale: 0.38,
      duration: 0.8, ease: 'power2.inOut',
      onComplete: () => {
        fly.remove()
        const slotEl = $('tooth-slot')
        slotEl.classList.remove('empty')
        slotEl.classList.add('filled')
        slotEl.innerHTML = toothSVG('leaf', 32, 40)
        gsap.fromTo(slotEl, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
      },
    })

  gsap.to(toothSprite, { alpha: 0, duration: 0.25 })
  gsap.to(sparkle, { alpha: 0, duration: 0.25, overwrite: true })
  toothSprite.eventMode = 'none'

  // wake the archway
  gsap.to(archGlow, { alpha: 0.65, duration: 1.2 })
  gsap.to(archGlow, { alpha: 0.25, duration: 1.4, yoyo: true, repeat: -1, delay: 1.2 })

  toast('A fossil tooth! It’s wide and flat. Open the 📖 Catalog to see whose it might be…', 6000)
  $('catalog-btn').classList.add('pulse')
}

function enterHall() {
  if (state.scene !== 'lobby') return
  state.scene = 'hall'
  sfx.whoosh()
  $('back-btn').classList.remove('hidden')
  switchScene(lobby, hall, -1)
  setTimeout(() => {
    toast(state.hasTooth
      ? 'The Hall of Dinosaurs! Three dioramas… which dinosaur lost your tooth? Tap one to try.'
      : 'Magnificent! But you feel like you missed a clue back in the lobby…', 6000)
  }, 700)
}

function backToLobby() {
  if (state.scene !== 'hall') return
  state.scene = 'lobby'
  sfx.whoosh()
  $('back-btn').classList.add('hidden')
  switchScene(hall, lobby, 1)
}

function switchScene(from, to, dir) {
  to.visible = true
  to.alpha = 0
  to.position.x = 220 * dir
  gsap.to(from, { alpha: 0, duration: 0.45, ease: 'power1.in', onComplete: () => { from.visible = false } })
  gsap.to(from.position, { x: -180 * dir, duration: 0.5, ease: 'power1.in' })
  gsap.to(to, { alpha: 1, duration: 0.55, delay: 0.25, ease: 'power1.out' })
  gsap.to(to.position, { x: 0, duration: 0.65, delay: 0.25, ease: 'power2.out' })
}

function tryDiorama(dino, container) {
  if (state.solved) return
  if (!state.hasTooth) {
    sfx.tap()
    toast('You’ll need a clue first… something glinted back in the lobby.')
    return
  }
  if (dino.correct) {
    state.solved = true
    sfx.success()
    gsap.to(container._glow, { alpha: 1, duration: 0.5 })
    gsap.fromTo(container.scale, { x: 1, y: 1 }, { x: 1.04, y: 1.04, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' })
    confetti(container)
    setTimeout(() => {
      $('success-text').textContent = dino.successText
      $('success').classList.remove('hidden')
    }, 1100)
  } else {
    state.triedWrong++
    sfx.wrong()
    const ox = container.position.x
    gsap.timeline()
      .to(container.position, { x: ox - 12, duration: 0.06 })
      .to(container.position, { x: ox + 12, duration: 0.06, repeat: 3, yoyo: true })
      .to(container.position, { x: ox, duration: 0.06 })
    toast(dino.wrongHint, 5500)
    if (state.triedWrong === 1) $('catalog-btn').classList.add('pulse')
  }
}

function confetti(fromContainer) {
  const gp = fromContainer.getGlobalPosition()
  // convert screen → root space
  const lx = (gp.x - root.position.x) / root.scale.x
  const ly = (gp.y - root.position.y) / root.scale.y
  const colors = [0xe8a948, 0xf4e6c8, 0x7fb6c9, 0xc9802e]
  for (let i = 0; i < 70; i++) {
    const g = new Graphics()
    if (Math.random() > 0.5) g.rect(-4, -7, 8, 14).fill(colors[i % colors.length])
    else g.circle(0, 0, 5).fill(colors[i % colors.length])
    g.position.set(lx, ly - 100)
    root.addChild(g)
    const a = Math.random() * Math.PI * 2
    const v = 180 + Math.random() * 420
    gsap.to(g, {
      x: lx + Math.cos(a) * v,
      y: ly - 100 + Math.sin(a) * v * 0.7 + 260,
      rotation: (Math.random() - 0.5) * 9,
      alpha: 0,
      duration: 1.3 + Math.random() * 0.9,
      ease: 'power1.out',
      onComplete: () => g.destroy(),
    })
  }
}

/* ---------- catalog ---------- */
function buildCatalog() {
  $('catalog-cards').innerHTML = DINOS.map((d) => `
    <div class="dino-card">
      <div class="art">${catalogCardArt(d)}</div>
      <h3>${d.name}</h3>
      <div class="diet">${d.diet}</div>
      <div class="tooth-row">
        ${toothSVG(d.tooth, 38, 46)}
        <span>${d.toothNote}</span>
      </div>
    </div>`).join('')

  $('catalog-btn').addEventListener('pointerdown', () => {
    sfx.tap()
    $('catalog-btn').classList.remove('pulse')
    $('catalog').classList.remove('hidden')
  })
  $('catalog-close').addEventListener('pointerdown', () => {
    $('catalog').classList.add('hidden')
    if (state.hasTooth && !state.solved && state.scene === 'lobby') {
      toast('Wide and flat… a plant eater’s tooth! The Dinosaur Wing is through the big archway.', 5500)
    }
  })
}

/* ---------- go ---------- */
async function boot() {
  app = new Application()
  await app.init({
    preference: 'webgl',
    resizeTo: window,
    background: '#120a04',
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
  })
  $('stage').appendChild(app.canvas)

  root = new Container()
  app.stage.addChild(root)
  layout()
  window.addEventListener('resize', layout)

  lobby = new Container()
  lobby._layers = []
  lobby._dust = []
  root.addChild(lobby)

  hall = new Container()
  hall._layers = []
  hall._dust = []
  hall.visible = false
  hall.alpha = 0
  root.addChild(hall)

  $('back-btn').addEventListener('pointerdown', backToLobby)
  $('replay-btn').addEventListener('pointerdown', () => location.reload())
  setupInput()
  buildCatalog()
  await Promise.all([buildLobby(), buildHall()])

  // update loop
  let t = 0
  app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000
    // gentle ambient drift so the scene breathes even with no input
    const ax = Math.sin(t * 0.25) * 0.07
    const ay = Math.cos(t * 0.18) * 0.05
    parallax.update()
    const px = parallax.x + ax
    const py = parallax.y + ay

    for (const scene of [lobby, hall]) {
      if (!scene.visible) continue
      for (const layer of scene._layers) {
        layer.position.x = -px * MAX_X * layer._depth
        layer.position.y = -py * MAX_Y * layer._depth
      }
      for (const d of scene._dust) {
        const p = d._p
        d.position.x = p.x + Math.sin(t * p.speed + p.phase) * p.amp - px * MAX_X * p.depth
        d.position.y = p.y + Math.cos(t * p.speed * 0.8 + p.phase) * p.amp * 0.6 - py * MAX_Y * p.depth
      }
    }
  })

  toast('You’re in the museum lobby. Something glints on the floor… tilt or move around to spot it!', 6500)
  lobbyHintTimer = setTimeout(() => {
    if (!state.hasTooth) toast('Psst — check near the big plant on the right. Things hide behind things here…', 6000)
  }, 12000)
}

boot()
