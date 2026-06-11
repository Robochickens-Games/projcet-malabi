import { Application, Container, Sprite, Graphics, Texture } from 'pixi.js'
import { gsap } from 'gsap'
import { toothSVG, catalogCardArt, DINOS } from './art.js'
import {
  INK, LOBBY_W, LOBBY_SPOTS, lobbyBackSVG, lobbyMainSVG, lobbyForeSVG,
  GROVE_W, GROVE_SPOTS, GUIDE, groveCloudsSVG, groveMountainsSVG, groveMidSVG, groveMainSVG, canopySVG, bushSVG,
} from './wireframe.js'

/* ---------- constants ---------- */
const DESIGN_W = 1920
const DESIGN_H = 1080

// every scene is a side-scrolling world (platformer parallax): layers carry a
// scroll speed; the camera walks left↔right; real art replaces wireframes 1:1
const WORLDS = {
  lobby: { w: LOBBY_W },
  grove: { w: GROVE_W },
}

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

/* ---------- game state ---------- */
const state = { hasTooth: false, solved: false, scene: 'lobby', triedWrong: 0 }

/* ---------- input: walk the world ---------- */
const cams = { lobby: { x: 0, vel: 0 }, grove: { x: 0, vel: 0 } }
const camMax = () => WORLDS[state.scene].w - DESIGN_W
const cam = () => cams[state.scene]
const lens = { x: 0, y: 0, tx: 0, ty: 0 } // micro hover parallax on top
const keys = { left: false, right: false }

function nudgeCam(dx) {
  const c = cam()
  c.x = Math.max(0, Math.min(camMax(), c.x + dx))
}

function setupInput() {
  window.addEventListener('mousemove', (e) => {
    lens.tx = (e.clientX / window.innerWidth) * 2 - 1
    lens.ty = (e.clientY / window.innerHeight) * 2 - 1
  })

  // drag to walk (mouse + touch): 1:1 grab while held, then the camera keeps
  // the swipe's momentum and glides to a stop — accelerative, inertial feel.
  // velocity is sampled DURING the swipe (a release delta is ~0 → no fling).
  let drag = null
  const dragStart = (x) => { drag = { lastX: x, lastT: performance.now(), moved: 0, vel: 0 } }
  const dragMove = (x) => {
    if (!drag) return
    const t = performance.now()
    const dx = x - drag.lastX
    const dt = Math.max(8, t - drag.lastT)
    drag.moved += Math.abs(dx)
    // camera velocity in px/s (world scrolls opposite the finger), smoothed
    drag.vel = drag.vel * 0.55 + (-dx / (dt / 1000)) * 0.45
    drag.lastX = x
    drag.lastT = t
    nudgeCam(-dx)            // grab the world 1:1 under the finger
    cam().vel = 0            // engine momentum is paused while held
  }
  const dragEnd = () => {
    if (!drag) return
    // hand the swipe's momentum to the camera; it decays via friction
    if (drag.moved > 16 && performance.now() - drag.lastT < 90) {
      cam().vel = Math.max(-5000, Math.min(5000, drag.vel))
    }
    drag = null
  }
  window.addEventListener('mousedown', (e) => dragStart(e.clientX))
  window.addEventListener('mousemove', (e) => dragMove(e.clientX))
  window.addEventListener('mouseup', () => dragEnd())
  window.addEventListener('touchstart', (e) => dragStart(e.touches[0].clientX), { passive: true })
  window.addEventListener('touchmove', (e) => dragMove(e.touches[0].clientX), { passive: true })
  window.addEventListener('touchend', () => dragEnd(), { passive: true })

  window.addEventListener('wheel', (e) => {
    nudgeCam(Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY)
  }, { passive: true })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true
    if (e.key === 'ArrowRight') keys.right = true
  })
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false
    if (e.key === 'ArrowRight') keys.right = false
  })

  // tilt to walk
  let base = null
  const onTilt = (e) => {
    if (e.gamma == null) return
    base ??= e.gamma
    cam().vel += Math.max(-1, Math.min(1, (e.gamma - base) / 22)) * 30
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
function toast(msg, ms = 4800) {
  const el = $('toast')
  el.textContent = msg
  el.classList.remove('hidden')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.add('hidden'), ms)
}

/* ---------- scene helpers ---------- */
// children are placed in WORLD coords (0..world width, 0..1080)
function placeAt(child, wx, wy) {
  child.position.set(wx - DESIGN_W / 2, wy - DESIGN_H / 2)
  return child
}

function scrollLayer(speed) {
  const c = new Container()
  c._speed = speed
  return c
}

function makeDust(scene, count, worldW, tint = 0xc2d6e2) {
  for (let i = 0; i < count; i++) {
    const g = new Graphics().circle(0, 0, 1 + Math.random() * 2).fill({ color: tint, alpha: 0.1 + Math.random() * 0.25 })
    g._p = {
      x: Math.random() * (worldW + 400) - DESIGN_W / 2 - 200,
      y: (Math.random() - 0.5) * DESIGN_H * 1.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5,
      depth: 0.25 + Math.random() * 0.9,
      amp: 8 + Math.random() * 22,
    }
    scene._dust.push(g)
    scene.addChild(g)
  }
}

function hitRect(wx, wy, w, h, onTap) {
  const g = new Graphics().rect(0, 0, w, h).fill({ color: 0xffffff, alpha: 0.0001 })
  placeAt(g, wx, wy)
  g.eventMode = 'static'
  g.cursor = 'pointer'
  g.on('pointertap', onTap)
  return g
}

/* ---------- boot ---------- */
// no top-level await: it deadlocks pixi's dynamic renderer chunks in the Rollup build
let app, root, lobby, grove
let toothSprite, sparkle, doorGlow, skeletonGlow, trayGlow
const cardFx = {}

function layout() {
  const s = Math.max(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
  root.scale.set(s)
  root.position.set(window.innerWidth / 2, window.innerHeight / 2)
}

/* ---------- LOBBY ---------- */
async function buildLobby() {
  const [backT, mainT, foreT, toothT] = await Promise.all(
    [lobbyBackSVG(), lobbyMainSVG(), lobbyForeSVG(), toothSVG('leaf', 64, 83)].map(svgTexture),
  )

  const backL = scrollLayer(0.25)
  const back = new Sprite(backT)
  back.anchor.set(0.5)
  placeAt(back, 1100, 540)
  backL.addChild(back)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, LOBBY_W / 2, 540)
  mainL.addChild(main)

  // glow under the dinosaur door once the tooth is collected
  doorGlow = new Graphics().ellipse(0, 0, 230, 50).fill({ color: 0xe8a948, alpha: 0.3 })
  placeAt(doorGlow, LOBBY_SPOTS.doorDino.x, 905)
  doorGlow.blendMode = 'add'
  doorGlow.alpha = 0
  mainL.addChild(doorGlow)

  mainL.addChild(hitRect(LOBBY_SPOTS.doorDino.x - 180, 300, 360, 580, enterGrove))
  mainL.addChild(hitRect(LOBBY_SPOTS.doorSpace.x - 170, 320, 340, 560, () => { sfx.tap(); toast('SPACE wing — roped off. Opening soon! ✨') }))
  mainL.addChild(hitRect(LOBBY_SPOTS.doorInventions.x - 170, 320, 340, 560, () => { sfx.tap(); toast('INVENTIONS wing — roped off. Opening soon! ⚙️') }))

  // the tooth rides its own layer, slightly slower than the planter in front
  // of it — WALKING past reveals it (the parallax beat)
  const toothL = scrollLayer(1.15)
  toothSprite = new Sprite(toothT)
  toothSprite.anchor.set(0.5)
  toothSprite.rotation = 0.4
  placeAt(toothSprite, LOBBY_SPOTS.tooth.x, LOBBY_SPOTS.tooth.y)
  toothSprite.eventMode = 'static'
  toothSprite.cursor = 'pointer'
  toothSprite.on('pointertap', pickUpTooth)
  toothL.addChild(toothSprite)

  sparkle = new Graphics()
    .poly([0, -16, 5, -5, 16, 0, 5, 5, 0, 16, -5, 5, -16, 0, -5, -5])
    .fill({ color: 0xffe9b0 })
  sparkle.blendMode = 'add'
  placeAt(sparkle, LOBBY_SPOTS.tooth.x + 26, LOBBY_SPOTS.tooth.y - 36)
  gsap.to(sparkle, { alpha: 0.15, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  gsap.to(sparkle.scale, { x: 1.5, y: 1.5, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  toothL.addChild(sparkle)

  const foreL = scrollLayer(1.4)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 3300 / 2, 540)
  foreL.addChild(fore)

  lobby.addChild(backL, mainL, toothL, foreL)
  lobby._layers = [backL, mainL, toothL, foreL]
  lobby._main = mainL
  makeDust(lobby, 26, LOBBY_W)
}

/* ---------- GROVE ---------- */
async function buildGrove() {
  const [cloudsT, mountainsT, midT, mainT, canopyT, bushT] = await Promise.all(
    [groveCloudsSVG(), groveMountainsSVG(), groveMidSVG(), groveMainSVG(), canopySVG(), bushSVG()].map(svgTexture),
  )

  const cloudsL = scrollLayer(0.1)
  const clouds = new Sprite(cloudsT)
  clouds.anchor.set(0.5)
  placeAt(clouds, 2150 / 2, 540)
  cloudsL.addChild(clouds)

  const mountainsL = scrollLayer(0.3)
  const mountains = new Sprite(mountainsT)
  mountains.anchor.set(0.5)
  placeAt(mountains, 2520 / 2, 540)
  mountainsL.addChild(mountains)

  const midL = scrollLayer(0.5)
  const mid = new Sprite(midT)
  mid.anchor.set(0.5)
  placeAt(mid, 1450, 540)
  midL.addChild(mid)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, GROVE_W / 2, 540)
  mainL.addChild(main)

  const S = GROVE_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, backToLobby))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('TRICERATOPS — “three-horned face”. A plant eater with a beak and hundreds of leaf-shaped teeth.')
  }))
  mainL.addChild(hitRect(S.skeleton.x - S.skeleton.w / 2, S.skeleton.y, S.skeleton.w, S.skeleton.h, () => {
    sfx.tap()
    toast('A skeleton guarding its nest… Which tooth card in the field guide matches YOUR find?')
  }))
  mainL.addChild(hitRect(S.bag.x - 60, S.bag.y - 60, 120, 120, () => { sfx.tap(); $('catalog').classList.remove('hidden') }))
  mainL.addChild(hitRect(S.hint.x - 60, S.hint.y - 60, 120, 120, () => {
    sfx.tap()
    toast(state.solved
      ? 'You solved it! Tap the skeleton to say goodbye.'
      : state.hasTooth
        ? 'Look at your tooth: wide, with a broad flat edge. Find the card that says that…'
        : 'You need a clue first — something glinted back in the lobby.')
  }))
  mainL.addChild(hitRect(S.tray.x, S.tray.y, 620, 110, () => {
    sfx.tap()
    if (state.hasTooth) toast('Your fossil tooth — wide and flat, with grinding ridges.')
  }))

  for (const card of GUIDE.cards) {
    const fx = new Graphics()
      .roundRect(0, 0, card.w, card.h, 12)
      .stroke({ color: 0xffd98a, width: 7, alpha: 0.95 })
    placeAt(fx, card.x, card.y)
    fx.alpha = 0
    fx.blendMode = 'add'
    mainL.addChild(fx)
    cardFx[card.name] = fx
    mainL.addChild(hitRect(card.x, card.y, card.w, card.h, () => tryCard(card)))
  }

  skeletonGlow = new Graphics()
    .roundRect(0, 0, S.skeleton.w, S.skeleton.h, 24)
    .fill({ color: 0xffd98a, alpha: 0.14 })
    .stroke({ color: 0xffd98a, width: 8, alpha: 0.8 })
  placeAt(skeletonGlow, S.skeleton.x - S.skeleton.w / 2, S.skeleton.y)
  skeletonGlow.alpha = 0
  skeletonGlow.blendMode = 'add'
  mainL.addChild(skeletonGlow)

  trayGlow = new Graphics().roundRect(0, 0, 120, 74, 8).stroke({ color: 0xffd98a, width: 6, alpha: 0.9 })
  placeAt(trayGlow, S.tray.x + 24, S.tray.y + 18)
  trayGlow.alpha = 0
  trayGlow.blendMode = 'add'
  mainL.addChild(trayGlow)

  // foreground: canopy hanging from the top, bushes along the bottom (fastest)
  const foreL = scrollLayer(1.42)
  for (const [wx, s, flip] of [[260, 1.4, false], [1500, 1.1, true], [2900, 1.5, false], [4350, 1.2, true]]) {
    const c = new Sprite(canopyT)
    c.anchor.set(0.5, 0)
    c.scale.set(s * (flip ? -1 : 1), s)
    placeAt(c, wx, -20)
    foreL.addChild(c)
  }
  for (const [wx, s, flip] of [[700, 1.3, false], [2100, 1.6, true], [3550, 1.2, false], [4650, 1.5, true]]) {
    const b = new Sprite(bushT)
    b.anchor.set(0.5, 1)
    b.scale.set(s * (flip ? -1 : 1), s)
    placeAt(b, wx, 1110)
    foreL.addChild(b)
  }

  grove.addChild(cloudsL, mountainsL, midL, mainL, foreL)
  grove._layers = [cloudsL, mountainsL, midL, mainL, foreL]
  grove._main = mainL
  makeDust(grove, 32, GROVE_W, 0xd8f0a0)
}

/* ---------- game beats ---------- */
let lobbyHintTimer = null

function pickUpTooth() {
  if (state.hasTooth) return
  state.hasTooth = true
  clearTimeout(lobbyHintTimer)
  sfx.pickup()

  const gp = toothSprite.getGlobalPosition()
  const slot = $('tooth-slot').getBoundingClientRect()
  const fly = document.createElement('div')
  fly.style.cssText = 'position:fixed;left:0;top:0;z-index:40;pointer-events:none;will-change:transform'
  fly.innerHTML = toothSVG('leaf', 64, 83)
  document.body.appendChild(fly)
  gsap.fromTo(fly,
    { x: gp.x - 32, y: gp.y - 42, scale: 1, rotation: 23 },
    {
      x: slot.left + slot.width / 2 - 32, y: slot.top + slot.height / 2 - 42, scale: 0.5, rotation: 0,
      duration: 0.8, ease: 'power2.inOut',
      onComplete: () => {
        fly.remove()
        const slotEl = $('tooth-slot')
        slotEl.classList.remove('empty')
        slotEl.classList.add('filled')
        slotEl.innerHTML = toothSVG('leaf', 30, 39)
        gsap.fromTo(slotEl, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
      },
    })

  gsap.to(toothSprite, { alpha: 0, duration: 0.25 })
  gsap.to(sparkle, { alpha: 0, duration: 0.25, overwrite: true })
  toothSprite.eventMode = 'none'

  gsap.to(doorGlow, { alpha: 0.7, duration: 1.2 })
  gsap.to(doorGlow, { alpha: 0.25, duration: 1.4, yoyo: true, repeat: -1, delay: 1.2 })

  toast('A fossil tooth! It’s wide and flat. The DINOSAUR WING is at the end of the hall →', 6000)
}

function enterGrove() {
  if (state.scene !== 'lobby') return
  state.scene = 'grove'
  cams.grove.x = 0
  cams.grove.vel = 0
  sfx.whoosh()
  $('back-btn').classList.remove('hidden')
  $('walk-arrow').classList.remove('hidden')
  switchScene(lobby, grove, -1)
  if (state.hasTooth && !state.solved) gsap.to(trayGlow, { alpha: 0.8, duration: 1, delay: 1, yoyo: true, repeat: 3 })
  setTimeout(() => {
    toast(state.hasTooth
      ? 'A jungle trail! Walk right — drag, tilt, scroll, or arrow keys — and find out whose tooth you’re carrying.'
      : 'A jungle trail! Walk right and explore… though you feel like you missed a clue back in the lobby.', 6500)
  }, 700)
}

function backToLobby() {
  if (state.scene !== 'grove') return
  state.scene = 'lobby'
  sfx.whoosh()
  $('back-btn').classList.add('hidden')
  $('walk-arrow').classList.add('hidden')
  switchScene(grove, lobby, 1)
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

function tryCard(card) {
  if (state.solved) return
  if (!state.hasTooth) {
    sfx.tap()
    toast('You’ll need a clue to compare first… something glinted back in the lobby.')
    return
  }
  const fx = cardFx[card.name]
  if (card.correct) {
    state.solved = true
    sfx.success()
    gsap.to(fx, { alpha: 1, duration: 0.4 })
    gsap.to(skeletonGlow, { alpha: 1, duration: 0.6, delay: 0.3 })
    confetti(skeletonGlow)
    setTimeout(() => {
      $('success-text').innerHTML =
        'Broad &amp; flat — for grinding ferns and leaves. A <b>plant eater’s</b> tooth!<br>' +
        'And the skeleton guarding the nest? <b>Triceratops</b> — it’s a perfect match.'
      $('success').classList.remove('hidden')
    }, 1400)
  } else {
    state.triedWrong++
    sfx.wrong()
    gsap.fromTo(fx, { alpha: 0.9 }, { alpha: 0, duration: 0.9, ease: 'power2.out' })
    const ox = grove._main.pivot.x
    gsap.timeline()
      .to(grove._main.pivot, { x: ox + 9, duration: 0.06 })
      .to(grove._main.pivot, { x: ox - 9, duration: 0.06, repeat: 2, yoyo: true })
      .to(grove._main.pivot, { x: ox, duration: 0.06 })
    toast(card.hint, 5600)
  }
}

function confetti(fromContainer) {
  const gp = fromContainer.getGlobalPosition()
  const lx = (gp.x - root.position.x) / root.scale.x
  const ly = (gp.y - root.position.y) / root.scale.y
  const colors = [0xe8a948, 0xf4e6c8, 0x7fb6c9, 0xc2d6e2]
  for (let i = 0; i < 70; i++) {
    const g = new Graphics()
    if (Math.random() > 0.5) g.rect(-4, -7, 8, 14).fill(colors[i % colors.length])
    else g.circle(0, 0, 5).fill(colors[i % colors.length])
    g.position.set(lx + 320, ly + 230)
    root.addChild(g)
    const a = Math.random() * Math.PI * 2
    const v = 180 + Math.random() * 420
    gsap.to(g, {
      x: lx + 320 + Math.cos(a) * v,
      y: ly + 230 + Math.sin(a) * v * 0.7 + 260,
      rotation: (Math.random() - 0.5) * 9,
      alpha: 0,
      duration: 1.3 + Math.random() * 0.9,
      ease: 'power1.out',
      onComplete: () => g.destroy(),
    })
  }
}

/* ---------- catalog (field notes modal — also opened by the BAG) ---------- */
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
      toast('Wide and flat… a plant eater’s tooth! The DINOSAUR WING is at the end of the hall →', 5500)
    }
  })
}

/* ---------- go ---------- */
async function boot() {
  app = new Application()
  await app.init({
    preference: 'webgl',
    resizeTo: window,
    background: INK,
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

  grove = new Container()
  grove._layers = []
  grove._dust = []
  grove.visible = false
  grove.alpha = 0
  root.addChild(grove)

  $('back-btn').addEventListener('pointerdown', backToLobby)
  $('replay-btn').addEventListener('pointerdown', () => location.reload())
  setupInput()
  buildCatalog()
  await Promise.all([buildLobby(), buildGrove()])

  let t = 0
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000
    t += dt
    lens.x += (lens.tx - lens.x) * 0.055
    lens.y += (lens.ty - lens.y) * 0.055
    const px = lens.x + Math.sin(t * 0.25) * 0.07
    const py = lens.y + Math.cos(t * 0.18) * 0.05

    const scene = state.scene === 'lobby' ? lobby : grove
    if (!scene.visible) return
    const c = cam()

    // movement acceleration: velocity eases toward walk speed, so starting
    // and stopping have weight (and the parallax slide reads clearly).
    // when nothing's driving, momentum glides out via frame-rate-independent
    // friction — a flung swipe coasts to a stop.
    const target = keys.right ? 1100 : keys.left ? -1100 : 0
    if (target !== 0) c.vel += (target - c.vel) * Math.min(1, 2.2 * dt)
    else c.vel *= Math.pow(0.06, dt) // ≈0.955/frame @60fps, but dt-correct
    if (Math.abs(c.vel) < 2) c.vel = 0
    c.x = Math.max(0, Math.min(camMax(), c.x + c.vel * dt))
    if (c.x === 0 || c.x === camMax()) c.vel = 0
    if (c.x > camMax() * 0.3) $('walk-arrow').classList.add('hidden')

    for (const layer of scene._layers) {
      layer.position.x = -c.x * layer._speed - px * 24 * layer._speed
      layer.position.y = -py * 18 * layer._speed
    }
    for (const d of scene._dust) {
      const p = d._p
      d.position.x = p.x + Math.sin(t * p.speed + p.phase) * p.amp - c.x * p.depth - px * 24 * p.depth
      d.position.y = p.y + Math.cos(t * p.speed * 0.8 + p.phase) * p.amp * 0.6 - py * 18 * p.depth
    }
  })

  // read-only debug hook (used by the prototype's headless feel-tests)
  window.__cam = () => ({ scene: state.scene, x: cam().x, vel: cam().vel })

  $('walk-arrow').classList.remove('hidden')
  toast('You’re in the museum lobby — walk right (drag, scroll, tilt, or arrow keys). Something glints behind the planter…', 7000)
  lobbyHintTimer = setTimeout(() => {
    if (!state.hasTooth) toast('Psst — walk slowly past the PLANTER and watch behind it. Layers move at different speeds…', 6000)
  }, 14000)
}

boot()
