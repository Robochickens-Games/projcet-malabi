// Build a single master VECTOR ASSET BOARD (SVG) for the art handoff.
//
// It pulls every swappable layer + prop straight from the prototype's own art
// code (src/wireframe.js = live blockout, src/art.js = painted-direction
// reference) and lays each one onto its own labelled frame at the EXACT export
// size the engine expects. A painter opens this in Figma / Illustrator / Affinity
// (SVG imports natively — each frame becomes a named layer) and replaces the
// blockout 1:1.
//
//   node scripts/build-asset-board.mjs   ->   assets/asset-board.svg
//
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import {
  LOBBY_W, lobbyBackSVG, lobbyMainSVG, lobbyForeSVG,
  GROVE_W, groveCloudsSVG, groveMountainsSVG, groveMidSVG, groveMainSVG,
  canopySVG, bushSVG,
} from '../src/wireframe.js'
import {
  toothSVG, floorToothSVG, SILHOUETTES,
  dioramaSVG, catalogCardArt, DINOS,
  lobbyBack, lobbyMid, lobbyFore, hallBack, hallFore,
} from '../src/art.js'

const __dir = dirname(fileURLToPath(import.meta.url))

/* ---- palette for the board chrome (not the assets) ---- */
const PAGE = '#0b0f14'
const FRAME = '#2b3a47'
const FRAME_HI = '#3f5566'
const LABEL = '#cfe0ec'
const SUB = '#7d97a8'
const ACCENT = '#e8a948'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const SERIF = 'Iowan Old Style, Palatino, Georgia, serif'

const PAD = 120          // page margin
const GAP = 150          // vertical gap between frames
const TITLE_H = 96       // room above a frame for its title
const SECTION_H = 200    // room above a section header

/* Pull width/height/viewBox out of a returned <svg> string and re-emit it as a
   positioned, named nested <svg> (Figma turns each into its own frame). */
function place(svgString, { id, x, y, note }) {
  const w = +svgString.match(/width="(\d+(?:\.\d+)?)"/)[1]
  const h = +svgString.match(/height="(\d+(?:\.\d+)?)"/)[1]
  const vb = (svgString.match(/viewBox="([^"]+)"/) || [])[1] || `0 0 ${w} ${h}`
  // strip the original root <svg ...> open tag, keep inner + drop closing tag
  const inner = svgString
    .replace(/^[\s]*<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
  const frame = `
    <g>
      <text x="${x}" y="${y - 46}" font-family="${MONO}" font-size="34"
            font-weight="600" letter-spacing="1" fill="${LABEL}">${id}</text>
      <text x="${x}" y="${y - 12}" font-family="${MONO}" font-size="24"
            fill="${SUB}">${w} × ${h}${note ? '   ·   ' + note : ''}</text>
      <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="10"
            fill="none" stroke="${FRAME}" stroke-width="3"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0e1620"/>
      <svg id="${id}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}"
           preserveAspectRatio="xMidYMid meet">${inner}</svg>
    </g>`
  return { frame, w, h }
}

function sectionHeader(title, subtitle, x, y) {
  return `
    <g>
      <rect x="${x - 6}" y="${y - 4}" width="14" height="120" fill="${ACCENT}"/>
      <text x="${x + 36}" y="${y + 56}" font-family="${SERIF}" font-size="72"
            letter-spacing="6" fill="${ACCENT}">${title}</text>
      <text x="${x + 38}" y="${y + 104}" font-family="${MONO}" font-size="26"
            fill="${SUB}">${subtitle}</text>
    </g>`
}

/* ---- wrap small named assets (tooth/dino/sprite) in a sized <svg> so place() can lay them ---- */
const wrap = (w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`

/* =========================== compose the board =========================== */

const parts = []
let y = PAD
let maxW = 0
const X = PAD

const pushRow = (svgString, opts) => {
  const { frame, w, h } = place(svgString, { ...opts, x: X, y })
  parts.push(frame)
  maxW = Math.max(maxW, X + w)
  y += h + GAP
}

const pushSection = (title, subtitle) => {
  parts.push(sectionHeader(title, subtitle, X, y))
  y += SECTION_H
}

/* lay several small assets left-to-right on one band, then advance y by the tallest */
const pushBand = (items) => {
  let cx = X
  let bandH = 0
  for (const it of items) {
    const { frame, w, h } = place(it.svg, { id: it.id, note: it.note, x: cx, y })
    parts.push(frame)
    cx += w + 120
    bandH = Math.max(bandH, h)
    maxW = Math.max(maxW, cx)
  }
  y += bandH + GAP
}

/* ---------- 1. LIVE BLOCKOUT — what ships now, paint over these ---------- */
pushSection('LOBBY — blockout layers', `world ${LOBBY_W}px · paint each at its own width · parallax speeds tagged in-frame`)
pushRow(lobbyBackSVG(), { id: 'lobby-back', note: 'BACK WALL · 0.25× · arched windows + title' })
pushRow(lobbyMainSVG(), { id: 'lobby-main', note: 'ROOM · 1.0× · 3 wing doors, info desk, bench, floor' })
pushRow(lobbyForeSVG(), { id: 'lobby-fore', note: 'FOREGROUND · 1.4× · columns, planter (tooth hides behind), rope' })

pushSection('GROVE — blockout layers', `world ${GROVE_W}px · five-deep parallax stack · skeleton + field-guide payoff`)
pushRow(groveCloudsSVG(), { id: 'grove-clouds', note: 'CLOUDS + SUN · 0.1×' })
pushRow(groveMountainsSVG(), { id: 'grove-mountains', note: 'MOUNTAINS · 0.3×' })
pushRow(groveMidSVG(), { id: 'grove-treeline', note: 'TREELINE · 0.5×' })
pushRow(groveMainSVG(), { id: 'grove-main', note: 'TRAIL + SCENE · 1.0× · skeleton, field guide, clues tray, bag, hint' })
pushBand([
  { id: 'grove-canopy', svg: canopySVG(), note: 'foreground sprite · 1.42× · tiles' },
  { id: 'grove-bush', svg: bushSVG(), note: 'foreground sprite · 1.42× · tiles' },
])

/* ---------- 2. PROP LIBRARY — discrete swappable objects ---------- */
pushSection('TOOTH LIBRARY', 'the collectible + the four field-guide tooth cards · keep silhouettes readable at small size')
pushBand([
  { id: 'tooth-floor-clue', svg: floorToothSVG(), note: 'the hidden lobby fossil' },
  { id: 'tooth-leaf-herbivore', svg: toothSVG('leaf'), note: 'broad + flat (correct match)' },
  { id: 'tooth-blade-carnivore', svg: toothSVG('blade'), note: 'serrated blade' },
  { id: 'tooth-cone-piscivore', svg: toothSVG('cone'), note: 'smooth cone' },
])

pushSection('DINO SKELETON MOUNTS', '700 × 520 box · standing on y≈480, facing left · used in grove skeleton + dioramas')
pushBand([
  { id: 'skeleton-trike', svg: wrap(700, 520, SILHOUETTES.trike()), note: 'Triceratops (the answer)' },
  { id: 'skeleton-allo', svg: wrap(700, 520, SILHOUETTES.allo()), note: 'Allosaurus' },
  { id: 'skeleton-spino', svg: wrap(700, 520, SILHOUETTES.spino()), note: 'Spinosaurus' },
])

/* ---------- 3. PAINTED-DIRECTION REFERENCE (from art.js) ---------- */
pushSection('PAINTED DIRECTION — reference, not blockout', 'the captured Art-Deco target fidelity · match palette + mood when painting the layers above')
pushRow(lobbyBack(), { id: 'ref-lobby-back', note: 'reference · warm deco far plane' })
pushRow(lobbyMid(), { id: 'ref-lobby-mid', note: 'reference · dino arch + space teaser' })
pushRow(lobbyFore(), { id: 'ref-lobby-fore', note: 'reference · columns + planter + rope' })
pushRow(hallBack(), { id: 'ref-hall-back', note: 'reference · teal hall, banner, spots' })
pushRow(hallFore(), { id: 'ref-hall-fore', note: 'reference · brass railing' })
pushBand(DINOS.map(d => ({ id: `ref-diorama-${d.id}`, svg: dioramaSVG(d), note: d.name })))
pushBand(DINOS.map(d => ({ id: `ref-card-${d.id}`, svg: catalogCardArt(d), note: `catalog · ${d.name}` })))

/* =========================== assemble =========================== */
const W = maxW + PAD
const H = y + PAD - GAP
const board = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${PAGE}"/>
  <text x="${PAD}" y="${PAD - 36}" font-family="${SERIF}" font-size="40" letter-spacing="4" fill="${LABEL}"
        opacity="0"> </text>
  ${parts.join('\n')}
</svg>`

const outDir = resolve(__dir, '../assets')
mkdirSync(outDir, { recursive: true })
const outFile = resolve(outDir, 'asset-board.svg')
writeFileSync(outFile, board)
console.log(`✓ wrote ${outFile}  (${W}×${H}, ${parts.length} placements)`)
