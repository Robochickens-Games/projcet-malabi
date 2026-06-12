// generate.mjs — manifest -> ComfyUI -> raw PNG candidates.
//
//   node scripts/generate.mjs                # generate every asset
//   node scripts/generate.mjs clue-tooth     # just one (or several) ids
//   node scripts/generate.mjs --wing dinosaurs
//
// Requires ComfyUI running locally (see README). Reproducible: each asset's
// seed is derived from its id, so re-running yields the same images until you
// change the prompt or style.
import { readFileSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'
import { parse } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const style = parse(readFileSync(join(root, 'style.yaml'), 'utf8'))
const { assets } = parse(readFileSync(join(root, 'assets.yaml'), 'utf8'))
const loadGraph = p => JSON.parse(readFileSync(join(root, p), 'utf8'))
const HOST = style.host
const clientId = createHash('md5').update('malabi-asset-pipeline').digest('hex')

// --- CLI filtering ---------------------------------------------------------
const argv = process.argv.slice(2)
const wingIdx = argv.indexOf('--wing')
const wing = wingIdx >= 0 ? argv[wingIdx + 1] : null
const ids = argv.filter((a, i) => !a.startsWith('--') && !(wingIdx >= 0 && i === wingIdx + 1))
let queue = assets
if (wing) queue = queue.filter(a => a.wing === wing)
if (ids.length) queue = queue.filter(a => ids.includes(a.id))
if (!queue.length) { console.error('No matching assets.'); process.exit(1) }

const d = style.defaults
const seedFor = (id, v, salt) =>
  parseInt(createHash('sha256').update(`${id}:${v}:${salt ?? ''}`).digest('hex').slice(0, 12), 16) % 2_147_483_647

// per-asset `style:` block overrides the global locked style (used for one-off
// experiments like a pixel-art variant)
const prefixOf = a => a.style?.prefix ?? style.style_prefix
const suffixOf = a => a.style?.suffix ?? style.style_suffix
const negOf = a => (a.style?.negative ?? style.negative) + (a.negative_extra ? ', ' + a.negative_extra : '')
const buildPrompt = a => `${prefixOf(a)}, ${a.prompt}, ${suffixOf(a)}`
  .replace(/\s+/g, ' ').trim()

async function submit(graph) {
  const r = await fetch(`${HOST}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  })
  if (!r.ok) throw new Error(`/prompt ${r.status}: ${await r.text()}`)
  return (await r.json()).prompt_id
}

async function waitForImages(promptId) {
  for (let i = 0; i < 2400; i++) {          // up to ~20 min (first LayerDiffuse run downloads weights)
    const h = await (await fetch(`${HOST}/history/${promptId}`)).json()
    const entry = h[promptId]
    if (entry) {
      const out = Object.values(entry.outputs || {}).flatMap(o => o.images || [])
      if (out.length) return out
    }
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`timed out waiting for ${promptId}`)
}

async function download(img, dest) {
  const u = new URL(`${HOST}/view`)
  u.searchParams.set('filename', img.filename)
  u.searchParams.set('subfolder', img.subfolder || '')
  u.searchParams.set('type', img.type || 'output')
  const buf = Buffer.from(await (await fetch(u)).arrayBuffer())
  writeFileSync(dest, buf)
}

// upload a ControlNet control image into ComfyUI's input folder
async function uploadImage(absPath) {
  const fd = new FormData()
  fd.append('image', new Blob([readFileSync(absPath)], { type: 'image/png' }), basename(absPath))
  fd.append('overwrite', 'true')
  const r = await fetch(`${HOST}/upload/image`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error(`/upload/image ${r.status}: ${await r.text()}`)
  return (await r.json()).name
}

console.log(`Generating ${queue.length} asset(s) via ComfyUI at ${HOST}\n`)
for (const a of queue) {
  const [w, h] = (a.size || d.size).split('x').map(Number)
  const variants = a.variants ?? d.variants
  const outDir = join(root, 'out/raw', a.wing)
  mkdirSync(outDir, { recursive: true })
  const positive = buildPrompt(a)
  // workflow: per-asset override > sprite default (style-anchored) > global
  const isSprite = !a.workflow && (a.kind === 'sprite' || a.kind === 'prop' || a.kind === 'character')
  const baseGraph = loadGraph(a.workflow ?? (isSprite ? style.default_sprite_workflow : style.workflow))
  // ControlNet: render-control.mjs makes the PNG; upload it so LoadImage can find it
  const controlName = a.control ? await uploadImage(join(root, a.control.image)) : null
  // style anchor: per-asset > per-wing default (style.yaml stylerefs)
  const refPath = a.styleref ?? (isSprite ? style.stylerefs?.[a.wing] : null)
  const stylerefName = refPath ? await uploadImage(join(root, refPath)) : null

  for (let v = 0; v < variants; v++) {
    const g = JSON.parse(JSON.stringify(baseGraph))
    g['6'].inputs.text = positive
    g['7'].inputs.text = negOf(a).replace(/\s+/g, ' ').trim()
    g['5'].inputs.width = w
    g['5'].inputs.height = h
    g['3'].inputs.seed = seedFor(a.id, v, a.seed)
    g['3'].inputs.steps = a.steps ?? d.steps
    g['3'].inputs.cfg = a.cfg ?? d.cfg
    g['3'].inputs.sampler_name = a.sampler ?? d.sampler
    g['3'].inputs.scheduler = a.scheduler ?? d.scheduler
    g['9'].inputs.filename_prefix = `${a.id}-v${v}`
    if (a.checkpoint && g['4']) g['4'].inputs.ckpt_name = a.checkpoint
    if (controlName) {
      g['11'].inputs.image = controlName
      g['14'].inputs.strength = a.control.strength ?? 0.8
    }
    if (stylerefName && g['31'] && g['32']) {
      g['31'].inputs.image = stylerefName
      if (a.styleweight != null) g['32'].inputs.weight = a.styleweight
    } else if (stylerefName) {
      console.warn(`  ! ${a.id}: styleref set but workflow has no IP-Adapter nodes — ignoring`)
    }
    delete g._comment

    try {
      const id = await submit(g)
      const imgs = await waitForImages(id)
      const dest = join(outDir, `${a.id}-v${v}.png`)
      await download(imgs[0], dest)
      console.log(`  ✓ ${a.wing}/${a.id}-v${v}.png`)
    } catch (e) {
      console.error(`  ✗ ${a.id}-v${v}: ${e.message}`)
    }
  }
}
console.log(`\nDone. Review candidates in out/raw/, then: npm run postprocess`)
