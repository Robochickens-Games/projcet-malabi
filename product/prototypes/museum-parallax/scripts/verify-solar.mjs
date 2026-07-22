/* The Solar System room, played the way a child would.
 *
 * The room's point is that the three missing planets come from three DIFFERENT
 * places — one found by exploring, one bought at the desk, one won in a game —
 * so this walks all three and then checks the puzzle's own rules: right ring
 * locks, wrong ring is free, and the science it teaches is actually correct.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-solar.mjs [url]
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
await page.waitForFunction(() => typeof window.__sockets === 'function', { timeout: 20000 })
await page.waitForTimeout(1500)

// ---- the room is part of the wing and reachable from the hall ----
check('solar is a room of the space wing',
  (await page.evaluate(() => window.__wingRooms('space'))).includes('solar'))
await page.evaluate(() => window.__goScene('spacehub'))
await page.waitForTimeout(900)
await page.evaluate(() => window.__tapWorld('spacehub', 'solar'))
await page.waitForTimeout(1100)
check('tapping the SOLAR SYSTEM niche enters the room',
  (await page.evaluate(() => window.__cam().scene)) === 'solar',
  await page.evaluate(() => window.__cam().scene))

// ---- the puzzle's shape: three empty rings, at 2 / 4 / 6 ----
const sockets = await page.evaluate(() => window.__sockets())
check('three rings start empty', Object.keys(sockets).length === 3, Object.keys(sockets).join(', '))
check('the empty rings are 2, 4 and 6',
  [sockets.venus?.order, sockets.mars?.order, sockets.saturn?.order].join(',') === '2,4,6',
  [sockets.venus?.order, sockets.mars?.order, sockets.saturn?.order].join(','))
check('none is solved yet', Object.values(sockets).every((s) => !s.done))
check('the room is not complete', (await page.evaluate(() => window.__roomComplete('solar'))) === false)

// ---- the Star Atlas carries the clues, and never names a planet ----
const atlasText = await page.evaluate(() => {
  window.__openCatalogSection('planets')
  return document.getElementById('catalog-list').textContent
})
check('the Star Atlas opens', /Three rings are empty/.test(atlasText))
for (const [what, re] of [['red → fourth', /rusty red.*fourth/is], ['rings → sixth', /bright rings.*sixth/is], ['hottest → second', /hottest.*second/is]]) {
  check(`the Atlas gives the clue: ${what}`, re.test(atlasText))
}
const clueBlock = atlasText.slice(0, atlasText.indexOf('Mercury'))
check('the clues describe traits without naming the planet',
  !/Venus|Mars|Saturn/.test(clueBlock), clueBlock.match(/Venus|Mars|Saturn/)?.[0] ?? '')
check('the Atlas admits the model is not to scale', /Not to scale/i.test(atlasText))
check('the Atlas teaches WHY Venus is hottest', /clouds trap the heat/i.test(atlasText))

// ---- source 1: the Mars model is findable in the room ----
check('a Mars model is hidden in the room', await page.evaluate(() => window.__clueExists('planet:mars')))
await page.evaluate(() => window.__tapClue('planet:mars'))
await page.waitForTimeout(1200)
check('picking it up puts Mars in the FINDS pouch',
  await page.evaluate(() => window.__bag().includes('planet:mars')
    && [...document.querySelectorAll('#inventory-grid .inv-slot.filled')].some((s) => s.dataset.item === 'planet:mars')))

// ---- the wrong ring costs nothing ----
check('Mars on the WRONG ring is refused',
  (await page.evaluate(() => window.__dropPlanet('mars', 'saturn'))) === false)
check('...and Mars is still in the bag afterwards',
  await page.evaluate(() => window.__bag().includes('planet:mars')))
check('...and that ring is still empty',
  (await page.evaluate(() => window.__sockets())).saturn.done === false)

// ---- the right ring locks it in ----
check('Mars on the FOURTH ring is accepted',
  (await page.evaluate(() => window.__dropPlanet('mars', 'mars'))) === true)
await page.waitForTimeout(400)
check('...Mars leaves the bag once mounted',
  !(await page.evaluate(() => window.__bag().includes('planet:mars'))))
check('...and the ring reads as solved', (await page.evaluate(() => window.__sockets())).mars.done === true)

// ---- source 2: Saturn is bought at the Supply Desk ----
await page.evaluate(() => { window.__setCoins(60); window.__openDesk() })
await page.waitForTimeout(500)
const buyBtn = await page.$('#supply-desk [data-item="planetModel"]')
check('the Planet Model is on the desk shelf', !!buyBtn)
check('the shelf label does not give the answer away',
  !/saturn/i.test(await page.evaluate(() => document.querySelector('#supply-desk [data-item="planetModel"]').textContent)))
await buyBtn.click()
await page.waitForTimeout(400)
check('buying the Planet Model puts a SATURN model in the bag',
  await page.evaluate(() => window.__bag().includes('planet:saturn')))
check('...and it cannot be bought twice',
  await page.evaluate(() => document.querySelector('#supply-desk [data-item="planetModel"]').disabled))
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(400)
check('Saturn on the SIXTH ring is accepted',
  (await page.evaluate(() => window.__dropPlanet('saturn', 'saturn'))) === true)

// ---- source 3: Venus is won in Orbit Balance ----
await page.evaluate(() => window.__tapWorld('solar', 'orbitgame'))
await page.waitForTimeout(600)
check('the ORBIT BALANCE console opens the mini-game', await page.evaluate(() => window.__orbitOpen()))
await page.evaluate(() => window.__winOrbit())
await page.waitForTimeout(2600)   // the game celebrates, then closes itself
check('winning closes the game and hands back control',
  (await page.evaluate(() => window.__orbitOpen())) === false)
check('winning grants the VENUS model', await page.evaluate(() => window.__bag().includes('planet:venus')))

// ---- the last planet finishes the exhibit ----
check('Venus on the SECOND ring is accepted',
  (await page.evaluate(() => window.__dropPlanet('venus', 'venus'))) === true)
await page.waitForTimeout(1600)
check('every ring is now filled',
  Object.values(await page.evaluate(() => window.__sockets())).every((s) => s.done))
check('the room is complete', (await page.evaluate(() => window.__roomComplete('solar'))) === true)
check('the success card celebrates the exhibit',
  await page.evaluate(() => !document.getElementById('success').classList.contains('hidden')))
check('the success text names the correct planet order',
  /Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune/.test(
    await page.evaluate(() => document.getElementById('success-text').textContent)))
check('the success text keeps the Venus aha',
  /hottest.*Venus/is.test(await page.evaluate(() => document.getElementById('success-text').textContent)))

// ---- but the WING is not done: four rooms are still missing ----
check('finishing one room does not finish the wing',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)

check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
