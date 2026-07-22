/* Headless regression check for the wing engine.
 *
 * The museum now has more than one wing sharing one engine (WINGS registry,
 * per-scene `_challenges`, wing-scoped seals + finale). The risk when touching
 * that engine is silently breaking a wing that already worked, so this drives
 * each wing through the read-only debug hooks main.js exposes:
 *   boot → every room incomplete → walk the whole wing → __solveWing → seals,
 *   finale card, and its copy.
 *
 * Usage:  npm run build && npm run preview   (in another shell)
 *         node scripts/verify-wings.mjs [url] [wing...]
 * Exits non-zero on the first failed assertion.
 */
import { chromium } from 'playwright-core'

const [, , urlArg, ...wingArgs] = process.argv
const URL = urlArg || 'http://localhost:4173/'
const WINGS = wingArgs.length ? wingArgs : ['dino']

const fails = []
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) fails.push(name)
}

const browser = await chromium.launch({ channel: 'chrome' })

for (const wing of WINGS) {
  console.log(`\n── ${wing} wing ──`)
  // a fresh page per wing: completion state lives in the running app, so solving
  // one wing must not leak into the next wing's "starts incomplete" assertion
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))

  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => typeof window.__wingRooms === 'function', { timeout: 20000 })
  await page.waitForTimeout(1200) // let the async scene builders finish

  const rooms = await page.evaluate((w) => window.__wingRooms(w), wing)
  check(`${wing}: rooms registered`, rooms.length > 0, rooms.join(', '))

  const before = await page.evaluate((rs) => rs.map((r) => window.__roomComplete(r)), rooms)
  check(`${wing}: every room starts incomplete`, before.every((d) => d === false))
  check(`${wing}: wing starts incomplete`, (await page.evaluate((w) => window.__wingComplete(w), wing)) === false)

  // walk lobby → hub → each room → hub → lobby; every hop must land where asked
  const hub = await page.evaluate((w) => window.__wingHub(w), wing)
  for (const scene of [hub, ...rooms, hub, 'lobby']) {
    await page.evaluate((s) => window.__goScene(s), scene)
    await page.waitForTimeout(280)
    const landed = await page.evaluate(() => window.__cam().scene)
    if (landed !== scene) { check(`${wing}: navigate → ${scene}`, false, `landed on ${landed}`); break }
  }
  check(`${wing}: navigable end to end`, (await page.evaluate(() => window.__cam().scene)) === 'lobby')

  await page.evaluate((w) => window.__solveWing(w), wing)
  await page.waitForTimeout(1200)

  const after = await page.evaluate((rs) => rs.map((r) => window.__roomComplete(r)), rooms)
  check(`${wing}: all rooms complete after solve`, after.every(Boolean))
  check(`${wing}: wing complete after solve`, (await page.evaluate((w) => window.__wingComplete(w), wing)) === true)

  const finale = await page.evaluate(() => ({
    visible: !document.getElementById('success').classList.contains('hidden'),
    title: document.querySelector('#success-card .big').textContent.trim(),
    badge: document.getElementById('fragment-badge').textContent.trim(),
  }))
  check(`${wing}: finale card shown`, finale.visible)
  check(`${wing}: finale badge names the wing`, /· COMPLETE ·/.test(finale.badge), finale.badge)
  // the dino wing has its own fossil-fit reel and should still play it
  check(`${wing}: finale still plays its own celebration reel`,
    await page.evaluate(() => !document.getElementById('success-video').classList.contains('hidden')))

  // solving the wing must not have completed any OTHER wing
  const others = await page.evaluate((w) => {
    const out = {}
    for (const id of window.__wings()) if (id !== w) out[id] = window.__wingComplete(id)
    return out
  }, wing)
  check(`${wing}: other wings unaffected`, Object.values(others).every((v) => v === false),
    Object.keys(others).length ? JSON.stringify(others) : 'no other wings yet')

  check(`${wing}: no uncaught page errors`, errors.length === 0, errors.join(' | '))
  await page.close()
}

await browser.close()
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed')
process.exit(fails.length ? 1 : 0)
