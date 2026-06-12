// verify-cutout.mjs — gatekeeper for element sprites. Cuts the raw render and
// reports whether it's a usable single-object transparent PNG:
//   transparent% (want >40), solid subject, and a checker preview to eyeball.
//   node scripts/verify-cutout.mjs <raw.png> <out.png>
import sharp from 'sharp'
import { removeBackground } from '@imgly/background-removal-node'

const [src, dest] = process.argv.slice(2)
const blob = await removeBackground(src)
const buf = Buffer.from(await blob.arrayBuffer())

const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
let trans = 0, solid = 0, n = w * h, minX = w, minY = h, maxX = 0, maxY = 0
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const a = data[(y * w + x) * c + c - 1]
  if (a < 16) trans++
  else { if (a > 220) solid++
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y }
}
const bw = maxX - minX + 1, bh = maxY - minY + 1
// tight-crop to subject
await sharp(buf).extract({ left: minX, top: minY, width: bw, height: bh }).png().toFile(dest)

const tPct = (100 * trans / n).toFixed(0), sPct = (100 * solid / n).toFixed(0)
const verdict = trans / n > 0.35 && solid / n > 0.05 ? 'OK' : 'SUSPECT'
console.log(`${verdict}  transparent:${tPct}%  solid:${sPct}%  subject:${bw}x${bh} of ${w}x${h}  -> ${dest}`)

// checker preview next to dest
const sq = 24
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}">` +
  Array.from({ length: Math.ceil(bh / sq) }, (_, r) => Array.from({ length: Math.ceil(bw / sq) }, (_, cc) =>
    `<rect x="${cc * sq}" y="${r * sq}" width="${sq}" height="${sq}" fill="${(r + cc) % 2 ? '#bbb' : '#777'}"/>`).join('')).join('') + `</svg>`)
await sharp(await sharp(svg).png().toBuffer()).composite([{ input: await sharp(dest).png().toBuffer() }])
  .png().toFile(dest.replace(/\.png$/, '-check.png'))
