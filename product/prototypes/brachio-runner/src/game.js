import { LIVES, INVULN_TIME, BASE_SPEED, MAX_SPEED, SPEED_RAMP } from './config.js'

// Pure-ish game rules + state machine. Owns lives/score/distance/speed/leaf-meter
// and the ready→play→over transitions. Talks to the HUD; knows nothing about
// Three.js. main.js drives the scene and feeds events in.

// --- tiny Web Audio synth for pickup / jump / hit blips (optional, fails silent) ---
let actx = null
function note(freq, dur = 0.1, type = 'triangle', gain = 0.05) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)()
    const t0 = actx.currentTime
    const o = actx.createOscillator(), g = actx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(gain, t0)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    o.connect(g); g.connect(actx.destination)
    o.start(t0); o.stop(t0 + dur)
  } catch { /* audio is a nicety */ }
}
const sfx = {
  leaf: () => note(880, 0.09, 'triangle'),
  berry: () => note(1175, 0.12, 'sine', 0.06),
  jump: () => note(440, 0.12, 'square', 0.04),
  hit: () => note(150, 0.28, 'sawtooth', 0.07),
  milestone: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => note(f, 0.14, 'sine'), i * 70)),
}

export function createGame(hud) {
  const g = {
    mode: 'ready',       // 'ready' | 'play' | 'over'
    lives: LIVES,
    score: 0,
    mult: 1,
    combo: 0,            // consecutive pickups without a hit → multiplier
    distance: 0,         // metres
    speed: BASE_SPEED,
    meter: 100,          // leaf meter %, drains slowly, refilled by leaves
    invuln: 0,
    best: Number(localStorage.getItem('brachio-best') || 0),
    nextMilestone: 500,
    sfx,
  }

  function refreshHud() {
    hud.setLives(g.lives, LIVES)
    hud.setScore(g.score)
    hud.setMult(g.mult)
    hud.setDistance(g.distance)
    hud.setMeter(g.meter)
  }

  function start() {
    if (g.mode === 'play') return
    g.mode = 'play'
    g.lives = LIVES; g.score = 0; g.mult = 1; g.combo = 0
    g.distance = 0; g.speed = BASE_SPEED; g.meter = 100
    g.invuln = 0; g.nextMilestone = 500
    refreshHud()
    hud.hideModal()
    hud.fadeHint()
  }

  function pickup(kind) {
    const base = kind === 'berry' ? 50 : 15
    g.combo++
    g.mult = Math.min(8, 1 + Math.floor(g.combo / 5))
    g.score += base * g.mult
    g.meter = Math.min(100, g.meter + (kind === 'berry' ? 14 : 7))
    sfx[kind]?.()
    if (g.score >= g.nextMilestone) { sfx.milestone(); g.nextMilestone += 500 }
    refreshHud()
  }

  // returns true if the hit "landed" (so the spawner can remove the obstacle)
  function hit() {
    if (g.invuln > 0) return false
    g.lives--
    g.combo = 0; g.mult = 1
    g.invuln = INVULN_TIME
    g.meter = Math.max(0, g.meter - 20)
    sfx.hit()
    refreshHud()
    if (g.lives <= 0) gameOver()
    return true
  }

  function gameOver() {
    g.mode = 'over'
    if (g.score > g.best) { g.best = g.score; localStorage.setItem('brachio-best', String(g.best)) }
    hud.showGameOver(g.score, g.distance, g.best)
  }

  // per-frame state advance (dt seconds). Returns the world scroll distance dz>0.
  function update(dt) {
    if (g.mode !== 'play') return 0
    // difficulty ramp
    g.speed = Math.min(MAX_SPEED, g.speed + SPEED_RAMP * dt)
    const dz = g.speed * dt
    g.distance += dz
    // distance points + slow leaf drain (keeps the meter meaningful without a fail)
    g.score += Math.round(dz * 2)
    g.meter = Math.max(0, g.meter - dt * 3.5)
    if (g.invuln > 0) g.invuln -= dt
    hud.setScore(g.score)
    hud.setDistance(g.distance)
    hud.setMeter(g.meter)
    return dz
  }

  return { state: g, start, pickup, hit, gameOver, update, refreshHud }
}
