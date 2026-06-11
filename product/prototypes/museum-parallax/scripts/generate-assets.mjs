// Slices the team's painted concept images (brain/images/) into the parallax
// layers + sprites the prototype uses. Re-run when the source paintings change:
//   node scripts/generate-assets.mjs        (needs playwright + Chrome: npm i -D playwright)
// Outputs are committed in public/img/ so the app itself needs none of this.
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const brainImages = join(root, '../../../brain/images')
const outDir = join(root, 'public/img')
mkdirSync(outDir, { recursive: true })

const grove = readFileSync(join(brainImages, 'landscape dino.png')).toString('base64')
const lobby = readFileSync(join(brainImages, 'Science Museum Mystery.png')).toString('base64')

const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage()
await p.goto('about:blank')

const files = await p.evaluate(async ({ grove, lobby }) => {
  const load = async (b64) => {
    const im = new Image()
    im.src = 'data:image/png;base64,' + b64
    await im.decode()
    return im
  }
  const groveIm = await load(grove)
  const lobbyIm = await load(lobby)
  const out = []

  const canvas = (w, h) => {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    return [c, c.getContext('2d')]
  }
  const save = (name, c, jpeg) =>
    out.push({ name, jpeg: !!jpeg, data: c.toDataURL(jpeg ? 'image/jpeg' : 'image/png', jpeg ? 0.88 : undefined).split(',')[1] })

  // feathered alpha mask: draw white shapes blurred, use as destination-in.
  // extend shapes past the canvas edge wherever the cut should stay solid.
  const masked = (im, sx, sy, sw, sh, scale, blur, shapes) => {
    const [c, ctx] = canvas(Math.round(sw * scale), Math.round(sh * scale))
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height)
    const [m, mc] = canvas(c.width, c.height)
    mc.filter = `blur(${blur}px)`
    mc.fillStyle = '#fff'
    for (const s of shapes) {
      if (s.ellipse) {
        mc.beginPath()
        mc.ellipse(s.x * scale, s.y * scale, s.rx * scale, s.ry * scale, 0, 0, Math.PI * 2)
        mc.fill()
      } else {
        mc.fillRect(s.x * scale, s.y * scale, s.w * scale, s.h * scale)
      }
    }
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(m, 0, 0)
    return c
  }

  // TRUE layer separation: whatever is cut into a nearer layer gets painted
  // OVER in the base with neighbouring scene texture (shift-sampled, feathered),
  // so nothing exists twice and parallax never shows a ghost copy.
  // regions: x/y/w/h = hole to fill (slightly larger than the cut); dx/dy = where
  // the replacement texture is sampled from, relative to the hole.
  const inpaint = (ctx, im, sx, sy, sw, sh, scale, regions) => {
    for (const r of regions) {
      const [f, fc] = canvas(ctx.canvas.width, ctx.canvas.height)
      fc.imageSmoothingQuality = 'high'
      fc.drawImage(im, sx + r.dx, sy + (r.dy || 0), sw, sh, 0, 0, f.width, f.height)
      const [m, mc] = canvas(f.width, f.height)
      mc.filter = `blur(${r.blur ?? 40}px)`
      mc.fillStyle = '#fff'
      mc.fillRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale)
      fc.globalCompositeOperation = 'destination-in'
      fc.drawImage(m, 0, 0)
      ctx.drawImage(f, 0, 0)
    }
  }

  /* ---- GROVE (landscape dino.png, 1672x941) ----
     The grove is a 3840-wide side-scrolling world (2 screens): an approach
     stretch built from crops of the painting, arriving at the painting itself.
     Every layer scrolls at its own speed — platformer parallax. */
  // the TRICERATOPS placard → its own mid-depth sprite
  save('grove-placard', masked(groveIm, 215, 310, 190, 185, 1, 16, [
    { x: 10, y: 10, w: 170, h: 165 },
  ]))
  // base: the painting, with everything that moved to nearer layers painted over.
  // In-world UI (book, buttons, tray, banner) stays painted and base-anchored.
  {
    const [c, ctx] = canvas(1672, 941)
    ctx.drawImage(groveIm, 0, 0)
    inpaint(ctx, groveIm, 0, 0, 1672, 941, 1, [
      { x: -80, y: 100, w: 348, h: 650, dx: 285 },   // behind left foliage ← jungle to its right
      { x: 205, y: 300, w: 212, h: 207, dx: 185, blur: 26 }, // behind the placard ← bushes
    ])
    save('grove-base', c, true)
  }
  // the found-clue tooth painted in tray slot 1 → collectible sprite
  save('clue-tooth', masked(groveIm, 492, 793, 132, 142, 1, 9, [
    { ellipse: true, x: 66, y: 71, rx: 52, ry: 62 },
  ]))

  /* ---- wide-world layers, composed from crops of the same painting ---- */
  const D = 1920 / 1672 // painting px → design px

  // helper: draw a feather-masked crop of the painting onto a target canvas
  // (pass `shapes` — e.g. a tight ellipse — to keep the crop's rectangular
  // background out; rectangles of baked sky read as seams on a gradient)
  const stamp = (ctx, sx, sy, sw, sh, dx, dyBottom, scale, { flip = false, blur = 14, shapes } = {}) => {
    const piece = masked(groveIm, sx, sy, sw, sh, D * scale, blur, shapes ?? [
      { x: 6, y: 6, w: sw - 12, h: sh - 12 },
    ])
    ctx.save()
    const w = piece.width
    const h = piece.height
    ctx.translate(dx + (flip ? w : 0), dyBottom - h)
    if (flip) ctx.scale(-1, 1)
    ctx.drawImage(piece, 0, 0)
    ctx.restore()
  }

  // source crops verified clean of the painted UI AND the scene's subjects
  // (back arrow, wall, book, tray, buttons, skeleton, placard), each with a
  // tight ellipse mask so no rectangular baked background comes along:
  const CROP = {
    palm: [230, 15, 270, 265],        // palm canopy heads (wall starts left of 230)
    bushA: [645, 465, 130, 115],      // shadow shrubs under the skeleton's belly
    bushB: [75, 440, 135, 120],       // dark leaves from the wall foliage
    dirt: [430, 575, 330, 130],       // open path, above the clue tray
    tuft: [713, 628, 148, 84],
  }
  const MASK = {
    palm: [{ ellipse: true, x: 135, y: 125, rx: 118, ry: 105 }],
    bushA: [{ ellipse: true, x: 65, y: 57, rx: 56, ry: 49 }],
    bushB: [{ ellipse: true, x: 67, y: 60, rx: 58, ry: 51 }],
    tuft: [{ ellipse: true, x: 74, y: 42, rx: 66, ry: 36 }],
  }

  // far sky: fully procedural — gradient, glowing sun, soft clouds, two
  // mountain-ridge silhouettes (painted crops always drag baked sky along)
  {
    const [c, ctx] = canvas(2400, 1080)
    const g = ctx.createLinearGradient(0, 0, 0, 1080)
    g.addColorStop(0, '#1c454e')
    g.addColorStop(0.32, '#3f7670')
    g.addColorStop(0.55, '#8fb39b')
    g.addColorStop(0.75, '#557e62')
    g.addColorStop(1, '#2f5a4e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 2400, 1080)

    // sun ahead-right with a warm halo
    const sg = ctx.createRadialGradient(1700, 330, 30, 1700, 330, 300)
    sg.addColorStop(0, 'rgba(255,238,190,0.95)')
    sg.addColorStop(0.2, 'rgba(255,215,140,0.5)')
    sg.addColorStop(1, 'rgba(255,215,140,0)')
    ctx.fillStyle = sg
    ctx.fillRect(1360, 0, 700, 680)
    ctx.beginPath()
    ctx.arc(1700, 330, 54, 0, Math.PI * 2)
    ctx.fillStyle = '#ffeec6'
    ctx.fill()

    // clouds
    ctx.save()
    ctx.filter = 'blur(16px)'
    ctx.fillStyle = 'rgba(244,236,214,0.5)'
    for (const [cx, cy, rx, ry] of [[260, 200, 130, 34], [820, 150, 170, 40], [1310, 250, 120, 30], [2050, 170, 150, 36], [560, 320, 100, 26]]) {
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // mountain ridges (back hazier, front darker)
    const ridge = (baseY, amp, step, color, alpha) => {
      ctx.save()
      ctx.filter = 'blur(2px)'
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(-40, 760)
      for (let x = -40, i = 0; x <= 2440; x += step, i++) {
        ctx.lineTo(x, baseY - amp * (0.4 + ((i * 7) % 10) / 10))
        ctx.lineTo(x + step / 2, baseY - amp * 0.15)
      }
      ctx.lineTo(2440, 760)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    ridge(470, 200, 420, '#6d958b', 0.85)
    ridge(520, 150, 300, '#4f7a6c', 0.95)
    save('grove-sky', c, true)
  }

  // mid jungle: a dense treeline of canopy heads + shrubs along the horizon
  {
    const [c, ctx] = canvas(2900, 1080)
    let alt = false
    for (let x = -80; x < 2900; x += 290) {
      stamp(ctx, ...CROP.palm, x, 700 + (x % 3) * 14, 1.05 + (x % 5) * 0.07, { flip: (alt = !alt), blur: 16, shapes: MASK.palm })
    }
    for (let x = 60; x < 2900; x += 380) {
      const which = (alt = !alt) ? 'bushA' : 'bushB'
      stamp(ctx, ...CROP[which], x, 745, 1.6, { flip: alt, blur: 14, shapes: MASK[which] })
    }
    save('grove-mid', c)
  }

  // the walkable approach: dirt gradient + a collage of clean path patches,
  // transparent above the (feathered) horizon so sky + mid show through
  {
    const [c, ctx] = canvas(1920, 1080)
    const g = ctx.createLinearGradient(0, 640, 0, 1080)
    g.addColorStop(0, '#a8814f')
    g.addColorStop(0.5, '#8a6a42')
    g.addColorStop(1, '#5c452c')
    ctx.fillStyle = g
    ctx.fillRect(0, 660, 1920, 420)
    let flip = false
    for (let row = 0; row < 4; row++) {
      const yB = 800 + row * 115
      for (let x = -80 + row * 130; x < 1980; x += 310) {
        stamp(ctx, ...CROP.dirt, x, yB, 1.1 + (row % 2) * 0.25, { flip: (flip = !flip), blur: 24 })
      }
    }
    // soft horizon edge
    const [m, mc] = canvas(1920, 1080)
    mc.filter = 'blur(28px)'
    mc.fillStyle = '#fff'
    mc.fillRect(-60, 695, 2040, 450)
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(m, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    // scattered set dressing
    stamp(ctx, ...CROP.bushA, 320, 880, 1.5, { shapes: MASK.bushA })
    stamp(ctx, ...CROP.tuft, 150, 1020, 1.4, { shapes: MASK.tuft })
    stamp(ctx, ...CROP.bushB, 1090, 960, 1.7, { flip: true, shapes: MASK.bushB })
    stamp(ctx, ...CROP.tuft, 820, 1050, 1.5, { flip: true, shapes: MASK.tuft })
    stamp(ctx, ...CROP.bushA, 1640, 860, 1.3, { shapes: MASK.bushA })
    stamp(ctx, ...CROP.tuft, 1430, 1010, 1.3, { shapes: MASK.tuft })
    save('grove-approach', c)
  }

  // foreground canopy clump — hangs from the top edge, darkened in-game, fastest layer
  save('grove-palm', masked(groveIm, ...CROP.palm, 1, 18, MASK.palm))

  /* ---- LOBBY (Science Museum Mystery.png, 941x1672) ---- */
  // foreground: jungle + triceratops bottom-left (the tooth hides behind it),
  // gramophone bottom-right
  save('lobby-fore', masked(lobbyIm, 0, 460, 941, 550, 2, 50, [
    { x: -60, y: 380, w: 190, h: 230 },     // jungle/trike, solid to left+bottom edges
    { x: 810, y: 330, w: 195, h: 280 },     // gramophone, solid to right+bottom edges
  ]))
  // base: museum-interior band with the three wings + kid, upscaled 2x to design
  // size (starts at y460 so the wing signs and tagline ribbon stay whole), with
  // the foreground cuts painted over so they exist only in the near layer
  {
    const [c, ctx] = canvas(1882, 1060)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(lobbyIm, 0, 460, 941, 550, 0, 0, 1882, 1060)
    inpaint(ctx, lobbyIm, 0, 460, 941, 550, 2, [
      { x: -60, y: 350, w: 225, h: 290, dx: 175, blur: 50 },  // behind trike ← floor/jungle right of it
      { x: 780, y: 300, w: 225, h: 340, dx: -180, blur: 50 }, // behind gramophone ← shelf left of it
    ])
    save('lobby-base', c, true)
  }

  return out
}, { grove, lobby })

for (const f of files) {
  const ext = f.jpeg ? 'jpg' : 'png'
  writeFileSync(join(outDir, `${f.name}.${ext}`), Buffer.from(f.data, 'base64'))
  console.log(`public/img/${f.name}.${ext}`)
}
await b.close()
