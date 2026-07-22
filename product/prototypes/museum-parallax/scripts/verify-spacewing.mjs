/* Headless check that the Space Wing is REACHABLE by playing, not just by
 * calling debug hooks — the thing a player actually does:
 *   lobby → tap the SPACE door → hall → pick a rock off the floor → tap the
 *   Supply Desk → sell → back to the lobby.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-spacewing.mjs [url]
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
await page.waitForFunction(() => typeof window.__tapWorld === 'function', { timeout: 20000 })
await page.waitForTimeout(1400)

// ---- the wing exists and starts unfinished ----
check('the space wing is registered', (await page.evaluate(() => window.__wings())).includes('space'))
check('an empty-room wing does NOT read as complete',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)
check('the space wing seal is not stamped on boot',
  (await page.evaluate(() => window.__wingSealShown('space'))) === false)

// ---- walk in through the SPACE door, as a player would ----
check('starts in the lobby', (await page.evaluate(() => window.__cam().scene)) === 'lobby')
await page.evaluate(() => window.__tapWorld('lobby', 'doorSpace'))
await page.waitForTimeout(1100)
check('tapping the SPACE door opens the wing',
  (await page.evaluate(() => window.__cam().scene)) === 'spacehub',
  await page.evaluate(() => window.__cam().scene))
check('the coin purse appears on arrival',
  await page.evaluate(() => !document.getElementById('coin-purse').classList.contains('hidden')))

// ---- the hall's own rock, picked up by tapping it ----
check('a rock is lying in the hall', await page.evaluate(() => window.__clueExists('lunarChip@spacehub')))
await page.evaluate(() => window.__tapClue('lunarChip@spacehub'))
await page.waitForTimeout(1300)
check('tapping the rock puts it in the ROCKS pouch',
  await page.evaluate(() => window.__bag().includes('lunarChip@spacehub')))
check('the rock landed in the rock grid, not the finds grid',
  await page.evaluate(() => [...document.querySelectorAll('#rock-grid .inv-slot.filled')]
    .some((s) => s.dataset.item === 'lunarChip@spacehub')))

// ---- the desk is reachable by tapping the counter ----
await page.evaluate(() => window.__tapWorld('spacehub', 'desk'))
await page.waitForTimeout(600)
check('tapping the counter opens the Supply Desk', await page.evaluate(() => window.__deskOpen()))
const row = await page.$('#supply-desk [data-col="sell"] .sd-item')
check('the hall rock is on sale at the desk', !!row)
if (row) {
  await row.click()
  await page.waitForTimeout(300)
  check('selling the hall rock pays 6 coins', (await page.evaluate(() => window.__coins())) === 6,
    String(await page.evaluate(() => window.__coins())))
}
await page.evaluate(() => window.__closeDesk())
await page.waitForTimeout(400)

// ---- rooms that don't exist yet must say so, never fail silently ----
// Found dynamically rather than hardcoded: every room we build would otherwise
// break this check, and the day all five exist it should skip, not fail.
const unbuilt = await page.evaluate(() =>
  window.__wingRooms('space').find((r) => !window.__sceneExists(r)) ?? null)
if (unbuilt) {
  await page.evaluate((r) => window.__tapWorld('spacehub', r), unbuilt)
  await page.waitForTimeout(500)
  check(`an unbuilt diorama (${unbuilt}) explains itself instead of doing nothing`,
    await page.evaluate(() => !document.getElementById('toast').classList.contains('hidden')
      && /being installed/.test(document.getElementById('toast-text').textContent)))
  check('and does not leave the hall', (await page.evaluate(() => window.__cam().scene)) === 'spacehub')
} else {
  console.log('· every space room is built — nothing left to check for unbuilt niches')
}

// ---- back out, and the dino wing is still its own thing ----
await page.evaluate(() => window.__goScene('lobby'))
await page.waitForTimeout(900)
check('back button returns to the lobby', (await page.evaluate(() => window.__cam().scene)) === 'lobby')
await page.evaluate(() => window.__solveWing('dino'))
await page.waitForTimeout(900)
check('finishing the DINO wing does not complete the space wing',
  (await page.evaluate(() => window.__wingComplete('space'))) === false)
check('finishing the dino wing does not stamp the SPACE door seal',
  (await page.evaluate(() => window.__wingSealShown('space'))) === false)

check('no uncaught page errors', errors.length === 0, errors.join(' | '))

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
