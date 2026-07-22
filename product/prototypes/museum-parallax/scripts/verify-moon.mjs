/* The Moon room — Rebuild the Landing Sequence.
 *
 * This room's puzzle is in two halves: GATHER six mission cards from four
 * different places, then ORDER them the way Apollo 11 actually happened. So the
 * checks follow the cards (room, other room, desk, mini-game), then the ordering
 * rules, then the history itself — the order is the fact this room teaches, and
 * a wrong order taught confidently is worse than no room at all.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-moon.mjs [url]
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
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error' && !BENIGN.some((re) => re.test(m.text()))) errors.push(`console: ${m.text()}`)
})

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForFunction(() => typeof window.__moonCards === 'function', { timeout: 20000 })
await page.waitForTimeout(1800)

// ---- the room, and the board that won't open yet ----
await page.evaluate(() => window.__goScene('spacehub'))
await page.waitForTimeout(800)
await page.evaluate(() => window.__tapWorld('spacehub', 'moon'))
await page.waitForTimeout(1100)
check('tapping the MOON niche enters the room',
  (await page.evaluate(() => window.__cam().scene)) === 'moon')
check('no mission cards held yet', (await page.evaluate(() => window.__moonCards())).length === 0)
check('the room is not complete', (await page.evaluate(() => window.__roomComplete('moon'))) === false)

await page.evaluate(() => window.__tapWorld('moon', 'board'))
await page.waitForTimeout(500)
check('the board will not open without all six cards',
  (await page.evaluate(() => window.__moonBoardOpen())) === false)
check('...and it says how many are still missing',
  /6 more mission cards/.test(await page.evaluate(() => document.getElementById('toast-text').textContent)),
  await page.evaluate(() => document.getElementById('toast-text').textContent))
// toast copy uses <b> for emphasis; it must RENDER, not print as literal tags
check('toast markup renders instead of printing as tags',
  !/[<>]/.test(await page.evaluate(() => document.getElementById('toast-text').textContent)))

// ---- cards come from FOUR different places ----
for (const id of ['liftoff', 'touchdown', 'firstSteps']) {
  check(`the ${id} card is hidden in the Moon room`, await page.evaluate((c) => window.__clueExists(`card:${c}`), id))
  await page.evaluate((c) => window.__tapClue(`card:${c}`), id)
  await page.waitForTimeout(900)
}
check('three cards found in the room', (await page.evaluate(() => window.__moonCards())).length === 3)

await page.evaluate(() => window.__goScene('mars'))
await page.waitForTimeout(1000)
check('a fourth card is over in the MARS room (cross-room)',
  await page.evaluate(() => window.__clueExists('card:onTheWay')))
await page.evaluate(() => window.__tapClue('card:onTheWay'))
await page.waitForTimeout(1100)
check('four cards held', (await page.evaluate(() => window.__moonCards())).length === 4)

await page.evaluate(() => { window.__setCoins(60); window.__openDesk() })
await page.waitForTimeout(500)
const cardBuy = await page.$('#supply-desk [data-item="missionCard"]')
check('a fifth card is sold at the Supply Desk', !!cardBuy)
await cardBuy.click()
await page.waitForTimeout(400)
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(500)
check('five cards held', (await page.evaluate(() => window.__moonCards())).length === 5)
check('the board is still not ready at five', (await page.evaluate(() => window.__moonBoardLit())) === false)

// ---- the sixth is won in Build-a-Rocket, and only by stacking it RIGHT ----
await page.evaluate(() => window.__goScene('moon'))
await page.waitForTimeout(1000)
await page.evaluate(() => window.__tapWorld('moon', 'bench'))
await page.waitForTimeout(700)
check('the workbench opens Build-a-Rocket', await page.evaluate(() => window.__rocketOpen()))

await page.evaluate(() => { window.__rocketStack(false); window.__rocketLaunch() })
await page.waitForTimeout(500)
check('an upside-down rocket topples instead of flying',
  (await page.evaluate(() => window.__rocketPhase())) === 'toppling')
await page.waitForTimeout(2000)
check('...and the pieces come straight back to try again',
  (await page.evaluate(() => window.__rocketPhase())) === 'build')
check('...a bad launch grants nothing',
  (await page.evaluate(() => window.__moonCards())).length === 5)

await page.evaluate(() => { window.__rocketStack(true); window.__rocketLaunch() })
await page.waitForFunction(() => !window.__rocketOpen(), null, { timeout: 15000 })
await page.waitForTimeout(600)
check('a correctly stacked Saturn V flies and wins the last card',
  (await page.evaluate(() => window.__moonCards())).length === 6,
  (await page.evaluate(() => window.__moonCards())).join(', '))
check('holding all six lights the sequence board',
  await page.evaluate(() => window.__moonBoardLit()))

// ---- the ordering puzzle ----
await page.evaluate(() => window.__tapWorld('moon', 'board'))
await page.waitForTimeout(600)
check('with all six cards the board opens', await page.evaluate(() => window.__moonBoardOpen()))

await page.evaluate(() => window.__moonSolveWrong())
await page.waitForTimeout(600)
check('a wrong order does not solve it', (await page.evaluate(() => window.__roomComplete('moon'))) === false)
const locked = await page.evaluate(() => document.querySelectorAll('#moon-board .mb-cell.locked').length)
check('...but the cards already in the right place lock in', locked === 4, `${locked} locked`)
check('...and the wrong ones come back to the tray',
  (await page.evaluate(() => document.querySelectorAll('#moon-board [data-row="tray"] .mb-cell').length)) === 2)
check('...with feedback a child can act on',
  /in the right place/.test(await page.evaluate(() => document.querySelector('#moon-board .mb-msg').textContent)))

await page.evaluate(() => window.__moonSolve())
await page.waitForTimeout(700)
check('the correct order solves the puzzle', await page.evaluate(() => window.__roomComplete('moon')))
await page.waitForFunction(() => !window.__moonBoardOpen(), null, { timeout: 12000 }).catch(() => {})
await page.waitForTimeout(900)
check('the board closes itself and hands back control',
  (await page.evaluate(() => window.__moonBoardOpen())) === false)

// ---- the history it teaches has to be right ----
const successText = await page.evaluate(() => document.getElementById('success-text').textContent)
check('the celebration keeps Collins in orbit, not on the surface',
  /Collins/.test(successText) && /Columbia/.test(successText), successText.slice(0, 90))
const atlas = await page.evaluate(() => {
  window.__openCatalogSection('apollo')
  return document.getElementById('catalog-list').textContent
})
check('the Star Atlas has a Moon Missions section', /Apollo 11|Moon Missions/i.test(atlas))
check('...it dates the landing correctly', /20 July 1969/.test(atlas))
check('...it says Eagle undocked only once already orbiting the Moon',
  /already circling the Moon/i.test(atlas))
check('...it says Collins never walked on the Moon', /never walked on the Moon/i.test(atlas))

check('finishing Moon does not finish the space wing',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)
check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
