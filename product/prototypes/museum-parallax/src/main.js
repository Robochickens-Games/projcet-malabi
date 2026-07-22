import { Application, Container, Sprite, Graphics, Texture, Text } from 'pixi.js'
import { gsap } from 'gsap'
import {
  toothSVG, catalogCardArt, featherSVG, catalogCrest, DINOS,
  eggSVG, pycnofiberSVG, footprintSVG, coveringSVG, spaceRockSVG,
  PLANETS, PLANET_BY_ID, planetSVG, roverWheelSVG, solarPanelSVG,
  MOON_STEPS, missionCardSVG, tetherSVG, spaceToolSVG, hexTileSVG, strutSVG,
} from './art.js'
import {
  INK, LOBBY_W, LOBBY_SPOTS, lobbyBackSVG, lobbyMainSVG, lobbyForeSVG,
  GROVE_W, GROVE_SPOTS, groveCloudsSVG, groveMountainsSVG, groveMidSVG, groveMainSVG, canopySVG, bushSVG,
  DINOHUB_W, DINOHUB_SPOTS, DINOHUB_ORDER, dinohubBackSVG, dinohubMainSVG, dinohubForeSVG,
  RAPTOR_W, RAPTOR_SPOTS, raptorSkySVG, raptorDunesFarSVG, raptorDunesMidSVG, raptorMainSVG, raptorRockSVG,
  TREX_W, TREX_SPOTS, trexSkySVG, trexFarSVG, trexMidSVG, trexMainSVG, trexFernSVG,
  BRACHIO_W, BRACHIO_SPOTS, brachioSkySVG, brachioHillsSVG, brachioTreesSVG, brachioMainSVG, brachioGrassSVG,
  PTERO_W, PTERO_SPOTS, pteroSkySVG, pteroSeaSVG, pteroCliffSVG, pteroMainSVG, pteroRockSVG,
  SPACEHUB_W, SPACEHUB_SPOTS, SPACEHUB_ORDER, spacehubBackSVG, spacehubMainSVG, spacehubForeSVG,
  SOLAR_W, SOLAR_SPOTS, orbitPoint, solarSkySVG, solarNebulaSVG, solarDomeSVG, solarMainSVG, solarForeSVG,
  MARS_W, MARS_SPOTS, marsSkySVG, marsFarSVG, marsMidSVG, marsMainSVG, marsForeSVG,
  MOON_W, MOON_SPOTS, moonSkySVG, moonFarSVG, moonMidSVG, moonMainSVG, moonForeSVG,
  STATION_W, STATION_SPOTS, stationSkySVG, stationEarthSVG, stationTrussSVG, stationMainSVG,
  stationForeSVG, solarWingSVG,
  WEBB_W, WEBB_SPOTS, webbTilePositions, webbSkySVG, webbShieldSVG, webbMainSVG, webbForeSVG,
} from './wireframe.js'
import { openPteroGame, isPteroGameOpen } from './pteroGame.js'
import { openBrachioGame, isBrachioGameOpen } from './brachioGame.js'
import { openOrbitGame, closeOrbitGame, isOrbitGameOpen, __orbitForceWin } from './orbitGame.js'
import { openRoverGame, closeRoverGame, isRoverGameOpen, __roverPlanTo, __roverDrive, __roverDriving, __roverReroll } from './roverGame.js'
import { openMoonBoard, closeMoonBoard, isMoonBoardOpen, __moonSolve, __moonSolveWrong } from './moonBoard.js'
import { openRocketGame, closeRocketGame, isRocketGameOpen, __rocketStack, __rocketLaunch, __rocketPhase } from './rocketGame.js'
import { openSpacewalk, closeSpacewalk, isSpacewalkOpen, __spacewalkGrabAll, __spacewalkToHatch, __spacewalkState } from './spacewalkGame.js'
import { openTelescope, closeTelescope, isTelescopeOpen, __focusSet, __focusState } from './telescopeGame.js'
import {
  SPACE_ROCKS, SPACE_TOOLS, isRock, itemArt, rockInstance, rockType, rockOf,
  openSupplyDesk, closeSupplyDesk, isSupplyDeskOpen, refreshSupplyDesk,
  getCoins, setCoins, auditEconomy,
} from './economy.js'

/* ---------- constants ---------- */
const DESIGN_W = 1920
const DESIGN_H = 1080

// every scene is a side-scrolling world (platformer parallax): layers carry a
// scroll speed; the camera walks left↔right; real art replaces wireframes 1:1
const WORLDS = {
  lobby: { w: LOBBY_W },
  dinohub: { w: DINOHUB_W },
  grove: { w: GROVE_W },
  raptor: { w: RAPTOR_W },
  trex: { w: TREX_W },
  brachio: { w: BRACHIO_W },
  ptero: { w: PTERO_W },
  spacehub: { w: SPACEHUB_W },
  solar: { w: SOLAR_W },
  mars: { w: MARS_W },
  moon: { w: MOON_W },
  station: { w: STATION_W },
  webb: { w: WEBB_W },
}

const $ = (id) => document.getElementById(id)

/* ---------- side-panel (rail) helpers ----------
   On phones both rails start tucked away so the scene fills the screen, and only
   one panel is open at a time. Opening a rail closes its sibling (compact only). */
const compactMQ = window.matchMedia('(max-width: 820px), (max-height: 460px)')
const isCompact = () => compactMQ.matches
const railBtn = (railId) => $(railId === 'catalog-rail' ? 'catalog-toggle' : 'inv-toggle')

function setRail(railId, collapsed) {
  $(railId).classList.toggle('collapsed', collapsed)
  railBtn(railId).classList.toggle('active', !collapsed)
  if (!collapsed && isCompact()) {
    const other = railId === 'catalog-rail' ? 'inventory-rail' : 'catalog-rail'
    $(other).classList.add('collapsed')
    railBtn(other).classList.remove('active')
  }
}

// open a rail with no slide animation, so a freshly-measured slot rect is the
// resting on-screen position (used when the found tooth flies into the inventory)
function openRailInstant(railId) {
  const rail = $(railId)
  const prev = rail.style.transition
  rail.style.transition = 'none'
  setRail(railId, false)
  void rail.offsetWidth // force reflow at the resting position
  rail.style.transition = prev
}

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

/* ---------- raster image (png/jpg) → texture ---------- */
async function imgTexture(url) {
  const img = new Image()
  img.src = url
  await img.decode()
  return Texture.from(img)
}

/* ---------- game state ---------- */
// per-puzzle progress lives on each scene's `_drop.done`; here we track the
// player's collected clues + the current scene
// has[itemId] = true once that clue is collected into the inventory
const state = { scene: 'lobby', has: {} }
const hasClue = (id) => !!state.has[id]

/* ---------- input: walk the world ---------- */
// true while the player is dragging an inventory item — pauses camera walking
let draggingItem = false
// set while dragging a bone in the T-rex foot-assembly puzzle (also pauses camera)
let footDrag = null
// the full-screen foot-puzzle overlay + whether it's currently open (pauses the room)
let footStage = null
let puzzleOpen = false
const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'
// don't start a camera-walk when the gesture begins on the HUD, a rail, or the ghost
const uiHit = (e) => !!(e.target?.closest && e.target.closest('#hud, .rail, #drag-ghost'))
const cams = Object.fromEntries(Object.keys(WORLDS).map((k) => [k, { x: 0, vel: 0 }]))
const camMax = () => WORLDS[state.scene].w - DESIGN_W
const cam = () => cams[state.scene]
const lens = { x: 0, y: 0, tx: 0, ty: 0 } // micro hover parallax on top
const keys = { left: false, right: false }

function nudgeCam(dx) {
  if (puzzleOpen) return
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
  window.addEventListener('mousedown', (e) => { if (!draggingItem && !footDrag && !puzzleOpen && !isPteroGameOpen() && !isBrachioGameOpen() && !isSupplyDeskOpen() && !isOrbitGameOpen() && !isRoverGameOpen() && !isMoonBoardOpen() && !isRocketGameOpen() && !isSpacewalkOpen() && !isTelescopeOpen() && !uiHit(e)) dragStart(e.clientX) })
  window.addEventListener('mousemove', (e) => dragMove(e.clientX))
  window.addEventListener('mouseup', () => dragEnd())
  window.addEventListener('touchstart', (e) => { if (!draggingItem && !footDrag && !puzzleOpen && !isPteroGameOpen() && !isBrachioGameOpen() && !isSupplyDeskOpen() && !isOrbitGameOpen() && !isRoverGameOpen() && !isMoonBoardOpen() && !isRocketGameOpen() && !isSpacewalkOpen() && !isTelescopeOpen() && !uiHit(e)) dragStart(e.touches[0].clientX) }, { passive: true })
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

  // tilt to walk — read the axis that means "lean left/right" for how the
  // phone is HELD: gamma in portrait, ±beta in landscape
  let base = null
  const tiltValue = (e) => {
    const a = screen.orientation?.angle ?? window.orientation ?? 0
    if (a === 90) return e.beta
    if (a === 270 || a === -90) return e.beta == null ? null : -e.beta
    return e.gamma
  }
  const onTilt = (e) => {
    if (puzzleOpen) return
    const v = tiltValue(e)
    if (v == null) return
    base ??= v
    cam().vel += Math.max(-1, Math.min(1, (v - base) / 22)) * 30
  }
  window.addEventListener('orientationchange', () => { base = null })
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

/* ---------- fullscreen + landscape lock ---------- */
function setupFullscreen() {
  const btn = $('fs-btn')
  const el = document.documentElement
  const request = el.requestFullscreen || el.webkitRequestFullscreen
  if (!request) {
    // iPhone Safari has no fullscreen API; the rotate overlay still nudges
    // landscape, and "Add to Home Screen" gives true fullscreen via the meta tag
    btn.classList.add('hidden')
    return
  }
  const inFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement)

  btn.addEventListener('pointerdown', async () => {
    sfx.tap()
    try {
      if (inFs()) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document)
      } else {
        await request.call(el)
        // Android Chrome: snaps the page horizontal; elsewhere lock is
        // unsupported and the rotate overlay carries the nudge instead
        await screen.orientation?.lock?.('landscape')
      }
    } catch { /* fullscreen is a nicety — never block on it */ }
  })

  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(ev, () => {
      btn.textContent = inFs() ? '⤡' : '⛶'
      btn.setAttribute('aria-label', inFs() ? 'Exit full screen' : 'Full screen')
      if (!inFs()) { try { screen.orientation?.unlock?.() } catch { /* not locked */ } }
    })
  }
}

/* ---------- toast ---------- */
let toastTimer = null
function dismissToast() {
  clearTimeout(toastTimer)
  $('toast').classList.add('hidden')
}
/* Toast copy carries light markup (<b> for the word that matters), so this
   assigns innerHTML, not textContent — with textContent the tags printed
   literally on screen. Every string reaching here is authored in this file;
   nothing player-supplied ever is, so there is no injection surface. */
function toast(msg, ms = 4800) {
  const el = $('toast')
  $('toast-text').innerHTML = msg
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

// world coords on a given layer → screen (CSS) px, accounting for camera + scale
function worldToScreen(wx, wy, layer = scenes[state.scene]?._main) {
  if (!layer) return { x: 0, y: 0 }
  return {
    x: root.position.x + root.scale.x * (layer.position.x + wx - DESIGN_W / 2),
    y: root.position.y + root.scale.y * (layer.position.y + wy - DESIGN_H / 2),
  }
}

// inverse: screen (CSS) px → world coords on a given layer
function screenToWorld(sx, sy, layer = scenes[state.scene]?._main) {
  if (!layer) return { x: 0, y: 0 }
  return {
    x: (sx - root.position.x) / root.scale.x - layer.position.x + DESIGN_W / 2,
    y: (sy - root.position.y) / root.scale.y - layer.position.y + DESIGN_H / 2,
  }
}

// is a screen point currently over the current room's dino? (the drag-drop target)
function pointerOverDino(x, y) {
  const d = activeDrop()
  if (!d) return false
  const S = d.skeleton
  const a = worldToScreen(S.x - S.w / 2, S.y)
  const b = worldToScreen(S.x + S.w / 2, S.y + S.h)
  return x >= a.x && x <= b.x && y >= a.y && y <= b.y
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

// named hotspots, so the headless tests can tap what a finger would tap rather
// than calling the handler's target directly — `scene:id` → its tap handler
const HOTSPOTS = {}

function hitRect(wx, wy, w, h, onTap, id) {
  const g = new Graphics().rect(0, 0, w, h).fill({ color: 0xffffff, alpha: 0.0001 })
  placeAt(g, wx, wy)
  g.eventMode = 'static'
  g.cursor = 'pointer'
  g.on('pointertap', onTap)
  if (id) HOTSPOTS[id] = onTap
  return g
}

// a wax-stamp "SOLVED" seal (gold disc + checkmark + caption), placed in world
// coords and hidden (alpha 0) until its puzzle is solved. Used to mark a finished
// diorama in the hall and the completed wing's door in the lobby.
function solvedSeal(wx, wy, { r = 44, caption = 'SOLVED' } = {}) {
  const c = new Container()
  c.addChild(new Graphics().circle(0, 0, r + 8).fill({ color: 0xffd98a, alpha: 0.22 }).stroke({ color: 0xffd98a, width: 3, alpha: 0.5 }))
  c.addChild(new Graphics().circle(0, 0, r).fill({ color: 0xe8a948 }).stroke({ color: 0xf4e6c8, width: 4 }))
  c.addChild(new Graphics()
    .moveTo(-r * 0.42, 0).lineTo(-r * 0.12, r * 0.34).lineTo(r * 0.46, -r * 0.36)
    .stroke({ color: 0x123c44, width: r * 0.2, cap: 'round', join: 'round' }))
  if (caption) {
    const label = new Text({ text: caption, style: { fontFamily: SERIF, fontSize: 22, fontWeight: '700', fill: 0xe8a948, letterSpacing: 2 } })
    label.anchor.set(0.5)
    label.position.set(0, r + 26)
    c.addChild(label)
  }
  placeAt(c, wx, wy)
  c.alpha = 0
  return c
}

// pop a hidden seal/glow into view with a stamp + sustained shimmer
function revealMark(node, { glow = false } = {}) {
  if (!node || node._shown) return
  node._shown = true
  gsap.to(node, { alpha: glow ? 0.5 : 1, duration: 0.55, ease: 'power2.out' })
  if (!glow && node.scale) gsap.fromTo(node.scale, { x: 0, y: 0 }, { x: 1, y: 1, duration: 0.6, ease: 'back.out(3)' })
  if (glow) gsap.to(node, { alpha: 0.26, duration: 1.4, yoyo: true, repeat: -1, delay: 0.6, ease: 'sine.inOut' })
}

/* ---------- boot ---------- */
// no top-level await: it deadlocks pixi's dynamic renderer chunks in the Rollup build
let app, root, lobby, grove, dinohub, raptor, trex, brachio, ptero, spacehub, solar, mars, moon, station, webb
let toothSprite, sparkle, doorGlow, skeletonGlow, trayGlow, placedTooth
let featherSprite, featherSparkle
const scenes = {}                                  // name → scene container
/* The placeable target in view, if any. Dino rooms have exactly one (`_drop`);
   a room can instead declare several (`_drops`) when more than one thing needs
   fixing — the Mars rover wants both a wheel and a clean panel. We prefer the
   target that WANTS the item being dragged, so each repair lights up its own
   spot, and fall back to any unfinished one so the "that's not what this needs"
   nudge still has something to talk about. */
function activeDrop() {
  const sc = scenes[state.scene]
  if (!sc?._drops) return sc?._drop ?? null
  return sc._drops.find((d) => !d.done && d.item === dragItem)
    ?? sc._drops.find((d) => !d.done)
    ?? null
}

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

  mainL.addChild(hitRect(LOBBY_SPOTS.doorDino.x - 180, 300, 360, 580, () => goScene('dinohub'), 'lobby:doorDino'))
  mainL.addChild(hitRect(LOBBY_SPOTS.doorSpace.x - 170, 320, 340, 560, () => goScene('spacehub'), 'lobby:doorSpace'))
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

  // one wing-complete seal per wing, over its lobby door (hidden until every room
  // in that wing is solved)
  lobby._wingMarks = {}
  for (const [wingId, w] of Object.entries(WINGS)) {
    const seal = solvedSeal(LOBBY_SPOTS[w.door].x, 470, { r: 58, caption: 'WING COMPLETE' })
    mainL.addChild(seal)
    lobby._wingMarks[wingId] = seal
  }

  lobby.addChild(backL, mainL, toothL, foreL)
  lobby._layers = [backL, mainL, toothL, foreL]
  lobby._main = mainL
  makeDust(lobby, 26, LOBBY_W)
  for (const wingId of Object.keys(WINGS)) if (wingComplete(wingId)) revealMark(lobby._wingMarks[wingId])
}

/* ---------- GROVE ---------- */
async function buildGrove() {
  const [cloudsT, mountainsT, midT, mainT, canopyT, bushT, toothT, featherT] = await Promise.all(
    [groveCloudsSVG(), groveMountainsSVG(), groveMidSVG(), groveMainSVG(), canopySVG(), bushSVG(), toothSVG('leaf', 64, 83), featherSVG(60, 78)].map(svgTexture),
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
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('dinohub')))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('TRICERATOPS — “three-horned face”. A plant eater with a beak and hundreds of leaf-shaped teeth.')
  }))
  mainL.addChild(hitRect(S.skeleton.x - S.skeleton.w / 2, S.skeleton.y, S.skeleton.w, S.skeleton.h, () => {
    sfx.tap()
    toast(grove._drop?.done
      ? 'A perfect fit — that tooth belongs to this Triceratops.'
      : hasClue('tooth')
        ? 'A gap in this jaw where a tooth should sit. If one of your finds looks like it fits, drag it onto the skeleton →'
        : 'A gap in this jaw where a tooth should sit. What kind of tooth wears down chewing tough plants all day?')
  }))
  mainL.addChild(hitRect(S.bag.x - 60, S.bag.y - 60, 120, 120, () => {
    sfx.tap()
    toast('Your finds live in the INVENTORY on the right →')
  }))
  mainL.addChild(hitRect(S.hint.x - 60, S.hint.y - 60, 120, 120, () => {
    sfx.tap()
    toast(grove._drop?.done
      ? 'You did it! The tooth is right where it belongs.'
      : !hasClue('tooth')
        ? 'A plant-eater chews with flat, grinding teeth — and something glinted back near the lobby planter…'
        : 'Read the placard, then open the CATALOG on the left. Which tooth shape suits a plant-grinder?')
  }))
  mainL.addChild(hitRect(S.tray.x, S.tray.y, 620, 110, () => {
    sfx.tap()
    if (hasClue('tooth') && !grove._drop?.done) toast('Your fossil tooth is in the inventory — drag it onto the dinosaur.')
  }))

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

  // the tooth locked into the jaw once placed (hidden until then)
  placedTooth = new Sprite(toothT)
  placedTooth.anchor.set(0.5)
  placedTooth.rotation = -0.15
  placeAt(placedTooth, S.socket.x, S.socket.y)
  placedTooth.alpha = 0
  mainL.addChild(placedTooth)

  // a stray FEATHER hidden on the trail — rides a 1.2x layer behind the 1.42x bush,
  // so walking past reveals it (the lobby-tooth parallax beat). It belongs to the raptor.
  const featherL = scrollLayer(1.2)
  addHiddenClue(featherL, S.feather, 'feather', featherT)

  // foreground: canopy hanging from the top, bushes along the bottom (fastest).
  // the bush at the feather's x is what hides it until you walk past.
  const foreL = scrollLayer(1.42)
  for (const [wx, s, flip] of [[260, 1.4, false], [1500, 1.1, true], [2900, 1.5, false], [4350, 1.2, true]]) {
    const c = new Sprite(canopyT)
    c.anchor.set(0.5, 0)
    c.scale.set(s * (flip ? -1 : 1), s)
    placeAt(c, wx, -20)
    foreL.addChild(c)
  }
  for (const [wx, s, flip] of [[700, 1.3, false], [S.feather.x, 1.25, false], [2100, 1.6, true], [3550, 1.2, false], [4650, 1.5, true]]) {
    const b = new Sprite(bushT)
    b.anchor.set(0.5, 1)
    b.scale.set(s * (flip ? -1 : 1), s)
    placeAt(b, wx, 1110)
    foreL.addChild(b)
  }

  grove.addChild(cloudsL, mountainsL, midL, mainL, featherL, foreL)
  grove._layers = [cloudsL, mountainsL, midL, mainL, featherL, foreL]
  grove._main = mainL
  // the placeable target in this room: drag the TOOTH here
  grove._drop = {
    item: 'tooth', skeleton: S.skeleton, socket: S.socket, glow: skeletonGlow, placed: placedTooth, done: false,
    success: {
      frag: 1,
      html: 'A <b>wide, flat tooth</b> — perfect for grinding ferns and leaves. It fits the jaw of a ' +
        '<b>plant eater</b>: the skeleton guarding the nest is a <b>Triceratops</b>!',
    },
  }
  grove._challenges = ['drop']
  makeDust(grove, 32, GROVE_W, 0xd8f0a0)
}

/* ---------- DINO HALL HUB ---------- */
async function buildDinoHub() {
  const [backT, mainT, foreT] = await Promise.all(
    [dinohubBackSVG(), dinohubMainSVG(), dinohubForeSVG()].map(svgTexture),
  )

  const backL = scrollLayer(0.3)
  const back = new Sprite(backT)
  back.anchor.set(0.5)
  placeAt(back, DINOHUB_W / 2 - 400, 540)
  backL.addChild(back)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, DINOHUB_W / 2, 540)
  mainL.addChild(main)

  const S = DINOHUB_SPOTS
  // diorama id → the room it opens
  const DIORAMA_ROOM = { trike: 'grove', ptero: 'ptero', trex: 'trex', raptor: 'raptor', brachio: 'brachio' }
  mainL.addChild(hitRect(S.back.x - 40, 540, 240, 360, () => goScene('lobby')))
  for (const [id] of DINOHUB_ORDER) {
    const spot = S[id]
    mainL.addChild(hitRect(spot.x - spot.w / 2, 200, spot.w, spot.h, () => goScene(DIORAMA_ROOM[id])))
  }

  // per-diorama completion marks (hidden until that room is solved): a gold glow
  // around the niche frame + a SOLVED seal stamped in the corner
  dinohub._marks = {}
  for (const [id] of DINOHUB_ORDER) {
    const room = DIORAMA_ROOM[id]
    const spot = S[id]
    const frameGlow = new Graphics()
      .roundRect(0, 0, spot.w, spot.h, 18)
      .stroke({ color: 0xffd98a, width: 8, alpha: 0.9 })
    placeAt(frameGlow, spot.x - spot.w / 2, 200)
    frameGlow.alpha = 0
    frameGlow.blendMode = 'add'
    mainL.addChild(frameGlow)
    const seal = solvedSeal(spot.x + spot.w / 2 - 70, 268, { r: 40 })
    mainL.addChild(seal)
    dinohub._marks[room] = { frameGlow, seal }
  }

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 5000 / 2, 540)
  foreL.addChild(fore)

  dinohub.addChild(backL, mainL, foreL)
  dinohub._layers = [backL, mainL, foreL]
  dinohub._main = mainL
  makeDust(dinohub, 24, DINOHUB_W)

  // already-solved rooms stay stamped if the hall is rebuilt/revisited
  for (const room of WINGS.dino.rooms) if (roomComplete(room)) markRoomComplete(room)
}

/* ---------- SPACE HALL HUB ----------
   The Space Wing's hub. Same shape as the Dino Hall — five tappable niches — plus
   the Supply Desk, which is why this hall gets revisited rather than passed
   through. The five rooms land next; until then their niches say so rather than
   failing silently on a tap ("never punish the poke"). */
async function buildSpaceHub() {
  const [backT, mainT, foreT, rockT] = await Promise.all(
    [spacehubBackSVG(), spacehubMainSVG(), spacehubForeSVG(), spaceRockSVG('lunarChip', 66, 86)].map(svgTexture),
  )

  const backL = scrollLayer(0.3)
  const back = new Sprite(backT)
  back.anchor.set(0.5)
  placeAt(back, SPACEHUB_W / 2 - 400, 540)
  backL.addChild(back)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, SPACEHUB_W / 2, 540)
  mainL.addChild(main)

  const S = SPACEHUB_SPOTS
  mainL.addChild(hitRect(S.back.x - 40, 540, 240, 360, () => goScene('lobby')))
  // the Supply Desk — the whole counter is the target, generously sized
  mainL.addChild(hitRect(S.desk.x - S.desk.w / 2, 400, S.desk.w, 480, () => openDesk(), 'spacehub:desk'))

  for (const [id, label] of SPACEHUB_ORDER) {
    const spot = S[id]
    mainL.addChild(hitRect(spot.x - spot.w / 2, 200, spot.w, spot.h, () => {
      if (scenes[id]) { goScene(id); return }
      sfx.tap()
      toast(`The ${label} exhibit is still being installed — check back soon! 🚧`, 4000)
    }, `spacehub:${id}`))
  }

  // per-diorama completion marks, exactly as the Dino Hall stamps its niches
  spacehub._marks = {}
  for (const [id] of SPACEHUB_ORDER) {
    const spot = S[id]
    const frameGlow = new Graphics()
      .roundRect(0, 0, spot.w, spot.h, 18)
      .stroke({ color: 0xffd98a, width: 8, alpha: 0.9 })
    placeAt(frameGlow, spot.x - spot.w / 2, 200)
    frameGlow.alpha = 0
    frameGlow.blendMode = 'add'
    mainL.addChild(frameGlow)
    const seal = solvedSeal(spot.x + spot.w / 2 - 70, 268, { r: 40 })
    mainL.addChild(seal)
    spacehub._marks[id] = { frameGlow, seal }
  }

  // a space rock on the hall floor — the first one a player meets, so the whole
  // find→sell→buy loop can be learned within sight of the desk that pays for it
  const rockL = scrollLayer(1.15)
  addHiddenClue(rockL, S.rock, rockInstance('lunarChip', 'spacehub'), rockT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 5500 / 2, 540)
  foreL.addChild(fore)

  spacehub.addChild(backL, mainL, rockL, foreL)
  spacehub._layers = [backL, mainL, rockL, foreL]
  spacehub._main = mainL
  makeDust(spacehub, 26, SPACEHUB_W, 0x9fc2e6)

  for (const room of WINGS.space.rooms) if (roomComplete(room)) markRoomComplete(room)
}

/* ---------- SOLAR SYSTEM ROOM — the Planet Path puzzle ----------
   The orrery has eight numbered orbit rings. Five planets are already mounted;
   THREE sockets are empty, and the Star Atlas describes exactly those three by
   TRAIT, never by name: the rusty-red one is fourth, the ringed giant is sixth,
   and the hottest one is second — which is the room's real aha, because the
   hottest planet is not the one closest to the Sun.

   The deduction is trait → which planet. The ring number is given, and each ring
   carries a counting marker, so a five-year-old can literally count to four. That
   keeps the difficulty in the reasoning rather than in the fingers — precise
   dragging is the thing young hands are worst at. Dropping a planet on the wrong
   ring costs nothing: it says why and comes back. */
const PLANET_SLOTS = ['venus', 'mars', 'saturn']   // the three left empty
const PLANET_PREMOUNTED = ['mercury', 'earth', 'jupiter', 'uranus', 'neptune']

async function buildSolar() {
  const [skyT, nebulaT, domeT, mainT, foreT, rockAT, rockBT] = await Promise.all([
    solarSkySVG(), solarNebulaSVG(), solarDomeSVG(), solarMainSVG(), solarForeSVG(),
    spaceRockSVG('starShard', 62, 80), spaceRockSVG('marsRock', 64, 84),
  ].map(svgTexture))

  const skyL = bgLayer(0.1, skyT, 2400 / 2)
  const nebulaL = bgLayer(0.35, nebulaT, 2800 / 2)
  const domeL = bgLayer(0.6, domeT, 3200 / 2)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, SOLAR_W / 2, 540)
  mainL.addChild(main)

  const S = SOLAR_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('spacehub'), 'solar:back'))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('EXHIBIT 1 — THE ORRERY. A working model of our Solar System. Three planets are missing from their rings.', 6500)
  }, 'solar:placard'))
  // the Star Atlas lectern opens the catalog at the planets section — the only
  // place the clues live, so reading is a deliberate act, not a passive toast
  mainL.addChild(hitRect(S.atlas.x - 110, 640, 220, 250, () => {
    sfx.tap()
    openCatalogSection('planets')
    if (isCompact()) setRail('catalog-rail', false)
  }, 'solar:atlas'))

  // the five planets that are already in place
  const planetTex = {}
  await Promise.all(PLANETS.map(async (p) => { planetTex[p.id] = await svgTexture(planetSVG(p.id, 120, 156)) }))
  for (const id of PLANET_PREMOUNTED) {
    const p = PLANET_BY_ID[id]
    const pt = orbitPoint(p.order)
    const s = new Sprite(planetTex[id])
    s.anchor.set(0.5, 0.82)
    s.scale.set(0.5 + p.r / 90)
    placeAt(s, pt.x, pt.y)
    mainL.addChild(s)
  }

  // the three empty sockets: a dashed ring on the orbit, waiting
  const sockets = {}
  for (const id of PLANET_SLOTS) {
    const p = PLANET_BY_ID[id]
    const pt = orbitPoint(p.order)
    const marker = new Graphics()
      .circle(0, 0, 34).stroke({ color: 0xffd98a, width: 4, alpha: 0.85 })
      .circle(0, 0, 6).fill({ color: 0xffd98a, alpha: 0.6 })
    placeAt(marker, pt.x, pt.y)
    mainL.addChild(marker)
    gsap.to(marker, { alpha: 0.42, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' })

    const placed = new Sprite(planetTex[id])
    placed.anchor.set(0.5, 0.82)
    placed.scale.set(0.5 + p.r / 90)
    placeAt(placed, pt.x, pt.y)
    placed.alpha = 0
    mainL.addChild(placed)

    sockets[id] = { planet: id, order: p.order, x: pt.x, y: pt.y, marker, placed, done: false }
  }
  solar._sockets = sockets
  solar._orrery = { done: false, left: PLANET_SLOTS.length }

  /* The ORBIT BALANCE console — the room's mini-game, and the only source of the
     third planet. So the three missing planets come from three different places:
     one found by exploring this room, one bought at the Supply Desk, one won in
     a game. That's the wing's whole loop taught inside a single exhibit. */
  const orbitStation = new Graphics()
    .roundRect(0, 0, 300, 190, 14)
    .fill({ color: 0x1a2f42 })
    .stroke({ color: 0xffd98a, width: 5, alpha: 0.9 })
  placeAt(orbitStation, S.orbitStation.x - 150, 664)
  mainL.addChild(orbitStation)
  const orbitLabel = new Text({
    text: 'ORBIT\nBALANCE', style: {
      fill: 0xe8a948, fontFamily: SERIF, fontSize: 30, align: 'center', lineHeight: 34, letterSpacing: 2,
    },
  })
  orbitLabel.anchor.set(0.5)
  placeAt(orbitLabel, S.orbitStation.x, 738)
  mainL.addChild(orbitLabel)
  solar._gameBadge = solvedSeal(S.orbitStation.x + 128, 690, { r: 34, caption: '' })
  mainL.addChild(solar._gameBadge)
  mainL.addChild(hitRect(S.orbitStation.x - 150, 640, 300, 240, () => {
    sfx.tap()
    if (hasClue('planet:venus') || solar._sockets.venus.done) {
      toast('You’ve already won this one — the model is yours.', 3500)
      return
    }
    openOrbitGame({
      goal: 8,
      onComplete: () => onMinigameSolved('solar'),
      onClose: () => {
        if (solar._gameDone && !hasClue('planet:venus') && !solar._sockets.venus.done) {
          grantItem('planet:venus')
          toast('🪐 You won the <b>Venus</b> model! The Star Atlas says it’s the <b>hottest</b> planet — even though it isn’t the closest to the Sun.', 7000)
        } else { afterMinigameClose('solar') }
      },
    })
  }, 'solar:orbitgame'))

  // the Mars model, rolled behind the console — the room's own findable planet
  const clueL = scrollLayer(1.12)
  const marsT = await svgTexture(planetSVG('mars', 78, 101))
  addHiddenClue(clueL, S.clueMars, 'planet:mars', marsT)
  /* The Mars rover's missing WHEEL is hidden here, not in the Mars room — the
     wing's first cross-room dependency. You cannot finish Mars without having
     explored the planetarium, which is the whole point of the wing's structure. */
  const wheelT = await svgTexture(roverWheelSVG(80, 104))
  addHiddenClue(clueL, S.wheel, 'roverWheel', wheelT)
  // two space rocks, because every room in the wing pays for exploring it
  addHiddenClue(clueL, S.rockA, rockInstance('starShard', 'solar'), rockAT)
  addHiddenClue(clueL, S.rockB, rockInstance('marsRock', 'solar'), rockBT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 4500 / 2, 540)
  foreL.addChild(fore)

  solar.addChild(skyL, nebulaL, domeL, mainL, clueL, foreL)
  solar._layers = [skyL, nebulaL, domeL, mainL, clueL, foreL]
  solar._main = mainL
  solar._challenges = ['orrery']   // winning Orbit Balance is how you GET the third
                                   // planet, so the orrery already implies it
  makeDust(solar, 30, SOLAR_W, 0x9fc2e6)
}

// which empty socket is the pointer over? (generous radius — kid-sized target)
function socketUnder(x, y) {
  const sockets = scenes[state.scene]?._sockets
  if (!sockets) return null
  for (const s of Object.values(sockets)) {
    if (s.done) continue
    const c = worldToScreen(s.x, s.y)
    const r = 52 * root.scale.x
    if (Math.hypot(x - c.x, y - c.y) <= r) return s
  }
  return null
}

// a planet was dropped on a socket — right ring or wrong one
function placePlanet(socket, planetId) {
  const p = PLANET_BY_ID[planetId]
  const sc = scenes[state.scene]
  if (socket.planet !== planetId) {
    // wrong ring: say WHY, hand it back, change nothing. Never a fail state.
    sfx.wrong()
    toast(`That’s the <b>${socket.order}${ordinalSuffix(socket.order)}</b> ring — but ${p.name} doesn’t belong there. Check the Star Atlas again.`, 5000)
    return false
  }
  socket.done = true
  sfx.success()
  removeItem(`planet:${planetId}`)
  gsap.to(socket.marker, { alpha: 0, duration: 0.3, overwrite: true })
  gsap.to(socket.placed, { alpha: 1, duration: 0.35 })
  gsap.fromTo(socket.placed.scale,
    { x: socket.placed.scale.x * 1.5, y: socket.placed.scale.y * 1.5 },
    { x: socket.placed.scale.x, y: socket.placed.scale.y, duration: 0.5, ease: 'back.out(3)' })
  confetti(socket.placed)

  sc._orrery.left -= 1
  const left = sc._orrery.left
  if (left > 0) {
    setTimeout(() => toast(
      `⭐ ${p.name} is home — ${p.why} ${left} more ${left === 1 ? 'planet' : 'planets'} to find.`, 6000), 900)
  } else {
    sc._orrery.done = true
    setTimeout(() => finishSolve({
      success: {
        title: '🪐 The orrery turns! 🪐',
        html: 'Every planet is back on its ring — <b>Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune</b>. ' +
          'And the hottest of them all is <b>Venus</b>, not Mercury: its thick clouds trap the heat like a blanket.',
      },
    }, 'solar'), 1000)
  }
  return true
}

const ordinalSuffix = (n) => (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th')

/* ---------- MARS ROOM — Rover Repair ----------
   Two separate repairs, then a drive. The rover is missing a WHEEL (hidden in
   the Solar System room, so finishing Mars means having explored next door) and
   its solar panel is caked in DUST (cleaned with the Solar Brush from the Supply
   Desk). Only once both are fixed does the drive console power up for Rover
   Route, where the actual science question waits: which of three rocks is the
   iron-rich red one.

   Accuracy note: dust really does bury Martian solar panels — it ended
   Opportunity's mission — but no real rover carries a brush. The catalog frames
   the brush as museum-diorama maintenance and never claims otherwise. */
async function buildMars() {
  const [skyT, farT, midT, mainT, foreT, rockAT, rockBT, wheelT, dustyT, cleanT] = await Promise.all([
    marsSkySVG(), marsFarSVG(), marsMidSVG(), marsMainSVG(), marsForeSVG(),
    spaceRockSVG('meteorite', 62, 80), spaceRockSVG('lunarChip', 60, 78),
    roverWheelSVG(104, 135), solarPanelSVG(1, 210, 138), solarPanelSVG(0, 210, 138),
  ].map(svgTexture))

  const skyL = bgLayer(0.1, skyT, 2400 / 2)
  const farL = bgLayer(0.3, farT, 2900 / 2)
  const midL = bgLayer(0.55, midT, 3200 / 2)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, MARS_W / 2, 540)
  mainL.addChild(main)

  const S = MARS_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('spacehub'), 'mars:back'))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('EXHIBIT 2 — THE MARS ROVER. A working model. It’s missing a wheel, and its solar panel is buried in red dust.', 6500)
  }, 'mars:placard'))

  // the dusty solar panel — swapped for the clean one when brushed
  const dusty = new Sprite(dustyT)
  dusty.anchor.set(0.5)
  placeAt(dusty, S.panelSocket.x, S.panelSocket.y)
  mainL.addChild(dusty)
  const clean = new Sprite(cleanT)
  clean.anchor.set(0.5)
  placeAt(clean, S.panelSocket.x, S.panelSocket.y)
  clean.alpha = 0
  mainL.addChild(clean)

  const wheelGlow = new Graphics()
    .circle(0, 0, 68).fill({ color: 0xffd98a, alpha: 0.16 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.8 })
  placeAt(wheelGlow, S.wheelSocket.x, S.wheelSocket.y)
  wheelGlow.alpha = 0
  wheelGlow.blendMode = 'add'
  mainL.addChild(wheelGlow)
  const wheelPlaced = new Sprite(wheelT)
  wheelPlaced.anchor.set(0.5)
  placeAt(wheelPlaced, S.wheelSocket.x, S.wheelSocket.y)
  wheelPlaced.alpha = 0
  mainL.addChild(wheelPlaced)

  const panelGlow = new Graphics()
    .roundRect(0, 0, 220, 148, 10).fill({ color: 0xffd98a, alpha: 0.14 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.8 })
  placeAt(panelGlow, S.panelSocket.x - 110, S.panelSocket.y - 74)
  panelGlow.alpha = 0
  panelGlow.blendMode = 'add'
  mainL.addChild(panelGlow)

  /* Two drop targets in one room — see activeDrop(). Each has its own hit box,
     so the wheel lights up the axle and the brush lights up the panel. */
  mars._drops = [
    {
      item: 'roverWheel',
      skeleton: { x: S.wheelSocket.x, y: S.wheelSocket.y - 80, w: 230, h: 200 },
      socket: S.wheelSocket, glow: wheelGlow, placed: wheelPlaced, done: false,
      success: {
        html: 'The wheel is back on its axle. Real rovers roll on six of these, ' +
          'with cleats that grip the loose Martian ground.',
      },
    },
    {
      item: 'solarBrush',
      skeleton: { x: S.panelSocket.x, y: S.panelSocket.y - 78, w: 250, h: 170 },
      socket: S.panelSocket, glow: panelGlow, placed: clean, done: false,
      onPlace: () => { gsap.to(dusty, { alpha: 0, duration: 0.7 }) },
      success: {
        html: 'Dust brushed away — the cells can drink the sunlight again. Dust really ' +
          'does bury solar panels on Mars: a dust storm is what finally ended the ' +
          '<b>Opportunity</b> rover’s mission after 14 years.',
      },
    },
  ]

  // the drive console — dark until both repairs are done
  const consoleGlow = new Graphics()
    .roundRect(0, 0, 300, 234, 12).stroke({ color: 0xffd98a, width: 7, alpha: 0.9 })
  placeAt(consoleGlow, S.console.x - 150, 646)
  consoleGlow.alpha = 0
  consoleGlow.blendMode = 'add'
  mainL.addChild(consoleGlow)
  mars._consoleGlow = consoleGlow
  mars._gameBadge = solvedSeal(S.console.x + 126, 690, { r: 34, caption: '' })
  mainL.addChild(mars._gameBadge)

  mainL.addChild(hitRect(S.console.x - 150, 620, 300, 260, () => {
    sfx.tap()
    if (mars._gameDone) { toast('The rover already found its rock. Nice driving.', 3500); return }
    if (!mars._drops.every((d) => d.done)) {
      toast('The rover can’t drive yet — it still needs its <b>wheel</b> and a <b>clean solar panel</b>.', 5000)
      return
    }
    openRoverGame({
      onComplete: () => onMinigameSolved('mars'),
      onClose: () => afterMinigameClose('mars'),
    })
  }, 'mars:console'))

  const clueL = scrollLayer(1.12)
  /* One of the Moon room's mission cards is here, not there — the dependency
     runs both ways between these two rooms, so neither is a place you visit once. */
  const cardT = await svgTexture(missionCardSVG('onTheWay', 84, 112))
  addHiddenClue(clueL, S.card, 'card:onTheWay', cardT)
  addHiddenClue(clueL, S.rockA, rockInstance('meteorite', 'mars'), rockAT)
  addHiddenClue(clueL, S.rockB, rockInstance('lunarChip', 'mars'), rockBT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 4200 / 2, 540)
  foreL.addChild(fore)

  mars.addChild(skyL, farL, midL, mainL, clueL, foreL)
  mars._layers = [skyL, farL, midL, mainL, clueL, foreL]
  mars._main = mainL
  // the console powers up the moment both repairs are done, so the next step is
  // announced by the world rather than by a toast the child may have dismissed
  mars._onRepair = () => {
    if (!mars._drops.every((d) => d.done) || mars._consoleLit) return
    mars._consoleLit = true
    gsap.to(consoleGlow, { alpha: 0.85, duration: 0.8 })
    gsap.to(consoleGlow, { alpha: 0.35, duration: 1.2, yoyo: true, repeat: -1, delay: 0.8 })
    setTimeout(() => toast('The rover hums back to life — the <b>ROVER ROUTE</b> console is lit. Time to drive.', 5500), 1600)
  }

  mars._challenges = ['repairs', 'game']
  makeDust(mars, 34, MARS_W, 0xd9a07a)
}

/* ---------- MOON ROOM — Rebuild the Landing Sequence ----------
   Six mission cards, gathered from four different places, then put in the order
   the real Apollo 11 mission happened. Three cards are lying around this room,
   one is over in the Mars bay, one is sold at the Supply Desk, and the last is
   won by stacking a Saturn V correctly in Build-a-Rocket. You cannot open the
   board until you hold all six — the collecting IS the first half of the puzzle. */
async function buildMoon() {
  const [skyT, farT, midT, mainT, foreT, rockAT, rockBT] = await Promise.all([
    moonSkySVG(), moonFarSVG(), moonMidSVG(), moonMainSVG(), moonForeSVG(),
    spaceRockSVG('lunarChip', 62, 80), spaceRockSVG('starShard', 60, 78),
  ].map(svgTexture))

  const skyL = bgLayer(0.1, skyT, 2400 / 2)
  const farL = bgLayer(0.3, farT, 2900 / 2)
  const midL = bgLayer(0.55, midT, 3200 / 2)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, MOON_W / 2, 540)
  mainL.addChild(main)

  const S = MOON_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('spacehub'), 'moon:back'))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('EXHIBIT 3 — APOLLO 11. Six mission cards have come off the board. Find them all, then put the mission back in order.', 6500)
  }, 'moon:placard'))

  // the board glows once every card is in hand — the world says "you're ready"
  const boardGlow = new Graphics()
    .roundRect(0, 0, 380, 300, 12).stroke({ color: 0xffd98a, width: 7, alpha: 0.9 })
  placeAt(boardGlow, S.board.x - 190, 520)
  boardGlow.alpha = 0
  boardGlow.blendMode = 'add'
  mainL.addChild(boardGlow)
  moon._boardGlow = boardGlow

  mainL.addChild(hitRect(S.board.x - 190, 520, 380, 360, () => {
    sfx.tap()
    if (moon._sequence?.done) { toast('The mission is already back in order. 🚀', 3500); return }
    const missing = MOON_STEPS.filter((s) => !hasClue(`card:${s.id}`))
    if (missing.length) {
      toast(`You still need <b>${missing.length}</b> more mission ${missing.length === 1 ? 'card' : 'cards'}. Look around the wing — and check the Supply Desk.`, 5500)
      return
    }
    openMoonBoard({
      onComplete: () => {
        moon._sequence.done = true
        for (const s of MOON_STEPS) removeItem(`card:${s.id}`)
      },
      onClose: () => {
        if (moon._sequence.done) {
          setTimeout(() => finishSolve({
            success: {
              title: '🌕 The mission is back in order! 🌕',
              html: 'Lift-off, three days out, <b>Eagle</b> undocking once they were already circling the Moon, ' +
                'touchdown in the Sea of Tranquility, first steps — and home with a splash. ' +
                '<b>Michael Collins</b> stayed aboard <i>Columbia</i> the whole time.',
            },
          }, 'moon'), 400)
        }
      },
    })
  }, 'moon:board'))
  moon._sequence = { done: false }

  // the Build-a-Rocket workbench
  moon._gameBadge = solvedSeal(S.bench.x + 128, 664, { r: 34, caption: '' })
  mainL.addChild(moon._gameBadge)
  mainL.addChild(hitRect(S.bench.x - 160, 600, 320, 280, () => {
    sfx.tap()
    if (hasClue('card:splashdown') || moon._sequence.done) {
      toast('You already earned that card by launching it properly.', 3500)
      return
    }
    openRocketGame({
      onComplete: () => onMinigameSolved('moon'),
      onClose: () => {
        if (moon._gameDone && !hasClue('card:splashdown') && !moon._sequence.done) {
          grantItem('card:splashdown')
          toast('🚀 A good launch! The <b>Splashdown</b> mission card is yours.', 6000)
        } else { afterMinigameClose('moon') }
      },
    })
  }, 'moon:bench'))

  // three of the six cards are hidden here
  const clueL = scrollLayer(1.12)
  const roomCards = ['liftoff', 'touchdown', 'firstSteps']
  const spots = [S.cardA, S.cardB, S.cardC]
  await Promise.all(roomCards.map(async (id, i) => {
    const tex = await svgTexture(missionCardSVG(id, 84, 112))
    addHiddenClue(clueL, spots[i], `card:${id}`, tex)
  }))
  /* The Space Station's safety tether is here — the Moon room supplies the next
     room along, just as Mars supplied this one's mission card. */
  const tetherT = await svgTexture(tetherSVG(78, 101))
  addHiddenClue(clueL, S.tether, 'safetyTether', tetherT)
  addHiddenClue(clueL, S.rockA, rockInstance('lunarChip', 'moon'), rockAT)
  addHiddenClue(clueL, S.rockB, rockInstance('starShard', 'moon'), rockBT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 4100 / 2, 540)
  foreL.addChild(fore)

  moon.addChild(skyL, farL, midL, mainL, clueL, foreL)
  moon._layers = [skyL, farL, midL, mainL, clueL, foreL]
  moon._main = mainL
  moon._challenges = ['sequence', 'game']
  makeDust(moon, 22, MOON_W, 0xc7ccd2)
}

// light the sequence board the moment the sixth card lands, wherever it came from
function refreshMoonBoardCue() {
  if (!moon?._boardGlow || moon._sequence?.done || moon._boardLit) return
  if (!MOON_STEPS.every((s) => hasClue(`card:${s.id}`))) return
  moon._boardLit = true
  gsap.to(moon._boardGlow, { alpha: 0.9, duration: 0.8 })
  gsap.to(moon._boardGlow, { alpha: 0.35, duration: 1.2, yoyo: true, repeat: -1, delay: 0.8 })
  setTimeout(() => toast('That’s all six mission cards! The <b>LANDING SEQUENCE</b> board is ready.', 6000), 900)
}

/* ---------- SPACE STATION ROOM — Fix the Airlock ----------
   Two repairs again, but of different kinds: clip the SAFETY TETHER back onto the
   airlock anchor (the tether is over in the Moon room), and use the ROTATE KEY
   from the desk to turn the solar array to face the Sun. Then suit up for the
   spacewalk.

   The spec called the tether an "oxygen hose". It isn't — a spacewalker's oxygen
   comes from the suit's own backpack, never a line to the station. Gidi approved
   the reframe: the item and the puzzle are unchanged, the fact is corrected. */
async function buildStation() {
  const [skyT, earthT, trussT, mainT, foreT, wingT, rockAT, rockBT] = await Promise.all([
    stationSkySVG(), stationEarthSVG(), stationTrussSVG(), stationMainSVG(), stationForeSVG(),
    solarWingSVG(), spaceRockSVG('stardust', 62, 80), spaceRockSVG('meteorite', 60, 78),
  ].map(svgTexture))

  const skyL = bgLayer(0.1, skyT, 2400 / 2)
  const earthL = bgLayer(0.28, earthT, 2800 / 2)
  const trussL = bgLayer(0.6, trussT, 3200 / 2)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, STATION_W / 2, 540)
  mainL.addChild(main)

  const S = STATION_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('spacehub'), 'station:back'))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('EXHIBIT 4 — THE AIRLOCK. About <b>400 km</b> up, going round the Earth every <b>90 minutes</b>. The safety tether is unclipped and the solar array is turned the wrong way.', 7000)
  }, 'station:placard'))

  /* The solar array wing. It starts edge-on to the Sun — useless — and the Rotate
     Key turns it to face the light. The Sun is drawn in the scene, so "which way
     should it point?" is a question the room itself answers. */
  const wing = new Sprite(wingT)
  wing.anchor.set(0.5)
  wing.scale.set(0.9)
  placeAt(wing, S.panelHub.x, S.panelHub.y)
  wing.rotation = Math.PI / 2          // edge-on: the broken state
  mainL.addChild(wing)
  const wingGlow = new Graphics()
    .circle(0, 0, 66).fill({ color: 0xffd98a, alpha: 0.16 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.85 })
  placeAt(wingGlow, S.panelHub.x, S.panelHub.y)
  wingGlow.alpha = 0
  wingGlow.blendMode = 'add'
  mainL.addChild(wingGlow)

  const tetherGlow = new Graphics()
    .circle(0, 0, 62).fill({ color: 0xffd98a, alpha: 0.16 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.85 })
  placeAt(tetherGlow, S.tetherHook.x, S.tetherHook.y)
  tetherGlow.alpha = 0
  tetherGlow.blendMode = 'add'
  mainL.addChild(tetherGlow)
  const tetherT = await svgTexture(tetherSVG(120, 156))
  const tetherPlaced = new Sprite(tetherT)
  tetherPlaced.anchor.set(0.5)
  placeAt(tetherPlaced, S.tetherHook.x, S.tetherHook.y)
  tetherPlaced.alpha = 0
  mainL.addChild(tetherPlaced)

  station._drops = [
    {
      item: 'safetyTether',
      skeleton: { x: S.tetherHook.x, y: S.tetherHook.y - 90, w: 240, h: 190 },
      socket: S.tetherHook, glow: tetherGlow, placed: tetherPlaced, done: false,
      success: {
        html: 'The <b>safety tether</b> is clipped back on. Spacewalkers are always tethered to the ' +
          'station — and they wear a little jetpack called <b>SAFER</b> as a backup, just in case.',
      },
    },
    {
      item: 'rotateKey',
      skeleton: { x: S.panelHub.x, y: S.panelHub.y - 80, w: 250, h: 200 },
      socket: S.panelHub, glow: wingGlow, placed: wingGlow, done: false,
      onPlace: () => {
        // turn the array to face the drawn Sun, up and to the right
        // face the Sun drawn up-and-right of the hub: the panel's flat side turns
        // toward it, so the wing lies perpendicular to the hub→Sun direction
        gsap.to(wing, { rotation: -0.5, duration: 1.5, ease: 'power2.inOut' })
        station._wingTurned = true
      },
      success: {
        html: 'The array swings round to face the <b>Sun</b> and the power comes back. Solar panels only ' +
          'work pointed at the light — the station turns its wings all day long to keep up.',
      },
    },
  ]

  // the spacewalk console — dark until both repairs are done
  const consoleGlow = new Graphics()
    .roundRect(0, 0, 300, 250, 12).stroke({ color: 0xffd98a, width: 7, alpha: 0.9 })
  placeAt(consoleGlow, S.hatch.x - 150, 630)
  consoleGlow.alpha = 0
  consoleGlow.blendMode = 'add'
  mainL.addChild(consoleGlow)
  station._gameBadge = solvedSeal(S.hatch.x + 126, 672, { r: 34, caption: '' })
  mainL.addChild(station._gameBadge)

  station._onRepair = () => {
    if (!station._drops.every((d) => d.done) || station._consoleLit) return
    station._consoleLit = true
    gsap.to(consoleGlow, { alpha: 0.85, duration: 0.8 })
    gsap.to(consoleGlow, { alpha: 0.35, duration: 1.2, yoyo: true, repeat: -1, delay: 0.8 })
    setTimeout(() => toast('Tether on, power back. The <b>SPACEWALK DRIFT</b> console is live — time to suit up.', 5500), 1600)
  }

  mainL.addChild(hitRect(S.hatch.x - 150, 610, 300, 270, () => {
    sfx.tap()
    if (station._gameDone) { toast('You already brought every tool back inside. 🧑‍🚀', 3500); return }
    if (!station._drops.every((d) => d.done)) {
      toast('Not yet — the airlock still needs its <b>safety tether</b>, and the array needs turning to the <b>Sun</b>.', 5500)
      return
    }
    openSpacewalk({
      onComplete: () => onMinigameSolved('station'),
      onClose: () => afterMinigameClose('station'),
    })
  }, 'station:hatch'))

  const clueL = scrollLayer(1.12)
  /* Webb's mirror strut is here — the last link in the chain that runs
     solar → mars → moon → station → webb. Every room feeds the next one. */
  const strutT = await svgTexture(strutSVG(78, 101))
  addHiddenClue(clueL, S.strut, 'mirrorStrut', strutT)
  addHiddenClue(clueL, S.rockA, rockInstance('stardust', 'station'), rockAT)
  addHiddenClue(clueL, S.rockB, rockInstance('meteorite', 'station'), rockBT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 4200 / 2, 540)
  foreL.addChild(fore)

  station.addChild(skyL, earthL, trussL, mainL, clueL, foreL)
  station._layers = [skyL, earthL, trussL, mainL, clueL, foreL]
  station._main = mainL
  station._challenges = ['repairs', 'game']
  makeDust(station, 18, STATION_W, 0xbfd8ea)
}

/* ---------- JAMES WEBB ROOM — Align the Golden Mirrors ----------
   The last exhibit, and three challenges deep. First the two repairs: a support
   STRUT (over in the Space Station) and the missing 18th SEGMENT (bought at the
   desk). Then the alignment itself — seven of the eighteen segments are turned
   the wrong way, and tapping one rotates it a sixth of a turn until every notch
   points the same way. Finally the focus, in Focus the Stars.

   Eighteen segments, gold-coated because gold reflects INFRARED, which is the
   light Webb is built for. Aligning them one at a time is what commissioning
   really was. */
const WEBB_LOOSE = 7                    // how many segments start turned wrong

async function buildWebb() {
  const [skyT, shieldT, mainT, foreT, rockAT, rockBT] = await Promise.all([
    webbSkySVG(), webbShieldSVG(), webbMainSVG(), webbForeSVG(),
    spaceRockSVG('starShard', 62, 80), spaceRockSVG('stardust', 60, 78),
  ].map(svgTexture))

  const skyL = bgLayer(0.1, skyT, 2400 / 2)
  const shieldL = bgLayer(0.45, shieldT, 2800 / 2)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, WEBB_W / 2, 540)
  mainL.addChild(main)

  const S = WEBB_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('spacehub'), 'webb:back'))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('EXHIBIT 5 — JAMES WEBB. <b>18</b> gold mirror segments, out at <b>L2</b>, 1.5 million km away. One segment is missing and its support strut has come off.', 7000)
  }, 'webb:placard'))

  // ---- the two repairs ----
  const strutGlow = new Graphics()
    .circle(0, 0, 60).fill({ color: 0xffd98a, alpha: 0.16 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.85 })
  placeAt(strutGlow, S.strutSocket.x, S.strutSocket.y)
  strutGlow.alpha = 0
  strutGlow.blendMode = 'add'
  mainL.addChild(strutGlow)
  const strutT = await svgTexture(strutSVG(116, 151))
  const strutPlaced = new Sprite(strutT)
  strutPlaced.anchor.set(0.5)
  placeAt(strutPlaced, S.strutSocket.x, S.strutSocket.y)
  strutPlaced.alpha = 0
  mainL.addChild(strutPlaced)

  const segGlow = new Graphics()
    .circle(0, 0, 62).fill({ color: 0xffd98a, alpha: 0.16 }).stroke({ color: 0xffd98a, width: 6, alpha: 0.85 })
  placeAt(segGlow, S.segmentSocket.x, S.segmentSocket.y)
  segGlow.alpha = 0
  segGlow.blendMode = 'add'
  mainL.addChild(segGlow)

  webb._drops = [
    {
      item: 'mirrorStrut',
      skeleton: { x: S.strutSocket.x, y: S.strutSocket.y - 80, w: 220, h: 190 },
      socket: S.strutSocket, glow: strutGlow, placed: strutPlaced, done: false,
      success: { html: 'The support strut is back on. Webb’s whole mirror rides on a lightweight <b>backplane</b> that barely moves at all — even at 220 degrees below zero.' },
    },
    {
      item: 'mirrorPart',
      skeleton: { x: S.segmentSocket.x, y: S.segmentSocket.y - 80, w: 240, h: 190 },
      socket: S.segmentSocket, glow: segGlow, placed: segGlow, done: false,
      onPlace: () => { webb._tiles.forEach((t) => { t.sprite.visible = true }) },
      success: { html: 'That’s all <b>18</b> segments. They’re coated in real <b>gold</b> — because gold reflects <b>infrared</b> light, and infrared is exactly what Webb was built to see.' },
    },
  ]

  /* ---- the mirror array: 18 tappable segments ----
     The last one only appears once it's been fitted. Seven start rotated; a tap
     turns one a sixth of a turn. Aligned segments are drawn with a pale rim, so
     the 11 already-correct ones ARE the reference — no separate instructions. */
  const [tileT, tileAlignedT] = await Promise.all([hexTileSVG(124, false), hexTileSVG(124, true)].map(svgTexture))
  const positions = webbTilePositions()
  webb._tiles = []
  positions.forEach((pos, i) => {
    const sprite = new Sprite(tileT)
    sprite.anchor.set(0.5)
    placeAt(sprite, pos.x, pos.y)
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    const loose = i < WEBB_LOOSE
    // a wrong turn is 1..5 sixths — never 0, or a "loose" tile would start right
    const steps = loose ? 1 + Math.floor(Math.random() * 5) : 0
    sprite.rotation = (Math.PI / 3) * steps
    if (i === positions.length - 1) sprite.visible = false   // the missing segment
    if (steps === 0) sprite.texture = tileAlignedT
    const tile = { sprite, steps, loose }
    sprite.on('pointertap', () => tapMirrorTile(tile))
    mainL.addChild(sprite)
    webb._tiles.push(tile)
  })
  webb._mirrors = { done: false, alignedTex: tileAlignedT, plainTex: tileT }

  // ---- the focus console ----
  const consoleGlow = new Graphics()
    .roundRect(0, 0, 300, 250, 12).stroke({ color: 0xffd98a, width: 7, alpha: 0.9 })
  placeAt(consoleGlow, S.console.x - 150, 630)
  consoleGlow.alpha = 0
  consoleGlow.blendMode = 'add'
  mainL.addChild(consoleGlow)
  webb._consoleGlow = consoleGlow
  webb._gameBadge = solvedSeal(S.console.x + 126, 672, { r: 34, caption: '' })
  mainL.addChild(webb._gameBadge)

  mainL.addChild(hitRect(S.console.x - 150, 610, 300, 270, () => {
    sfx.tap()
    if (webb._gameDone) { toast('Already focused. That galaxy isn’t going anywhere. ✨', 3500); return }
    if (!webb._drops.every((d) => d.done)) {
      toast('The mirror isn’t whole yet — it still needs its <b>support strut</b> and the last <b>segment</b>.', 5500)
      return
    }
    if (!webb._mirrors.done) {
      toast('The segments are still pointing different ways. <b>Tap</b> the crooked ones until every notch points up.', 6000)
      return
    }
    openTelescope({
      onComplete: () => onMinigameSolved('webb'),
      onClose: () => afterMinigameClose('webb'),
    })
  }, 'webb:console'))

  webb._onRepair = () => {
    if (!webb._drops.every((d) => d.done) || webb._repairsDone) return
    webb._repairsDone = true
    setTimeout(() => toast('All 18 segments are mounted — but they’re pointing every which way. <b>Tap</b> a crooked one to turn it.', 6500), 1600)
  }

  const clueL = scrollLayer(1.12)
  addHiddenClue(clueL, S.rockA, rockInstance('starShard', 'webb'), rockAT)
  addHiddenClue(clueL, S.rockB, rockInstance('stardust', 'webb'), rockBT)

  const foreL = scrollLayer(1.35)
  const fore = new Sprite(foreT)
  fore.anchor.set(0.5)
  placeAt(fore, 4200 / 2, 540)
  foreL.addChild(fore)

  webb.addChild(skyL, shieldL, mainL, clueL, foreL)
  webb._layers = [skyL, shieldL, mainL, clueL, foreL]
  webb._main = mainL
  webb._challenges = ['repairs', 'mirrors', 'game']
  makeDust(webb, 16, WEBB_W, 0xd9c9f0)
}

// tap a segment: turn it a sixth of a turn. Aligned tiles gain a pale rim, so
// the ones already right show you what right looks like.
function tapMirrorTile(tile) {
  if (!webb || webb._mirrors.done || !tile.sprite.visible) return
  if (!webb._drops.every((d) => d.done)) {
    sfx.tap()
    toast('Fit the last segment and its strut first — then the mirror can be aligned.', 4500)
    return
  }
  sfx.tap()
  tile.steps = (tile.steps + 1) % 6
  gsap.to(tile.sprite, { rotation: tile.sprite.rotation + Math.PI / 3, duration: 0.32, ease: 'back.out(2)' })
  tile.sprite.texture = tile.steps === 0 ? webb._mirrors.alignedTex : webb._mirrors.plainTex

  if (webb._tiles.every((t) => t.steps === 0)) {
    webb._mirrors.done = true
    sfx.success()
    for (const t of webb._tiles) {
      t.sprite.texture = webb._mirrors.alignedTex
      gsap.fromTo(t.sprite.scale, { x: 1.14, y: 1.14 }, { x: 1, y: 1, duration: 0.5, ease: 'back.out(3)' })
    }
    gsap.to(webb._consoleGlow, { alpha: 0.85, duration: 0.8 })
    gsap.to(webb._consoleGlow, { alpha: 0.35, duration: 1.2, yoyo: true, repeat: -1, delay: 0.8 })
    confetti(webb._tiles[0].sprite)
    setTimeout(() => toast('Every notch points the same way — <b>18 mirrors acting as one</b>. Now focus it.', 6000), 700)
  }
}

/* ---------- VELOCIRAPTOR ROOM (arid badlands) ---------- */
async function buildRaptor() {
  const [skyT, dunesFarT, dunesMidT, mainT, rockT, featherT, trexToothT] = await Promise.all(
    [raptorSkySVG(), raptorDunesFarSVG(), raptorDunesMidSVG(), raptorMainSVG(), raptorRockSVG(), featherSVG(60, 78), toothSVG('blade', 60, 78)].map(svgTexture),
  )

  const skyL = scrollLayer(0.1)
  const sky = new Sprite(skyT)
  sky.anchor.set(0.5)
  placeAt(sky, 2200 / 2, 540)
  skyL.addChild(sky)

  const dunesFarL = scrollLayer(0.3)
  const dunesFar = new Sprite(dunesFarT)
  dunesFar.anchor.set(0.5)
  placeAt(dunesFar, 2600 / 2, 540)
  dunesFarL.addChild(dunesFar)

  const dunesMidL = scrollLayer(0.5)
  const dunesMid = new Sprite(dunesMidT)
  dunesMid.anchor.set(0.5)
  placeAt(dunesMid, 2950 / 2, 540)
  dunesMidL.addChild(dunesMid)

  const mainL = scrollLayer(1)
  const main = new Sprite(mainT)
  main.anchor.set(0.5)
  placeAt(main, RAPTOR_W / 2, 540)
  mainL.addChild(main)

  const S = RAPTOR_SPOTS
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('dinohub')))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => {
    sfx.tap()
    toast('VELOCIRAPTOR — “swift thief”. A turkey-sized, FEATHERED hunter with a big sickle claw.')
  }))
  mainL.addChild(hitRect(S.skeleton.x - S.skeleton.w / 2, S.skeleton.y, S.skeleton.w, S.skeleton.h, () => {
    sfx.tap()
    toast(raptor._drop?.done
      ? 'Feathers, just like a bird — they suit this raptor perfectly.'
      : hasClue('feather')
        ? 'This hunter’s arms look strangely bare. If one of your finds belongs here, drag it on →'
        : 'This little hunter’s arms look strangely bare — as if something light is missing.')
  }))
  mainL.addChild(hitRect(S.hint.x - 60, S.hint.y - 60, 120, 120, () => {
    sfx.tap()
    toast(raptor._drop?.done
      ? 'You did it! The feather belongs to the only feathered dino here.'
      : !hasClue('feather')
        ? 'You’re missing the right piece. Watch the shadows as you walk the other rooms — things hide behind them.'
        : 'Check the placards. Which dinosaur here was built more like a bird than a scaly lizard?')
  }))

  const raptorGlow = new Graphics()
    .roundRect(0, 0, S.skeleton.w, S.skeleton.h, 24)
    .fill({ color: 0xffd98a, alpha: 0.14 })
    .stroke({ color: 0xffd98a, width: 8, alpha: 0.8 })
  placeAt(raptorGlow, S.skeleton.x - S.skeleton.w / 2, S.skeleton.y)
  raptorGlow.alpha = 0
  raptorGlow.blendMode = 'add'
  mainL.addChild(raptorGlow)

  const placedFeather = new Sprite(featherT)
  placedFeather.anchor.set(0.5)
  placedFeather.rotation = -0.35
  placeAt(placedFeather, S.socket.x, S.socket.y)
  placedFeather.alpha = 0
  mainL.addChild(placedFeather)

  // a hidden T-REX TOOTH (1.2x layer, revealed from behind the 1.4x rock as you walk)
  const clueL = scrollLayer(1.2)
  addHiddenClue(clueL, S.clue, 'trexTooth', trexToothT)

  // foreground rocks (fastest) — the rock at the clue's x hides it until you walk past
  const foreL = scrollLayer(1.4)
  for (const [wx, s, flip] of [[500, 1.3, false], [S.clue.x, 1.25, false], [1700, 1.6, true], [2950, 1.2, false], [3500, 1.5, true]]) {
    const r = new Sprite(rockT)
    r.anchor.set(0.5, 1)
    r.scale.set(s * (flip ? -1 : 1), s)
    placeAt(r, wx, 1120)
    foreL.addChild(r)
  }

  raptor.addChild(skyL, dunesFarL, dunesMidL, mainL, clueL, foreL)
  raptor._layers = [skyL, dunesFarL, dunesMidL, mainL, clueL, foreL]
  raptor._main = mainL
  // the placeable target in this room: drag the FEATHER here
  raptor._drop = {
    item: 'feather', skeleton: S.skeleton, socket: S.socket, glow: raptorGlow, placed: placedFeather, done: false,
    success: {
      frag: 2,
      video: '/video/raptor-success.mp4',
      html: 'Velociraptor wore <b>feathers</b> like a bird! Bumps on its arm bones — <b>quill knobs</b> — ' +
        'show exactly where its feathers attached.',
    },
  }
  raptor._challenges = ['drop']
  makeDust(raptor, 26, RAPTOR_W, 0xe8d29a)
}

// a background parallax layer holding one full-width sprite
function bgLayer(speed, tex, x, y = 540) {
  const L = scrollLayer(speed)
  const s = new Sprite(tex)
  s.anchor.set(0.5)
  placeAt(s, x, y)
  L.addChild(s)
  return L
}

// the standard room hotspots (back exit · placard · skeleton · hint), driven by the
// room's _drop so the copy reacts to whether the clue is held / placed
function roomHotspots(mainL, scene, S, t) {
  mainL.addChild(hitRect(S.backPost.x, S.backPost.y, S.backPost.w, S.backPost.h, () => goScene('dinohub')))
  mainL.addChild(hitRect(S.placard.x - 100, 620, 200, 240, () => { sfx.tap(); toast(t.placard) }))
  mainL.addChild(hitRect(S.skeleton.x - S.skeleton.w / 2, S.skeleton.y, S.skeleton.w, S.skeleton.h, () => {
    sfx.tap(); toast(scene._drop?.done ? t.solved : hasClue(scene._drop?.item) ? t.have : t.need)
  }))
  mainL.addChild(hitRect(S.hint.x - 60, S.hint.y - 60, 120, 120, () => {
    sfx.tap(); toast(scene._drop?.done ? t.solved : hasClue(scene._drop?.item) ? t.have : t.hint)
  }))
}

/* ---------- T-REX ROOM (dim conifer forest) ---------- */
async function buildTrex() {
  const S = TREX_SPOTS
  const [skyT, farT, midT, mainT, fernT, toothT, eggT, footIconT] = await Promise.all(
    [trexSkySVG(), trexFarSVG(), trexMidSVG(), trexMainSVG(), trexFernSVG(), toothSVG('blade', 64, 82), eggSVG('round', 60, 78),
      footprintSVG('three-toe', 96, 120)].map(svgTexture),
  )
  const skyL = bgLayer(0.15, skyT, 2200 / 2)
  const farL = bgLayer(0.3, farT, 2600 / 2)
  const midL = bgLayer(0.5, midT, 2950 / 2)
  const mainL = bgLayer(1, mainT, TREX_W / 2)

  roomHotspots(mainL, trex, S, {
    placard: 'TYRANNOSAURUS REX — “tyrant lizard king”. Huge jaws, tiny arms, and bone-crushing teeth.',
    solved: 'A perfect bite — those banana-sized teeth belong to the T-rex.',
    have: 'A giant jaw with a gap in it. If one of your finds is big enough, drag it here →',
    need: 'A giant jaw with a gap in it. Only one kind of tooth could arm a bite this size.',
    hint: 'Think about the size of that bite. A bone-crusher needs a tooth far bigger than a little hunter’s.',
  })
  addDropTarget(mainL, trex, {
    item: 'trexTooth', skeleton: S.skeleton, socket: S.socket, placedTex: toothT, rot: 0.25, frag: 3,
    html: 'Banana-sized, <b>serrated teeth</b> — strong enough to crush bone. They belong to the king: <b>Tyrannosaurus rex</b>!',
  })

  // a hidden BRACHIOSAURUS egg behind a fern (1.2x layer)
  const clueL = scrollLayer(1.2)
  addHiddenClue(clueL, S.clue, 'brachioEgg', eggT)

  const foreL = scrollLayer(1.4)
  for (const [wx, sc, flip] of [[420, 1.3, false], [S.clue.x, 1.25, false], [1950, 1.4, true], [3150, 1.3, false]]) {
    const f = new Sprite(fernT)
    f.anchor.set(0.5, 1)
    f.scale.set(sc * (flip ? -1 : 1), sc)
    placeAt(f, wx, 1120)
    foreL.addChild(f)
  }

  // foot-assembly puzzle: a lit plinth in the room opens a full-screen, immersive
  // stage where the player rebuilds a real T-rex foot from a kit of separate fossil
  // bones (metatarsal + toes + dewclaw), scattered on a sandstone dig backdrop.
  const [metaT, toeAT, toeBT, toeCT, clawT, footBgT] = await Promise.all([
    imgTexture('/img/foot/metatarsal.png'), imgTexture('/img/foot/toe-a.png'),
    imgTexture('/img/foot/toe-b.png'), imgTexture('/img/foot/toe-c.png'),
    imgTexture('/img/foot/claw.png'), imgTexture('/img/foot-bg.jpg'),
  ])
  // each bone's home in the assembled foot: dx/dy = centre offset (design px) from
  // the foot centre, ang = its rotation when seated. Tuned so the metatarsal stands
  // at the top and three toes splay below with their claws pointing down.
  // dx/dy/ang tuned so each bone's joint meets the metatarsal base — the toes
  // fan from one hub and the whole thing reads as a connected foot (matches the
  // catalog's assembled reference, which is composited from these same numbers).
  // Order = z-order (back→front): dewclaw sits behind the toes.
  const bonesCfg = [
    { tex: metaT, w: 394, h: 404, dx: 0, dy: -177, ang: -0.732 },  // metatarsal (core, vertical)
    { tex: clawT, w: 197, h: 113, dx: -87, dy: -10, ang: 1.36 },   // back dewclaw (points up-left)
    { tex: toeAT, w: 427, h: 243, dx: -123, dy: 148, ang: -0.767 }, // inner toe (claw down-left)
    { tex: toeBT, w: 334, h: 254, dx: 10, dy: 177, ang: -1.015 },  // middle toe (longest, claw down)
    { tex: toeCT, w: 126, h: 185, dx: 87, dy: 107, ang: 2.30 },    // outer toe (claw down-right)
  ]
  buildFootEntry(mainL, S, footIconT)

  trex.addChild(skyL, farL, midL, mainL, clueL, foreL)
  trex._layers = [skyL, farL, midL, mainL, clueL, foreL]
  trex._main = mainL
  trex._challenges = ['drop', 'foot']
  makeDust(trex, 24, TREX_W, 0x9fce9f)

  // the full-screen overlay lives on top of every scene (added to root, hidden)
  footStage = buildFootStage(bonesCfg, footBgT)
  root.addChild(footStage)
}

/* ---------- BRACHIOSAURUS ROOM (open plains) ---------- */
async function buildBrachio() {
  const S = BRACHIO_SPOTS
  const [skyT, hillsT, treesT, mainT, grassT, eggT, fuzzT] = await Promise.all(
    [brachioSkySVG(), brachioHillsSVG(), brachioTreesSVG(), brachioMainSVG(), brachioGrassSVG(), eggSVG('round', 64, 82), pycnofiberSVG(60, 78)].map(svgTexture),
  )
  const skyL = bgLayer(0.1, skyT, 2200 / 2)
  const hillsL = bgLayer(0.3, hillsT, 2600 / 2)
  const treesL = bgLayer(0.5, treesT, 2950 / 2)
  const mainL = bgLayer(1, mainT, BRACHIO_W / 2)

  roomHotspots(mainL, brachio, S, {
    placard: 'BRACHIOSAURUS — a giant plant-eater that reached treetops on a long neck. Taller than a house!',
    solved: 'Snug in its nest — a giant egg for a giant plant-eater.',
    have: 'An empty nest by the giant’s feet. If one of your finds belongs here, drag it in →',
    need: 'An empty nest sits by the giant’s feet. Whatever filled it must have been enormous.',
    hint: 'A giant animal lays a giant clutch. Which of your finds is far too big for any small creature?',
  })
  addDropTarget(mainL, brachio, {
    item: 'brachioEgg', skeleton: S.skeleton, socket: S.socket, placedTex: eggT, rot: 0, frag: 4,
    html: 'A giant <b>round egg</b> for a giant plant-eater — <b>Brachiosaurus</b>, who browsed the treetops on its long neck.',
  })

  // a tappable sign on the open plain that launches the BRACHIO RUN mini-game
  buildBrachioGameEntry(mainL, { x: 850, y: 720 })

  // hidden PTERODACTYL pycnofibers behind a grass tuft (1.2x layer)
  const clueL = scrollLayer(1.2)
  addHiddenClue(clueL, S.clue, 'pycnofibers', fuzzT)

  const foreL = scrollLayer(1.4)
  for (const [wx, sc, flip] of [[500, 1.4, false], [S.clue.x, 1.25, false], [2200, 1.5, true], [3400, 1.3, false]]) {
    const g = new Sprite(grassT)
    g.anchor.set(0.5, 1)
    g.scale.set(sc * (flip ? -1 : 1), sc)
    placeAt(g, wx, 1118)
    foreL.addChild(g)
  }

  brachio.addChild(skyL, hillsL, treesL, mainL, clueL, foreL)
  brachio._layers = [skyL, hillsL, treesL, mainL, clueL, foreL]
  brachio._main = mainL
  brachio._challenges = ['drop', 'game']
  makeDust(brachio, 26, BRACHIO_W, 0xe6d79a)
}

/* ---------- PTERODACTYL ROOM (sea cliffs) ---------- */
async function buildPtero() {
  const S = PTERO_SPOTS
  const [skyT, seaT, cliffT, mainT, rockT, fuzzT] = await Promise.all(
    [pteroSkySVG(), pteroSeaSVG(), pteroCliffSVG(), pteroMainSVG(), pteroRockSVG(), pycnofiberSVG(64, 82)].map(svgTexture),
  )
  const skyL = bgLayer(0.1, skyT, 2200 / 2)
  const seaL = bgLayer(0.25, seaT, 2600 / 2)
  const cliffL = bgLayer(0.5, cliffT, 2900 / 2)
  const mainL = bgLayer(1, mainT, PTERO_W / 2)

  roomHotspots(mainL, ptero, S, {
    placard: 'PTERODACTYL — a flying reptile (a pterosaur, NOT a dinosaur). Toothless beak, big crest, fuzzy pycnofibers.',
    solved: 'Fuzzy at last — pycnofibers suit this flying reptile perfectly.',
    have: 'This flyer’s skin looks oddly bare. If one of your finds suits it, drag it on →',
    need: 'This flying reptile looks oddly bare — as if a soft covering is missing.',
    hint: 'Not every prehistoric fuzz is feathers. What soft coat would keep a flying reptile warm?',
  })
  addDropTarget(mainL, ptero, {
    item: 'pycnofibers', skeleton: S.skeleton, socket: S.socket, placedTex: fuzzT, rot: 0, frag: 5,
    html: 'Soft <b>pycnofibers</b> — fuzzy down! They belong to <b>Pterodactyl</b>, a flying reptile (a <b>pterosaur</b>), not a dinosaur.',
  })

  // a tappable cliff-side sign that launches the FISH RUN mini-game
  buildPteroGameEntry(mainL, { x: 980, y: 720 })

  const foreL = scrollLayer(1.4)
  for (const [wx, sc, flip] of [[420, 1.3, false], [1500, 1.5, true], [2600, 1.3, false], [3200, 1.4, true]]) {
    const r = new Sprite(rockT)
    r.anchor.set(0.5, 1)
    r.scale.set(sc * (flip ? -1 : 1), sc)
    placeAt(r, wx, 1120)
    foreL.addChild(r)
  }

  ptero.addChild(skyL, seaL, cliffL, mainL, foreL)
  ptero._layers = [skyL, seaL, cliffL, mainL, foreL]
  ptero._main = mainL
  ptero._challenges = ['drop', 'game']
  makeDust(ptero, 24, PTERO_W, 0xbcd6e6)
}

// a glowing cliff-side placard that opens the FISH RUN one-tap mini-game
function buildPteroGameEntry(mainL, { x, y }) {
  const glow = new Graphics().ellipse(0, 0, 150, 100).fill({ color: 0x7fa6c0, alpha: 0.16 })
  placeAt(glow, x, y - 30); glow.blendMode = 'add'; mainL.addChild(glow)
  gsap.to(glow, { alpha: 0.4, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  const sign = new Graphics().roundRect(-128, -52, 256, 104, 16)
    .fill({ color: 0x16242f, alpha: 0.92 }).stroke({ color: 0xece0c2, width: 3, alpha: 0.7 })
  placeAt(sign, x, y); mainL.addChild(sign)

  const fish = new Text({ text: '🐟', style: { fontSize: 44 } })
  fish.anchor.set(0.5); placeAt(fish, x - 84, y); mainL.addChild(fish)
  gsap.to(fish, { y: fish.y - 10, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  const label = new Text({
    text: 'FISH RUN\ntap to play ▸',
    style: { fontFamily: SERIF, fontSize: 26, fill: 0xf4ead0, align: 'center', lineHeight: 30, fontWeight: '600' },
  })
  label.anchor.set(0.5); placeAt(label, x + 26, y); mainL.addChild(label)

  ptero._gameBadge = solvedSeal(x + 150, y - 64, { r: 28, caption: '' })
  mainL.addChild(ptero._gameBadge)

  mainL.addChild(hitRect(x - 128, y - 56, 256, 112, () => {
    sfx.tap()
    openPteroGame({ goal: 10, onComplete: () => onMinigameSolved('ptero'), onClose: () => afterMinigameClose('ptero') })
  }))
}

// a glowing plain-side placard that opens the BRACHIO RUN endless-runner mini-game
function buildBrachioGameEntry(mainL, { x, y }) {
  const glow = new Graphics().ellipse(0, 0, 150, 100).fill({ color: 0x8fce6a, alpha: 0.16 })
  placeAt(glow, x, y - 30); glow.blendMode = 'add'; mainL.addChild(glow)
  gsap.to(glow, { alpha: 0.42, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  const sign = new Graphics().roundRect(-128, -52, 256, 104, 16)
    .fill({ color: 0x1c2a16, alpha: 0.92 }).stroke({ color: 0xece0c2, width: 3, alpha: 0.7 })
  placeAt(sign, x, y); mainL.addChild(sign)

  const leaf = new Text({ text: '🌿', style: { fontSize: 44 } })
  leaf.anchor.set(0.5); placeAt(leaf, x - 84, y); mainL.addChild(leaf)
  gsap.to(leaf, { y: leaf.y - 10, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  const label = new Text({
    text: 'BRACHIO RUN\ntap to play ▸',
    style: { fontFamily: SERIF, fontSize: 26, fill: 0xf4ead0, align: 'center', lineHeight: 30, fontWeight: '600' },
  })
  label.anchor.set(0.5); placeAt(label, x + 26, y); mainL.addChild(label)

  brachio._gameBadge = solvedSeal(x + 150, y - 64, { r: 28, caption: '' })
  mainL.addChild(brachio._gameBadge)

  mainL.addChild(hitRect(x - 128, y - 56, 256, 112, () => {
    sfx.tap()
    openBrachioGame({ surviveSeconds: 20, onSurvive: () => onMinigameSolved('brachio'), onClose: () => afterMinigameClose('brachio') })
  }))
}

/* ---------- game beats ---------- */
let lobbyHintTimer = null
let firstSpaceVisit = true

// the first inventory slot holds the found tooth
const invToothSlot = () => document.querySelector('#inventory-grid .inv-slot')

function pickUpTooth() {
  if (hasClue('tooth')) return
  state.has.tooth = true
  clearTimeout(lobbyHintTimer)
  sfx.pickup()

  // always open the inventory so the tooth has a visible slot to land in
  // (instant, so the slot is measured at its resting position)
  openRailInstant('inventory-rail')

  const gp = toothSprite.getGlobalPosition()
  const slotEl = invToothSlot()
  const slot = slotEl.getBoundingClientRect()
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
        slotEl.classList.remove('empty')
        slotEl.classList.add('filled')
        slotEl.dataset.item = 'tooth'
        slotEl.innerHTML = slotInner('tooth')
        gsap.fromTo(slotEl, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
      },
    })

  gsap.to(toothSprite, { alpha: 0, duration: 0.25 })
  gsap.to(sparkle, { alpha: 0, duration: 0.25, overwrite: true })
  toothSprite.eventMode = 'none'

  gsap.to(doorGlow, { alpha: 0.7, duration: 1.2 })
  gsap.to(doorGlow, { alpha: 0.25, duration: 1.4, yoyo: true, repeat: -1, delay: 1.2 })

  toast('A fossil tooth! It’s now in your INVENTORY. The DINOSAUR WING is at the end of the hall →', 6000)
}

/* ---------- wings (lobby → a wing's hall → one of its rooms) ----------
   The museum is a set of WINGS. Each wing owns a hub scene, its rooms, the lobby
   door that leads into it, and the copy its finale card shows. Everything below —
   navigation, seals, completion — reads this registry, so adding a wing is data,
   not new plumbing. */
const WINGS = {
  dino: {
    hub: 'dinohub',
    hubLabel: 'Dino Hall',
    door: 'doorDino',
    rooms: ['grove', 'raptor', 'trex', 'brachio', 'ptero'],
    finale: {
      name: 'DINOSAUR WING',
      text: 'Every fossil is back where it belongs — you’ve solved <b>all five exhibits</b> ' +
        'and completed the entire <b>Dinosaur Wing</b>! 🦕',
    },
  },
  space: {
    hub: 'spacehub',
    hubLabel: 'Space Hall',
    door: 'doorSpace',
    // All five are declared even though only `solar` is built. An unbuilt room
    // has no `_challenges`, so roomComplete() reads false for it and the wing
    // cannot finish early — declaring only the built ones would have fired the
    // WING finale the moment the first room was solved.
    rooms: ['solar', 'mars', 'moon', 'station', 'webb'],
    finale: {
      name: 'SPACE WING',
      text: 'Every exhibit is running again — you’ve restored <b>all five</b> and finished ' +
        'the whole <b>Space Wing</b>! 🚀',
    },
  },
}

// derived navigation tables: lobby(0) → hub(1) → room(2)
const SCENE_BACK = {}
const BACK_LABEL = {}
const DEPTH = { lobby: 0 }
const ROOM_WING = {}   // room id → the wing it belongs to
for (const [wingId, w] of Object.entries(WINGS)) {
  SCENE_BACK[w.hub] = 'lobby'
  BACK_LABEL[w.hub] = 'Lobby'
  DEPTH[w.hub] = 1
  for (const r of w.rooms) {
    SCENE_BACK[r] = w.hub
    BACK_LABEL[r] = w.hubLabel
    DEPTH[r] = 2
    ROOM_WING[r] = wingId
  }
}

/* ---------- completion state (a room = one diorama; a wing = five of them) ----------
   A room is "done" when ALL its challenges are solved. Each room declares which
   challenges it has via `sc._challenges` (set by its builder) instead of the engine
   knowing room names. A WING is done when every one of its rooms is. Each room stamps
   a SOLVED seal on its diorama in the hall; the wing stamps its lobby door and fires
   a grand finale. */
/* Every kind of challenge a room can declare, as a pair: how to tell it's done,
   and how to force it done. They live together so the test/screenshot hook can
   never fall behind the game — an earlier version of `force` only knew the dino
   wing's types, so __solveWing('space') fired the wing finale for a wing that
   was not actually finished. */
const CHALLENGES = {
  // drag a clue onto the skeleton
  drop: { done: (sc) => !!sc._drop?.done,
    force: (sc) => { if (sc._drop) { sc._drop.done = true; if (sc._drop.placed) sc._drop.placed.alpha = 1 } } },
  // the T-rex foot-assembly puzzle
  foot: { done: (sc) => !!sc._foot?.done, force: (sc) => { if (sc._foot) sc._foot.done = true } },
  // a mini-game hit its goal
  game: { done: (sc) => !!sc._gameDone,
    force: (sc) => { sc._gameDone = true; if (sc._gameBadge) revealMark(sc._gameBadge) } },
  // every planet back on its ring
  orrery: { done: (sc) => !!sc._orrery?.done, force: (sc) => { if (sc._orrery) sc._orrery.done = true } },
  // every repair in a multi-repair room
  repairs: { done: (sc) => !!sc._drops?.every((d) => d.done),
    force: (sc) => { for (const d of sc._drops ?? []) { d.done = true; if (d.placed) d.placed.alpha = 1 } } },
  // the mission cards are in order
  sequence: { done: (sc) => !!sc._sequence?.done, force: (sc) => { if (sc._sequence) sc._sequence.done = true } },
  // every mirror segment aligned
  mirrors: { done: (sc) => !!sc._mirrors?.done,
    force: (sc) => { if (sc._mirrors) sc._mirrors.done = true; for (const t of sc._tiles ?? []) t.steps = 0 } },
}

function roomComplete(name) {
  const sc = scenes[name]
  // no `_challenges` yet = the builder hasn't run — an unbuilt room is NOT complete
  if (!sc?._challenges?.length) return false
  return sc._challenges.every((c) => CHALLENGES[c].done(sc))
}
// a wing with no rooms yet (one still being built) is NOT complete — `[].every()`
// is true, which would otherwise stamp its seal and fire its finale on boot
const wingComplete = (wingId) => {
  const rooms = WINGS[wingId].rooms
  return rooms.length > 0 && rooms.every(roomComplete)
}

function goScene(target) {
  if (!scenes[target] || target === state.scene) return
  if (puzzleOpen) closeFootPuzzle()
  if (isSupplyDeskOpen()) closeSupplyDesk()
  if (isOrbitGameOpen()) closeOrbitGame()
  if (isRoverGameOpen()) closeRoverGame()
  if (isMoonBoardOpen()) closeMoonBoard()
  if (isRocketGameOpen()) closeRocketGame()
  if (isSpacewalkOpen()) closeSpacewalk()
  if (isTelescopeOpen()) closeTelescope()
  const from = scenes[state.scene]
  const to = scenes[target]
  const dir = DEPTH[target] >= DEPTH[state.scene] ? -1 : 1
  state.scene = target
  cams[target].x = 0
  cams[target].vel = 0
  sfx.whoosh()
  switchScene(from, to, dir)
  const back = SCENE_BACK[target]
  const btn = $('back-btn')
  if (back) { btn.textContent = '‹ ' + BACK_LABEL[target]; btn.classList.remove('hidden') }
  else btn.classList.add('hidden')
  $('walk-arrow').classList.remove('hidden')
  onSceneEnter(target)
}

// per-room: which clue is placed here, and the on-enter toasts
const ROOM_ENTER = {
  grove: { item: 'tooth', ready: 'A jungle trail! Walk to the skeleton and DRAG your tooth onto it — and watch the ground for a stray FEATHER.', explore: 'A jungle trail! Walk and explore — keep an eye on the ground…' },
  raptor: { item: 'feather', ready: 'Arid badlands — a FEATHERED raptor! Drag your feather onto its arm. (Something glints by the rocks…)', explore: 'Arid badlands. This raptor looks like it’s missing a plume…' },
  trex: { item: 'trexTooth', ready: 'A dark forest, and a giant jaw missing a tooth. Drag the big tooth onto it. (Is that an EGG in the ferns?)', explore: 'A dark conifer forest. The T-rex’s jaw looks bare…' },
  brachio: { item: 'brachioEgg', ready: 'Open plains and a huge nest. Drag the egg into the nest. (Something fuzzy hides in the grass…)', explore: 'Open plains. There’s an empty nest by the giant’s feet…' },
  ptero: { item: 'pycnofibers', ready: 'Sea cliffs! Drag the fuzzy pycnofibers onto the flying pterosaur.', explore: 'Windy sea cliffs. The pterosaur looks oddly bare…' },
}

// the space rooms don't hang on one clue, so they get their own on-enter copy
const SPACE_ROOM_ENTER = {
  solar: 'The planetarium! Three rings on the orrery are <b>empty</b>. Read the <b>STAR ATLAS</b> on the lectern to work out which planet goes where.',
  mars: 'The Mars bay. The rover is missing a <b>wheel</b>, and its solar panel is buried in <b>red dust</b>. Fix both, then take it for a drive.',
  moon: 'The Apollo 11 landing site — that really is <b>Earth</b> up there. Six <b>mission cards</b> have come off the board. Find them all, then put the mission back in order.',
  station: 'Outside the station, <b>400 km</b> above the Earth. The airlock’s <b>safety tether</b> is unclipped and the <b>solar array</b> is turned away from the Sun.',
  webb: 'The James Webb telescope, a million and a half kilometres from home. A <b>mirror segment</b> is missing, its <b>strut</b> has come off — and the rest are pointing every which way.',
}

function onSceneEnter(target) {
  if (target === 'dinohub') {
    setTimeout(() => toast('The Hall of Dinosaurs! Tap a diorama to step inside its world.', 6000), 700)
    return
  }
  if (target === 'spacehub') {
    // arming the purse here is what makes coins appear at all — the Dinosaur Wing
    // never shows them
    armCoinHud()
    // read the flag NOW, not inside the timeout — it's cleared before then
    const msg = firstSpaceVisit
      ? 'The Hall of Space! Five exhibits are broken. Space rocks are scattered everywhere — sell them at the SUPPLY DESK to buy what the exhibits need.'
      : 'The Hall of Space. Tap the SUPPLY DESK to trade, or a diorama to step inside.'
    firstSpaceVisit = false
    setTimeout(() => toast(msg, 7000), 700)
    return
  }
  if (SPACE_ROOM_ENTER[target]) {
    setTimeout(() => toast(SPACE_ROOM_ENTER[target], 7000), 700)
    return
  }
  const cfg = ROOM_ENTER[target]
  if (!cfg) return
  const drop = scenes[target]?._drop
  const ready = hasClue(cfg.item) && drop && !drop.done
  if (ready) {
    if (isCompact()) setRail('inventory-rail', false)
    showPouch(pouchOf(cfg.item))   // a cue in a hidden pouch cues nobody
    invSlotFor(cfg.item)?.classList.add('cue')
    if (target === 'grove') gsap.to(trayGlow, { alpha: 0.8, duration: 1, delay: 1, yoyo: true, repeat: 3 })
  }
  setTimeout(() => toast(ready ? cfg.ready : cfg.explore, 6500), 700)
}

/* ---------- the bag's two pouches ----------
   FINDS holds the puzzle items you drag onto exhibits; ROCKS holds the Space
   Wing's currency, which is only ever sold at the Supply Desk. They share one
   rail as two tabs rather than becoming a second panel: screen space on a phone
   is the scarcest thing we have, and rocks crowding out quest items in a 6-slot
   grid was the real problem. An item's pouch follows from what it IS, so nothing
   has to remember to file it correctly. */
const pouchOf = (itemId) => (isRock(itemId) ? 'rocks' : 'finds')
const gridSel = (pouch) => (pouch === 'rocks' ? '#rock-grid' : '#inventory-grid')
const slotsIn = (pouch) => [...document.querySelectorAll(`${gridSel(pouch)} .inv-slot`)]
const allSlots = () => [...slotsIn('finds'), ...slotsIn('rocks')]

const invSlot = (i) => slotsIn('finds')[i]
const invSlotFor = (item) => allSlots().find((s) => s.dataset.item === item)
const nextEmptySlotIn = (pouch) => slotsIn(pouch).find((s) => !s.classList.contains('filled'))
const nextEmptyInvSlot = (itemId) => nextEmptySlotIn(pouchOf(itemId))

// every collectible clue → how it's drawn (inventory icon · drag ghost · placed sprite).
// Space rocks and tools draw themselves from the economy's own art.
const ITEM_SVG = {
  tooth: (w, h) => toothSVG('leaf', w, h),
  feather: (w, h) => featherSVG(w, h),
  trexTooth: (w, h) => toothSVG('blade', w, h),
  brachioEgg: (w, h) => eggSVG('round', w, h),
  pycnofibers: (w, h) => pycnofiberSVG(w, h),
  ...Object.fromEntries(
    [...Object.keys(SPACE_ROCKS), ...Object.keys(SPACE_TOOLS)].map((id) => [id, (w, h) => itemArt(id, w, h)]),
  ),
  ...Object.fromEntries(PLANETS.map((p) => [`planet:${p.id}`, (w, h) => planetSVG(p.id, w, h)])),
  roverWheel: (w, h) => roverWheelSVG(w, h),
  ...Object.fromEntries(MOON_STEPS.map((s) => [`card:${s.id}`, (w, h) => missionCardSVG(s.id, w, h)])),
  safetyTether: (w, h) => tetherSVG(w, h),
  mirrorStrut: (w, h) => strutSVG(w, h),
}
const CLUE_TOAST = {
  feather: 'A feather! But Triceratops had scales, not feathers… whose is it? It’s in your INVENTORY.',
  trexTooth: 'A huge, serrated tooth — far too big for a little raptor. Into your INVENTORY it goes.',
  brachioEgg: 'An enormous egg! No meat-eater laid this. It’s in your INVENTORY.',
  pycnofibers: 'A tuft of fuzzy pycnofibers — only one flyer grew these. Into your INVENTORY.',
}

// The inventory is the CONTEXT-LIGHT side of the loop: a find shows only WHAT it is
// and WHERE it was picked up (+ the image). The "whose is it / why" reasoning lives
// in the Catalog. `found` = the diorama the clue was hidden in. `section`/`dino`
// stay as metadata in case a Catalog cross-link is wired back in later.
const ITEM_INFO = {
  tooth: { name: 'Fossil Tooth', section: 'Teeth', dino: 'trike', found: 'Museum Lobby' },
  feather: { name: 'Feather', section: 'Covering', dino: 'raptor', found: 'Fern Grove' },
  trexTooth: { name: 'Giant Tooth', section: 'Teeth', dino: 'trex', found: 'Desert Dunes' },
  brachioEgg: { name: 'Giant Egg', section: 'Eggs', dino: 'brachio', found: 'Pine Forest' },
  pycnofibers: { name: 'Pycnofibers', section: 'Covering', dino: 'ptero', found: 'Green Hills' },
  // space rocks read their worth off the desk's price list, so the inventory and
  // the counter can never disagree about what something sells for
  ...Object.fromEntries(Object.entries(SPACE_ROCKS).map(([id, r]) =>
    [id, { name: r.name, section: 'Space Rocks', found: 'Space Wing', worth: r.value }])),
  ...Object.fromEntries(Object.entries(SPACE_TOOLS).map(([id, t]) =>
    [id, { name: t.name, section: 'Supplies', found: 'Space Supply Desk' }])),
  ...Object.fromEntries(PLANETS.map((p) =>
    [`planet:${p.id}`, { name: `${p.name} model`, section: 'Star Atlas', found: 'Space Wing', note: p.trait }])),
  roverWheel: { name: 'Rover Wheel', section: 'Supplies', found: 'The Orrery' },
  ...Object.fromEntries(MOON_STEPS.map((s) =>
    [`card:${s.id}`, { name: `${s.name} card`, section: 'Moon Missions', found: 'Space Wing', note: s.blurb }])),
  safetyTether: { name: 'Safety Tether', section: 'Supplies', found: 'The Moon' },
  mirrorStrut: { name: 'Mirror Strut', section: 'Supplies', found: 'The Space Station' },
}

/* A bag item id is usually the item itself, but a space rock is an INSTANCE
   (`lunarChip@solar` — see economy.js) so that the same rock type can be found in
   several rooms. Everything that draws or describes an item resolves through
   these, never by indexing the tables directly. */
const itemKey = (id) => (isRock(id) ? rockType(id) : id)
const itemSvg = (id, w, h) => (ITEM_SVG[itemKey(id)] || ITEM_SVG.tooth)(w, h)
const itemInfo = (id) => ITEM_INFO[itemKey(id)]

// a filled inventory slot's contents: the item icon + an ⓘ "more details" badge
const slotInner = (itemId) => `${itemSvg(itemId, 40, 52)}<button class="inv-info" aria-label="More details">i</button>`

function openItemDetail(itemId) {
  const info = itemInfo(itemId)
  if (!info) return
  sfx.tap()
  $('inventory-detail').innerHTML = `
    <button class="inv-back">‹ Inventory</button>
    <div class="inv-detail-art">${itemSvg(itemId, 132, 172)}</div>
    <h3 class="inv-detail-title">${info.name}</h3>
    <p class="inv-detail-found">Found in <b>${info.found}</b></p>
    ${info.worth ? `<p class="inv-detail-found">Sells for <b>${info.worth} coins</b> at the Supply Desk</p>` : ''}`
  // the detail view takes over the grid area; the tabs stay put so the child can
  // always see where they are and get back with one tap
  for (const el of document.querySelectorAll('.inv-grid, .inv-hint')) el.classList.add('hidden-inv')
  $('inventory-detail').classList.remove('hidden-inv')
}

function closeItemDetail() {
  $('inventory-detail').classList.add('hidden-inv')
  // restore whichever pouch is open, not always Finds
  for (const el of document.querySelectorAll('.inv-grid, .inv-hint')) {
    el.classList.toggle('hidden-inv', el.dataset.tab !== activePouch)
  }
}

// clues currently hidden in the world: itemId → { sprite, sparkle }
const CLUES = {}

function sparkleAt(wx, wy) {
  const s = new Graphics()
    .poly([0, -16, 5, -5, 16, 0, 5, 5, 0, 16, -5, 5, -16, 0, -5, -5])
    .fill({ color: 0xffe9b0 })
  s.blendMode = 'add'
  placeAt(s, wx, wy)
  gsap.to(s, { alpha: 0.15, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  gsap.to(s.scale, { x: 1.5, y: 1.5, duration: 0.7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
  return s
}

// hide a clue in a room (on a 1.2x parallax layer; a foreground element reveals it on the walk)
function addHiddenClue(layer, spot, itemId, tex) {
  const s = new Sprite(tex)
  s.anchor.set(0.5)
  s.rotation = -0.4
  placeAt(s, spot.x, spot.y)
  s.eventMode = 'static'
  s.cursor = 'pointer'
  s.on('pointertap', () => pickUpClue(itemId))
  layer.addChild(s)
  const sparkle = sparkleAt(spot.x + 28, spot.y - 30)
  layer.addChild(sparkle)
  CLUES[itemId] = { sprite: s, sparkle }
}

// a room's placement target: drag `item` onto the skeleton to lock it into the socket
function addDropTarget(mainLayer, scene, opts) {
  const S = opts.skeleton
  const glow = new Graphics()
    .roundRect(0, 0, S.w, S.h, 24)
    .fill({ color: 0xffd98a, alpha: 0.14 })
    .stroke({ color: 0xffd98a, width: 8, alpha: 0.8 })
  placeAt(glow, S.x - S.w / 2, S.y)
  glow.alpha = 0
  glow.blendMode = 'add'
  mainLayer.addChild(glow)
  const placed = new Sprite(opts.placedTex)
  placed.anchor.set(0.5)
  placed.rotation = opts.rot ?? -0.2
  placeAt(placed, opts.socket.x, opts.socket.y)
  placed.alpha = 0
  mainLayer.addChild(placed)
  scene._drop = {
    item: opts.item, skeleton: S, socket: opts.socket, glow, placed, done: false,
    success: { frag: opts.frag, html: opts.html },
  }
  return glow
}

/* ---------- inventory add/remove without a world sprite ----------
   pickUpClue() flies an item out of the SCENE into the bag, so it needs a sprite
   in the world. Buying at the Supply Desk has no such sprite, and selling has to
   take an item back OUT — hence this pair. Both keep `state.has` and the slot DOM
   in step; the desk is the only thing that removes an item other than placing it. */
function fillInvSlot(slotEl, itemId) {
  slotEl.classList.remove('empty')
  slotEl.classList.add('filled')
  slotEl.dataset.item = itemId
  slotEl.innerHTML = slotInner(itemId)
}

/* ---------- pouch tabs ----------
   The Rocks tab stays hidden until the first rock is found, so the Dinosaur Wing's
   rail is exactly as it was. Switching is instant and free — nothing is ever lost
   by poking the other tab. */
let activePouch = 'finds'

function showPouch(pouch) {
  activePouch = pouch
  for (const el of document.querySelectorAll('#inv-tabs .inv-tab')) {
    const on = el.dataset.tab === pouch
    el.classList.toggle('active', on)
    el.setAttribute('aria-selected', String(on))
    if (on) el.classList.remove('nudge')
  }
  for (const el of document.querySelectorAll('.inv-grid, .inv-hint')) {
    el.classList.toggle('hidden-inv', el.dataset.tab !== pouch)
  }
  closeItemDetail()
}

function revealRockPouch() {
  const tab = document.querySelector('#inv-tabs .inv-tab[data-tab="rocks"]')
  if (!tab || !tab.classList.contains('hidden')) return
  tab.classList.remove('hidden')
  $('inv-tabs').classList.add('two')
}

// the rock count + what the pouch is worth: the child can see their pile growing
// without opening it, and reads the total before deciding to walk to the desk
function updatePouchTotals() {
  const rocks = Object.keys(state.has).filter(isRock)
  const countEl = document.querySelector('#inv-tabs .inv-tab[data-tab="rocks"] .inv-tab-count')
  if (countEl) countEl.textContent = String(rocks.length)
  const totalEl = $('rock-total')
  if (totalEl) totalEl.textContent = String(rocks.reduce((sum, id) => sum + (rockOf(id)?.value ?? 0), 0))
}

function grantItem(itemId) {
  if (hasClue(itemId)) return false
  const pouch = pouchOf(itemId)
  const slotEl = nextEmptySlotIn(pouch)
  if (!slotEl) {
    toast(pouch === 'rocks'
      ? 'Your rock pouch is full — sell some at the Supply Desk!'
      : 'Your bag is full — use something first.', 4500)
    return false
  }
  state.has[itemId] = true
  sfx.pickup()
  if (pouch === 'rocks') revealRockPouch()
  fillInvSlot(slotEl, itemId)
  gsap.fromTo(slotEl, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
  updatePouchTotals()
  refreshMoonBoardCue()   // the sixth card may have just arrived
  return true
}

// send the drag ghost home to its slot — a rejected drop must never lose the item
function returnDragGhost() {
  const ghost = $('drag-ghost')
  const r = dragSlot?.getBoundingClientRect()
  if (!r) { ghost.classList.add('hidden'); return }
  gsap.to(ghost, {
    x: r.left + r.width / 2 - 32, y: r.top + r.height / 2 - 41,
    duration: 0.3, ease: 'power2.out',
    onComplete: () => ghost.classList.add('hidden'),
  })
}

function removeItem(itemId) {
  if (!hasClue(itemId)) return false
  delete state.has[itemId]
  const slotEl = invSlotFor(itemId)
  if (slotEl) {
    slotEl.classList.remove('filled', 'cue')
    slotEl.classList.add('empty')
    slotEl.innerHTML = ''
    delete slotEl.dataset.item
  }
  updatePouchTotals()
  return true
}

// collect any clue into the inventory (works for every itemId)
function pickUpClue(itemId) {
  if (hasClue(itemId)) return
  const clue = CLUES[itemId]
  if (!clue) return
  const pouch = pouchOf(itemId)
  if (pouch === 'rocks' && !nextEmptySlotIn('rocks')) {
    toast('Your rock pouch is full — sell some at the Supply Desk first!', 4500)
    return
  }
  state.has[itemId] = true
  sfx.pickup()
  // open the inventory so the clue has a visible slot to fly into, on the pouch
  // that's about to receive it — the find must land somewhere the child can see
  openRailInstant('inventory-rail')
  if (pouch === 'rocks') revealRockPouch()
  showPouch(pouch)

  const gp = clue.sprite.getGlobalPosition()
  const slotEl = nextEmptyInvSlot(itemId)
  if (slotEl) {
    const slot = slotEl.getBoundingClientRect()
    const fly = document.createElement('div')
    fly.style.cssText = 'position:fixed;left:0;top:0;z-index:40;pointer-events:none;will-change:transform'
    fly.innerHTML = itemSvg(itemId, 60, 78)
    document.body.appendChild(fly)
    gsap.fromTo(fly,
      { x: gp.x - 30, y: gp.y - 39, scale: 1, rotation: -24 },
      {
        x: slot.left + slot.width / 2 - 30, y: slot.top + slot.height / 2 - 39, scale: 0.55, rotation: 0,
        duration: 0.8, ease: 'power2.inOut',
        onComplete: () => {
          fly.remove()
          slotEl.classList.remove('empty')
          slotEl.classList.add('filled')
          slotEl.dataset.item = itemId
          slotEl.innerHTML = slotInner(itemId)
          gsap.fromTo(slotEl, { scale: 1.35 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
          updatePouchTotals()
          refreshMoonBoardCue()
        },
      })
  }
  gsap.to(clue.sprite, { alpha: 0, duration: 0.25 })
  gsap.to(clue.sparkle, { alpha: 0, duration: 0.25, overwrite: true })
  clue.sprite.eventMode = 'none'
  // a rock's toast names it and what it's worth — the value IS the reward, and
  // saying it out loud is how a child learns rocks are money
  const rock = isRock(itemId) ? rockOf(itemId) : null
  toast(rock
    ? `A ${rock.name}! Worth <b>${rock.value} coins</b> at the Space Supply Desk. It’s in your ROCKS pouch.`
    : (CLUE_TOAST[itemKey(itemId)] || 'A new clue is in your INVENTORY.'), 6000)
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

/* ---------- inventory drag-and-drop: drag a clue onto its dinosaur ---------- */
let dragSlot = null
let dragItem = null

function startItemDrag(x, y, slot) {
  if (!slot.classList.contains('filled')) return
  draggingItem = true
  dragSlot = slot
  dragItem = slot.dataset.item
  slot.classList.remove('cue')
  slot.classList.add('dragging')
  sfx.pickup()
  const ghost = $('drag-ghost')
  ghost.innerHTML = itemSvg(dragItem, 64, 83)
  ghost.classList.remove('hidden')
  gsap.killTweensOf(ghost)
  gsap.set(ghost, { x: x - 32, y: y - 41 })
}

function moveItemDrag(x, y) {
  if (footDrag) { moveBoneDrag(x, y); return }
  if (!draggingItem) return
  gsap.set($('drag-ghost'), { x: x - 32, y: y - 41 })
  // light up the dino as a drop affordance — only when it's the RIGHT clue
  const d = activeDrop()
  if (d?.glow && !d.done) d.glow.alpha = (pointerOverDino(x, y) && d.item === dragItem) ? 0.5 : 0
}

function endItemDrag(x, y) {
  if (footDrag) { endBoneDrag(x, y); return }
  if (!draggingItem) return
  draggingItem = false
  dragSlot?.classList.remove('dragging')

  // orrery rooms: a planet dropped on an orbit socket takes a different path to
  // the one-skeleton-per-room drop targets
  if (dragItem?.startsWith('planet:')) {
    const socket = socketUnder(x, y)
    const planetId = dragItem.slice('planet:'.length)
    const ghost = $('drag-ghost')
    if (socket && placePlanet(socket, planetId)) {
      const to = worldToScreen(socket.x, socket.y)
      gsap.to(ghost, {
        x: to.x - 32, y: to.y - 41, duration: 0.35, ease: 'power2.out',
        onComplete: () => ghost.classList.add('hidden'),
      })
    } else {
      returnDragGhost()
      if (!socket) toast('Drop the planet right onto an empty ring — the glowing circles.', 3500)
    }
    dragSlot = null
    dragItem = null
    return
  }

  const d = activeDrop()
  const over = pointerOverDino(x, y)
  if (d && !d.done && over && d.item === dragItem) {
    placeItem(d)
  } else {
    if (d?.glow) d.glow.alpha = 0
    const r = dragSlot.getBoundingClientRect()
    gsap.to($('drag-ghost'), {
      x: r.left + r.width / 2 - 32, y: r.top + r.height / 2 - 41,
      duration: 0.3, ease: 'power2.out',
      onComplete: () => $('drag-ghost').classList.add('hidden'),
    })
    if (over && d && d.item !== dragItem) toast('That’s not what this dinosaur is missing…', 3500)
    else if (d && !d.done) toast('Drag it right onto the skeleton to place it.', 3000)
  }
  dragSlot = null
  dragItem = null
}

// dropped on the right dino — fly into place, lock it in, celebrate
function placeItem(d) {
  d.done = true
  d.onPlace?.(d)
  scenes[state.scene]?._onRepair?.()
  sfx.success()
  const slot = dragSlot
  slot.classList.remove('filled', 'cue')
  slot.classList.add('empty')
  slot.innerHTML = ''
  delete slot.dataset.item

  const ghost = $('drag-ghost')
  const to = worldToScreen(d.socket.x, d.socket.y)
  gsap.to(ghost, {
    x: to.x - 32, y: to.y - 41, duration: 0.4, ease: 'power2.out',
    onComplete: () => {
      ghost.classList.add('hidden')
      gsap.to(d.placed, { alpha: 1, duration: 0.3 })
      gsap.fromTo(d.placed.scale, { x: 1.4, y: 1.4 }, { x: 1, y: 1, duration: 0.45, ease: 'back.out(3)' })
      gsap.to(d.glow, { alpha: 1, duration: 0.6 })
      confetti(d.glow)
      setTimeout(() => finishSolve(d, state.scene), 1000)
    },
  })
}

function showSuccess(d, meta = {}) {
  const card = $('success-card')
  const badge = $('fragment-badge')
  card.classList.toggle('finale', !!meta.wingComplete)

  if (meta.wingComplete) {
    // grand finale — every room in that wing is solved (copy comes from the wing)
    const fin = WINGS[meta.wingComplete].finale
    card.querySelector('.big').textContent = '🏆 WING COMPLETE! 🏆'
    $('success-text').innerHTML = fin.text
    badge.innerHTML = `${fin.name}&nbsp;<b>· COMPLETE ·</b>`
    badge.classList.remove('hidden')
  } else {
    $('success-text').innerHTML = d.success.html +
      (meta.roomComplete ? '<span class="exhibit-done">✓ Exhibit complete</span>' : '')
    // foot-style puzzles aren't fossil fragments — hide the badge when frag is absent
    if (d.success.frag) {
      badge.innerHTML = `FOSSIL FRAGMENT&nbsp;<b>${d.success.frag}</b>&nbsp;/ 5`
      badge.classList.remove('hidden')
    } else {
      badge.classList.add('hidden')
    }
    card.querySelector('.big').textContent = d.success.title || '✨ It fits! ✨'
  }

  $('success').classList.remove('hidden')
  const vid = $('success-video')
  if (vid) {
    const src = (meta.wingComplete ? null : d.success.video) || '/video/success.mp4'
    if (!vid.src.endsWith(src)) vid.src = src
    vid.currentTime = 0; vid.play().catch(() => {})
  }
  if (meta.wingComplete) { sfx.success(); finaleConfetti() }
}

/* ---------- T-rex foot-assembly puzzle (full-screen, immersive) ----------
   Tapping the lit plinth in the T-rex room opens a dedicated full-screen stage:
   a real T-rex foot skeleton (one photographed specimen sliced into its three
   fossil bones) scattered on a sandstone dig backdrop, with NO on-stage answer. The
   player consults the CATALOG (Footprints → T-rex three-toed track) to work out
   the shape, then recreates it: drag each bone into place AND twist it to its seated
   angle. A bone only locks when BOTH its position and rotation match the pose its
   config describes — together they rebuild a complete theropod foot.
   POS_TOL / ANG_TOL set the slack. */
const FOOT_SC = 0.62          // scales the fossil bone kit to a full-screen foot
const FOOT_POS_TOL = 78       // px of slack on placement
const FOOT_ANG_TOL = 0.22     // ~13° of slack on rotation
const angDelta = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b))
const MX = 1230, MY = 720     // mount (pedestal) centre, in design space
const FCX = MX, FCY = MY - 120 // assembled foot's centre (claws rest on the pedestal)

function makeBone(bc, scale) {
  const sp = new Sprite(bc.tex)
  sp.anchor.set(0.5)
  sp.scale.set(scale)
  return sp
}

// the lit plinth in the room that opens the full-screen puzzle
function buildFootEntry(mainL, S, footTex) {
  const x = S.foot.x, y = S.foot.y
  const glow = new Graphics().ellipse(0, 0, 140, 96).fill({ color: 0xffd98a, alpha: 0.16 })
  placeAt(glow, x, y - 36); glow.blendMode = 'add'; mainL.addChild(glow)
  gsap.to(glow, { alpha: 0.42, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  const plinth = new Graphics().roundRect(-96, -14, 192, 56, 12)
    .fill({ color: 0x2a3b33, alpha: 0.92 }).stroke({ color: 0xece0c2, width: 3, alpha: 0.7 })
  placeAt(plinth, x, y + 28); mainL.addChild(plinth)

  const icon = new Sprite(footTex); icon.anchor.set(0.5); icon.scale.set(1.15)
  placeAt(icon, x, y - 40); mainL.addChild(icon)
  gsap.to(icon.scale, { x: 1.28, y: 1.28, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })

  mainL.addChild(hitRect(x - 110, y - 130, 220, 210, () => { sfx.tap(); openFootPuzzle() }))
}

// build the hidden full-screen overlay once; it lives on top of every scene
function buildFootStage(bonesCfg, bgTex) {
  const stage = new Container()
  stage.visible = false
  stage.alpha = 0
  stage.eventMode = 'static'

  // --- atmospheric backdrop: a sandstone dig texture, darkened, with a warm
  //     spotlight pooling on the pedestal so the bones read clearly ---
  const bg = new Sprite(bgTex)
  bg.anchor.set(0.5)
  bg.scale.set(Math.max(DESIGN_W / bgTex.width, DESIGN_H / bgTex.height) * 1.02)
  placeAt(bg, 960, 540)
  bg.eventMode = 'static' // swallow taps so the room beneath never reacts
  stage.addChild(bg)
  // darken + cool the stone so the warm spotlight and bones pop
  const dark = new Graphics().rect(-3000, -2000, 6000, 4000).fill({ color: 0x12100a, alpha: 0.5 })
  placeAt(dark, 960, 540); stage.addChild(dark)
  // edge vignette to focus the eye on the pedestal
  const vig = new Graphics().rect(-3000, -2000, 6000, 4000).fill({ color: 0x000000, alpha: 0 })
  placeAt(vig, 960, 540); stage.addChild(vig)
  const spot = new Graphics().ellipse(0, 0, 820, 660).fill({ color: 0x3a2f1c, alpha: 0.45 })
  placeAt(spot, MX, MY - 130); spot.blendMode = 'add'; stage.addChild(spot)
  const spot2 = new Graphics().ellipse(0, 0, 420, 360).fill({ color: 0xffd98a, alpha: 0.14 })
  placeAt(spot2, MX, MY - 170); spot2.blendMode = 'add'; stage.addChild(spot2)

  // floating dust motes for depth
  for (let i = 0; i < 16; i++) {
    const m = new Graphics().circle(0, 0, 1.5 + Math.random() * 2.5)
      .fill({ color: 0xece0c2, alpha: 0.12 + Math.random() * 0.18 })
    placeAt(m, 300 + Math.random() * 1320, 250 + Math.random() * 620)
    m.blendMode = 'add'; stage.addChild(m)
    gsap.to(m.position, { y: m.position.y - (30 + Math.random() * 60), duration: 4 + Math.random() * 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 3 })
    gsap.to(m, { alpha: 0.04, duration: 2 + Math.random() * 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 2 })
  }

  // --- title + subtitle ---
  const title = new Text({ text: 'REBUILD THE T-REX FOOT', style: { fontFamily: SERIF, fontSize: 50, fontWeight: '700', fill: 0xe8a948, letterSpacing: 3 } })
  title.anchor.set(0.5); placeAt(title, 960, 178); stage.addChild(title)
  const sub = new Text({ text: 'See how it fits together in the CATALOG (T-rex Foot), then recreate it — drag each bone into place and twist its gold grip to the right angle.', style: { fontFamily: SERIF, fontSize: 23, fill: 0xd9c9a6, align: 'center' } })
  sub.anchor.set(0.5); placeAt(sub, 960, 228); stage.addChild(sub)

  // No reference card on the stage — the player consults the CATALOG (T-rex Foot →
  // the assembled-skeleton guide) and matches it on the bare pedestal.

  // --- pedestal (NO placement clues — bare mount) ---
  const shadow = new Graphics().ellipse(0, 0, 240, 44).fill({ color: 0x000000, alpha: 0.45 })
  placeAt(shadow, MX, MY + 116); stage.addChild(shadow)
  const heel = new Graphics().roundRect(-96, 0, 192, 98, 20)
    .fill({ color: 0x241c10, alpha: 0.66 }).stroke({ color: 0xece0c2, width: 5, alpha: 0.85 })
  placeAt(heel, MX, MY); stage.addChild(heel)

  // a faint halo sized to the assembled foot — lights up when it's rebuilt
  const fW = bonesCfg.reduce((m, b) => Math.max(m, Math.abs(b.dx) + b.w / 2), 0) * 2 * FOOT_SC
  const fH = bonesCfg.reduce((m, b) => Math.max(m, Math.abs(b.dy) + b.h / 2), 0) * 2 * FOOT_SC
  const footGlow = new Graphics().roundRect(-fW / 2 - 26, -fH / 2 - 26, fW + 52, fH + 52, 30)
    .fill({ color: 0xffd98a, alpha: 0.12 }).stroke({ color: 0xffd98a, width: 8, alpha: 0.8 })
  placeAt(footGlow, FCX, FCY); footGlow.alpha = 0; footGlow.blendMode = 'add'; stage.addChild(footGlow)

  // each bone's home: its centre-offset (from the foot centre) scaled onto the
  // pedestal, at its seated angle. Locking all of them rebuilds the foot.
  const targets = bonesCfg.map((bc) => ({
    wx: FCX + bc.dx * FOOT_SC, wy: FCY + bc.dy * FOOT_SC, ang: bc.ang,
  }))

  // bones scattered around the pedestal, each clearly mis-rotated — drag + twist
  const starts = [
    { x: 1230, y: 905, ang: 2.6 },   // metatarsal
    { x: 1670, y: 905, ang: -2.1 },  // dewclaw
    { x: 610, y: 640, ang: -1.3 },   // toe-a
    { x: 1690, y: 620, ang: 1.9 },   // toe-b
    { x: 600, y: 905, ang: 0.6 },    // toe-c
  ]
  bonesCfg.forEach((bc, i) => {
    const sp = makeBone(bc, FOOT_SC)
    const st = starts[i]
    placeAt(sp, st.x, st.y)
    sp.rotation = st.ang
    sp.eventMode = 'static'
    sp.cursor = 'grab'
    sp._bone = { startX: st.x, startY: st.y, sprite: sp, placed: false, target: targets[i] }
    sp.on('pointerdown', () => startBoneDrag(sp, 'move'))

    // twist grip just above the toe's top — grab it and swing to rotate. It's
    // counter-scaled so it stays a comfortable, finger-sized target on screen.
    const grip = new Graphics()
    grip.circle(0, 0, 22).fill({ color: 0xe8a948, alpha: 0.95 }).stroke({ color: 0x3a2c1a, width: 3 })
    grip.arc(0, 0, 11, -2.2, 1.1).stroke({ color: 0x3a2c1a, width: 3, cap: 'round' }) // curved arrow hint
    grip.position.set(0, -(bc.h / 2 + 48))
    grip.scale.set(1 / FOOT_SC)
    grip.eventMode = 'static'
    grip.cursor = 'grab'
    grip.on('pointerdown', (e) => { e.stopPropagation(); startBoneDrag(sp, 'rotate') })
    sp.addChild(grip)
    sp._grip = grip

    stage.addChild(sp)
  })

  // --- close button (back to the room) ---
  const close = new Container(); close.eventMode = 'static'; close.cursor = 'pointer'
  close.addChild(
    new Graphics().circle(0, 0, 30).fill({ color: 0x1d2823, alpha: 0.95 }).stroke({ color: 0xe8a948, width: 3 }),
  )
  const cx = new Text({ text: '✕', style: { fontFamily: SERIF, fontSize: 32, fill: 0xe8a948 } })
  cx.anchor.set(0.5); close.addChild(cx)
  placeAt(close, 1800, 175)
  close.on('pointertap', () => { sfx.tap(); closeFootPuzzle() })
  stage.addChild(close)

  trex._foot = { targets, footGlow, done: false, placedCount: 0, hinted: false, stage }
  return stage
}

function openFootPuzzle() {
  if (puzzleOpen || !footStage) return
  puzzleOpen = true
  cam().vel = 0
  setRail('inventory-rail', true)
  setRail('catalog-rail', false) // open the field guide — it's the only reference now
  openCatalogSection('trex-foot') // jump straight to the assembled-foot solution
  $('walk-arrow').classList.add('hidden') // no room chrome over the full-screen stage
  footStage.visible = true
  gsap.killTweensOf(footStage)
  gsap.fromTo(footStage, { alpha: 0 }, { alpha: 1, duration: 0.45, ease: 'power2.out' })
  sfx.whoosh()
  if (!trex._foot.hinted) {
    trex._foot.hinted = true
    toast('The CATALOG → T-rex Foot shows how the bones fit together. Rebuild it on the pedestal — drag a bone, then grab its gold grip to TWIST it into place.', 6000)
  }
}

function closeFootPuzzle() {
  if (!puzzleOpen) return
  puzzleOpen = false
  gsap.killTweensOf(footStage)
  gsap.to(footStage, { alpha: 0, duration: 0.35, ease: 'power2.in', onComplete: () => { footStage.visible = false } })
}

function startBoneDrag(sp, mode) {
  if (sp._bone.placed || trex._foot?.done) return
  footDrag = { sprite: sp, bone: sp._bone, layer: footStage, mode }
  draggingItem = true // also pauses the camera walk
  sp.cursor = 'grabbing'
}

function moveBoneDrag(x, y) {
  if (!footDrag) return
  const fd = footDrag
  const w = screenToWorld(x, y, fd.layer)
  if (fd.mode === 'rotate') {
    // point the bone's tip toward the finger
    const cx = fd.sprite.position.x + DESIGN_W / 2
    const cy = fd.sprite.position.y + DESIGN_H / 2
    fd.sprite.rotation = Math.atan2(w.y - cy, w.x - cx) + Math.PI / 2
  } else {
    placeAt(fd.sprite, w.x, w.y)
  }
}

function endBoneDrag(x, y) {
  const fd = footDrag
  footDrag = null
  draggingItem = false
  fd.sprite.cursor = 'grab'
  const foot = trex._foot
  const t = fd.bone.target
  const cx = fd.sprite.position.x + DESIGN_W / 2
  const cy = fd.sprite.position.y + DESIGN_H / 2
  const distOk = Math.hypot(cx - t.wx, cy - t.wy) < FOOT_POS_TOL
  const angOk = Math.abs(angDelta(fd.sprite.rotation, t.ang)) < FOOT_ANG_TOL

  if (distOk && angOk) {
    fd.bone.placed = true
    foot.placedCount++
    fd.sprite.eventMode = 'none'
    fd.sprite.cursor = 'default'
    if (fd.sprite._grip) fd.sprite._grip.visible = false
    sfx.pickup()
    // snap crisply to the exact catalog pose
    gsap.to(fd.sprite.position, { x: t.wx - DESIGN_W / 2, y: t.wy - DESIGN_H / 2, duration: 0.22, ease: 'back.out(2)' })
    gsap.to(fd.sprite, { rotation: t.ang, duration: 0.22, ease: 'back.out(2)' })
    if (foot.placedCount === foot.targets.length) finishFoot(foot)
  } else if (distOk && !angOk) {
    // right spot, wrong tilt — nudge them to twist it (leave it where it is)
    sfx.wrong()
    toast('Almost! It’s in the right spot but tilted wrong — grab the gold grip and TWIST it upright to match the catalog’s track.', 3800)
  }
  // otherwise: leave the bone wherever they dropped it — this is a posing puzzle, not a tray
}

function finishFoot(foot) {
  foot.done = true
  sfx.success()
  gsap.to(foot.footGlow, { alpha: 0.8, duration: 0.6 })
  gsap.to(foot.footGlow, { alpha: 0.4, duration: 1.2, yoyo: true, repeat: -1, delay: 0.6 })
  confetti(foot.footGlow)
  setTimeout(() => finishSolve({
    success: {
      title: '🦖 Foot rebuilt! 🦖',
      video: '/video/trex-foot-success.mp4',
      html: 'You rebuilt the T-rex’s foot! Three big toes — and the middle one longest — ' +
        'a perfect match for the three-toed track in your catalog.',
    },
  }, 'trex'), 1000)
}

/* ---------- where the space rocks are hidden ----------
   Which rock TYPE is hidden in which scene. Rooms read this when they build, so
   the placement and the economy's affordability audit can never drift apart.
   Every scene in the wing carries rocks (plus one in the lobby, to teach the
   mechanic before the wing is even open) — exploring anywhere always pays.
   Tuned so the rocks are worth ~1.6× every tool combined: a child who finds only
   two thirds of them can still afford the whole wing (see auditEconomy). */
const SPACE_ROCK_PLACEMENT = {
  lobby: ['lunarChip'],
  spacehub: ['marsRock', 'lunarChip'],
  solar: ['starShard', 'lunarChip', 'marsRock'],
  mars: ['marsRock', 'meteorite', 'lunarChip'],
  moon: ['lunarChip', 'starShard', 'marsRock'],
  station: ['meteorite', 'stardust', 'lunarChip'],
  webb: ['starShard', 'stardust', 'marsRock'],
}
// every rock in the world, as the unique instance ids the inventory will use
const allPlacedRocks = () =>
  Object.entries(SPACE_ROCK_PLACEMENT).flatMap(([scene, types]) =>
    types.map((t) => rockInstance(t, scene)))

/* A few desk purchases hand over something more specific than the shelf label.
   The "Planet Model" on the shelf is the orrery's missing ringed giant — the
   desk stays vague on purpose (naming it would hand over the Star Atlas answer,
   which is the rule in [[clue-design-deduction-not-naming]]), but what lands in
   the bag is a labelled Saturn the child can then place. */
const TOOL_GRANTS = { planetModel: 'planet:saturn', missionCard: 'card:eagleSeparates' }

/* ---------- Space Supply Desk ----------
   The desk is a PLACE you walk to (a tappable counter in the space hub), not a
   menu you can pull up anywhere — trading stays part of exploring. main.js owns
   the inventory, so it hands the desk a small adapter and economy.js does the
   rest. Selling is restricted to rocks by economy.js, so no quest item can be
   traded away. */
function openDesk() {
  if (isSupplyDeskOpen()) return
  sfx.tap()
  openSupplyDesk({
    ownedRocks: () => Object.keys(state.has).filter(isRock),
    // some tools ARE the thing they unlock (the Planet Model is a planet), so
    // "do you own it?" and "what lands in the bag?" both go through TOOL_GRANTS
    owns: (id) => hasClue(TOOL_GRANTS[id] ?? id),
    onSell: (id) => { removeItem(id); sfx.pickup() },
    onBuy: (id) => grantItem(TOOL_GRANTS[id] ?? id),
    onClose: () => { sfx.whoosh(); updateCoinHud() },
  })
}

// the coin purse in the HUD — hidden until the player has been to the Space Wing,
// so the dino wing's screen stays exactly as it was
let coinHudArmed = false
let lastShownCoins = 0

function updateCoinHud() {
  const el = $('coin-purse')
  if (!el) return
  const n = getCoins()
  $('coin-count').textContent = String(n)
  el.classList.toggle('hidden', !coinHudArmed)
  // pop the purse when the number moves, so earning is felt and not just read
  if (n !== lastShownCoins && coinHudArmed) {
    el.classList.remove('bump')
    void el.offsetWidth
    el.classList.add('bump')
  }
  lastShownCoins = n
}

function armCoinHud() { coinHudArmed = true; updateCoinHud() }

/* ---------- completion: stamp the finished room / wing, then celebrate ---------- */
const wingFinaleShown = {}   // wingId → already celebrated

function markRoomComplete(room) {
  const hub = scenes[WINGS[ROOM_WING[room]]?.hub]
  const m = hub?._marks?.[room]
  if (!m) return
  revealMark(m.frameGlow, { glow: true })
  revealMark(m.seal)
}

function markWingComplete(wingId) {
  revealMark(lobby?._wingMarks?.[wingId]) // idempotent — revealMark guards re-runs
}

// the grand finale card (shown once per wing) — fired when the LAST challenge in
// that wing is solved, whether that's a drag-puzzle, the foot, or a mini-game
function showWingFinale(wingId) {
  if (wingFinaleShown[wingId]) return
  wingFinaleShown[wingId] = true
  markWingComplete(wingId)
  showSuccess(null, { wingComplete: wingId })
}

// called 1s after a drag-placement or the T-rex foot is solved: stamps the room
// if all its challenges are done, then shows the success card (or the finale).
function finishSolve(d, room) {
  const roomDone = roomComplete(room)
  if (roomDone) markRoomComplete(room)
  const wing = ROOM_WING[room]
  if (wingComplete(wing)) { showWingFinale(wing); return }
  showSuccess(d, { roomComplete: roomDone })
}

// a mini-game (Fish Run / Brachio Run) hit its goal — solve that challenge. The
// player is still inside the full-screen game, so the museum-side celebration is
// deferred to afterMinigameClose(); here we just record + stamp.
function onMinigameSolved(room) {
  const sc = scenes[room]
  if (!sc || sc._gameDone) return
  sc._gameDone = true
  revealMark(sc._gameBadge)
  if (roomComplete(room)) markRoomComplete(room)
}

// returning to the room from a mini-game: roll out any celebration earned inside it
function afterMinigameClose(room) {
  const wing = ROOM_WING[room]
  if (wingComplete(wing)) { showWingFinale(wing); return }
  if (scenes[room]?._gameDone && roomComplete(room)) {
    setTimeout(() => toast('🎉 Exhibit complete! Every challenge in this room is solved.', 5000), 500)
  }
}

// confetti raining from the centre of the screen, repeated — the wing finale
function finaleConfetti() {
  const rx = (window.innerWidth / 2 - root.position.x) / root.scale.x
  const ry = (window.innerHeight / 2.6 - root.position.y) / root.scale.y
  for (let i = 0; i < 4; i++) setTimeout(() => confettiBurst(rx, ry, 90), i * 320)
}

// confetti burst at root-local coords (rx, ry)
function confettiBurst(rx, ry, n = 70) {
  const colors = [0xe8a948, 0xf4e6c8, 0x7fb6c9, 0xc2d6e2]
  for (let i = 0; i < n; i++) {
    const g = new Graphics()
    if (Math.random() > 0.5) g.rect(-4, -7, 8, 14).fill(colors[i % colors.length])
    else g.circle(0, 0, 5).fill(colors[i % colors.length])
    g.position.set(rx, ry)
    root.addChild(g)
    const a = Math.random() * Math.PI * 2
    const v = 180 + Math.random() * 420
    gsap.to(g, {
      x: rx + Math.cos(a) * v,
      y: ry + Math.sin(a) * v * 0.7 + 260,
      rotation: (Math.random() - 0.5) * 9,
      alpha: 0,
      duration: 1.3 + Math.random() * 0.9,
      ease: 'power1.out',
      onComplete: () => g.destroy(),
    })
  }
}

function confetti(fromContainer) {
  const gp = fromContainer.getGlobalPosition()
  const lx = (gp.x - root.position.x) / root.scale.x
  const ly = (gp.y - root.position.y) / root.scale.y
  confettiBurst(lx + 320, ly + 230)
}

/* ---------- catalog (left rail — the field guide) ----------
   The catalog opens on a COVER that lists its sections; tap a section to read it,
   tap ‹ Sections to come back. Teeth is built from DINOS; new sections (Covering,
   …) are added to CATALOG_SECTIONS and their content drops into render(). */
// one card per dino: the HERO image is just this section's trait (tooth / covering
// / footprint / egg) — not the whole dino — so each section reads as its own thing.
// The catalog is the CONTEXT-rich side of the loop: trait image + diet + a full note.
// (It deliberately HIDES the dino's name, so the player reasons from traits, not labels.)
function catalogCard(d, trait, note) {
  return `
    <div class="cat-card">
      <div class="art trait">${trait(d)}</div>
      <div class="diet">${d.diet}</div>
      ${d.kind === 'pterosaur' ? '<div class="cat-kind">✦ a flying reptile, not a dinosaur</div>' : ''}
      <div class="cat-note">${note(d)}</div>
    </div>`
}

// each section reads its own field off every DINOS entry; `trait` draws it big
const SECTION = (id, title, blurb, icon, trait, note) => ({
  id, title, blurb, icon, tag: `${DINOS.length} entries`, ready: true,
  render: () => DINOS.map((d) => catalogCard(d, trait, note)).join(''),
})
// the T-rex foot "rebuild guide" — a single static reference card showing the
// assembled skeleton (the puzzle's solution), so the player can match it.
const FOOT_GUIDE_SECTION = {
  id: 'trex-foot', title: 'T-rex Foot', blurb: 'How the toe-bones fit together.',
  icon: footprintSVG('three-toe', 34, 42), tag: 'rebuild guide', ready: true,
  render: () => `
    <div class="cat-card">
      <div class="art foot"><img src="/img/foot/assembled.png" alt="assembled T-rex foot skeleton"></div>
      <div class="diet">Tyrannosaurus rex — left foot</div>
      <div class="cat-note">The tall <b>metatarsal</b> (ankle bones) stands upright. Below it,
        <b>three toes</b> fan out — each tipped with a <b>claw</b> pointing down, and the
        <b>middle toe is the longest</b>. A small <b>dewclaw</b> sits high on the inside, turned
        back. Match this on the pedestal: bones joined at the base, claws down.</div>
    </div>`,
}
/* The STAR ATLAS — the Space Wing's half of the catalog, and the only place the
   orrery's clues live. Unlike the dino sections it leads with the three CLUES,
   because in this room reading is the puzzle: each clue names a TRAIT and a ring
   number, never the planet ([[clue-design-deduction-not-naming]]). Every planet
   then gets a card, so a child who doesn't already know them can match trait to
   picture. The scale disclaimer is stated out loud rather than left to imply. */
const STAR_ATLAS_SECTION = {
  id: 'planets', title: 'Star Atlas', blurb: 'The eight planets, and where each one belongs.',
  icon: planetSVG('saturn', 34, 42), tag: 'orrery clues', ready: true,
  render: () => `
    <div class="cat-card">
      <div class="cat-note"><b>Three rings are empty.</b> The Atlas says which:
        <br>· the <b>rusty red</b> world is <b>fourth</b> from the Sun
        <br>· the giant wearing <b>bright rings</b> is <b>sixth</b>
        <br>· the <b>hottest</b> world of all is <b>second</b> — and it is <i>not</i> the one
        closest to the Sun</div>
    </div>
    ${PLANETS.map((p) => `
      <div class="cat-card">
        <div class="art trait">${planetSVG(p.id, 96, 120)}</div>
        <h3>${p.name}</h3>
        <div class="diet">${p.order}${(p.order === 1 ? 'st' : p.order === 2 ? 'nd' : p.order === 3 ? 'rd' : 'th')} from the Sun</div>
        <div class="cat-note">${p.atlas}</div>
      </div>`).join('')}
    <div class="cat-card">
      <div class="cat-note">⚠️ <b>Not to scale.</b> No model can show the real distances — Neptune
        is about <b>30 times</b> further from the Sun than Earth is. The orrery squashes the
        gaps and grows the planets so you can see them all at once.</div>
    </div>`,
}

/* MOON MISSIONS — the Apollo half of the Star Atlas, and the sequence puzzle's
   only clue source. It deliberately does NOT print the steps as a numbered list:
   that would hand over the answer. Each card gets its own entry with the facts a
   child needs to reason ("only once they were already circling the Moon"), and
   the ordering is left to them. Verified against NASA + Smithsonian Air & Space;
   rulings in brain/memory/projects/science-museum-mystery/space-accuracy-rulings. */
const MOON_MISSIONS_SECTION = {
  id: 'apollo', title: 'Moon Missions', blurb: 'How Apollo 11 actually went.',
  icon: missionCardSVG('touchdown', 34, 45), tag: 'mission log', ready: true,
  render: () => `
    <div class="cat-card">
      <div class="cat-note"><b>Apollo 11</b> — the first time people landed on another world.
        Three astronauts went: <b>Neil Armstrong</b>, <b>Buzz Aldrin</b> and <b>Michael Collins</b>.
        Only two of them walked on the Moon.</div>
    </div>
    ${[...MOON_STEPS].sort((a, b) => a.name.localeCompare(b.name)).map((s) => `
      <div class="cat-card">
        <div class="art trait">${missionCardSVG(s.id, 96, 128)}</div>
        <h3>${s.name}</h3>
        <div class="cat-note">${s.atlas}</div>
      </div>`).join('')}
    <div class="cat-card">
      <div class="cat-note">🌕 <b>Twelve people</b> have walked on the Moon, across six landings
        between 1969 and 1972. Nobody has been back since.</div>
    </div>`,
}

/* LIVING IN ORBIT — the Space Station's half of the Atlas. Two of these entries
   exist to correct things kids' space media almost always gets wrong: that a
   spacewalker breathes through a hose from the ship (they don't — it's a backpack),
   and that astronauts float because there's "no gravity" (they're falling). */
const STATION_SECTION = {
  id: 'station', title: 'Living in Orbit', blurb: 'How people work outside a spacecraft.',
  icon: tetherSVG(34, 45), tag: 'station log', ready: true,
  render: () => `
    <div class="cat-card">
      <h3>The Space Station</h3>
      <div class="cat-note">It circles the Earth about <b>400 km</b> up, going all the way round
        roughly every <b>90 minutes</b> — sixteen sunrises a day. People have been living aboard
        <b>continuously since November 2000</b>.</div>
    </div>
    <div class="cat-card">
      <div class="art trait">${tetherSVG(96, 128)}</div>
      <h3>The safety tether</h3>
      <div class="cat-note">Going outside, an astronaut clips a <b>tether</b> to the station so they
        can’t drift off — and wears a small jetpack called <b>SAFER</b> as a backup. Their
        <b>air comes from the backpack on the suit</b>, not from a hose to the ship.</div>
    </div>
    <div class="cat-card">
      <div class="art trait">${spaceToolSVG('rotateKey', 96, 128)}</div>
      <h3>Turning the wings</h3>
      <div class="cat-note">Solar panels only make power when they face the <b>Sun</b>, so the station
        turns its huge wings all day to keep pointing at it as it goes round and round.</div>
    </div>
    <div class="cat-card">
      <h3>Why everything floats</h3>
      <div class="cat-note">Not because there’s no gravity — there’s plenty up there. The station is
        <b>falling</b> around the Earth and moving sideways so fast that it keeps missing. Everyone
        inside is falling too, which is what floating really is.</div>
    </div>`,
}

/* THE GOLDEN MIRROR — Webb's section. The two facts kids' media most often gets
   wrong about Webb are that it orbits the Earth (it doesn't — it's at L2, four
   times further away than the Moon) and that its pictures are what you'd see
   with your eyes (they're infrared, translated into colours we can look at). */
const WEBB_SECTION = {
  id: 'webb', title: 'The Golden Mirror', blurb: 'Webb, and why it’s gold.',
  icon: hexTileSVG(38, true), tag: 'telescope log', ready: true,
  render: () => `
    <div class="cat-card">
      <div class="art trait">${hexTileSVG(104, true)}</div>
      <h3>Eighteen segments</h3>
      <div class="cat-note">Webb’s main mirror is <b>18 hexagons</b> of a light metal called
        <b>beryllium</b>, each about 1.3 m across, fitted together into one big honeycomb. Each one
        was nudged into place separately until all eighteen worked as a single mirror.</div>
    </div>
    <div class="cat-card">
      <h3>Why gold?</h3>
      <div class="cat-note">The segments wear a coat of real <b>gold</b> — thinner than a hair — because
        gold is very good at bouncing back <b>infrared</b> light. Infrared is the light Webb was built
        to see, so gold is the right mirror for the job.</div>
    </div>
    <div class="cat-card">
      <h3>Where it lives</h3>
      <div class="cat-note">Webb does <b>not</b> circle the Earth the way Hubble does. It sits at a
        quiet spot called <b>L2</b>, about <b>1.5 million km</b> away — four times further than the
        Moon. Its kite-shaped <b>sunshield</b> always stays between it and the Sun, keeping the mirror
        colder than −220°C. It launched in <b>December 2021</b>.</div>
    </div>
    <div class="cat-card">
      <h3>Pictures of invisible light</h3>
      <div class="cat-note">Because Webb sees <b>infrared</b>, its photographs show light your eyes
        can’t. The colours are chosen afterwards so people can look at them — beautiful, and true,
        but not quite what you’d see out of a window.</div>
    </div>`,
}

const CATALOG_SECTIONS = [
  SECTION('teeth', 'Teeth', 'A tooth tells you what a dinosaur ate.', toothSVG('leaf', 34, 42),
    (d) => toothSVG(d.tooth, 96, 120), (d) => d.toothNote),
  SECTION('covering', 'Covering', 'Scales, feathers, or fuzzy pycnofibers?', coveringSVG('feathers', 34, 42),
    (d) => coveringSVG(d.covering, 96, 120), (d) => d.coveringNote),
  SECTION('footprints', 'Footprints', 'Every dino left a different track.', footprintSVG('three-toe', 34, 42),
    (d) => footprintSVG(d.footprint, 96, 120), (d) => d.footprintNote),
  FOOT_GUIDE_SECTION,
  SECTION('eggs', 'Eggs', 'Round, long, or leathery — eggs tell tales too.', eggSVG('round', 34, 42),
    (d) => eggSVG(d.egg, 96, 120), (d) => d.eggNote),
  STAR_ATLAS_SECTION,
  MOON_MISSIONS_SECTION,
  STATION_SECTION,
  WEBB_SECTION,
]

function renderCatalogCover() {
  $('catalog-list').innerHTML = `
    <div class="cat-cover">
      <div class="cat-crest">${catalogCrest(88)}</div>
      <div class="cat-cover-title">Field Guide</div>
      <div class="cat-cover-sub">Tap a section to study it</div>
      <div class="cat-sections">
        ${CATALOG_SECTIONS.map((s) => `
          <button class="cat-row${s.ready ? '' : ' soon'}" data-section="${s.id}">
            <span class="cat-row-ic">${s.icon}</span>
            <span class="cat-row-meta">
              <span class="cat-row-title">${s.title}</span>
              <span class="cat-row-blurb">${s.blurb}</span>
            </span>
            <span class="cat-row-tag">${s.tag}</span>
          </button>`).join('')}
      </div>
    </div>`
}

function openCatalogSection(id) {
  const s = CATALOG_SECTIONS.find((x) => x.id === id)
  if (!s) return
  $('catalog-list').innerHTML = `
    <button class="cat-back">‹ Sections</button>
    <div class="cat-section-head"><span class="cat-section-ic">${s.icon}</span><h3>${s.title}</h3></div>
    <div class="cat-section-body">${s.render()}</div>`
}

function setupCatalog() {
  renderCatalogCover()
  $('catalog-list').addEventListener('pointerdown', (e) => {
    if (e.target.closest('.cat-back')) { sfx.tap(); renderCatalogCover(); return }
    const row = e.target.closest('.cat-row')
    if (row) { sfx.tap(); openCatalogSection(row.dataset.section) }
  })
}

/* ---------- inventory drag wiring (pointer events, mouse + touch) ---------- */
function setupInventoryDrag() {
  // FINDS: a slot is grabbed and dragged onto an exhibit
  $('inventory-grid').addEventListener('pointerdown', (e) => {
    // the ⓘ badge opens the item's "more details" drilldown (not a drag)
    const info = e.target.closest('.inv-info')
    if (info) { e.preventDefault(); e.stopPropagation(); openItemDetail(info.closest('.inv-slot').dataset.item); return }
    const slot = e.target.closest('.inv-slot.filled')
    if (!slot) return
    e.preventDefault()        // suppress the compatibility mouse/touch events
    startItemDrag(e.clientX, e.clientY, slot)
  })

  // ROCKS: never dragged — they're sold, not used. Tapping one opens its details
  // (what it is, what it's worth) rather than starting a drag that could only
  // ever fail. A rock is still a *find*, so the tap has to reward, not rebuff.
  $('rock-grid').addEventListener('pointerdown', (e) => {
    const slot = e.target.closest('.inv-slot.filled')
    if (!slot) return
    e.preventDefault()
    sfx.tap()
    openItemDetail(slot.dataset.item)
  })

  // the two pouch tabs
  $('inv-tabs').addEventListener('pointerdown', (e) => {
    const tab = e.target.closest('.inv-tab')
    if (!tab || tab.classList.contains('active')) return
    e.preventDefault()
    sfx.tap()
    showPouch(tab.dataset.tab)
  })

  $('inventory-detail').addEventListener('pointerdown', (e) => {
    if (e.target.closest('.inv-back')) { sfx.tap(); closeItemDetail() }
  })
  window.addEventListener('pointermove', (e) => moveItemDrag(e.clientX, e.clientY))
  window.addEventListener('pointerup', (e) => endItemDrag(e.clientX, e.clientY))
  window.addEventListener('pointercancel', (e) => endItemDrag(e.clientX, e.clientY))
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

  // every scene is a Container of parallax layers; only the active one is visible
  for (const name of ['lobby', 'dinohub', 'grove', 'raptor', 'trex', 'brachio', 'ptero', 'spacehub', 'solar', 'mars', 'moon', 'station', 'webb']) {
    const c = new Container()
    c._layers = []
    c._dust = []
    if (name !== 'lobby') { c.visible = false; c.alpha = 0 }
    root.addChild(c)
    scenes[name] = c
  }
  ;({ lobby, dinohub, grove, raptor, trex, brachio, ptero, spacehub, solar, mars, moon, station, webb } = scenes)

  $('back-btn').addEventListener('pointerdown', () => goScene(SCENE_BACK[state.scene] || 'lobby'))
  $('replay-btn').addEventListener('pointerdown', () => location.reload())
  $('success-continue').addEventListener('pointerdown', () => {
    const vid = $('success-video'); if (vid) vid.pause()
    $('success').classList.add('hidden')
    if (puzzleOpen) closeFootPuzzle()
  })
  // side-panel toggles
  const toggleRail = (railId) => {
    sfx.tap()
    setRail(railId, !$(railId).classList.contains('collapsed'))
  }
  $('catalog-toggle').addEventListener('pointerdown', () => toggleRail('catalog-rail'))
  $('inv-toggle').addEventListener('pointerdown', () => toggleRail('inventory-rail'))
  $('toast-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); sfx.tap(); dismissToast() })
  // tap outside the inventory closes it (ignore taps on the panel or its toggle)
  document.addEventListener('pointerdown', (e) => {
    const rail = $('inventory-rail')
    if (rail.classList.contains('collapsed') || draggingItem) return
    if (e.target.closest('#inventory-rail') || e.target.closest('#inv-toggle')) return
    setRail('inventory-rail', true)
  })
  // phones: start with both panels closed so nothing covers the world
  if (isCompact() || window.matchMedia('(pointer: coarse)').matches) {
    setRail('catalog-rail', true)
    setRail('inventory-rail', true)
  }
  document.addEventListener('coins-changed', () => updateCoinHud())
  setupInput()
  setupFullscreen()
  setupInventoryDrag()
  setupCatalog()

  // the wing must stay affordable: prove the rocks we place are worth more than
  // every tool costs, so no edit to either list can quietly strand a player
  const econ = auditEconomy(allPlacedRocks())
  if (!econ.ok) {
    console.error('[economy] SOFT-LOCK RISK — placed rocks cannot fund the tools', econ)
  }
  await Promise.all([buildLobby(), buildDinoHub(), buildGrove(), buildRaptor(), buildTrex(), buildBrachio(), buildPtero(), buildSpaceHub(), buildSolar(), buildMars(), buildMoon(), buildStation(), buildWebb()])

  let t = 0
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000
    t += dt
    lens.x += (lens.tx - lens.x) * 0.055
    lens.y += (lens.ty - lens.y) * 0.055
    const px = lens.x + Math.sin(t * 0.25) * 0.07
    const py = lens.y + Math.cos(t * 0.18) * 0.05

    const scene = scenes[state.scene]
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

  // read-only debug hooks (used by the prototype's headless feel-tests)
  window.__cam = () => ({ scene: state.scene, x: cam().x, vel: cam().vel })
  window.__foot = () => !!trex?._foot?.done
  window.__goScene = (s) => goScene(s)
  window.__pteroGame = () => isPteroGameOpen()
  window.__brachioGame = () => isBrachioGameOpen()
  window.__openBrachio = () => openBrachioGame()
  window.__roomComplete = (r) => roomComplete(r)
  window.__wingComplete = (w = 'dino') => wingComplete(w)
  window.__wings = () => Object.keys(WINGS)
  // economy hooks — the Supply Desk is reachable before the space hub exists, so
  // the whole sell/buy loop is testable now
  window.__economyAudit = () => auditEconomy(allPlacedRocks())
  window.__coins = () => getCoins()
  window.__openDesk = () => { armCoinHud(); openDesk() }
  window.__deskOpen = () => isSupplyDeskOpen()
  window.__closeDesk = () => closeSupplyDesk()
  window.__giveRock = (type, scene = 'test') => grantItem(rockInstance(type, scene))
  window.__bag = () => Object.keys(state.has)
  window.__rockValue = (id) => rockOf(id)?.value ?? 0
  window.__toolPrice = (id) => SPACE_TOOLS[id]?.price ?? 0
  window.__toolGrant = (id) => TOOL_GRANTS[id] ?? id
  // tap what a finger would tap, so tests exercise the real hotspot wiring
  window.__tapWorld = (scene, id) => { HOTSPOTS[`${scene}:${id}`]?.(); return !!HOTSPOTS[`${scene}:${id}`] }
  window.__clueExists = (id) => !!CLUES[id]
  window.__sceneExists = (id) => !!scenes[id]
  window.__pan = (x) => { cam().x = Math.max(0, Math.min(camMax(), x)); cam().vel = 0 }
  window.__orbitOpen = () => isOrbitGameOpen()
  window.__openCatalogSection = (id) => openCatalogSection(id)
  window.__winOrbit = () => __orbitForceWin()
  window.__roverOpen = () => isRoverGameOpen()
  window.__roverPlan = (which) => __roverPlanTo(which)
  window.__roverGo = () => __roverDrive()
  window.__roverDriving = () => __roverDriving()
  window.__roverReroll = () => __roverReroll()
  window.__moonBoardOpen = () => isMoonBoardOpen()
  window.__moonSolve = () => __moonSolve()
  window.__moonSolveWrong = () => __moonSolveWrong()
  window.__moonCards = () => MOON_STEPS.filter((x) => hasClue(`card:${x.id}`)).map((x) => x.id)
  window.__moonBoardLit = () => !!moon?._boardLit
  window.__rocketOpen = () => isRocketGameOpen()
  window.__rocketStack = (ok) => __rocketStack(ok)
  window.__rocketLaunch = () => __rocketLaunch()
  window.__rocketPhase = () => __rocketPhase()
  window.__stationRepairs = () => (station?._drops ?? []).map((d) => ({ item: d.item, done: d.done }))
  window.__stationConsoleLit = () => !!station?._consoleLit
  window.__wingTurned = () => !!station?._wingTurned
  window.__spacewalkOpen = () => isSpacewalkOpen()
  window.__spacewalkState = () => __spacewalkState()
  window.__spacewalkGrabAll = () => __spacewalkGrabAll()
  window.__spacewalkToHatch = () => __spacewalkToHatch()
  window.__webbRepairs = () => (webb?._drops ?? []).map((d) => ({ item: d.item, done: d.done }))
  window.__webbTiles = () => (webb?._tiles ?? []).map((t) => ({ steps: t.steps, visible: t.sprite.visible }))
  window.__webbMirrorsDone = () => !!webb?._mirrors?.done
  window.__tapTile = (i) => { const t = webb?._tiles?.[i]; if (t) tapMirrorTile(t); return !!t }
  window.__alignMirrors = () => {
    if (!webb) return false
    for (const t of webb._tiles) { while (t.steps !== 0) tapMirrorTile(t) }
    return webb._mirrors.done
  }
  window.__telescopeOpen = () => isTelescopeOpen()
  window.__focusSet = (x, y) => __focusSet(x, y)
  window.__focusState = () => __focusState()
  window.__repairs = () => (mars?._drops ?? []).map((d) => ({ item: d.item, done: d.done }))
  window.__consoleLit = () => !!mars?._consoleLit
  // use an item on the repair that wants it, going through the real placement path
  window.__useItem = (item) => {
    const sc = scenes[state.scene]
    const d = (sc?._drops ?? [sc?._drop]).find((x) => x && !x.done && x.item === item)
    if (!d || !hasClue(item) || !invSlotFor(item)) return false
    dragSlot = invSlotFor(item)
    dragItem = item
    placeItem(d)
    return true
  }
  window.__sockets = () => Object.fromEntries(
    Object.entries(solar?._sockets ?? {}).map(([k, v]) => [k, { order: v.order, done: v.done }]))
  window.__dropPlanet = (planetId, onSocket) => {
    const sc = solar?._sockets?.[onSocket]
    return sc ? placePlanet(sc, planetId) : false
  }
  window.__tapClue = (id) => { CLUES[id]?.sprite.emit('pointertap'); return !!CLUES[id] }
  window.__wingSealShown = (w) => (lobby?._wingMarks?.[w]?.alpha ?? 0) > 0
  window.__setCoins = (n) => { setCoins(n); refreshSupplyDesk() }
  // a non-rock item in the bag, to prove the desk will never buy it back
  window.__giveTestQuestItem = () => { grantItem('trexTooth'); refreshSupplyDesk() }
  window.__wingRooms = (w = 'dino') => WINGS[w].rooms.slice()
  window.__wingHub = (w = 'dino') => WINGS[w].hub
  window.__openPtero = () => openPteroGame({ goal: 10, onComplete: () => onMinigameSolved('ptero'), onClose: () => afterMinigameClose('ptero') })
  // test/screenshot hook: mark every challenge in a wing solved, stamp all seals, fire the finale
  window.__solveWing = (w = 'dino') => {
    for (const r of WINGS[w].rooms) {
      const sc = scenes[r]
      if (!sc?._challenges) continue                 // room not built yet
      for (const c of sc._challenges) CHALLENGES[c].force(sc)
      markRoomComplete(r)
    }
    // only celebrate a wing that really is finished — forcing the challenges is
    // the point, and if that didn't work the finale must not paper over it
    if (!wingComplete(w)) return false
    showWingFinale(w)
    return true
  }

  $('walk-arrow').classList.remove('hidden')
  toast('You’re in the museum lobby — walk right (drag, scroll, tilt, or arrow keys). Look closely as you move; the lobby hides more than it shows.', 7000)
  lobbyHintTimer = setTimeout(() => {
    if (!hasClue('tooth')) toast('Psst — walk slowly past the PLANTER and watch behind it. Layers move at different speeds…', 6000)
  }, 14000)
}

boot()
