// pixelate.mjs — snap an image to a crisp pixel grid.
//   node scripts/pixelate.mjs <path-to-png> [targetWidth=320]
// Downscales with nearest-neighbour to targetWidth, then upscales back to the
// original size with nearest-neighbour, so pixels are big and hard-edged.
// Writes <name>-px.png next to the source. Use after generating with the
// pixel-art LoRA to remove residual anti-aliasing.
import sharp from 'sharp'

const src = process.argv[2]
const targetW = Number(process.argv[3] || 320)
if (!src) { console.error('usage: node scripts/pixelate.mjs <png> [targetWidth]'); process.exit(1) }

const img = sharp(src)
const { width, height } = await img.metadata()
const targetH = Math.round((height / width) * targetW)
const dest = src.replace(/\.png$/i, '-px.png')

const small = await sharp(src)
  .resize(targetW, targetH, { kernel: 'nearest' })
  .toBuffer()

await sharp(small)
  .resize(width, height, { kernel: 'nearest' })
  .png()
  .toFile(dest)

console.log(`  ✓ ${dest}  (snapped to ${targetW}x${targetH} grid)`)
