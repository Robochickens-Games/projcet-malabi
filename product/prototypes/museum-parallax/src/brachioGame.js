// "Brachio Run" mini-game launcher for the Brachiosaurus room.
//
// Mirrors the pteroGame.js pattern: a self-contained full-screen DOM overlay with
// open / close / isOpen, no Pixi coupling. The actual runner is the low-poly Three.js
// engine from the sibling ../brachio-runner prototype — we reuse its mountBrachioRunner
// entry verbatim (single source of truth; see vite.config.js for the three alias +
// fs.allow that make the cross-folder import resolve in dev and build).

import { mountBrachioRunner } from '../../brachio-runner/src/runner.js'

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

let overlay = null, stage = null, closeBtn = null
let open = false
let runner = null
let onCloseCb = null

export const isBrachioGameOpen = () => open

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #brachio-game { position: fixed; inset: 0; z-index: 200; background: #8fd3ff;
      touch-action: none; user-select: none; -webkit-user-select: none; display: none; }
    #brachio-game.on { display: block; }
    #brachio-game .bg-stage { position: absolute; inset: 0; }
    #brachio-game .bg-close { position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      z-index: 5; background: rgba(20,52,30,0.78); color: #fff; border: 1.5px solid rgba(255,255,255,0.6);
      font: 600 14px ${SERIF}; padding: 7px 16px; border-radius: 999px; cursor: pointer; letter-spacing: .03em; }
    #brachio-game .bg-close:hover { background: rgba(40,110,50,0.92); }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'brachio-game'
  stage = document.createElement('div')
  stage.className = 'bg-stage'
  closeBtn = document.createElement('button')
  closeBtn.className = 'bg-close'
  closeBtn.textContent = '‹ Back to the trail'
  overlay.append(stage, closeBtn)
  document.body.appendChild(overlay)

  // close button sits above the runner's own HUD
  closeBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation() })
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeBrachioGame() })
}

export function openBrachioGame(opts = {}) {
  if (open) return
  ensureDom()
  onCloseCb = opts.onClose || null
  open = true
  overlay.classList.add('on')
  // fresh game each open; Esc inside the runner also closes back to the room
  runner = mountBrachioRunner(stage, {
    onExit: closeBrachioGame,
    surviveSeconds: opts.surviveSeconds,
    onSurvive: opts.onSurvive,
  })
}

export function closeBrachioGame() {
  if (!open) return
  open = false
  overlay.classList.remove('on')
  if (runner) { runner.dispose(); runner = null }
  if (onCloseCb) { const cb = onCloseCb; onCloseCb = null; cb() }
}
