// postprocess.mjs — raw candidates -> clean transparent PNGs.
//   node scripts/postprocess.mjs
// Strips the flat background to alpha (rembg/@imgly), trims transparent margins
// tight to the subject. If style.yaml transparency.native:true (LayerDiffuse),
// it skips removal and only trims. Reads out/raw/**, writes out/final/**.
import { readFileSync, readdirSync, mkdirSync, statSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'yaml'
import sharp from 'sharp'
import { removeBackground } from '@imgly/background-removal-node'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const style = parse(readFileSync(join(root, 'style.yaml'), 'utf8'))
const t = style.transparency
const rawRoot = join(root, 'out/raw')
const finalRoot = join(root, 'out/final')

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (name.endsWith('.png')) yield p
  }
}

// optional: pass a single file path to process just that one (scenes shouldn't
// be bg-removed, so target individual element sprites explicitly)
const only = process.argv[2]
const sources = only ? [only] : [...walk(rawRoot)]

let n = 0
for (const src of sources) {
  const abs = only ? join(process.cwd(), src) : src
  const rel = abs.includes('/out/raw/') ? abs.split('/out/raw/')[1] : basename(abs)
  const dest = join(finalRoot, rel)
  mkdirSync(dirname(dest), { recursive: true })
  try {
    let buf
    if (t.native) {
      buf = readFileSync(abs)                           // already has alpha
    } else if (t.bg_removal) {
      const blob = await removeBackground(abs)
      buf = Buffer.from(await blob.arrayBuffer())
    } else {
      buf = readFileSync(abs)
    }
    let img = sharp(buf)
    if (t.trim) {
      // tight crop to the alpha bounding box (sharp.trim leaves soft-alpha
      // padding, which makes sprites float when bottom-anchored)
      const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
      const { width: w, height: h, channels: c } = info
      let minX = w, minY = h, maxX = 0, maxY = 0
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * c + c - 1] > 16) {
          if (x < minX) minX = x; if (x > maxX) maxX = x
          if (y < minY) minY = y; if (y > maxY) maxY = y
        }
      }
      if (maxX >= minX && maxY >= minY) {
        img = sharp(buf).extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
      }
    }
    await img.png().toFile(dest)
    console.log(`  ✓ ${rel}`)
    n++
  } catch (e) {
    console.error(`  ✗ ${rel}: ${e.message}`)
  }
}
console.log(`\n${n} transparent PNG(s) in out/final/. Pick the winning variant per asset and copy it into the game.`)
