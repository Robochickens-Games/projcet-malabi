// Self-contained DOM HUD. Builds its own markup + CSS inside a given root element
// (so the runner can be mounted anywhere — standalone page, or an overlay inside the
// museum prototype — with no reliance on a specific index.html). The game pushes
// numbers here; this file owns no game logic. CSS is scoped under `.bhud`.

const LEAF_PIP = `<svg class="bhud-pip" viewBox="0 0 20 22"><path d="M10 1C4 4 2 12 4 18c1 2 3 3 6 3s5-1 6-3c2-6 0-14-6-17z" fill="#7cc24a" stroke="#356016" stroke-width="1.4"/><path d="M10 4v15" stroke="#356016" stroke-width="1.2" fill="none"/></svg>`

const CSS = `
.bhud { position: absolute; inset: 0; pointer-events: none; color: #f3f7ee;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
.bhud .pill { background: rgba(20,32,18,.55); border: 1.5px solid rgba(255,255,255,.18);
  border-radius: 14px; backdrop-filter: blur(3px); box-shadow: 0 4px 14px rgba(0,0,0,.25);
  text-shadow: 0 2px 4px rgba(0,0,0,.45); }
.bhud-lives { position: absolute; top: 14px; left: 14px; display: flex; gap: 7px; padding: 9px 12px; }
.bhud-pip { width: 20px; height: 22px; transition: transform .25s, opacity .25s;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.35)); }
.bhud-pip.spent { opacity: .22; transform: scale(.8); }
.bhud-meter { position: absolute; top: 92px; left: 18px; width: 26px; height: 190px;
  border-radius: 16px; overflow: hidden; padding: 4px; }
.bhud-meter .fill { position: absolute; left: 4px; right: 4px; bottom: 4px; border-radius: 12px;
  background: linear-gradient(180deg, #7cc24a, #4e8a2a); transition: height .18s ease-out; }
.bhud-scorebox { position: absolute; top: 14px; right: 14px; text-align: right; padding: 9px 16px; }
.bhud-mult { font-size: 13px; font-weight: 700; opacity: .85; letter-spacing: .5px; }
.bhud-score { font-size: 30px; font-weight: 800; line-height: 1; margin-top: 2px; font-variant-numeric: tabular-nums; }
.bhud-dist { position: absolute; top: 86px; right: 14px; padding: 7px 14px; font-weight: 700;
  font-size: 15px; font-variant-numeric: tabular-nums; }
.bhud-hint { position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
  padding: 8px 16px; font-size: 13px; font-weight: 600; opacity: .9; white-space: nowrap; }
.bhud-modal { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at center, rgba(10,24,8,.35), rgba(10,24,8,.7));
  pointer-events: auto; cursor: pointer; transition: opacity .25s; }
.bhud-modal.hidden { opacity: 0; pointer-events: none; }
.bhud-card { background: rgba(20,32,18,.55); border: 1.5px solid rgba(255,255,255,.18); border-radius: 22px;
  padding: 34px 40px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,.4); backdrop-filter: blur(4px); max-width: 86vw; }
.bhud-card h1 { font-size: 30px; font-weight: 800; letter-spacing: .5px; text-shadow: 0 2px 6px rgba(0,0,0,.45); margin: 0; }
.bhud-card p { margin: 12px 0 0; font-size: 15px; line-height: 1.5; opacity: .92; }
.bhud-cta { margin-top: 22px; display: inline-block; padding: 12px 26px; border-radius: 14px;
  background: linear-gradient(180deg, #7cc24a, #4e8a2a); font-weight: 800; font-size: 16px;
  box-shadow: 0 5px 0 #356016, 0 9px 16px rgba(0,0,0,.3); }
.bhud-keys { margin-top: 16px; font-size: 12.5px; opacity: .72; line-height: 1.7; }
.bhud kbd { display: inline-block; padding: 1px 7px; border-radius: 6px; font-size: 11px; font-weight: 700;
  background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.22); }
`

const MARKUP = `
  <div class="bhud-lives pill"></div>
  <div class="bhud-meter pill"><div class="fill" style="height:0%"></div></div>
  <div class="bhud-scorebox pill"><div class="bhud-mult">x1</div><div class="bhud-score">0</div></div>
  <div class="bhud-dist pill"><span class="bhud-dist-val">0</span>m <span style="opacity:.8">🏁</span></div>
  <div class="bhud-hint pill">Swipe or ← → to weave between the treetops</div>
  <div class="bhud-modal">
    <div class="bhud-card">
      <h1 class="bhud-title">Brachio Run</h1>
      <p class="bhud-body">Weave the treetops. Stretch your long neck for leaves &amp; berries, steer around the boughs.</p>
      <div class="bhud-cta">Tap to start ▸</div>
      <div class="bhud-keys"><kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> weave between lanes ·
        <kbd>Esc</kbd> exit</div>
    </div>
  </div>
`

export function createHud(root) {
  if (!document.getElementById('bhud-style')) {
    const style = document.createElement('style')
    style.id = 'bhud-style'
    style.textContent = CSS
    document.head.appendChild(style)
  }
  const el = document.createElement('div')
  el.className = 'bhud'
  el.innerHTML = MARKUP
  root.appendChild(el)

  const q = (sel) => el.querySelector(sel)
  const livesEl = q('.bhud-lives')
  const meterFill = q('.bhud-meter .fill')
  const scoreEl = q('.bhud-score')
  const multEl = q('.bhud-mult')
  const distEl = q('.bhud-dist-val')
  const modal = q('.bhud-modal')
  const titleEl = q('.bhud-title')
  const bodyEl = q('.bhud-body')
  const ctaEl = q('.bhud-cta')
  const hint = q('.bhud-hint')

  return {
    root: el,
    setLives(n, max) {
      livesEl.innerHTML = ''
      for (let i = 0; i < max; i++) {
        const wrap = document.createElement('div')
        wrap.innerHTML = LEAF_PIP
        const pip = wrap.firstChild
        if (i >= n) pip.classList.add('spent')
        livesEl.appendChild(pip)
      }
    },
    setScore(n) { scoreEl.textContent = n.toLocaleString('en-US') },
    setMult(m) { multEl.textContent = 'x' + m },
    setDistance(m) { distEl.textContent = Math.floor(m).toLocaleString('en-US') },
    setMeter(pct) { meterFill.style.height = Math.max(0, Math.min(100, pct)) + '%' },

    // attach a tap-to-start handler to the modal (it sits above the canvas, so it
    // would otherwise swallow the tap before the canvas input sees it).
    onStartTap(cb) { modal.addEventListener('pointerdown', cb) },

    showStart() {
      modal.classList.remove('hidden')
      titleEl.textContent = 'Brachio Run'
      bodyEl.textContent = 'Weave the treetops. Stretch your long neck for leaves & berries, steer around the boughs.'
      ctaEl.textContent = 'Tap to start ▸'
      hint.style.opacity = ''
    },
    showGameOver(score, dist, best) {
      modal.classList.remove('hidden')
      titleEl.textContent = 'Out of leaves!'
      bodyEl.innerHTML =
        `Score <b>${score.toLocaleString('en-US')}</b> · ${Math.floor(dist)}m` +
        (best ? `<br><span style="opacity:.7">Best ${best.toLocaleString('en-US')}</span>` : '')
      ctaEl.textContent = 'Tap to run again ▸'
    },
    hideModal() { modal.classList.add('hidden') },
    fadeHint() { hint.style.transition = 'opacity .6s'; hint.style.opacity = '0' },
  }
}
