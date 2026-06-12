// key-magenta.mjs — knock out a flat magenta background. Works for soft/fuzzy
// subjects (clouds, mist) where ML background removal fails: keys by color
// distance to the background color sampled from the image corners.
//   node scripts/key-magenta.mjs <raw.png> <out.png>
import sharp from 'sharp'

const [src, dest] = process.argv.slice(2)
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

// sample bg color from the 4 corners (average)
const px = (x, y) => { const i = (y * w + x) * c; return [data[i], data[i + 1], data[i + 2]] }
const corners = [px(4, 4), px(w - 5, 4), px(4, h - 5), px(w - 5, h - 5)]
const bg = [0, 1, 2].map(k => Math.round(corners.reduce((s, p) => s + p[k], 0) / 4))

const dist = (r, g, b) => Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
const HARD = 70, SOFT = 130   // <HARD fully transparent, HARD..SOFT feathered
let cut = 0
for (let i = 0; i < data.length; i += c) {
  const d = dist(data[i], data[i + 1], data[i + 2])
  if (d < HARD) { data[i + 3] = 0; cut++ }
  else if (d < SOFT) data[i + 3] = Math.round(255 * (d - HARD) / (SOFT - HARD))
}
// tight-crop to remaining content
let minX = w, minY = h, maxX = 0, maxY = 0
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (data[(y * w + x) * c + c - 1] > 16) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
}
await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: c } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .png().toFile(dest)
console.log(`  ✓ keyed bg rgb(${bg}) -> ${dest}  (${(100 * cut / (w * h)).toFixed(0)}% removed, subject ${maxX - minX + 1}x${maxY - minY + 1})`)
