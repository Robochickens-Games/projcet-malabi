// render-door-control.mjs — control image for the doorway frame, using the SAME
// geometry as the demo's clip path (ensureDoorClips): opening x 27%→73%, spring
// at 16% height, gentle elliptical arch (ry = rx/2). The frame fills the canvas
// edge-to-edge (no background to crop); the opening is flat white so chroma-key
// knocks it out and the asset drops 1:1 into the door box.
//   node scripts/render-door-control.mjs   -> out/control/door-control.png
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'out/control'), { recursive: true })

// LARGE open museum-section archway: wide opening (16%→84%), generous arch —
// you see the section clearly through it. Fractions MUST match ensureDoorClips.
const W = 832, H = 1216
const ox1 = W * 0.16, ox2 = W * 0.84, rx = (ox2 - ox1) / 2, ry = rx * 0.75, spring = H * 0.30
const open = `M${ox1},${H} L${ox1},${spring} A${rx},${ry} 0 0 1 ${ox2},${spring} L${ox2},${H} Z`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#7a5a38"/>
  <rect x="${W*0.02}" y="${H*0.015}" width="${W*0.96}" height="${H*0.97}" fill="none" stroke="#2c1c0e" stroke-width="7"/>
  <path d="M${ox1-W*0.06},${H} L${ox1-W*0.06},${spring} A${rx+W*0.06},${ry+W*0.05} 0 0 1 ${ox2+W*0.06},${spring} L${ox2+W*0.06},${H}"
        fill="none" stroke="#2c1c0e" stroke-width="8"/>
  <path d="${open}" fill="#ffffff" stroke="#1a100a" stroke-width="9"/>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(join(root, 'out/control/door-control.png'))
console.log(`  ✓ out/control/door-control.png (${W}x${H}, opening matches demo clip geometry)`)
