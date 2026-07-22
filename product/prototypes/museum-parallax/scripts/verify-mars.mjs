/* The Mars room — Rover Repair, and the wing's first cross-room dependency.
 *
 * The point of this room is that you cannot finish it from inside it: the
 * rover's wheel is hidden in the Solar System room, and the brush that clears
 * its solar panel is only sold at the Supply Desk. So this walks the whole
 * chain, then checks the mini-game's real question — which of three rocks is
 * the iron-rich red one — including what happens when you scan the wrong one.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-mars.mjs [url]
 */
import { chromium } from 'playwright-core'

const URL = process.argv[2] || 'http://localhost:4173/'
const fails = []
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) fails.push(name)
}

const BENIGN = [/favicon\.ico/, /Failed to load resource.*404/, /video\/success\.mp4/]
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error' && !BENIGN.some((re) => re.test(m.text()))) errors.push(`console: ${m.text()}`)
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForFunction(() => typeof window.__repairs === 'function', { timeout: 20000 })
await page.waitForTimeout(1600)

// ---- the room starts broken ----
await page.evaluate(() => window.__goScene('spacehub'))
await page.waitForTimeout(800)
await page.evaluate(() => window.__tapWorld('spacehub', 'mars'))
await page.waitForTimeout(1100)
check('tapping the MARS niche enters the room',
  (await page.evaluate(() => window.__cam().scene)) === 'mars')
const start = await page.evaluate(() => window.__repairs())
check('two repairs are waiting', start.length === 2 && start.every((r) => !r.done),
  start.map((r) => r.item).join(' + '))
check('the drive console starts dark', (await page.evaluate(() => window.__consoleLit())) === false)
check('the room is not complete', (await page.evaluate(() => window.__roomComplete('mars'))) === false)

// ---- the console refuses to drive an unrepaired rover, and says why ----
await page.evaluate(() => window.__tapWorld('mars', 'console'))
await page.waitForTimeout(500)
check('the console will not open the game while the rover is broken',
  (await page.evaluate(() => window.__roverOpen())) === false)
check('...and it explains what is still missing',
  /wheel/i.test(await page.evaluate(() => document.getElementById('toast-text').textContent)))

// ---- the wheel lives in ANOTHER room: the cross-room dependency ----
check('the wheel is NOT in the Mars room',
  (await page.evaluate(() => { window.__goScene('mars'); return window.__clueExists('roverWheel') && window.__cam().scene === 'mars' })) !== false)
await page.evaluate(() => window.__goScene('solar'))
await page.waitForTimeout(1000)
check('the wheel is hidden in the Solar System room',
  await page.evaluate(() => window.__clueExists('roverWheel')))
await page.evaluate(() => window.__tapClue('roverWheel'))
await page.waitForTimeout(1200)
check('picking up the wheel puts it in the FINDS pouch',
  await page.evaluate(() => window.__bag().includes('roverWheel')))

// ---- repair 1: the wheel ----
await page.evaluate(() => window.__goScene('mars'))
await page.waitForTimeout(1000)
check('fitting the wheel works', await page.evaluate(() => window.__useItem('roverWheel')))
await page.waitForTimeout(1400)
const afterWheel = await page.evaluate(() => window.__repairs())
check('the wheel repair is done', afterWheel.find((r) => r.item === 'roverWheel').done)
check('the panel repair is still waiting', !afterWheel.find((r) => r.item === 'solarBrush').done)
check('one repair does not light the console', (await page.evaluate(() => window.__consoleLit())) === false)
check('one repair does not complete the room', (await page.evaluate(() => window.__roomComplete('mars'))) === false)

// ---- repair 2: the brush, which only the Supply Desk sells ----
await page.evaluate(() => { window.__setCoins(40); window.__openDesk() })
await page.waitForTimeout(500)
const brush = await page.$('#supply-desk [data-item="solarBrush"]')
check('the Solar Brush is sold at the desk', !!brush)
await brush.click()
await page.waitForTimeout(400)
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(500)
check('brushing the panel works', await page.evaluate(() => window.__useItem('solarBrush')))
await page.waitForTimeout(1500)
check('both repairs are done', (await page.evaluate(() => window.__repairs())).every((r) => r.done))
check('the console lights up once the rover is whole',
  await page.evaluate(() => window.__consoleLit()))
check('repairs alone do not complete the room — the drive is still to do',
  (await page.evaluate(() => window.__roomComplete('mars'))) === false)

// ---- the drive: scanning the WRONG rock teaches, and costs only a retry ----
await page.evaluate(() => { document.getElementById('success')?.classList.add('hidden') })
await page.evaluate(() => window.__tapWorld('mars', 'console'))
await page.waitForTimeout(700)
check('a repaired rover opens Rover Route', await page.evaluate(() => window.__roverOpen()))

/* The plain is generated at random, and hazards in the second-to-last column can
   wall a rock off entirely — including the right one, which would be a dead end.
   The generator rejects such boards; re-roll a pile of them and prove it. */
const reroll = await page.evaluate(() => {
  let bad = 0
  for (let i = 0; i < 200; i++) {
    window.__roverReroll()
    if (!window.__roverPlan('right') || !window.__roverPlan('wrong')) bad++
  }
  return bad
})
check('every generated plain leaves all three rocks reachable', reroll === 0,
  `${reroll} unreachable in 200 boards`)

/* The rover drives deliberately slowly and the canvas runs on requestAnimationFrame,
   which the browser throttles when the page isn't focused — so wait for the STATE
   to settle rather than for a wall-clock guess. */
const settled = () => page.waitForFunction(() => !window.__roverDriving?.(), null, { timeout: 30000 })

let planned = await page.evaluate(() => window.__roverPlan('wrong'))
check('a route to a wrong rock can be planned', planned)
if (planned) {
  await page.evaluate(() => window.__roverGo())
  await settled()
  check('scanning the wrong rock does NOT win', (await page.evaluate(() => window.__roverOpen())) === true)
  check('...and the room is still incomplete',
    (await page.evaluate(() => window.__roomComplete('mars'))) === false)
}

// ---- the right rock finishes the exhibit ----
let drove = false
for (let attempt = 0; attempt < 6 && !drove; attempt++) {
  if (!(await page.evaluate(() => window.__roverOpen()))) {
    await page.evaluate(() => window.__tapWorld('mars', 'console'))
    await page.waitForTimeout(600)
  }
  if (await page.evaluate(() => window.__roverPlan('right'))) {
    await page.evaluate(() => window.__roverGo())
    await settled()
    drove = await page.waitForFunction(() => window.__roomComplete('mars'), null, { timeout: 8000 })
      .then(() => true).catch(() => false)
  }
}
check('driving to the iron-rich red rock completes the room', drove)
// it celebrates the scan for a couple of seconds, then closes itself
await page.waitForFunction(() => !window.__roverOpen(), null, { timeout: 8000 }).catch(() => {})
check('the game hands control back afterwards',
  (await page.evaluate(() => window.__roverOpen())) === false)

// ---- one room still doesn't finish the wing ----
check('finishing Mars does not finish the space wing',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)

check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
