/* =====================================================================
   THE LANDING SEQUENCE BOARD — the Moon room's puzzle.

   Six mission cards, six slots, one correct order. TAP a card, then TAP a slot:
   young hands are far better at tap-then-tap than at a precise drag, and this
   puzzle is meant to be hard in the head, not in the fingers.

   THE CLUE IS NOT IN HERE. Out in the room a signal lamp flashes the six card
   colours in the order the mission happened. Nobody says so — noticing that the
   lamp and the cards share a palette is the puzzle. The catalog deliberately does
   not give the order away (Gidi, 2026-07-22: it was "too direct").

   So CHECK tells you HOW MANY cards are in the right place, and not which. An
   earlier version locked the correct ones, which quietly became the real
   solution: six or eight presses converged on the answer without ever looking at
   the lamp. A count still tells a child they're getting warmer and still lets
   them fix one card at a time, while leaving the lamp as the only way in. Cards
   stay exactly where they were put — nothing is ever taken away.
   (Gameplay principle #4: no dead ends, no fail states.)
   ===================================================================== */

import { MOON_STEPS, missionCardSVG } from './art.js'

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

let open = false
export const isMoonBoardOpen = () => open

let overlay, slotRow, trayRow, checkBtn, msgEl
let onCloseCb = null, onCompleteCb = null
let slots = []        // stepId | null, per position
let tray = []         // stepIds not yet placed
let picked = null     // the card currently lifted
let solved = false

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
  } catch { /* audio is optional */ }
}

const N = MOON_STEPS.length
const correctIdFor = (i) => MOON_STEPS.find((s) => s.order === i + 1).id

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #moon-board { position: fixed; inset: 0; z-index: 200; display: none; overflow: auto;
      background: radial-gradient(120% 90% at 50% 0%, #1b2430 0%, #0b1018 70%, #060a0f 100%);
      font-family: ${SERIF}; color: #f4e6c8;
      touch-action: manipulation; user-select: none; -webkit-user-select: none; }
    #moon-board.on { display: block; }
    #moon-board .mb-wrap { max-width: 1180px; margin: 0 auto; padding: 16px 14px 34px; }
    #moon-board h1 { font-size: clamp(19px, 3.6vw, 28px); letter-spacing: .11em; text-align: center;
      margin: 4px 0 2px; color: #e8a948; text-transform: uppercase; }
    #moon-board .mb-sub { text-align: center; opacity: .72; font-size: 13.5px; margin-bottom: 12px; }
    #moon-board .mb-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
    #moon-board .mb-btn { background: rgba(20,52,74,0.85); color: #f4e6c8;
      border: 2px solid rgba(232,169,72,0.55); font: 600 15px ${SERIF};
      padding: 10px 20px; border-radius: 999px; cursor: pointer; min-height: 44px; }
    #moon-board .mb-check { background: #e8a948; color: #1b110a; border-color: #e8a948; font-weight: 700; letter-spacing: .08em; }
    #moon-board .mb-check:disabled { opacity: .45; cursor: default; }
    #moon-board .mb-label { font-size: 12.5px; letter-spacing: .16em; text-transform: uppercase;
      color: #e8a948; text-align: center; margin: 14px 0 8px; opacity: .85; }
    #moon-board .mb-row { display: grid; grid-template-columns: repeat(${N}, 1fr); gap: 9px; }
    @media (max-width: 780px) { #moon-board .mb-row { grid-template-columns: repeat(3, 1fr); } }
    #moon-board .mb-cell { position: relative; aspect-ratio: 150 / 200; border-radius: 12px;
      border: 2px dashed rgba(232,169,72,0.45); background: rgba(244,230,200,0.05);
      display: grid; place-items: center; cursor: pointer;
      transition: transform .12s ease, border-color .15s ease, background .15s ease; }
    #moon-board .mb-cell:hover { transform: translateY(-2px); background: rgba(232,169,72,0.12); }
    #moon-board .mb-cell.filled { border-style: solid; border-color: rgba(232,169,72,0.9); background: none; }
    #moon-board .mb-cell.picked { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.35); }
    #moon-board .mb-cell.wrong { animation: mb-shake .45s ease; }
    @keyframes mb-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } }
    #moon-board .mb-cell svg { width: 100%; height: 100%; display: block; border-radius: 10px; }
    #moon-board .mb-num { position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
      width: 26px; height: 26px; border-radius: 50%; background: #0b1018; border: 2px solid #e8a948;
      color: #e8a948; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
    #moon-board .mb-empty { opacity: .3; font-size: 13px; }
    #moon-board .mb-msg { text-align: center; font-size: 15px; line-height: 1.45; min-height: 46px;
      margin-top: 20px; color: #f4e6c8; }
    #moon-board .mb-msg b { color: #ffd98a; }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'moon-board'
  overlay.innerHTML = `
    <div class="mb-wrap">
      <h1>✦ The Landing Sequence ✦</h1>
      <div class="mb-sub">Put the six mission cards in the order the mission really happened</div>
      <div class="mb-bar">
        <button class="mb-btn mb-close">‹ Back to the Moon</button>
        <button class="mb-btn mb-check">CHECK</button>
      </div>
      <div class="mb-label">The mission, first to last</div>
      <div class="mb-row" data-row="slots"></div>
      <div class="mb-label" data-label="tray">Cards to place</div>
      <div class="mb-row" data-row="tray"></div>
      <div class="mb-msg"></div>
    </div>`
  document.body.appendChild(overlay)
  slotRow = overlay.querySelector('[data-row="slots"]')
  trayRow = overlay.querySelector('[data-row="tray"]')
  checkBtn = overlay.querySelector('.mb-check')
  msgEl = overlay.querySelector('.mb-msg')
  overlay.querySelector('.mb-close').addEventListener('click', () => closeMoonBoard())
  checkBtn.addEventListener('click', () => check())
  window.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') closeMoonBoard() })
}

function render() {
  slotRow.replaceChildren()
  for (let i = 0; i < N; i++) {
    const cell = document.createElement('div')
    cell.className = 'mb-cell' + (slots[i] ? ' filled' : '')
    cell.dataset.slot = String(i)
    cell.innerHTML = (slots[i] ? missionCardSVG(slots[i], 150, 200) : '<span class="mb-empty">?</span>')
      + `<span class="mb-num">${i + 1}</span>`
    cell.addEventListener('click', () => tapSlot(i))
    slotRow.appendChild(cell)
  }
  trayRow.replaceChildren()
  for (const id of tray) {
    const cell = document.createElement('div')
    cell.className = 'mb-cell filled' + (picked === id ? ' picked' : '')
    cell.dataset.card = id
    cell.innerHTML = missionCardSVG(id, 150, 200)
    cell.addEventListener('click', () => tapCard(id))
    trayRow.appendChild(cell)
  }
  // once every card is on the board the tray is empty — hide its heading rather
  // than leaving a label over a blank strip
  overlay.querySelector('[data-label="tray"]').style.display = tray.length ? '' : 'none'
  checkBtn.disabled = solved || slots.some((s) => !s)
}

function tapCard(id) {
  if (solved) return
  picked = picked === id ? null : id
  note(560, 0.06, 'triangle', 0.03)
  render()
}

function tapSlot(i) {
  if (solved) return
  if (picked) {
    // if the slot already holds a card, that one goes back to the tray
    if (slots[i]) tray.push(slots[i])
    slots[i] = picked
    tray = tray.filter((t) => t !== picked)
    picked = null
    note(680, 0.07, 'triangle', 0.035)
  } else if (slots[i]) {
    tray.push(slots[i])
    slots[i] = null
    note(320, 0.07, 'triangle', 0.03)
  }
  msgEl.textContent = ''
  render()
}

/* CHECK says how many are right, never which, and never takes a card away. */
function check() {
  if (solved || slots.some((s) => !s)) return
  let right = 0
  for (let i = 0; i < N; i++) if (slots[i] === correctIdFor(i)) right++

  if (right === N) {
    solved = true
    ;[660, 880, 1100, 1320].forEach((f, i) => note(f, 0.24, 'triangle', 0.05, i * 0.11))
    msgEl.innerHTML = '<b>That’s the mission.</b> The beacon was flashing it the whole time.'
    render()
    if (onCompleteCb) onCompleteCb()
    setTimeout(() => { if (open) closeMoonBoard() }, 2800)
    return
  }
  note(220, 0.22, 'square', 0.04)
  msgEl.innerHTML = right === 0
    ? 'None of them are in the right place yet. Have another look at the <b>beacon</b> out in the room — it keeps flashing its colours for a reason.'
    : `<b>${right}</b> of <b>${N}</b> are in the right place — but not which ones. Watch the <b>beacon</b> again, then shuffle the rest.`
  render()
  // shake the whole row: the answer is in here somewhere, not back in the tray
  requestAnimationFrame(() => {
    for (const el of slotRow.children) el.classList.add('wrong')
    setTimeout(() => { for (const el of slotRow.children) el.classList.remove('wrong') }, 480)
  })
}

export function openMoonBoard(opts = {}) {
  ensureDom()
  if (open) return
  onCompleteCb = opts.onComplete || null
  onCloseCb = opts.onClose || null
  if (!solved) {
    slots = new Array(N).fill(null)
    // shuffled, so the tray order is never itself a hint
    tray = MOON_STEPS.map((s) => s.id).sort(() => Math.random() - 0.5)
    picked = null
  }
  open = true
  overlay.classList.add('on')
  overlay.scrollTop = 0
  msgEl.textContent = ''
  render()
}

export function closeMoonBoard() {
  if (!open) return
  open = false
  overlay.classList.remove('on')
  const cb = onCloseCb
  onCloseCb = null
  if (cb) cb()
}

export const isMoonBoardSolved = () => solved

// test hook: place every card correctly, then run the real check
export function __moonSolve() {
  if (!open || solved) return false
  slots = MOON_STEPS.map((_, i) => correctIdFor(i))
  tray = []
  check()
  return true
}
// test hook: place a deliberately wrong order (last two swapped)
export function __moonSolveWrong() {
  if (!open || solved) return false
  slots = MOON_STEPS.map((_, i) => correctIdFor(i))
  ;[slots[N - 1], slots[N - 2]] = [slots[N - 2], slots[N - 1]]
  tray = []
  check()
  return true
}
