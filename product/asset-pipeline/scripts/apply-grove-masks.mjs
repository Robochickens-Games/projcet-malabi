// apply-grove-masks.mjs — diorama pipeline stage 2: cut each generated grove
// layer with its OWN vector silhouette (the same shape ControlNet locked to).
// Result: crisp paper-cut edges that match the prototype wireframe 1:1.
//   node scripts/apply-grove-masks.mjs
import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const LAYERS = ['grove-clouds', 'grove-mountains', 'grove-treeline', 'grove-ground', 'grove-canopy', 'grove-bush']

for (const name of LAYERS) {
  const src = join(root, `out/raw/dinosaurs/${name}-v0.png`)
  const maskP = join(root, `out/control/${name}-mask.png`)
  try {
    const { width, height } = await sharp(src).metadata()
    const mask = await sharp(maskP).resize(width, height, { fit: 'fill' }).extractChannel(0).raw().toBuffer()
    await sharp(src).removeAlpha()
      .joinChannel(mask, { raw: { width, height, channels: 1 } })
      .png().toFile(join(root, `demo/img/${name}.png`))
    console.log(`  ✓ ${name} cut with vector mask`)
  } catch (e) { console.error(`  ✗ ${name}: ${e.message}`) }
}
