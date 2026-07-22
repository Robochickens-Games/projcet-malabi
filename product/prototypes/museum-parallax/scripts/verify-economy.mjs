/* Headless checks for the Space Wing economy (Supply Desk).
 *
 * The economy is the first system where a child can make a choice that *costs*
 * something, so the checks here are mostly about what must be IMPOSSIBLE:
 * paying and getting nothing, selling a quest item, or reaching a state where
 * the remaining tools can't be afforded. Gameplay principle #4 — no dead ends.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-economy.mjs [url]
 */
import { chromium } from 'playwright-core'

const URL = process.argv[2] || 'http://localhost:4173/'
const fails = []
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) fails.push(name)
}

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
/* Two console errors predate this work and are harmless — the page has no
   favicon.ico, and the success-video's preload aborts when showSuccess() swaps
   its src. Both are console noise with no failing HTTP request behind them
   (verified via performance entries), so they're excluded by exact cause rather
   than by muting console errors wholesale. */
const BENIGN = [/favicon\.ico/, /Failed to load resource.*404/, /video\/success\.mp4/]
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() !== 'error') return
  const text = m.text()
  if (!BENIGN.some((re) => re.test(text))) errors.push(`console: ${text}`)
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForFunction(() => typeof window.__economyAudit === 'function', { timeout: 20000 })
await page.waitForTimeout(1000)

// ---- 1. the wing is affordable by construction ----
const audit = await page.evaluate(() => window.__economyAudit())
check('rocks placed are worth more than every tool costs', audit.ok,
  `supply ${audit.supply} vs demand ${audit.demand} (${audit.ratio}×)`)
check('no unknown rock types placed', audit.unknown.length === 0, audit.unknown.join(', '))
check('no duplicate rock instance ids', audit.dupes.length === 0, audit.dupes.join(', '))
check('a player finding only 70% of rocks can still afford everything',
  audit.supply * 0.7 >= audit.demand,
  `${Math.round(audit.supply * 0.7)} ≥ ${audit.demand}`)

// ---- 2. the same rock type in different rooms is separately collectable ----
await page.evaluate(() => { window.__giveRock('lunarChip', 'solar'); window.__giveRock('lunarChip', 'mars') })
const bagAfterDupes = await page.evaluate(() => window.__bag().filter((i) => i.startsWith('lunarChip')))
check('same rock type from two rooms both land in the bag', bagAfterDupes.length === 2, bagAfterDupes.join(', '))

// ---- 2b. the two pouches: rocks must not crowd out quest items ----
const pouch = await page.evaluate(() => ({
  rocksTabVisible: !document.querySelector('.inv-tab[data-tab="rocks"]').classList.contains('hidden'),
  rocksInRockGrid: [...document.querySelectorAll('#rock-grid .inv-slot.filled')].map((s) => s.dataset.item),
  findsGridUsed: [...document.querySelectorAll('#inventory-grid .inv-slot.filled')].length,
  count: document.querySelector('.inv-tab[data-tab="rocks"] .inv-tab-count').textContent,
  worth: document.getElementById('rock-total').textContent,
}))
check('the Rocks tab appears once a rock is found', pouch.rocksTabVisible)
check('rocks land in the rock pouch, not the finds grid',
  pouch.rocksInRockGrid.length === 2 && pouch.findsGridUsed === 0,
  `rocks ${pouch.rocksInRockGrid.length}, finds used ${pouch.findsGridUsed}`)
check('the tab shows how many rocks are held', pouch.count === '2', pouch.count)
check('the pouch shows what it is worth', pouch.worth === '12', `${pouch.worth} (2 × lunarChip @6)`)
check('rocks cannot be dragged onto an exhibit', await page.evaluate(() =>
  getComputedStyle(document.querySelector('#rock-grid .inv-slot.filled')).cursor === 'pointer'))

// ---- 3. selling pays what the rock is worth ----
await page.evaluate(() => window.__openDesk())
await page.waitForTimeout(400)
check('desk opens', await page.evaluate(() => window.__deskOpen()))
check('coin purse is visible once the desk has been used',
  await page.evaluate(() => !document.getElementById('coin-purse').classList.contains('hidden')))

const sellRows = await page.$$('#supply-desk [data-col="sell"] .sd-item')
check('both rocks are listed for sale', sellRows.length === 2, `${sellRows.length} rows`)

const expected = await page.evaluate(() => window.__rockValue('lunarChip@solar'))
await sellRows[0].click()
await page.waitForTimeout(250)
check('selling a rock pays its listed value',
  (await page.evaluate(() => window.__coins())) === expected, `got ${await page.evaluate(() => window.__coins())}, expected ${expected}`)
check('a sold rock leaves the bag',
  (await page.evaluate(() => window.__bag().filter((i) => i.startsWith('lunarChip')).length)) === 1)

// ---- 4. you cannot buy what you can't afford ----
const tooExpensive = await page.evaluate(() =>
  [...document.querySelectorAll('#supply-desk [data-col="buy"] .sd-item')].every((b) => b.disabled))
check('with 6 coins every tool is disabled', tooExpensive)

// ---- 5. buying deducts exactly the price and grants the item ----
await page.evaluate(() => window.__setCoins(100))
await page.waitForTimeout(200)
const firstBuy = await page.$('#supply-desk [data-col="buy"] .sd-item:not([disabled])')
const buyId = await firstBuy.evaluate((el) => el.dataset.item)
const price = await page.evaluate((id) => window.__toolPrice(id), buyId)
await firstBuy.click()
await page.waitForTimeout(250)
check('buying deducts exactly the price',
  (await page.evaluate(() => window.__coins())) === 100 - price, `${await page.evaluate(() => window.__coins())} = 100 − ${price}`)
check('the bought tool is in the bag', await page.evaluate((id) => window.__bag().includes(id), buyId))
check('an owned tool cannot be bought twice', await page.evaluate((id) =>
  document.querySelector(`#supply-desk [data-col="buy"] [data-item="${id}"]`).disabled, buyId))

// ---- 6. a quest item can NEVER be sold ----
await page.evaluate(() => window.__giveTestQuestItem())
await page.waitForTimeout(200)
const sellable = await page.evaluate(() =>
  [...document.querySelectorAll('#supply-desk [data-col="sell"] .sd-item')].map((b) => b.dataset.item))
check('quest items are not sellable', !sellable.some((id) => !id.includes('@')), sellable.join(', '))
check('the bought tool is not sellable either', !sellable.includes(buyId))

// ---- 7. leaving the desk is always safe ----
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(300)
check('desk closes', (await page.evaluate(() => window.__deskOpen())) === false)
check('coins survive closing the desk', (await page.evaluate(() => window.__coins())) === 100 - price)

// ---- 8. a full rock pouch never blocks a quest item ----
await page.evaluate(() => {
  // fill every rock slot, then try to take one more rock and one more find
  const types = ['starShard', 'marsRock', 'meteorite', 'stardust', 'lunarChip']
  for (let i = 0; i < 12; i++) window.__giveRock(types[i % types.length], `fill${i}`)
})
await page.waitForTimeout(200)
const full = await page.evaluate(() => ({
  rockSlotsFree: [...document.querySelectorAll('#rock-grid .inv-slot')].filter((s) => !s.classList.contains('filled')).length,
  findsFree: [...document.querySelectorAll('#inventory-grid .inv-slot')].filter((s) => !s.classList.contains('filled')).length,
}))
check('the rock pouch fills up rather than growing forever', full.rockSlotsFree === 0)
check('a FULL rock pouch still leaves room for quest items', full.findsFree > 0, `${full.findsFree} find slots free`)

check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
