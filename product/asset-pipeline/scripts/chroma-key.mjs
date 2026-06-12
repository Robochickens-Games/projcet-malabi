// chroma-key.mjs — knock out a near-white background AND enclosed white areas
// (e.g. a door-frame's central opening) to transparent, so the rendered frame
// becomes a true ring. Unlike bg-removal, this keys by color so the enclosed
// opening is removed too.
//   node scripts/chroma-key.mjs <in.png> <out.png> [threshold=236]
import sharp from 'sharp'
const [src, dest, thRaw] = process.argv.slice(2)
const TH = Number(thRaw || 236)
if (!src || !dest) { console.error('usage: chroma-key.mjs <in> <out> [threshold]'); process.exit(1) }

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
for (let i = 0; i < data.length; i += c) {
  const r = data[i], g = data[i + 1], b = data[i + 2]
  if (r > TH && g > TH && b > TH) data[i + 3] = 0           // near-white -> transparent
  else if (r > TH - 18 && g > TH - 18 && b > TH - 18)       // soft edge -> partial
    data[i + 3] = Math.round(data[i + 3] * (1 - (Math.min(r, g, b) - (TH - 18)) / 18))
}
await sharp(data, { raw: { width: w, height: h, channels: c } }).png().toFile(dest)
console.log(`  ✓ ${dest} (keyed white > ${TH})`)
