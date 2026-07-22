/* =====================================================================
   SPACE SUPPLY DESK — the Space Wing's economy.

   The loop (per Gidi's spec, page 2): find space rocks scattered through the
   lobby and every space room → sell them at the desk for coins → buy the tools
   the dioramas need. It's the first system in the game where exploring one room
   pays for progress in another.

   This module owns the economy's RULES and its full-screen counter overlay.
   It does NOT own the inventory — main.js does — so the desk talks to the game
   through a small adapter passed to openSupplyDesk(). Item ART lives in art.js.

   Two rules keep it safe for a 5–10-year-old (see the mobile-game-builder
   playbook's kids-ethical economy section, and gameplay principle #4 "no dead
   ends"). Both are enforced in code, not by convention:

     1. ONLY rocks can be sold. Tools and quest items are never sellable, so a
        child can't trade away something a puzzle still needs.
     2. The rocks placed in the world are always worth MORE than every tool
        costs, with margin — auditEconomy() proves it at boot, so a future edit
        can't silently create a soft-lock.

   There is no real money here and never will be: coins are found, not bought.
   ===================================================================== */

import { spaceRockSVG, spaceToolSVG, coinSVG } from './art.js'

const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

/* ---------- the rocks you find and sell ----------
   `value` is what the desk pays. Rarer/more striking finds pay more, so a child
   learns the ranking by trading rather than by reading a table. */
export const SPACE_ROCKS = {
  lunarChip: { name: 'Lunar Chip', value: 6, art: 'lunarChip', note: 'Grey basalt from the Moon’s surface, pocked by tiny impacts.' },
  marsRock: { name: 'Mars Rock', value: 7, art: 'marsRock', note: 'Rusty red — Mars is red because its dust is full of iron oxide. Rust!' },
  meteorite: { name: 'Meteorite', value: 9, art: 'meteorite', note: 'A rock that fell to Earth. Its dark crust melted on the way down.' },
  starShard: { name: 'Star Shard', value: 10, art: 'starShard', note: 'A bright crystal shard from a museum meteor display.' },
  stardust: { name: 'Stardust Cluster', value: 12, art: 'stardust', note: 'A clump of glittering grains — the rarest thing on the shelf.' },
}

/* ---------- the tools you buy, and what each one unlocks ---------- */
export const SPACE_TOOLS = {
  planetModel: { name: 'Planet Model', price: 20, art: 'planetModel', room: 'solar', need: 'The Solar System orrery is missing a planet.' },
  solarBrush: { name: 'Solar Brush', price: 16, art: 'solarBrush', room: 'mars', need: 'The rover’s solar panel is buried in dust.' },
  missionCard: { name: 'Mission Card', price: 18, art: 'missionCard', room: 'moon', need: 'One card is missing from the landing sequence.' },
  rotateKey: { name: 'Rotate Key', price: 14, art: 'rotateKey', room: 'station', need: 'The station’s solar panels won’t turn to the Sun.' },
  mirrorPart: { name: 'Mirror Segment', price: 22, art: 'mirrorPart', room: 'webb', need: 'The telescope is one golden hexagon short.' },
}

/* ---------- rock instances ----------
   The same rock TYPE is placed in several rooms, but the inventory is keyed by
   item id (`state.has[id]` is a boolean), so six Lunar Chips sharing one id would
   mean only the first could ever be picked up. Each placed rock therefore gets an
   instance id `type@scene` — unique in the bag, but still resolvable to its type
   for art, value and naming. Tools stay single-instance and need no suffix. */
export const rockInstance = (type, scene) => `${type}@${scene}`
export const rockType = (id) => (id.includes('@') ? id.slice(0, id.indexOf('@')) : id)
export const rockOf = (id) => SPACE_ROCKS[rockType(id)]

export const isRock = (id) => !!SPACE_ROCKS[rockType(id)]
export const isTool = (id) => !!SPACE_TOOLS[id]
export const itemArt = (id, w, h) =>
  isRock(id) ? spaceRockSVG(rockOf(id).art, w, h)
    : isTool(id) ? spaceToolSVG(SPACE_TOOLS[id].art, w, h) : ''

/* ---------- coins ---------- */
let coins = 0
export const getCoins = () => coins
export function setCoins(n) {
  const prev = coins
  coins = Math.max(0, n | 0)
  renderCoinHud()
  // let the game react (HUD pop, sfx) without economy.js reaching into its DOM
  if (coins !== prev) document.dispatchEvent(new CustomEvent('coins-changed', { detail: { coins, prev } }))
}
export function addCoins(n) { setCoins(coins + n) }

/* ---------- the no-soft-lock audit ----------
   Called at boot with every rock the world actually places. A child who finds
   only some of the rocks must still be able to afford every tool, so we require
   a healthy surplus rather than a bare pass: a player who finds two thirds of
   the rocks should still finish. Returns a report; main.js warns if it fails. */
export const MIN_AFFORDABLE_FRACTION = 0.7

export function auditEconomy(placedRockIds) {
  const supply = placedRockIds.reduce((sum, id) => sum + (rockOf(id)?.value ?? 0), 0)
  const demand = Object.values(SPACE_TOOLS).reduce((sum, t) => sum + t.price, 0)
  const reachable = supply * MIN_AFFORDABLE_FRACTION
  const unknown = placedRockIds.filter((id) => !rockOf(id))
  const dupes = placedRockIds.filter((id, i) => placedRockIds.indexOf(id) !== i)
  return {
    supply, demand, ratio: demand ? +(supply / demand).toFixed(2) : Infinity,
    unknown, dupes,
    ok: reachable >= demand && !unknown.length && !dupes.length,
  }
}

/* ---------- the desk overlay ---------- */
let open = false
export const isSupplyDeskOpen = () => open

let overlay, sellCol, buyCol, coinEl, adapter = null

// the coin counter in the HUD (created by main.js; we just keep it in sync)
function renderCoinHud() {
  const el = document.getElementById('coin-count')
  if (el) el.textContent = String(coins)
  if (coinEl) coinEl.textContent = String(coins)
}

function ensureDom() {
  if (overlay) return
  const style = document.createElement('style')
  style.textContent = `
    #supply-desk { position: fixed; inset: 0; z-index: 200; display: none;
      background: radial-gradient(120% 90% at 50% 0%, #17303c 0%, #0a1820 70%, #060f14 100%);
      font-family: ${SERIF}; color: #f4e6c8; overflow: auto;
      touch-action: manipulation; user-select: none; -webkit-user-select: none; }
    #supply-desk.on { display: block; }
    #supply-desk .sd-wrap { max-width: 1100px; margin: 0 auto; padding: 18px 16px 40px; }
    #supply-desk h1 { font-size: clamp(20px, 4vw, 30px); letter-spacing: .12em; text-align: center;
      margin: 6px 0 2px; color: #e8a948; text-transform: uppercase; }
    #supply-desk .sd-sub { text-align: center; opacity: .75; font-size: 14px; margin-bottom: 14px; }
    #supply-desk .sd-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 720px) { #supply-desk .sd-cols { grid-template-columns: 1fr; } }
    #supply-desk .sd-col { background: rgba(244,230,200,0.05); border: 2px solid rgba(232,169,72,0.35);
      border-radius: 14px; padding: 12px; }
    #supply-desk .sd-col h2 { font-size: 17px; letter-spacing: .14em; text-transform: uppercase;
      color: #e8a948; margin: 2px 0 10px; text-align: center; }
    #supply-desk .sd-list { display: flex; flex-direction: column; gap: 10px; }
    /* kid-sized targets: ~2cm tall rows, generous spacing (mobile-game-builder §6) */
    #supply-desk .sd-item { display: flex; align-items: center; gap: 12px; width: 100%;
      min-height: 84px; padding: 10px 12px; border-radius: 12px; cursor: pointer; text-align: left;
      background: rgba(244,230,200,0.08); border: 2px solid rgba(232,169,72,0.4);
      color: inherit; font: inherit; transition: transform .12s ease, background .12s ease; }
    #supply-desk .sd-item:hover:not(:disabled) { background: rgba(232,169,72,0.18); transform: translateY(-2px); }
    #supply-desk .sd-item:active:not(:disabled) { transform: scale(0.97); }
    #supply-desk .sd-item:disabled { opacity: .45; cursor: default; }
    #supply-desk .sd-item.owned { opacity: .6; border-style: dashed; cursor: default; }
    #supply-desk .sd-art { flex: 0 0 54px; height: 70px; display: grid; place-items: center; }
    #supply-desk .sd-art svg { width: 100%; height: 100%; }
    #supply-desk .sd-text { flex: 1 1 auto; min-width: 0; }
    /* name on its own line — at this size a run-on name+description is the first
       thing that stops scanning for a young reader */
    #supply-desk .sd-name { display: block; font-weight: 700; font-size: 16px; margin-bottom: 3px; }
    #supply-desk .sd-why { display: block; font-size: 12.5px; opacity: .7; line-height: 1.3; }
    #supply-desk .sd-price { flex: 0 0 auto; font-weight: 700; font-size: 17px; color: #e8a948;
      display: flex; align-items: center; gap: 5px; white-space: nowrap; }
    #supply-desk .sd-price svg { width: 20px; height: 20px; }
    #supply-desk .sd-empty { opacity: .55; font-size: 14px; text-align: center; padding: 22px 8px; line-height: 1.5; }
    #supply-desk .sd-bar { display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin: 4px 0 14px; }
    #supply-desk .sd-purse { display: flex; align-items: center; gap: 8px; font-size: 20px;
      font-weight: 700; color: #e8a948; background: rgba(12,52,60,0.7);
      border: 2px solid rgba(232,169,72,0.5); border-radius: 999px; padding: 8px 18px; }
    #supply-desk .sd-purse svg { width: 26px; height: 26px; }
    #supply-desk .sd-close { background: rgba(20,52,74,0.85); color: #f4e6c8;
      border: 2px solid rgba(232,169,72,0.5); font: 600 15px ${SERIF};
      padding: 10px 20px; border-radius: 999px; cursor: pointer; letter-spacing: .04em; min-height: 44px; }
    #supply-desk .sd-close:hover { background: rgba(31,115,176,0.92); }
    #supply-desk .sd-flash { position: fixed; left: 50%; top: 16%; transform: translateX(-50%);
      background: rgba(12,52,60,0.95); border: 2px solid #e8a948; color: #f4e6c8;
      padding: 10px 20px; border-radius: 999px; font-size: 15px; pointer-events: none;
      opacity: 0; transition: opacity .2s ease, transform .2s ease; z-index: 3; }
    #supply-desk .sd-flash.on { opacity: 1; transform: translateX(-50%) translateY(-8px); }
  `
  document.head.appendChild(style)

  overlay = document.createElement('div')
  overlay.id = 'supply-desk'
  overlay.innerHTML = `
    <div class="sd-wrap">
      <h1>✦ Space Supply Desk ✦</h1>
      <div class="sd-sub">Sell the rocks you’ve found · buy the tools the exhibits need</div>
      <div class="sd-bar">
        <div class="sd-purse">${coinSVG(26)}<span class="sd-coins">0</span></div>
        <button class="sd-close">‹ Back to the wing</button>
      </div>
      <div class="sd-cols">
        <div class="sd-col"><h2>Sell rocks</h2><div class="sd-list" data-col="sell"></div></div>
        <div class="sd-col"><h2>Buy tools</h2><div class="sd-list" data-col="buy"></div></div>
      </div>
    </div>
    <div class="sd-flash"></div>`
  document.body.appendChild(overlay)

  sellCol = overlay.querySelector('[data-col="sell"]')
  buyCol = overlay.querySelector('[data-col="buy"]')
  coinEl = overlay.querySelector('.sd-coins')
  overlay.querySelector('.sd-close').addEventListener('click', () => closeSupplyDesk())
  window.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') closeSupplyDesk() })
}

let flashTimer = 0
function flash(msg) {
  const el = overlay.querySelector('.sd-flash')
  el.textContent = msg
  el.classList.add('on')
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => el.classList.remove('on'), 1600)
}

function row({ id, art, name, why, amount, disabled, owned, onClick }) {
  const btn = document.createElement('button')
  btn.className = 'sd-item' + (owned ? ' owned' : '')
  btn.dataset.item = id
  btn.disabled = !!disabled || !!owned
  btn.innerHTML = `
    <span class="sd-art">${art}</span>
    <span class="sd-text">
      <span class="sd-name">${name}</span>
      <span class="sd-why">${why}</span>
    </span>
    <span class="sd-price">${owned ? '✓' : amount}${owned ? '' : coinSVG(20)}</span>`
  if (!btn.disabled) btn.addEventListener('click', onClick)
  return btn
}

function render() {
  renderCoinHud()

  // ---- SELL: only rocks currently in the inventory. Nothing else is sellable,
  // so a needed tool can never be traded away by mistake.
  const rocks = adapter.ownedRocks().filter(isRock)
  sellCol.replaceChildren()
  if (!rocks.length) {
    sellCol.innerHTML = '<div class="sd-empty">No rocks yet.<br>Space rocks are hidden all over the wing — go and look!</div>'
  } else {
    for (const id of rocks) {
      const r = rockOf(id)
      sellCol.appendChild(row({
        id, art: spaceRockSVG(r.art, 54, 70), name: r.name, why: r.note, amount: r.value,
        onClick: () => {
          adapter.onSell(id)
          addCoins(r.value)
          flash(`Sold the ${r.name} — +${r.value} coins!`)
          render()
        },
      }))
    }
  }

  // ---- BUY: every tool, always visible. A child can see what's coming and what
  // it costs — the desk is also the wing's to-do list. Nothing here is a wasted
  // purchase: all five tools are needed, so there's no wrong choice to punish.
  buyCol.replaceChildren()
  for (const [id, t] of Object.entries(SPACE_TOOLS)) {
    const owned = adapter.owns(id)
    const afford = coins >= t.price
    buyCol.appendChild(row({
      id, art: spaceToolSVG(t.art, 54, 70), name: t.name, why: owned ? 'Already in your bag.' : t.need,
      amount: t.price, owned, disabled: !afford,
      onClick: () => {
        // hand it over FIRST — if the bag is full the purchase must not happen,
        // or the child pays and gets nothing (a soft-lock we'd never see in test)
        if (adapter.onBuy(id) === false) { flash('Your bag is full — use something first.'); return }
        addCoins(-t.price)
        flash(`Bought the ${t.name}!`)
        render()
      },
    }))
  }
}

/* adapter: {
     ownedRocks(): string[]   — rock ids currently in the inventory
     owns(id): boolean        — does the player already hold this item?
     onSell(rockId)           — remove it from the inventory (main.js owns the DOM)
     onBuy(toolId): boolean   — grant it; return false if it couldn't be given
                                (bag full), and the sale is called off
     onClose()                — the player left the desk
   } */
export function openSupplyDesk(a) {
  if (open) return
  ensureDom()
  adapter = a
  open = true
  overlay.classList.add('on')
  overlay.scrollTop = 0
  render()
}

export function closeSupplyDesk() {
  if (!open) return
  open = false
  overlay.classList.remove('on')
  const cb = adapter?.onClose
  adapter = null
  if (cb) cb()
}

// re-render if the inventory changed while the desk is open (e.g. a hint grants
// an item); harmless when closed
export function refreshSupplyDesk() { if (open) render() }
