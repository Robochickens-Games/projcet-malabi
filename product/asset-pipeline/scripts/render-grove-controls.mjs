// render-grove-controls.mjs — the dino-wing DIORAMA pipeline, stage 1.
// Takes the prototype's wireframe grove layers (the vector shapes in
// wireframe.js) and produces, per layer:
//   out/control/grove-<name>.png       ControlNet input (locks the silhouette)
//   out/control/grove-<name>-mask.png  the SAME silhouette as a cut mask
// Generation is shape-locked AND cut along the identical vector edge ->
// crisp paper-cut diorama layers that match the prototype 1:1.
//   node scripts/render-grove-controls.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { groveCloudsSVG, groveMountainsSVG, groveMidSVG, canopySVG, bushSVG } from '../../prototypes/museum-parallax/src/wireframe.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'out/control')
mkdirSync(outDir, { recursive: true })

const stripTags = s => s.replace(/<text[\s\S]*?<\/text>/g, '')  // drop the speed labels

// simple ground band (trail) — drawn here; the prototype's main layer is too busy
function groundSVG() {
  const W = 2900, H = 1080
  let tufts = ''
  for (let x = 60, i = 0; x < W; x += 170, i++) {
    const y = 880 + ((i * 11) % 3) * 30
    tufts += `<path d="M${x},${y} l14,-38 l20,6 l10,30 Z" fill="#1d2d39" stroke="#5d7e91" stroke-width="3"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect x="0" y="880" width="${W}" height="200" fill="#273a47" stroke="#9cb6c7" stroke-width="4"/>
    <line x1="0" y1="880" x2="${W}" y2="880" stroke="#9cb6c7" stroke-width="5"/>
    ${tufts}
  </svg>`
}

// name -> [svg, outW, outH] (≈2/3 scale of the 1080 canvases, /8-rounded)
const LAYERS = {
  'grove-clouds':   [stripTags(groveCloudsSVG()),    1432, 720],
  'grove-mountains':[stripTags(groveMountainsSVG()), 1680, 720],
  'grove-treeline': [stripTags(groveMidSVG()),       1936, 720],
  'grove-ground':   [groundSVG(),                    1936, 720],
  'grove-canopy':   [stripTags(canopySVG()),         1024, 712],
  'grove-bush':     [stripTags(bushSVG()),           1024, 624],
}

for (const [name, [svg, W, H]] of Object.entries(LAYERS)) {
  const raster = await sharp(Buffer.from(svg)).resize(W, H, { fit: 'fill' }).png().toBuffer()
  // control: silhouette over flat grey so Canny traces the vector edges
  await sharp({ create: { width: W, height: H, channels: 3, background: '#6b6b6b' } })
    .composite([{ input: raster }]).png().toFile(join(outDir, `${name}.png`))
  // mask: alpha -> hard white-on-black, slightly dilated so thin strokes survive
  const { data, info } = await sharp(raster).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const m = Buffer.alloc(info.width * info.height)
  for (let i = 0; i < m.length; i++) m[i] = data[i * info.channels + info.channels - 1] > 12 ? 255 : 0
  await sharp(m, { raw: { width: info.width, height: info.height, channels: 1 } })
    .blur(2.2).threshold(46).png().toFile(join(outDir, `${name}-mask.png`))
  console.log(`  ✓ ${name}  control + mask (${W}x${H})`)
}
