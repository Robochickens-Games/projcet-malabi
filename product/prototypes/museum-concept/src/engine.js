/* =============================================================================
   engine.js — the concept-test runtime. You normally don't edit this; you edit
   config.js. It builds each scene from the config, scrolls the parallax world,
   routes clicks on hotspots, and draws labelled placeholders for any art that
   hasn't been dropped yet.
============================================================================= */
import { DESIGN_H, GAME, SCENES } from './config.js'

const $ = (sel) => document.querySelector(sel)
const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n }

// Mobile Safari has a tight per-tab memory budget and kills the page ("A problem
// repeatedly occurred") when composited backing stores pile up. The cinematic FX
// (fullscreen blur + mix-blend overlays) and the per-prop drop-shadow filters are
// pure polish but each forces extra GPU layers — so on touch/coarse-pointer
// devices we switch to a "low-FX" mode: no FX overlays, no prop filters.
const LOW_FX = (() => {
  try { return matchMedia('(hover: none) and (pointer: coarse)').matches } catch { return false }
})()

// Paint order follows DEPTH: a layer's parallax `speed` is its z-index, so a
// thing farther back (lower speed) can never render over something nearer
// (higher speed). Same-speed layers fall back to DOM/authoring order — that's
// how the clue stays tucked behind the column (same plane, listed first).
const depthZ = (speed) => Math.round((speed ?? 1) * 100)

/* ---------- state ---------- */
const state = {
  scene: GAME.startScene,
  bag: [],
  cams: {},                       // per-scene { x, vel }
}
for (const id in SCENES) state.cams[id] = { x: 0, vel: 0 }

const built = {}                  // sceneId -> { root, layers:[{node,speed,cfg}] }
let stage, world, scale = 1
const edit = { active: false, sel: null }   // edit mode + selected layer entry

/* ---------- toast ---------- */
let toastTimer
function toast(msg, ms = 4200) {
  if (!msg) return
  const t = $('#toast')
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), ms)
}

/* ---------- layers ----------
   Two kinds, both scrolling on their own `speed` plane:
   • BAND  — a full-width background image (cover or tile). The default.
   • PROP  — a cut-out image placed at a world position (set `x`). `h` is its
             height in design px; `y` is its baseline (default = floor, 1080).
   Either renders a labelled placeholder until its art is dropped.            */
function makeLayer(scene, layer) {
  const node = el('div', 'layer')

  if (layer.x != null) {                          // PROP layer
    node.classList.add('prop-layer')
    const img = el('img', 'prop')
    positionProp(img, layer)
    img.alt = layer.label || layer.id
    img.onerror = () => { img.remove(); node.appendChild(propPlaceholder(layer, layer.h || 700, layer.y != null ? layer.y : DESIGN_H)) }
    img.src = layer.src
    node.appendChild(img)
    node.__img = img                              // editor handle
    if (layer.action) attachPropAction(img, layer)  // the prop IS the hit area
    return node
  }

  // Only a BAND spans the whole world, so only it gets a full-world box. Prop
  // layers (above) are left to shrink-wrap their single cut-out: each composited
  // layer is then ~1MB instead of a 7560×1080 ≈ 31MB GPU surface. With ~15 props
  // per scene that pile of full-world layers (~600MB total) is what silently
  // OOM-killed the page on mobile Safari — no JS error, just a dead tab.
  node.style.width = scene.width + 'px'
  node.style.height = DESIGN_H + 'px'

  if (layer.src) {                                // BAND layer
    const img = new Image()
    img.onload = () => {
      node.style.backgroundImage = `url("${layer.src}")`
      node.style.backgroundSize = layer.fit === 'tile' ? `${img.width}px ${DESIGN_H}px` : 'cover'
      node.style.backgroundRepeat = layer.fit === 'tile' ? 'repeat-x' : 'no-repeat'
      node.classList.remove('placeholder')
      node.innerHTML = ''            // clear the placeholder label now art has loaded
    }
    img.onerror = () => paintBandPlaceholder(node, layer)
    img.src = layer.src
  }
  paintBandPlaceholder(node, layer)               // shown until/unless the image loads
  return node
}

function paintBandPlaceholder(node, layer) {
  node.classList.add('placeholder')
  node.innerHTML =
    `<div class="ph-tag">
       <b>${layer.label || layer.id}</b>
       <span>speed ${layer.speed}</span>
       <code>${layer.src || '(no src)'}</code>
     </div>`
}

// place/refresh a prop image from its config (x = world centre, y = baseline,
// h = design-px height). Shared by the builder and the editor.
function positionProp(img, layer) {
  const h = layer.h || 700
  const y = layer.y != null ? layer.y : DESIGN_H
  img.style.height = h + 'px'
  img.style.left = layer.x + 'px'
  img.style.top = (y - h) + 'px'
  img.style.transform = layer.flip ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)'
}

function propPlaceholder(layer, h, y) {
  const box = el('div', 'ph-prop')
  box.style.height = h + 'px'
  box.style.left = layer.x + 'px'
  box.style.top = (y - h) + 'px'
  box.innerHTML = `<b>${layer.label || layer.id}</b><span>speed ${layer.speed}</span><code>${layer.src || '(no src)'}</code>`
  return box
}

// An interactive PROP: the image itself is the click target, so the hit area
// always tracks the art — even after it's moved/resized in edit mode. Same
// tap-vs-drag discrimination as a hotspot; inert while editing.
function attachPropAction(img, layer) {
  img.classList.add('interactive')
  let downX, moved
  img.addEventListener('pointerdown', (e) => { downX = e.clientX; moved = false })
  img.addEventListener('pointermove', (e) => { if (downX != null && Math.abs(e.clientX - downX) > 8) moved = true })
  img.addEventListener('click', (e) => {
    if (edit.active) return                  // in edit mode clicks pick/drag the prop
    if (moved) { e.preventDefault(); return } // it was a drag-to-walk, not a tap
    runAction(layer, img)
  })
}

/* ---------- hotspot ---------- */
function makeHotspot(scene, h) {
  const node = el('button', 'hotspot')
  node.style.left = h.x + 'px'
  node.style.top = h.y + 'px'
  node.style.width = h.w + 'px'
  node.style.height = h.h + 'px'
  node.setAttribute('aria-label', h.label || h.id)
  if (h.sparkle) node.classList.add('sparkle')

  if (h.bare) {
    // invisible click target — used when the visible art lives on a prop layer
    node.classList.add('bare')
  } else {
    if (h.art) {
      const img = new Image()
      img.onload = () => { node.style.backgroundImage = `url("${h.art}")`; node.classList.add('has-art') }
      img.src = h.art
    }
    node.innerHTML = `<span class="hs-marker">${h.icon || '◎'}<em>${h.label || h.id}</em></span>`
  }

  let downX, downT, moved
  node.addEventListener('pointerdown', (e) => { downX = e.clientX; downT = performance.now(); moved = false })
  node.addEventListener('pointermove', (e) => { if (downX != null && Math.abs(e.clientX - downX) > 8) moved = true })
  node.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); return }   // it was a drag-to-walk, not a tap
    runAction(h, node)
  })
  return node
}

function runAction(h, node) {
  const a = h.action || {}
  switch (a.type) {
    case 'goto':
      gotoScene(a.scene)
      toast(a.toast)
      break
    case 'collect':
      if (!state.bag.includes(a.item)) { state.bag.push(a.item); renderBag() }
      node.classList.add('collected')
      toast(a.toast)
      break
    case 'link':
      window.open(a.url, '_blank', 'noopener')
      break
    case 'toast':
    default:
      toast(a.toast)
  }
}

/* ---------- build a scene once, cache it ---------- */
function buildScene(id) {
  if (built[id]) return built[id]
  const scene = SCENES[id]
  const root = el('div', 'scene')
  root.style.width = scene.width + 'px'

  const layers = scene.layers.map((l) => {
    const node = makeLayer(scene, l)
    node.style.zIndex = depthZ(l.speed)               // depth drives paint order
    root.appendChild(node)
    const entry = { node, speed: l.speed, cfg: l }   // cfg = the live config object (editor mutates it)
    node.__entry = entry
    return entry
  })

  // hotspots ride a parallax plane — default 1.0, or `speed` to lock onto a
  // prop on another plane (e.g. a clue tucked behind a moving column)
  const hsPlanes = new Map()
  for (const h of (scene.hotspots || [])) {
    const sp = h.speed != null ? h.speed : 1.0
    let plane = hsPlanes.get(sp)
    if (!plane) {
      plane = el('div', 'hotspots')
      // no full-world width — the plane shrink-wraps its buttons so it doesn't
      // allocate its own 7560×1080 GPU layer (see makeLayer's note on mobile OOM)
      plane.style.zIndex = depthZ(sp) + 500           // hotspots stay clickable above same-depth art
      root.appendChild(plane)
      layers.push({ node: plane, speed: sp })
      hsPlanes.set(sp, plane)
    }
    plane.appendChild(makeHotspot(scene, h))
  }

  built[id] = { root, layers, scene }
  world.appendChild(root)
  return built[id]
}

/* ---------- scene switching ---------- */
function gotoScene(id) {
  if (!SCENES[id] || id === state.scene) return
  const from = built[state.scene]?.root
  buildScene(id)
  const to = built[id].root
  state.scene = id
  state.cams[id].x = 0
  state.cams[id].vel = 0

  for (const sid in built) built[sid].root.classList.toggle('active', sid === id)
  if (from && from !== to) { from.classList.add('leaving'); setTimeout(() => from.classList.remove('leaving'), 500) }
  to.classList.add('entering'); setTimeout(() => to.classList.remove('entering'), 500)

  $('#back-btn').classList.toggle('hidden', !SCENES[id].back)
  $('#scene-name').textContent = SCENES[id].name
  if (edit.active) { selectEntry(null); refreshPropList() }
}

/* ---------- camera / parallax loop ---------- */
const cam = () => state.cams[state.scene]
const camMax = () => Math.max(0, SCENES[state.scene].width - window.innerWidth / scale)

function nudge(dx) { const c = cam(); c.x = Math.max(0, Math.min(camMax(), c.x + dx)) }

function tick() {
  const c = cam()
  // inertial friction (frame-rate independent-ish; rAF ~60fps)
  if (keys.right) c.vel += (1100 - c.vel) * 0.12
  else if (keys.left) c.vel += (-1100 - c.vel) * 0.12
  else c.vel *= 0.94
  if (Math.abs(c.vel) < 2) c.vel = 0
  c.x = Math.max(0, Math.min(camMax(), c.x + c.vel / 60))
  if (c.x === 0 || c.x === camMax()) c.vel = 0

  const b = built[state.scene]
  if (b) for (const L of b.layers) L.node.style.transform = `translate3d(${-c.x * L.speed}px,0,0)`

  // fade the walk cue once you've moved
  if (c.x > 80) $('#walk-cue')?.classList.add('hidden')
  updateFx(c)
  requestAnimationFrame(tick)
}

/* ---------- viewport scaling: map DESIGN_H → viewport height ---------- */
function layout() {
  scale = window.innerHeight / DESIGN_H
  world.style.height = DESIGN_H + 'px'
  world.style.top = ((window.innerHeight - DESIGN_H * scale) / 2) + 'px'
  world.style.transform = `scale(${scale})`
}

/* ---------- input ---------- */
const keys = { left: false, right: false }
function setupInput() {
  let drag = null
  // in edit mode, a press that lands on a prop (or the panel) is for the editor,
  // not for panning the world
  const onProp = (e) => edit.active && e.target?.closest?.('.prop, #editor-panel')
  const start = (x) => { drag = { x, lastX: x, t: performance.now(), vel: 0, moved: 0 } }
  const move = (x) => {
    if (!drag) return
    const now = performance.now(), dt = Math.max(8, now - drag.t), dx = x - drag.lastX
    drag.moved += Math.abs(dx)
    drag.vel = drag.vel * 0.6 + (-dx / scale / (dt / 1000)) * 0.4
    nudge(-dx / scale)
    cam().vel = 0
    drag.lastX = x; drag.t = now
  }
  const end = () => {
    if (drag && drag.moved > 12 && performance.now() - drag.t < 90) {
      cam().vel = Math.max(-4500, Math.min(4500, drag.vel))
    }
    drag = null
  }
  addEventListener('mousedown', (e) => { if (!onProp(e)) start(e.clientX) })
  addEventListener('mousemove', (e) => move(e.clientX))
  addEventListener('mouseup', end)
  addEventListener('touchstart', (e) => { if (!onProp(e)) start(e.touches[0].clientX) }, { passive: true })
  addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true })
  addEventListener('touchend', end, { passive: true })
  addEventListener('wheel', (e) => nudge((Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) / scale), { passive: true })
  addEventListener('keydown', (e) => {
    if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return
    // in edit mode with a selection, arrows nudge the prop (Shift = ×10)
    if (edit.active && edit.sel && (e.key.startsWith('Arrow'))) {
      const step = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowLeft') edit.sel.cfg.x -= step
      if (e.key === 'ArrowRight') edit.sel.cfg.x += step
      if (e.key === 'ArrowUp') edit.sel.cfg.y = (edit.sel.cfg.y ?? DESIGN_H) - step
      if (e.key === 'ArrowDown') edit.sel.cfg.y = (edit.sel.cfg.y ?? DESIGN_H) + step
      positionProp(edit.sel.node.__img, edit.sel.cfg)
      syncPanel()
      markDirty()
      e.preventDefault()
      return
    }
    if (e.key === 'ArrowLeft') keys.left = true
    if (e.key === 'ArrowRight') keys.right = true
  })
  addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft') keys.left = false; if (e.key === 'ArrowRight') keys.right = false })
}

/* ---------- HUD: inventory + menu (Museum-Placard UI) ---------- */
const ITEM_ICON = { Fossil: 'i-bone' }   // maps an item name -> SVG symbol id
const itemSvg = (name) => `<svg class="ico" aria-hidden="true"><use href="#${ITEM_ICON[name] || 'i-bone'}"></use></svg>`
const INV_SLOTS = 6

function renderBag() {
  const n = state.bag.length
  const badge = $('#inv-badge')
  if (badge) { badge.textContent = n; badge.classList.toggle('hidden', n === 0) }
  const grid = $('#inv-grid')
  if (grid) {
    let html = state.bag
      .map((i) => `<div class="toon tile inv-tile" title="${i}">${itemSvg(i)}</div>`)
      .join('')
    for (let k = n; k < Math.max(INV_SLOTS, n); k++) html += '<div class="inv-slot"></div>'
    grid.innerHTML = html
    $('#inv-hint').textContent = n ? `${n} clue${n > 1 ? 's' : ''} collected.` : 'Tap clues in the museum to collect them.'
  }
}

function closePanels() {
  $('#overlay')?.classList.add('hidden')
  for (const id of ['#inventory', '#menu']) $(id)?.classList.add('hidden')
}
function openPanel(sel) {
  closePanels()
  $('#overlay')?.classList.remove('hidden')
  $(sel)?.classList.remove('hidden')
}
function setupUI() {
  $('#inv-btn')?.addEventListener('click', () => openPanel('#inventory'))
  $('#menu-btn')?.addEventListener('click', () => openPanel('#menu'))
  $('#overlay')?.addEventListener('click', closePanels)
  document.querySelectorAll('.js-close').forEach((b) => b.addEventListener('click', closePanels))
  document.querySelectorAll('.js-toggle').forEach((t) => t.addEventListener('click', () => {
    t.classList.toggle('is-on')
    const on = t.classList.contains('is-on')
    toast(`${t.dataset.setting === 'music' ? 'Music' : 'Sound'} ${on ? 'on' : 'off'}`, 1400)
  }))
  $('#menu-help')?.addEventListener('click', () => {
    closePanels()
    toast('Walk with drag, scroll, or ← → keys. Tap anything that looks interesting; collect clues into your bag.', 5000)
  })
  $('#menu-restart')?.addEventListener('click', () => {
    state.bag = []
    renderBag()
    document.querySelectorAll('.hotspot.collected').forEach((h) => h.classList.remove('collected'))
    closePanels()
    state.cams[GAME.startScene].x = 0
    if (state.scene !== GAME.startScene) gotoScene(GAME.startScene)
    toast('Tour restarted.', 2000)
  })
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels() })
}

/* ---------- cinematic FX: vignette + scroll-reactive lens flare + dust ----------
   A light source drifts across the screen as you walk the hall; lens ghosts ride
   the line through screen-centre, and an anamorphic streak + bloom intensify with
   scroll speed. Pure overlay (screen/multiply blend) — never touches gameplay.   */
let fx = null
function setupFx() {
  const vig = el('div'); vig.id = 'fx-vignette'
  const flare = el('div'); flare.id = 'fx-flare'
  flare.innerHTML = `<div class="fl-streak"></div><div class="fl-glow"></div>
    <div class="fl-core"></div><div class="fl-ghost fl-g1"></div>
    <div class="fl-ghost fl-g2"></div><div class="fl-ghost fl-g3"></div>`
  const motes = el('div'); motes.id = 'fx-motes'
  for (let i = 0; i < 7; i++) {
    const m = el('span', 'mote')
    const d = { x: Math.random(), y: 0.12 + Math.random() * 0.72, par: 0.03 + Math.random() * 0.08,
      bob: 0.3 + Math.random() * 0.5, ph: Math.random() * 6.28, op: 0.18 + Math.random() * 0.4,
      sz: 3 + Math.random() * 5 }
    m._fx = d; m.style.width = m.style.height = d.sz + 'px'
    motes.appendChild(m)
  }
  document.body.append(vig, flare, motes)
  fx = {
    core: flare.querySelector('.fl-core'), glow: flare.querySelector('.fl-glow'),
    streak: flare.querySelector('.fl-streak'), ghosts: [...flare.querySelectorAll('.fl-ghost')],
    motes: [...motes.querySelectorAll('.mote')],
  }
}

function place(n, x, y, s, o) {
  n.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%)) scale(${s})`
  n.style.opacity = o
}

function updateFx(c) {
  if (!fx) return
  const vw = window.innerWidth, vh = window.innerHeight
  const max = camMax()
  const p = max ? c.x / max : 0                       // walk progress 0..1
  const sp = Math.min(1, Math.abs(c.vel) / 1800)      // scroll speed 0..1
  const k = edit.active ? 0.25 : 1                     // dim while editing

  // light source slides right→left across the hall as you walk forward
  const cx = (0.80 - 0.60 * p) * vw, cy = 0.30 * vh
  const Cx = vw * 0.5, Cy = vh * 0.5
  const along = (t) => [Cx + (cx - Cx) * t, Cy + (cy - Cy) * t]

  place(fx.glow, cx, cy, 0.8 + 0.4 * p, (0.22 + 0.42 * sp) * k)
  place(fx.core, cx, cy, 0.65 + 0.5 * sp, (0.45 + 0.45 * sp) * k)
  const g1 = along(-0.4), g2 = along(0.55), g3 = along(1.5)
  place(fx.ghosts[0], g1[0], g1[1], 0.85, (0.16 + 0.30 * sp) * k)
  place(fx.ghosts[1], g2[0], g2[1], 0.55, (0.14 + 0.34 * sp) * k)
  place(fx.ghosts[2], g3[0], g3[1], 1.15, (0.10 + 0.30 * sp) * k)
  fx.streak.style.top = cy + 'px'
  fx.streak.style.opacity = (0.08 + 0.7 * sp) * k

  const t = performance.now() / 1000
  const span = vw + 60
  for (const m of fx.motes) {
    const d = m._fx
    let x = (d.x * vw - c.x * d.par) % span; if (x < 0) x += span; x -= 30
    const y = d.y * vh + Math.sin(t * d.bob + d.ph) * 16
    m.style.transform = `translate(${x}px, ${y}px)`
    m.style.opacity = d.op * (0.55 + 0.45 * sp) * k
  }
}

/* =============================================================================
   EDIT MODE — move props (x/y by drag or arrows), set depth (parallax speed),
   size, flip, and z-order, then copy the result back into config.js. Toggle with
   the ✎ button or the `e` key. Nothing here ships in a "real" build; it's a
   layout tool for dressing scenes with dropped-in art.
============================================================================= */
let panel
let editorWin = null                     // popped-out editor window, if open
let assetList = []                       // /assets/props/*.png choices for the picker
// query INSIDE the panel element (works whether it lives in this doc or the popout)
const epq = (sel) => panel?.querySelector(sel)
const round2 = (n) => Math.round(n * 100) / 100

// fetch the list of prop images from the dev server (for the file picker)
async function loadAssetList() {
  try { const r = await fetch('/__assets', { cache: 'no-store' }); if (r.ok) assetList = await r.json() }
  catch { /* not in dev / endpoint absent — picker just stays empty, typing still works */ }
  fillAssetPicker()
}

// (re)populate the picker, keeping the selected prop's current src as an option
function fillAssetPicker() {
  const sel = epq('#ep-srcpick'); if (!sel) return
  const cur = edit.sel?.cfg?.src || ''
  const list = assetList.includes(cur) || !cur ? assetList : [cur, ...assetList]
  sel.innerHTML = '<option value="">— choose image —</option>' +
    list.map((p) => `<option value="${p}">${p.replace('/assets/props/', '')}</option>`).join('')
  sel.value = list.includes(cur) ? cur : ''
}

// apply a chosen image path to the selected prop (shared by picker + text field)
function applySrc(v) {
  v = (v || '').trim()
  if (!edit.sel || !v || v === edit.sel.cfg.src) return
  edit.sel.cfg.src = v
  rebuildPropNode(edit.sel)              // reload the art (also recovers a broken placeholder)
  edit.sel.node.__img?.classList.add('sel')
  if (epq('#ep-src')) epq('#ep-src').value = v
  fillAssetPicker()
  markDirty()
  toast('Image updated.', 1500)
}

function setupEditor() {
  const btn = $('#edit-btn')
  btn.addEventListener('click', toggleEdit)
  addEventListener('keydown', (e) => {
    if (e.key === 'e' && e.target?.tagName !== 'INPUT' && e.target?.tagName !== 'TEXTAREA') toggleEdit()
  })

  // pick + drag props (only while editing; props are click-through otherwise)
  let pd = null
  world.addEventListener('pointerdown', (e) => {
    if (!edit.active) return
    const img = e.target.closest('.prop')
    if (!img) { if (e.target.closest('.scene')) selectEntry(null); return }
    const entry = img.parentElement.__entry
    if (!entry) return
    e.preventDefault()
    selectEntry(entry)
    pd = { x: e.clientX, y: e.clientY, ox: entry.cfg.x, oy: entry.cfg.y != null ? entry.cfg.y : DESIGN_H }
    img.setPointerCapture?.(e.pointerId)
  })
  world.addEventListener('pointermove', (e) => {
    if (!pd || !edit.sel) return
    pd.moved = true
    edit.sel.cfg.x = Math.round(pd.ox + (e.clientX - pd.x) / scale)
    edit.sel.cfg.y = Math.round(pd.oy + (e.clientY - pd.y) / scale)
    positionProp(edit.sel.node.__img, edit.sel.cfg)
    syncPanel()
  })
  addEventListener('pointerup', () => { if (pd?.moved) markDirty(); pd = null })
}

function toggleEdit() {
  edit.active = !edit.active
  document.body.classList.toggle('editing', edit.active)
  $('#edit-btn').classList.toggle('on', edit.active)
  if (edit.active) {
    buildPanel()
    openEditorWindow()         // pop the panel out into its own window (keeps the scene clear)
    refreshPropList()
    loadAssetList()            // populate the image picker from /assets/props
    syncPanel()
    toast('Edit mode — the controls are in a separate window. Tap a prop, drag to move.', 5000)
  } else {
    selectEntry(null)
    closeEditorWindow()
    panel?.classList.add('hidden')
  }
}

/* ---------- pop-out editor window ----------
   The panel DOM is MOVED (adoptNode keeps its listeners) into a separate window
   so it never covers the scene. All handlers query inside `panel` via epq(), so
   they keep working in either document. If the popup is blocked we fall back to
   the inline panel.                                                            */
function openEditorWindow() {
  if (editorWin && !editorWin.closed) { editorWin.focus(); return }
  editorWin = window.open('', 'malabi-scene-editor', 'width=440,height=860')
  if (!editorWin) {                       // blocked → keep the inline panel
    panel.classList.remove('hidden')
    toast('Popup blocked — editor shown inline. Allow popups to pop it out.', 4500)
    return
  }
  const d = editorWin.document
  d.title = 'Malabi — Scene Editor'
  d.head.innerHTML = ''
  d.body.innerHTML = ''
  for (const n of document.querySelectorAll('style, link[rel="stylesheet"]')) d.head.appendChild(n.cloneNode(true))
  const base = d.createElement('style')
  base.textContent = `html,body{margin:0;height:100%;background:#efe2c4}
    #editor-panel{position:static!important;inset:auto!important;width:auto!important;
      max-width:none!important;max-height:none!important;height:auto!important;
      box-shadow:none!important;border-radius:0!important}`
  d.head.appendChild(base)
  d.body.appendChild(d.adoptNode(panel))
  panel.classList.remove('hidden')
  // user closes the window directly → the panel node dies with it, so drop the
  // reference (next edit rebuilds it) and exit edit mode
  editorWin.__onUnload = () => { editorWin = null; panel = null; if (edit.active) toggleEdit() }
  editorWin.addEventListener('beforeunload', editorWin.__onUnload)
}

function closeEditorWindow() {
  if (editorWin && !editorWin.closed) {
    editorWin.removeEventListener('beforeunload', editorWin.__onUnload)  // we're closing it on purpose
    document.body.appendChild(document.adoptNode(panel))                 // bring the panel home for reuse
    editorWin.close()
  }
  editorWin = null
}

function propEntries() {
  // only PROP layers (have x) of the active scene, in paint order (DOM order)
  const b = built[state.scene]
  if (!b) return []
  return [...b.root.children].map((n) => n.__entry).filter((en) => en && en.cfg && en.cfg.x != null)
}

function selectEntry(entry) {
  if (edit.sel?.node?.__img) edit.sel.node.__img.classList.remove('sel')
  edit.sel = entry
  if (entry?.node?.__img) entry.node.__img.classList.add('sel')
  syncPanel()
  fillAssetPicker()              // reflect this prop's image in the picker
}

/* ---------- panel ---------- */
function buildPanel() {
  if (panel) { panel.classList.remove('hidden'); return }
  panel = el('div'); panel.id = 'editor-panel'
  panel.innerHTML = `
    <div class="ep-head panel__head">⠿ Edit mode <span id="ep-status" class="ep-status"></span><button id="ep-close" title="Exit (E)">✕</button></div>
    <div class="ep-pad">
    <label class="ep-row">Prop <select id="ep-pick"></select></label>
    <div id="ep-fields" class="ep-fields">
      <label class="ep-src-row">Image <select id="ep-srcpick"><option value="">— choose image —</option></select></label>
      <label class="ep-src-row">Path <input id="ep-src" type="text" placeholder="/assets/props/…"></label>
      <label>X <input id="ep-x" type="number" step="1"></label>
      <label>Y <input id="ep-y" type="number" step="1"></label>
      <label>Size <input id="ep-h" type="range" min="80" max="1600" step="2"><input id="ep-hn" type="number" step="2"></label>
      <label>Depth <input id="ep-s" type="range" min="0" max="2" step="0.01"><input id="ep-sn" type="number" step="0.01"></label>
      <label class="ep-check"><input id="ep-flip" type="checkbox"> Flip horizontally</label>
      <div class="ep-z">Z-order <button id="ep-back" class="toon is-press btn btn--cream btn--sm">Send back</button><button id="ep-fwd" class="toon is-press btn btn--cream btn--sm">Bring forward</button></div>
      <button id="ep-del" class="ep-del toon is-press btn btn--sm">🗑 Delete prop</button>
    </div>
    <p id="ep-empty" class="ep-empty">Tap a prop in the scene to select it, then drag to move (or use arrow keys).</p>
    <div class="ep-actions">
      <button id="ep-add" class="ep-add toon is-press btn btn--green btn--sm">＋ Add prop</button>
      <button id="ep-save" class="ep-save toon is-press btn btn--green btn--sm">Save</button>
      <button id="ep-copy" class="ep-copy toon is-press btn btn--cream btn--sm">Copy config</button>
    </div>
    <textarea id="ep-out" readonly placeholder="…copied config appears here"></textarea>
    </div>`
  document.body.appendChild(panel)

  makePanelDraggable()
  epq('#ep-close').addEventListener('click', toggleEdit)
  epq('#ep-save').addEventListener('click', () => saveLayout(true))
  epq('#ep-pick').addEventListener('change', (e) => {
    const en = propEntries().find((x) => x.cfg.id === e.target.value)
    if (en) { selectEntry(en); centerOn(en) }
  })
  const bind = (id, key, opts = {}) => epq(id).addEventListener('input', (e) => {
    if (!edit.sel) return
    let v = opts.bool ? e.target.checked : parseFloat(e.target.value)
    if (!opts.bool && Number.isNaN(v)) return
    edit.sel.cfg[key] = v
    if (key === 'speed') { edit.sel.speed = v; edit.sel.node.style.zIndex = depthZ(v) }   // keep z in sync with depth
    positionProp(edit.sel.node.__img, edit.sel.cfg)
    syncPanel(id)
    markDirty()
  })
  bind('#ep-x', 'x'); bind('#ep-y', 'y')
  bind('#ep-h', 'h'); bind('#ep-hn', 'h')
  bind('#ep-s', 'speed'); bind('#ep-sn', 'speed')
  bind('#ep-flip', 'flip', { bool: true })
  epq('#ep-srcpick').addEventListener('change', (e) => applySrc(e.target.value))
  epq('#ep-src').addEventListener('change', (e) => applySrc(e.target.value))
  epq('#ep-back').addEventListener('click', () => reorder(-1))
  epq('#ep-fwd').addEventListener('click', () => reorder(1))
  epq('#ep-add').addEventListener('click', addProp)
  epq('#ep-del').addEventListener('click', deleteSelected)
  epq('#ep-copy').addEventListener('click', copyConfig)
}

// unique layer id within the current scene (id-1, id-2, …)
function uniqueId(base) {
  const taken = new Set([...built[state.scene].root.children].map((n) => n.__entry?.cfg?.id).filter(Boolean))
  let n = 1, id
  do { id = `${base}-${n++}` } while (taken.has(id))
  return id
}

// Rebuild a prop's DOM node from its (mutated) cfg — used when the image src
// changes, so a new <img> loads (and a failed placeholder can recover). Keeps
// the same entry object, paint position and z-order.
function rebuildPropNode(entry) {
  const node = makeLayer(SCENES[state.scene], entry.cfg)
  node.style.zIndex = depthZ(entry.speed)
  node.__entry = entry
  node.style.transform = entry.node.style.transform   // keep current parallax offset
  entry.node.replaceWith(node)
  entry.node = node
}

// ADD a new prop to the current scene at the centre of the view, then select it
// so it can be dragged / sized immediately. Persisted on save like any prop.
// dialogs should appear over whichever window holds the editor controls
const epWin = () => (editorWin && !editorWin.closed ? editorWin : window)

function addProp() {
  if (!edit.active) return
  // default to the first available image so no typing is needed; the user then
  // picks the right one from the Image dropdown. Falls back to a prompt only if
  // the asset list is unavailable (e.g. not running the dev server).
  let src = assetList[0]
  if (!src) {
    src = (epWin().prompt('Image path for the new prop\n(e.g. /assets/props/fern.png):', '/assets/props/') || '').trim()
    if (!src || src === '/assets/props/') return
  }
  const id = uniqueId('prop')
  const c = cam()
  const cfg = { id, src, speed: 1.0, x: Math.round(c.x + (window.innerWidth / scale) / 2), y: DESIGN_H, h: 500, label: id }
  const scene = SCENES[state.scene]
  scene.layers.push(cfg)
  const node = makeLayer(scene, cfg)
  node.style.zIndex = depthZ(cfg.speed)
  built[state.scene].root.appendChild(node)
  const entry = { node, speed: cfg.speed, cfg }
  node.__entry = entry
  built[state.scene].layers.push(entry)
  refreshPropList()
  selectEntry(entry)
  markDirty()
  toast(`Added “${id}”. Pick its image from the Image dropdown, then drag to place / size it.`, 5000)
}

// REMOVE the selected prop from the current scene (DOM + config), then save.
function deleteSelected() {
  if (!edit.sel) { toast('Tap a prop to select it first, then Delete.', 2600); return }
  const id = edit.sel.cfg.id
  if (!epWin().confirm(`Delete prop “${id}” from this scene?`)) return
  edit.sel.node.remove()
  const bl = built[state.scene].layers, i = bl.indexOf(edit.sel)
  if (i >= 0) bl.splice(i, 1)
  const sl = SCENES[state.scene].layers, j = sl.findIndex((l) => l.id === id)
  if (j >= 0) sl.splice(j, 1)
  selectEntry(null)
  refreshPropList()
  markDirty()
  toast(`Removed “${id}”.`, 2600)
}

function refreshPropList() {
  const sel = epq('#ep-pick'); if (!sel) return
  sel.innerHTML = propEntries().map((en) => `<option value="${en.cfg.id}">${en.cfg.label || en.cfg.id}</option>`).join('')
  if (edit.sel) sel.value = edit.sel.cfg.id
}

// keep panel inputs in sync with the selection; `except` skips the field being typed in
function syncPanel(except) {
  if (!panel) return
  const has = !!edit.sel
  epq('#ep-fields').style.display = has ? '' : 'none'
  epq('#ep-empty').style.display = has ? 'none' : ''
  if (!has) return
  const c = edit.sel.cfg
  const set = (id, v) => { if (id !== except && epq(id)) epq(id).value = v }
  set('#ep-src', c.src || '')
  set('#ep-x', Math.round(c.x)); set('#ep-y', Math.round(c.y != null ? c.y : DESIGN_H))
  set('#ep-h', Math.round(c.h || 700)); set('#ep-hn', Math.round(c.h || 700))
  set('#ep-s', round2(edit.sel.speed)); set('#ep-sn', round2(edit.sel.speed))
  if (epq('#ep-flip')) epq('#ep-flip').checked = !!c.flip
  if (epq('#ep-pick')) epq('#ep-pick').value = c.id
}

function reorder(dir) {
  if (!edit.sel) return
  const node = edit.sel.node
  const sib = dir > 0 ? node.nextElementSibling : node.previousElementSibling
  if (!sib) return
  if (dir > 0) node.parentNode.insertBefore(sib, node)   // move forward (later = on top)
  else node.parentNode.insertBefore(node, sib)           // move back
  refreshPropList()
  markDirty()
}

function centerOn(entry) {
  const c = cam()
  const visW = window.innerWidth / scale
  // a prop on plane `speed` sits at screen = propX - camX*speed; solve for centre
  c.x = Math.max(0, Math.min(camMax(), (entry.cfg.x - visW / 2) / (entry.speed || 1)))
  c.vel = 0
}

/* ---------- config export ---------- */
function layerToJS(c) {
  const q = (s) => `'${String(s).replace(/'/g, "\\'")}'`
  const p = [`id: ${q(c.id)}`, `src: ${q(c.src)}`, `speed: ${round2(c.speed)}`]
  if (c.x != null) {
    p.push(`x: ${Math.round(c.x)}`, `y: ${Math.round(c.y != null ? c.y : DESIGN_H)}`, `h: ${Math.round(c.h || 700)}`)
    if (c.flip) p.push('flip: true')
  } else if (c.fit) p.push(`fit: ${q(c.fit)}`)
  if (c.label) p.push(`label: ${q(c.label)}`)
  return `      { ${p.join(', ')} },`
}

function copyConfig() {
  const b = built[state.scene]
  const lines = [...b.root.children].map((n) => n.__entry?.cfg).filter(Boolean).map(layerToJS)
  const text = `// ${state.scene} — paste over this scene's \`layers\` in src/config.js\n    layers: [\n${lines.join('\n')}\n    ],`
  epq('#ep-out').value = text
  navigator.clipboard?.writeText(text).then(
    () => toast('Layers config copied to clipboard — paste into config.js', 4000),
    () => toast('Select the text below and copy it into config.js', 4000),
  )
}

/* ---------- save (persist to public/layout.json via the dev server) ---------- */
let saveTimer
function markDirty() {            // debounced auto-save after any edit
  setSaveState('saving')
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveLayout(false), 600)
}

function cfgToData(c) {
  const o = { id: c.id, src: c.src, speed: round2(c.speed) }
  if (c.x != null) {
    o.x = Math.round(c.x); o.y = Math.round(c.y != null ? c.y : DESIGN_H); o.h = Math.round(c.h || 700)
    if (c.flip) o.flip = true
  } else if (c.fit) o.fit = c.fit
  if (c.label) o.label = c.label
  return o
}

async function saveLayout(explicit) {
  // every scene: built scenes use DOM order (captures z-order edits), others
  // keep their current config order — so nothing is dropped across reloads
  const data = {}
  for (const id in SCENES) {
    const b = built[id]
    const layers = b ? [...b.root.children].map((n) => n.__entry?.cfg).filter(Boolean) : SCENES[id].layers
    data[id] = layers.map(cfgToData)
  }
  try {
    const res = await fetch('/__save_layout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
    setSaveState(res.ok ? 'saved' : 'error')
    if (explicit) toast(res.ok ? 'Saved — your layout persists across reloads.' : 'Save failed (is the dev server running?)', 3500)
  } catch {
    setSaveState('error')
    if (explicit) toast('Save failed (is the dev server running?)', 3500)
  }
}

function setSaveState(s) {
  const el = epq('#ep-status'); if (!el) return
  el.textContent = s === 'saving' ? 'saving…' : s === 'saved' ? '✓ saved' : s === 'error' ? '⚠ failed' : ''
  el.className = 'ep-status ' + s
}

/* ---------- draggable panel (grab the header) ---------- */
function makePanelDraggable() {
  let pd = null
  panel.addEventListener('pointerdown', (e) => {
    if (editorWin && !editorWin.closed) return    // popped out → the OS window handles moving
    if (!e.target.closest('.ep-head') || e.target.id === 'ep-close') return
    const r = panel.getBoundingClientRect()
    pd = { x: e.clientX, y: e.clientY, left: r.left, top: r.top }
    e.preventDefault()
  })
  addEventListener('pointermove', (e) => {
    if (!pd) return
    panel.style.right = 'auto'
    panel.style.left = (pd.left + e.clientX - pd.x) + 'px'
    panel.style.top = Math.max(8, pd.top + e.clientY - pd.y) + 'px'
  })
  addEventListener('pointerup', () => { pd = null })
}

/* ---------- persisted layout (saved from edit mode → public/layout.json) ----- */
async function loadLayout() {
  try {
    const res = await fetch('/layout.json', { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    for (const id in data) if (SCENES[id] && Array.isArray(data[id])) {
      // the saved layout only carries geometry; re-graft each layer's `action`
      // (defined once in config.js) back on by id so interactive props keep working
      const actions = new Map(SCENES[id].layers.filter((l) => l.action).map((l) => [l.id, l.action]))
      SCENES[id].layers = data[id]
      for (const l of SCENES[id].layers) if (actions.has(l.id)) l.action = actions.get(l.id)
    }
  } catch { /* no saved layout yet — use config.js as-is */ }
}

/* ---------- boot ---------- */
export async function boot() {
  document.body.style.background = GAME.bg
  if (LOW_FX) document.body.classList.add('lowfx')
  $('#title').textContent = GAME.title
  $('#subtitle').textContent = GAME.subtitle
  stage = $('#stage')
  world = $('#world')

  layout()
  addEventListener('resize', layout)

  await loadLayout()
  buildScene(state.scene)
  built[state.scene].root.classList.add('active')
  $('#scene-name').textContent = SCENES[state.scene].name
  $('#back-btn').classList.toggle('hidden', !SCENES[state.scene].back)
  $('#back-btn').addEventListener('click', () => { const back = SCENES[state.scene].back; if (back) gotoScene(back) })

  renderBag()
  setupUI()
  if (!LOW_FX) setupFx()          // skip the blur/blend FX overlays on mobile (memory)
  setupInput()
  setupEditor()
  requestAnimationFrame(tick)

  toast('Walk right — drag, scroll, or arrow keys. Tap anything that looks interesting.', 6000)
}
