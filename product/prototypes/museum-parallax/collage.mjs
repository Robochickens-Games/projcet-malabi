import { chromium } from 'playwright-core'
const EXE = '/Users/dor.tal@gong.io/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const b = await chromium.launch({ executablePath: EXE })
const p = await b.newPage({ viewport: { width: 1800, height: 1040 }, deviceScaleFactor: 1.5 })
await p.goto('file:///tmp/collage.html', { waitUntil: 'networkidle' })
await new Promise(r => setTimeout(r, 600))
await p.screenshot({ path: '/tmp/shots/00-hero-collage.png' })
await b.close()
console.log('collage done')
