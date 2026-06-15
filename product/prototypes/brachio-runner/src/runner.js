import * as THREE from 'three'
import { COLORS } from './config.js'
import { createDino, moveLane, updateDino } from './dino.js'
import { createWorld } from './world.js'
import { createSpawner } from './spawner.js'
import { createHud } from './hud.js'
import { createGame } from './game.js'
import { attachInput } from './input.js'

// Mount the whole runner (renderer + HUD + loop + input) inside `container`. Returns
// a handle with dispose() so an embedder can tear it down. This is the single entry
// shared by the standalone page (src/main.js) and the museum overlay
// (museum-parallax/src/brachioGame.js) — no code is duplicated between them.
//
// opts.onExit — if provided, Esc (or a swallowed game-over) calls it instead of an
// in-place restart; the museum overlay uses this to close back to the room.
export function mountBrachioRunner(container, opts = {}) {
  // onSurvive — fired once when the player has survived `surviveSeconds` of play
  // (used by the museum to "solve" the Brachiosaurus exhibit's mini-game challenge)
  const { onExit, onSurvive, surviveSeconds = 0 } = opts
  let surviveT = 0, survived = false

  // ---- renderer / scene / camera ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(COLORS.sky)
  scene.fog = new THREE.Fog(COLORS.fog, 45, 95)

  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 200)
  camera.position.set(0, 7.8, 13.5)
  camera.lookAt(0, 2.7, -10)   // framed up at head height, where the browsing happens

  // ---- lights ----
  scene.add(new THREE.HemisphereLight(0xcfeaff, 0x4a6b3a, 0.95))
  const sun = new THREE.DirectionalLight(0xfff4d6, 1.15)
  sun.position.set(-8, 16, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 50
  sun.shadow.camera.left = -12; sun.shadow.camera.right = 12
  sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12
  scene.add(sun)

  // ---- game objects ----
  const dino = createDino()
  dino.group.scale.setScalar(0.6)        // keep the sauropod comfortably in frame
  scene.add(dino.group)
  const world = createWorld(scene)
  const spawner = createSpawner(scene)

  const hud = createHud(container)
  const game = createGame(hud)

  // ---- pickup pop particles (tiny reusable burst) ----
  const pops = []
  const popGeo = new THREE.SphereGeometry(0.16, 6, 6)
  function burst(pos, color) {
    for (let i = 0; i < 7; i++) {
      const m = new THREE.Mesh(popGeo, new THREE.MeshBasicMaterial({ color }))
      m.position.copy(pos)
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 3
      m.userData.v = new THREE.Vector3(Math.cos(a) * s, 2 + Math.random() * 3, Math.sin(a) * s)
      m.userData.life = 0.5
      scene.add(m)
      pops.push(m)
    }
  }
  function updatePops(dt) {
    for (let i = pops.length - 1; i >= 0; i--) {
      const m = pops[i]
      m.userData.life -= dt
      m.userData.v.y -= 12 * dt
      m.position.addScaledVector(m.userData.v, dt)
      const k = Math.max(0, m.userData.life / 0.5)
      m.scale.setScalar(k)
      if (m.userData.life <= 0) { scene.remove(m); m.material.dispose(); pops.splice(i, 1) }
    }
  }

  // ---- run lifecycle ----
  function startRun() {
    if (game.state.mode === 'play') return
    spawner.reset()
    dino.lane = 1; dino.x = 0
    dino.group.visible = true
    game.start()
  }

  // ---- input wiring ----
  const detachInput = attachInput(renderer.domElement, {
    onLane: (dir) => { if (game.state.mode === 'play') moveLane(dino, dir) },
    onJump: () => {},   // no jumping — the long neck weaves between treetops by lane
    onStart: () => { if (game.state.mode !== 'play') startRun() },
    // Esc: exit the mini-game when embedded, else restart in place
    onRestart: () => { if (onExit) onExit(); else startRun() },
  })
  // the modal overlay swallows taps before the canvas sees them → wire it directly
  hud.onStartTap(() => { if (game.state.mode !== 'play') startRun() })

  // ---- resize (sized to the container, not the window) ----
  function resize() {
    const w = container.clientWidth || window.innerWidth
    const h = container.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  resize()

  // ---- main loop ----
  let last = 0, raf = 0, alive = true
  function frame(now) {
    if (!alive) return
    const dt = Math.min(0.05, (now - (last || now)) / 1000)
    last = now

    const dz = game.update(dt)              // 0 unless playing
    const speed = game.state.speed

    // always animate the dino's run cycle (idle-run on menus too, for life)
    updateDino(dino, dt, game.state.mode === 'play' ? speed : 16)

    if (game.state.mode === 'play') {
      // survival milestone → solve the exhibit's mini-game challenge (once)
      if (surviveSeconds && !survived) {
        surviveT += dt
        if (surviveT >= surviveSeconds) { survived = true; game.state.sfx?.milestone?.(); onSurvive?.() }
      }
      world.scroll(dz)
      spawner.update(dz, dt, speed, dino,
        (sub, pos) => { game.pickup(sub); burst(pos, sub === 'berry' ? COLORS.berry : COLORS.leaf) },
        (pos) => game.hit(),
      )
      // invulnerability blink after a hit
      dino.group.visible = game.state.invuln > 0 ? (Math.floor(now / 90) % 2 === 0) : true
    } else if (!survived) {
      surviveT = 0   // a fresh run restarts the survival clock (until it's been met once)
    }

    // camera eases toward the dino's lane so a side lane never pushes it off-frame
    camera.position.x += (dino.x * 0.45 - camera.position.x) * 0.1
    camera.lookAt(dino.x * 0.4, 2.7, -10)

    updatePops(dt)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  // start on the ready screen
  hud.showStart()
  game.refreshHud()
  raf = requestAnimationFrame(frame)

  return {
    dispose() {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      detachInput()
      renderer.dispose()
      if (renderer.domElement.parentNode) renderer.domElement.remove()
      if (hud.root.parentNode) hud.root.remove()
    },
  }
}
