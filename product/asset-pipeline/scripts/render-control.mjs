// render-control.mjs — rasterize the prototype's SVG layout layers into a
// single control image for ControlNet. The vector source IS the layout, so this
// gives the generator an exact structural map (window/arch/column positions).
//   node scripts/render-control.mjs            # -> out/control/lobby-control.png
// Add scenes here as the game grows (hall, etc.).
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { lobbyBack, lobbyMid, lobbyFore } from '../../prototypes/museum-parallax/src/art.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'out/control')
mkdirSync(outDir, { recursive: true })

// 16:9 to match the SVG layers (2400x1350); SDXL-friendly resolution.
const W = 1344, H = 768

const raster = svg =>
  sharp(Buffer.from(svg)).resize(W, H, { fit: 'fill' }).png().toBuffer()

async function compose(layers, name) {
  const base = await raster(layers[0])
  const over = await Promise.all(layers.slice(1).map(async l => ({ input: await raster(l) })))
  const dest = join(outDir, `${name}.png`)
  await sharp(base).composite(over).png().toFile(dest)
  console.log(`  ✓ ${dest}  (${W}x${H})`)
}

// Full lobby (back wall + windows + wing archways + columns) — one-shot control.
await compose([lobbyBack(), lobbyMid(), lobbyFore()], 'lobby-control')

// Shell only (back wall + 3 windows + cornice + columns, NO wing arches) — the
// background plate for the elements-composited-by-vector approach. The section
// arches are generated as separate elements and placed at their art.js coords.
await compose([lobbyBack(), lobbyFore()], 'lobby-shell')
