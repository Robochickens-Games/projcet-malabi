/* The Space Station room — Fix the Airlock, then the spacewalk.
 *
 * Two repairs of different kinds (a fetched item and a bought tool), then a
 * mini-game. The accuracy checks here matter more than usual: the spec called
 * the tether an "oxygen hose", and a spacewalker's air does NOT come from the
 * ship. This asserts the corrected fact actually reached the player.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-station.mjs [url]
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
await page.waitForFunction(() => typeof window.__stationRepairs === 'function', { timeout: 20000 })
await page.waitForTimeout(1900)

// ---- the room starts broken ----
await page.evaluate(() => window.__goScene('spacehub'))
await page.waitForTimeout(800)
await page.evaluate(() => window.__tapWorld('spacehub', 'station'))
await page.waitForTimeout(1100)
check('tapping the SPACE STATION niche enters the room',
  (await page.evaluate(() => window.__cam().scene)) === 'station')
const start = await page.evaluate(() => window.__stationRepairs())
check('two repairs are waiting', start.length === 2 && start.every((r) => !r.done),
  start.map((r) => r.item).join(' + '))
check('the solar array starts turned away from the Sun',
  (await page.evaluate(() => window.__wingTurned())) === false)
check('the spacewalk console starts dark', (await page.evaluate(() => window.__stationConsoleLit())) === false)

await page.evaluate(() => window.__tapWorld('station', 'hatch'))
await page.waitForTimeout(500)
check('the console will not suit you up while the airlock is broken',
  (await page.evaluate(() => window.__spacewalkOpen())) === false)
check('...and it names what is missing',
  /safety tether/i.test(await page.evaluate(() => document.getElementById('toast-text').textContent)))

// ---- repair 1: the tether, fetched from the MOON room ----
check('the tether is NOT in the station room',
  (await page.evaluate(() => window.__bag().includes('safetyTether'))) === false)
await page.evaluate(() => window.__goScene('moon'))
await page.waitForTimeout(1000)
check('the safety tether is hidden in the Moon room (cross-room)',
  await page.evaluate(() => window.__clueExists('safetyTether')))
await page.evaluate(() => window.__tapClue('safetyTether'))
await page.waitForTimeout(1100)
check('picking up the tether puts it in the FINDS pouch',
  await page.evaluate(() => window.__bag().includes('safetyTether')))

await page.evaluate(() => window.__goScene('station'))
await page.waitForTimeout(1000)
check('clipping the tether on works', await page.evaluate(() => window.__useItem('safetyTether')))
await page.waitForTimeout(1400)
check('one repair does not light the console',
  (await page.evaluate(() => window.__stationConsoleLit())) === false)

// ---- repair 2: the Rotate Key, bought at the desk ----
await page.evaluate(() => { window.__setCoins(40); window.__openDesk() })
await page.waitForTimeout(500)
const key = await page.$('#supply-desk [data-item="rotateKey"]')
check('the Rotate Key is sold at the desk', !!key)
await key.click()
await page.waitForTimeout(400)
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(500)
check('using the key turns the array', await page.evaluate(() => window.__useItem('rotateKey')))
await page.waitForTimeout(1800)
check('the array now faces the Sun', await page.evaluate(() => window.__wingTurned()))
check('both repairs done', (await page.evaluate(() => window.__stationRepairs())).every((r) => r.done))
check('the spacewalk console lights up', await page.evaluate(() => window.__stationConsoleLit()))
check('repairs alone do not complete the room',
  (await page.evaluate(() => window.__roomComplete('station'))) === false)

// ---- the spacewalk ----
await page.evaluate(() => { document.getElementById('success')?.classList.add('hidden') })
await page.evaluate(() => window.__tapWorld('station', 'hatch'))
await page.waitForTimeout(700)
check('a fixed airlock opens Spacewalk Drift', await page.evaluate(() => window.__spacewalkOpen()))

const s0 = await page.evaluate(() => window.__spacewalkState())
check('three tools are floating out there', s0.total === 3 && s0.taken === 0)

// reaching the hatch WITHOUT the tools must not finish it
await page.evaluate(() => window.__spacewalkToHatch())
await page.waitForTimeout(1200)
check('the hatch will not open without all three tools',
  (await page.evaluate(() => window.__spacewalkState().won)) === false)
check('...and you are not stranded — the run simply comes round again',
  (await page.evaluate(() => window.__spacewalkOpen())) === true)

/* The tether must make drifting away impossible — so actually HOLD the thruster
   down for a long time and check the limit holds. (An earlier version of this
   check just waited: with no thrust the astronaut sits at the rail, so it proved
   nothing at all.) */
await page.mouse.move(640, 500)
await page.mouse.down()
await page.waitForTimeout(3500)          // far longer than it takes to hit the limit
const held = await page.evaluate(() => window.__spacewalkState())
await page.mouse.up()
check('holding the thruster actually moves the astronaut', Math.abs(held.y) > 20,
  `|y| ${Math.round(Math.abs(held.y))}`)
check('the tether never lets the astronaut past its limit',
  Math.abs(held.y) <= held.reach + 1, `|y| ${Math.round(Math.abs(held.y))} ≤ ${held.reach}`)
await page.waitForTimeout(900)
check('letting go draws the astronaut back toward the handrail',
  Math.abs((await page.evaluate(() => window.__spacewalkState())).y) < Math.abs(held.y))

await page.evaluate(() => { window.__spacewalkGrabAll(); window.__spacewalkToHatch() })
await page.waitForFunction(() => !window.__spacewalkOpen(), null, { timeout: 20000 })
await page.waitForTimeout(700)
check('collecting all three and reaching the hatch completes the room',
  await page.evaluate(() => window.__roomComplete('station')))

// ---- the corrected science ----
const atlas = await page.evaluate(() => {
  window.__openCatalogSection('station')
  return document.getElementById('catalog-list').textContent
})
check('the Atlas has a station section', /Space Station/i.test(atlas))
check('...it gives the real altitude and orbit time', /400 km/.test(atlas) && /90 minutes/.test(atlas))
check('...it says air comes from the SUIT, not a hose to the ship',
  /backpack on the suit/i.test(atlas) && /not from a hose/i.test(atlas))
check('...it never calls the tether an oxygen hose', !/oxygen hose/i.test(atlas))
check('...it explains floating as falling, not "no gravity"',
  /falling/i.test(atlas) && /no gravity/i.test(atlas))
check('...it mentions the SAFER backup jetpack', /SAFER/.test(atlas))

check('finishing the Station does not finish the wing',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)
check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
