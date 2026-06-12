// cut-by-mask.mjs — apply a known silhouette mask as the alpha channel, then
// tight-crop. The deterministic cutout for shape-locked (ControlNet) renders.
//   node scripts/cut-by-mask.mjs <raw.png> <mask.png> <out.png>
import sharp from 'sharp'

const [src, maskP, dest] = process.argv.slice(2)
const { width, height } = await sharp(src).metadata()
const mask = await sharp(maskP).resize(width, height, { fit: 'fill' }).extractChannel(0).raw().toBuffer()

// two stages: sharp's fixed op order runs removeAlpha AFTER joinChannel if
// chained together, which strips the mask we just joined (RGB out, no alpha)
const rgb = await sharp(src).removeAlpha().toBuffer()
const cut = await sharp(rgb)
  .joinChannel(mask, { raw: { width, height, channels: 1 } })
  .png().toBuffer()

// tight-crop to the mask bbox
const { data, info } = await sharp(cut).raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
let minX = w, minY = h, maxX = 0, maxY = 0
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (data[(y * w + x) * c + c - 1] > 16) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
}
await sharp(cut).extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }).png().toFile(dest)
console.log(`  ✓ ${dest} (${maxX - minX + 1}x${maxY - minY + 1})`)
