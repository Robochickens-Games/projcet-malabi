/* The James Webb room — Align the Golden Mirrors + Focus the Stars — and the
 * SPACE WING FINALE, which this room is the last piece of.
 *
 * Three challenges deep (two repairs, the alignment, then the focus), so this
 * also checks that each stage genuinely gates the next rather than merely being
 * listed. Then it finishes the whole wing and asserts the finale fires exactly
 * once, stamps the lobby door, and leaves the Dinosaur Wing alone.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-webb.mjs [url]
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
await page.waitForFunction(() => typeof window.__webbTiles === 'function', { timeout: 20000 })
await page.waitForTimeout(2100)

// ---- the mirror starts incomplete ----
await page.evaluate(() => window.__goScene('spacehub'))
await page.waitForTimeout(800)
await page.evaluate(() => window.__tapWorld('spacehub', 'webb'))
await page.waitForTimeout(1100)
check('tapping the JAMES WEBB niche enters the room',
  (await page.evaluate(() => window.__cam().scene)) === 'webb')

const tiles = await page.evaluate(() => window.__webbTiles())
check('the mirror has exactly 18 segments', tiles.length === 18, `${tiles.length}`)
check('one segment is missing to begin with',
  tiles.filter((t) => t.visible).length === 17, `${tiles.filter((t) => t.visible).length} fitted`)
check('seven segments start turned the wrong way',
  tiles.filter((t) => t.steps !== 0).length === 7)
check('the room is not complete', (await page.evaluate(() => window.__roomComplete('webb'))) === false)

// ---- you cannot align a mirror that isn't whole ----
await page.evaluate(() => window.__tapTile(0))
await page.waitForTimeout(400)
check('tapping a segment before the repairs does nothing',
  (await page.evaluate(() => window.__webbTiles()))[0].steps === tiles[0].steps)
check('...and says what is needed first',
  /last segment/i.test(await page.evaluate(() => document.getElementById('toast-text').textContent)))
await page.evaluate(() => window.__tapWorld('webb', 'console'))
await page.waitForTimeout(400)
check('the focus console refuses an unbuilt mirror',
  (await page.evaluate(() => window.__telescopeOpen())) === false)

// ---- repair 1: the strut, fetched from the Space Station ----
await page.evaluate(() => window.__goScene('station'))
await page.waitForTimeout(1000)
check('the mirror strut is hidden in the Space Station room (cross-room)',
  await page.evaluate(() => window.__clueExists('mirrorStrut')))
await page.evaluate(() => window.__tapClue('mirrorStrut'))
await page.waitForTimeout(1100)
await page.evaluate(() => window.__goScene('webb'))
await page.waitForTimeout(1000)
check('fitting the strut works', await page.evaluate(() => window.__useItem('mirrorStrut')))
await page.waitForTimeout(1300)

// ---- repair 2: the 18th segment, bought at the desk ----
await page.evaluate(() => { window.__setCoins(60); window.__openDesk() })
await page.waitForTimeout(500)
const seg = await page.$('#supply-desk [data-item="mirrorPart"]')
check('the mirror segment is sold at the desk', !!seg)
await seg.click()
await page.waitForTimeout(400)
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(500)
check('fitting the last segment works', await page.evaluate(() => window.__useItem('mirrorPart')))
await page.waitForTimeout(1400)
check('all 18 segments are now fitted',
  (await page.evaluate(() => window.__webbTiles())).every((t) => t.visible))
check('both repairs done', (await page.evaluate(() => window.__webbRepairs())).every((r) => r.done))
check('a whole mirror is still not an ALIGNED mirror',
  (await page.evaluate(() => window.__webbMirrorsDone())) === false)
check('...so the room is still incomplete',
  (await page.evaluate(() => window.__roomComplete('webb'))) === false)

// ---- the alignment: one tap turns a segment a sixth of a turn ----
const before = (await page.evaluate(() => window.__webbTiles()))[0].steps
await page.evaluate(() => window.__tapTile(0))
await page.waitForTimeout(400)
check('now a tap turns a segment',
  (await page.evaluate(() => window.__webbTiles()))[0].steps === (before + 1) % 6)
check('aligning every segment finishes the alignment',
  await page.evaluate(() => window.__alignMirrors()))
check('...and the array reports itself aligned',
  (await page.evaluate(() => window.__webbTiles())).every((t) => t.steps === 0))
check('...but the room still needs its focus',
  (await page.evaluate(() => window.__roomComplete('webb'))) === false)

// ---- Focus the Stars ----
await page.evaluate(() => window.__tapWorld('webb', 'console'))
await page.waitForTimeout(700)
check('an aligned mirror opens Focus the Stars', await page.evaluate(() => window.__telescopeOpen()))
const f0 = await page.evaluate(() => window.__focusState())
check('it starts well out of focus', f0.err > f0.tol * 2, `err ${f0.err.toFixed(2)}`)

// being briefly in the sweet spot must not be enough — you have to hold it
await page.evaluate(() => window.__focusSet(0, 0))
await page.waitForTimeout(120)
await page.evaluate(() => window.__focusSet(0.8, 0))
await page.waitForTimeout(300)
check('a flick through the sweet spot does not lock focus',
  (await page.evaluate(() => window.__focusState())).won === false)

await page.evaluate(() => window.__focusSet(0, 0))
await page.waitForFunction(() => window.__focusState().won, null, { timeout: 12000 })
check('holding the sweet spot locks focus', await page.evaluate(() => window.__focusState().won))
await page.waitForFunction(() => !window.__telescopeOpen(), null, { timeout: 15000 })
await page.waitForTimeout(800)
check('the room is complete', await page.evaluate(() => window.__roomComplete('webb')))

// ---- THE WING FINALE ----
const rooms = await page.evaluate(() => window.__wingRooms('space'))
check('the wing is made of five rooms', rooms.length === 5, rooms.join(', '))
check('four are still unfinished, so the wing is not done yet',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)

// force the other four, which also proves __solveWing understands every kind of
// challenge in this wing (it returns false rather than faking a finale)
const forced = await page.evaluate(() => window.__solveWing('space'))
await page.waitForTimeout(1400)
check('__solveWing can actually satisfy every space challenge type', forced === true)
check('finishing all five completes the SPACE wing',
  await page.evaluate(() => window.__wingComplete('space')))
check('...and every room reports complete',
  (await page.evaluate((rs) => rs.every((r) => window.__roomComplete(r)), rooms)) === true)
check('the finale card fires',
  await page.evaluate(() => !document.getElementById('success').classList.contains('hidden')))
check('...and names the Space Wing, not the Dinosaur Wing',
  /SPACE WING/.test(await page.evaluate(() => document.getElementById('fragment-badge').textContent)),
  await page.evaluate(() => document.getElementById('fragment-badge').textContent))
check('the SPACE door in the lobby is sealed',
  await page.evaluate(() => window.__wingSealShown('space')))
check('the DINOSAUR wing is untouched by all this',
  (await page.evaluate(() => window.__wingComplete('dino'))) === false
  && (await page.evaluate(() => window.__wingSealShown('dino'))) === false)

// ---- the science ----
const atlas = await page.evaluate(() => {
  window.__openCatalogSection('webb')
  return document.getElementById('catalog-list').textContent
})
check('the Atlas says 18 segments', /18 hexagons/.test(atlas))
check('...explains gold is for infrared', /gold/i.test(atlas) && /infrared/i.test(atlas))
check('...says Webb does NOT orbit Earth like Hubble',
  /does not|doesn’t/i.test(atlas) && /Hubble/.test(atlas))
check('...gives L2 and the real distance', /L2/.test(atlas) && /1\.5 million km/.test(atlas))
check('...is honest that the colours are added', /colours are chosen afterwards/i.test(atlas))

check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
