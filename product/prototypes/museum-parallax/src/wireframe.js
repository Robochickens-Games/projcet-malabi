// Low-fidelity blockout art for the side-scrolling prototype.
// Filled silhouettes + outlines + labels on ink — placeholder geometry to be
// replaced 1:1 by painted layers later. Single source of truth for world
// layout: the exported *_SPOTS constants drive both the drawings and the
// hotspots. Fills are depth-graded (far = darker/recedes, near = lighter)
// so the parallax reads even before real art.
import { SILHOUETTES, SPACE_SILHOUETTES } from './art.js'

export const INK = '#0d141d'
const FAR = '#44606f'
const MID = '#5d7e91'
const MAIN = '#9cb6c7'
const FORE = '#c2d6e2'
const GOLD = '#e8a948'
const ROPE = '#b96a6a'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

// depth-graded fills — each darker than its layer's stroke, so the outline reads
const FAR_F = '#16242f'
const WALL_F = '#111d26'
const MID_F = '#1d2d39'
const MAIN_F = '#273a47'
const FORE_F = '#33485a'
const PANEL_F = '#0f1820'
const PAPER_F = '#23201a'
const GOLD_F = '#3a2a12'
const BONE_F = '#34454f'

const svgOpen = (w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
const tag = (x, y, label, color = MAIN, size = 18, anchor = 'middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}"
         letter-spacing="2" fill="${color}">${label}</text>`
const speedTag = (label) => tag(70, 46, label, FAR, 16, 'start')

/* =========================== LOBBY (world: 2880) =========================== */

export const LOBBY_W = 2880

// the tooth sits 60px behind the planter's centre on a SLOWER layer (1.15x vs
// 1.4x): hidden when you start, it slides out from behind the pot around
// two-thirds of the way down the hall — walking IS the reveal.
export const LOBBY_SPOTS = {
  doorInventions: { x: 700, label: 'INVENTIONS' },
  doorSpace: { x: 1500, label: 'SPACE' },
  doorDino: { x: 2480, label: 'DINOSAUR WING' },
  planter: { x: 1360 },      // on the foreground layer (1.4x)
  tooth: { x: 1300, y: 905 }, // on its own 1.15x layer
}

export function lobbyBackSVG() {
  const W = 2200
  let windows = ''
  for (const cx of [300, 800, 1300, 1800]) {
    windows += `
      <g transform="translate(${cx},0)">
        <path d="M-90,640 L-90,330 A90,90 0 0 1 90,330 L90,640 Z" fill="${FAR_F}" stroke="${FAR}" stroke-width="3"/>
        <g stroke="${FAR}" stroke-width="3" fill="none">
          <line x1="0" y1="245" x2="0" y2="640"/><line x1="-90" y1="430" x2="90" y2="430"/>
        </g>
      </g>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="170" width="${W}" height="680" fill="${WALL_F}"/>
    <g stroke="${FAR}" stroke-width="3" fill="none">
      <line x1="0" y1="170" x2="${W}" y2="170"/>
      <line x1="0" y1="850" x2="${W}" y2="850"/>
    </g>
    ${windows}
    ${tag(W / 2, 110, 'SCIENCE MUSEUM — LOBBY', FAR, 30)}
    ${speedTag('LAYER: BACK WALL · 0.25x')}
  ${'</svg>'}`
}

export function lobbyMainSVG() {
  const door = (x, label, open) => `
    <g transform="translate(${x},0)">
      <path d="M-160,880 L-160,480 A160,160 0 0 1 160,480 L160,880 Z"
            fill="${open ? GOLD_F : MAIN_F}" stroke="${open ? GOLD : MID}" stroke-width="${open ? 5 : 3}"/>
      ${open ? '' : `<g stroke="${ROPE}" stroke-width="3" fill="none">
        <line x1="-150" y1="500" x2="150" y2="860"/><line x1="150" y1="500" x2="-150" y2="860"/></g>`}
      ${tag(0, 300, label, open ? GOLD : MID, 26)}
      ${tag(0, 340, open ? '[ ENTER ]' : '· soon ·', open ? GOLD : FAR, 20)}
    </g>`
  let ticks = ''
  for (let x = 40; x < LOBBY_W; x += 120) ticks += `<line x1="${x}" y1="880" x2="${x - 18}" y2="912" stroke="${MID}" stroke-width="2" opacity="0.5"/>`
  return `${svgOpen(LOBBY_W, 1080)}
    <rect x="0" y="880" width="${LOBBY_W}" height="200" fill="${MAIN_F}"/>
    <line x1="0" y1="880" x2="${LOBBY_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}
    ${door(LOBBY_SPOTS.doorInventions.x, 'INVENTIONS', false)}
    ${door(LOBBY_SPOTS.doorSpace.x, 'SPACE', false)}
    ${door(LOBBY_SPOTS.doorDino.x, 'DINOSAUR WING', true)}
    <!-- info desk -->
    <g transform="translate(330,0)">
      <rect x="-130" y="700" width="260" height="180" fill="${MAIN_F}" stroke="${MID}" stroke-width="3"/>
      <line x1="-130" y1="745" x2="130" y2="745" stroke="${MID}" stroke-width="3"/>
    </g>
    ${tag(330, 675, 'INFO DESK', MID, 18)}
    <!-- bench -->
    <g transform="translate(1950,0)" stroke="${MID}" stroke-width="3">
      <rect x="-150" y="790" width="300" height="34" fill="${MAIN_F}"/>
      <line x1="-120" y1="824" x2="-120" y2="880"/><line x1="120" y1="824" x2="120" y2="880"/>
    </g>
    ${tag(1950, 765, 'BENCH', MID, 18)}
    ${tag(120, 990, 'ENTRANCE', FAR, 18)}
    ${speedTag('LAYER: ROOM · 1.0x')}
  ${'</svg>'}`
}

export function lobbyForeSVG() {
  const W = 3300
  const column = (x) => `
    <g transform="translate(${x},0)" stroke="${FORE}" stroke-width="5">
      <rect x="-52" y="80" width="104" height="940" fill="${FORE_F}"/>
      <rect x="-78" y="40" width="156" height="42" fill="${FORE_F}"/>
      <rect x="-78" y="1020" width="156" height="42" fill="${FORE_F}"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${column(200)}${column(1750)}${column(2480)}${column(3150)}
    <!-- planter: the tooth hides behind this -->
    <g transform="translate(${LOBBY_SPOTS.planter.x},0)">
      <path d="M-120,780 L120,780 L92,1000 L-92,1000 Z" fill="${FORE_F}" stroke="${FORE}" stroke-width="5"/>
      <g stroke="${FORE}" stroke-width="4" fill="${MID_F}">
        <path d="M0,780 C-30,690 -90,650 -130,640 C-95,672 -40,720 0,780 Z"/>
        <path d="M0,780 C-10,670 -30,610 -20,560 C2,608 18,690 0,780 Z"/>
        <path d="M0,780 C30,680 90,640 135,635 C98,668 42,722 0,780 Z"/>
        <path d="M0,780 C15,690 55,640 60,590 C40,640 18,712 0,780 Z"/>
      </g>
      ${tag(0, 1045, 'PLANTER', FORE, 18)}
    </g>
    <!-- rope -->
    <path d="M1750,360 Q2115,470 2480,360" stroke="${ROPE}" stroke-width="5" fill="none"/>
    ${speedTag('LAYER: FOREGROUND · 1.4x')}
  ${'</svg>'}`
}

/* =========================== GROVE (world: 3840) =========================== */

export const GROVE_W = 3840

export const GROVE_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 2130 },
  skeleton: { x: 2700, y: 430, w: 640, h: 460 },
  socket: { x: 2440, y: 685 },   // the empty jaw — where the player places the tooth
  feather: { x: 2050, y: 905 },  // a stray feather on the trail — belongs to the raptor
                                 // (rides a 1.2x layer; the 1.42x bush in front reveals it as you walk)
  tray: { x: 2480, y: 940 },     // top-left of the FOUND CLUES tray
  bag: { x: 2280, y: 1000 },
  hint: { x: 3760, y: 1000 },
}

// clouds + sun: the farthest layer — barely moves, everything drifts past it
export function groveCloudsSVG() {
  const W = 2150
  let rays = ''
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    rays += `<line x1="${1620 + Math.cos(a) * 70}" y1="${300 + Math.sin(a) * 70}"
                   x2="${1620 + Math.cos(a) * 105}" y2="${300 + Math.sin(a) * 105}"
                   stroke="${GOLD}" stroke-width="3"/>`
  }
  const cloud = (cx, cy, rx) => `
    <g stroke="${FAR}" stroke-width="3" fill="${FAR_F}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.24}"/>
      <ellipse cx="${cx - rx * 0.35}" cy="${cy - rx * 0.16}" rx="${rx * 0.45}" ry="${rx * 0.16}"/>
    </g>`
  return `${svgOpen(W, 1080)}
    <circle cx="1620" cy="300" r="54" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
    ${rays}
    ${cloud(300, 210, 140)}${cloud(840, 140, 170)}${cloud(1280, 250, 110)}${cloud(1900, 180, 150)}
    ${speedTag('LAYER: CLOUDS + SUN · 0.1x')}
  ${'</svg>'}`
}

// mountain ridges: filled silhouettes, sliding between clouds and treeline
export function groveMountainsSVG() {
  const W = 2520
  const ridge = (baseY, amp, step, fill) => {
    let pts = `-40,700 `
    for (let x = -40, i = 0; x <= W + 40; x += step, i++) {
      pts += `${x},${baseY - amp * (0.35 + ((i * 7) % 10) / 11)} ${x + step / 2},${baseY - amp * 0.12} `
    }
    pts += `${W + 40},700`
    return `<polygon points="${pts}" fill="${fill}" stroke="${FAR}" stroke-width="3"/>`
  }
  return `${svgOpen(W, 1080)}
    ${ridge(520, 240, 420, FAR_F)}
    ${ridge(590, 160, 300, MID_F)}
    ${speedTag('LAYER: MOUNTAINS · 0.3x')}
  ${'</svg>'}`
}

export function groveMidSVG() {
  const W = 2900
  let trees = ''
  for (let x = 30, i = 0; x < W; x += 150, i++) {
    const r = 55 + ((i * 13) % 4) * 12
    const y = 705 + ((i * 7) % 3) * 16
    trees += `
      <path d="M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y} Z" fill="${MID_F}" stroke="${MID}" stroke-width="3"/>
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 70}" stroke="${MID}" stroke-width="3"/>`
  }
  return `${svgOpen(W, 1080)}
    ${trees}
    ${speedTag('LAYER: TREELINE · 0.5x')}
  ${'</svg>'}`
}

export function groveMainSVG() {
  let ticks = ''
  for (let x = 30, i = 0; x < GROVE_W; x += 130, i++) {
    ticks += `<line x1="${x}" y1="880" x2="${x - 20}" y2="914" stroke="${MAIN}" stroke-width="2" opacity="0.5"/>`
    if (i % 3 === 0) ticks += `<path d="M${x + 60},880 l10,-26 l16,4 l8,22 Z" stroke="${MID}" stroke-width="2" fill="${MID_F}"/>`
    if (i % 4 === 1) ticks += `<g stroke="${MID}" stroke-width="2">
      <line x1="${x + 30}" y1="880" x2="${x + 24}" y2="852"/><line x1="${x + 36}" y1="880" x2="${x + 38}" y2="850"/>
      <line x1="${x + 42}" y1="880" x2="${x + 50}" y2="856"/></g>`
  }

  const S = GROVE_SPOTS
  return `${svgOpen(GROVE_W, 1080)}
    <rect x="0" y="880" width="${GROVE_W}" height="200" fill="${MAIN_F}"/>
    <line x1="0" y1="880" x2="${GROVE_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}

    <!-- trailhead -->
    <g transform="translate(${S.backPost.x + 110},0)">
      <line x1="0" y1="880" x2="0" y2="640" stroke="${GOLD}" stroke-width="4"/>
      <rect x="-105" y="590" width="210" height="60" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    </g>
    ${tag(S.backPost.x + 110, 628, '&#8592; LOBBY', GOLD, 22)}
    <g transform="translate(620,0)">
      <line x1="0" y1="880" x2="0" y2="660" stroke="${MID}" stroke-width="3"/>
      <rect x="-150" y="610" width="300" height="56" fill="${MAIN_F}" stroke="${MID}" stroke-width="3"/>
    </g>
    ${tag(620, 646, 'NESTING GROVE &#8594;', MID, 20)}

    <!-- placard -->
    <g transform="translate(${S.placard.x},0) rotate(-3)">
      <rect x="-85" y="640" width="170" height="200" rx="8" stroke="${MAIN}" stroke-width="3" fill="${PAPER_F}"/>
      ${tag(0, 680, 'PLACARD', MAIN, 16)}
      ${[706, 726, 746, 766, 786].map((y) => `<line x1="-62" y1="${y}" x2="62" y2="${y}" stroke="${FAR}" stroke-width="3"/>`).join('')}
    </g>

    <!-- the skeleton mount, with an empty jaw socket to fill -->
    <g transform="translate(${S.skeleton.x},0)">
      <line x1="-320" y1="880" x2="320" y2="880" stroke="${MAIN}" stroke-width="6"/>
      <g transform="translate(-310,388) scale(0.9)">${SILHOUETTES.trike(BONE_F, '#223039', MAIN)}</g>
      <g fill="none" stroke="${MAIN}" stroke-width="2" opacity="0.6">
        <rect x="-320" y="350" width="640" height="530" rx="14" stroke-dasharray="10 8"/>
      </g>
    </g>

    <!-- found clues tray -->
    <g transform="translate(${S.tray.x},${S.tray.y})">
      <rect x="0" y="0" width="620" height="110" rx="12" fill="${PANEL_F}" stroke="${MAIN}" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${24 + i * 152}" y="18" width="120" height="74" rx="8" fill="${INK}" stroke="${FAR}" stroke-width="3"/>`).join('')}
    </g>
    ${tag(S.tray.x + 310, S.tray.y - 14, 'FOUND CLUES', MAIN, 18)}

    <!-- bag + hint -->
    <circle cx="${S.bag.x}" cy="${S.bag.y}" r="56" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    ${tag(S.bag.x, S.bag.y + 7, 'BAG', GOLD, 18)}
    <circle cx="${S.hint.x}" cy="${S.hint.y}" r="56" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    ${tag(S.hint.x, S.hint.y + 7, 'HINT', GOLD, 18)}

    ${speedTag('LAYER: TRAIL + SCENE · 1.0x')}
  ${'</svg>'}`
}

// small repeated foreground sprites (fastest layer)
export function canopySVG() {
  return `${svgOpen(360, 250)}
    <path d="M180,0 C120,40 70,30 30,170 C90,150 130,120 180,40 C230,120 270,150 330,150 C290,40 240,40 180,0 Z"
          fill="${FORE_F}" stroke="${FORE}" stroke-width="4"/>
    <g stroke="${FORE}" stroke-width="3" fill="none">
      <path d="M180,30 Q150,110 95,150"/><path d="M180,30 Q210,110 290,140"/>
    </g>
  ${'</svg>'}`
}

export function bushSVG() {
  return `${svgOpen(280, 170)}
    <path d="M10,165 Q30,60 90,55 Q140,-10 200,55 Q260,60 272,165 Z" fill="${FORE_F}" stroke="${FORE}" stroke-width="5"/>
    <g stroke="${FORE}" stroke-width="3" fill="none">
      <line x1="95" y1="160" x2="105" y2="80"/><line x1="160" y1="160" x2="150" y2="60"/>
    </g>
  ${'</svg>'}`
}

/* ===================== DINO HALL — the dino-wing hub (world: 4700) =====================
   A gallery of dioramas, one per dino. Each framed niche is a tappable door into
   that dino's room. */

export const DINOHUB_W = 4700

export const DINOHUB_SPOTS = {
  back: { x: 120, label: 'LOBBY' },               // ‹ back to the museum lobby (left)
  trike: { x: 900, w: 460, h: 660 },              // → TRICERATOPS grove
  ptero: { x: 1700, w: 460, h: 660 },             // → PTERODACTYL sea cliffs
  trex: { x: 2500, w: 460, h: 660 },              // → T-REX forest
  raptor: { x: 3300, w: 460, h: 660 },            // → VELOCIRAPTOR badlands
  brachio: { x: 4100, w: 460, h: 660 },           // → BRACHIOSAURUS plains
}

// the diorama order shown in the hall (also the catalog order)
export const DINOHUB_ORDER = [
  ['trike', 'TRICERATOPS'], ['ptero', 'PTERODACTYL'], ['trex', 'T-REX'],
  ['raptor', 'VELOCIRAPTOR'], ['brachio', 'BRACHIOSAURUS'],
]

export function dinohubBackSVG() {
  const W = 3900
  return `${svgOpen(W, 1080)}
    <rect x="0" y="150" width="${W}" height="710" fill="${WALL_F}"/>
    <g stroke="${FAR}" stroke-width="3" fill="none">
      <line x1="0" y1="150" x2="${W}" y2="150"/><line x1="0" y1="860" x2="${W}" y2="860"/>
    </g>
    ${tag(W / 2, 112, 'HALL OF DINOSAURS', FAR, 30)}
    ${speedTag('LAYER: BACK WALL · 0.3x')}
  ${'</svg>'}`
}

export function dinohubMainSVG() {
  const S = DINOHUB_SPOTS
  // a framed niche with the dino inside, a nameplate, and an ENTER cue
  const diorama = (x, sil, label) => `
    <g transform="translate(${x},0)">
      <rect x="-230" y="200" width="460" height="660" rx="18" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="5"/>
      <path d="M-208,300 A208,150 0 0 1 208,300" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <rect x="-210" y="720" width="420" height="140" fill="${MID_F}"/>
      <g transform="translate(-252,374) scale(0.72)">${sil}</g>
      <rect x="-150" y="772" width="300" height="54" rx="10" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
      ${tag(0, 808, label, GOLD, 18)}
      ${tag(0, 262, '[ ENTER ]', GOLD, 18)}
    </g>`
  let ticks = ''
  for (let x = 40; x < DINOHUB_W; x += 120) ticks += `<line x1="${x}" y1="880" x2="${x - 18}" y2="912" stroke="${MAIN}" stroke-width="2" opacity="0.5"/>`
  const dioramas = DINOHUB_ORDER.map(([id, label]) => diorama(S[id].x, SILHOUETTES[id](BONE_F, '#223039', MAIN), label)).join('')
  return `${svgOpen(DINOHUB_W, 1080)}
    <rect x="0" y="880" width="${DINOHUB_W}" height="200" fill="${MAIN_F}"/>
    <line x1="0" y1="880" x2="${DINOHUB_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}
    <!-- ‹ back to lobby -->
    <g transform="translate(${S.back.x + 90},0)">
      <line x1="0" y1="880" x2="0" y2="600" stroke="${GOLD}" stroke-width="4"/>
      <rect x="-100" y="552" width="200" height="58" rx="8" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    </g>
    ${tag(S.back.x + 90, 588, '&#8592; LOBBY', GOLD, 20)}
    ${dioramas}
    ${speedTag('LAYER: GALLERY · 1.0x')}
  ${'</svg>'}`
}

export function dinohubForeSVG() {
  const W = 5000
  const column = (x) => `
    <g transform="translate(${x},0)" stroke="${FORE}" stroke-width="5">
      <rect x="-44" y="60" width="88" height="980" fill="${FORE_F}"/>
      <rect x="-66" y="20" width="132" height="44" fill="${FORE_F}"/>
      <rect x="-66" y="1010" width="132" height="40" fill="${FORE_F}"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${[480, 1300, 2100, 2900, 3700, 4520].map(column).join('')}
    ${speedTag('LAYER: FOREGROUND · 1.35x')}
  ${'</svg>'}`
}

/* ===================== VELOCIRAPTOR ROOM — arid badlands (world: 3600) ===================== */

export const RAPTOR_W = 3600

export const RAPTOR_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 1500 },
  skeleton: { x: 2300, y: 380, w: 560, h: 500 },
  socket: { x: 2240, y: 612 },   // on the raptor's feathered arm/back (not drawn)
  clue: { x: 2050, y: 905 },     // a T-REX tooth hidden behind a rock here
  hint: { x: 3360, y: 1000 },
}

const SAND = '#9c8a52'
const D_FAR = '#2b2718'
const D_MID = '#393320'
const D_MAIN = '#4a4327'
const D_FORE = '#5c5430'

function dunes(W, baseY, amp, fill) {
  const step = 360
  let d = `M-40,1080 L-40,${baseY}`
  for (let x = -40, i = 0; x <= W + 40; x += step, i++) {
    const cy = baseY - amp * (0.5 + ((i * 5) % 7) / 9)
    d += ` Q ${x + step / 2},${cy} ${x + step},${(baseY - amp * 0.2).toFixed(0)}`
  }
  d += ` L${W + 40},1080 Z`
  return `<path d="${d}" fill="${fill}" stroke="${SAND}" stroke-width="3"/>`
}

export function raptorSkySVG() {
  const W = 2200
  let rays = ''
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    rays += `<line x1="${1700 + Math.cos(a) * 64}" y1="${280 + Math.sin(a) * 64}"
                   x2="${1700 + Math.cos(a) * 98}" y2="${280 + Math.sin(a) * 98}" stroke="${GOLD}" stroke-width="3"/>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="0" width="${W}" height="1080" fill="#241a0c"/>
    <circle cx="1700" cy="280" r="60" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
    ${rays}
    ${speedTag('LAYER: DESERT SKY + SUN · 0.1x')}
  ${'</svg>'}`
}

export function raptorDunesFarSVG() {
  const W = 2600
  return `${svgOpen(W, 1080)}
    ${dunes(W, 720, 150, D_FAR)}
    ${speedTag('LAYER: FAR DUNES · 0.3x')}
  ${'</svg>'}`
}

export function raptorDunesMidSVG() {
  const W = 2950
  let rocks = ''
  for (let x = 120, i = 0; x < W; x += 520, i++) {
    rocks += `<path d="M${x},860 l40,-90 l60,40 l50,-60 l70,110 Z" fill="${D_MID}" stroke="${SAND}" stroke-width="3"/>`
  }
  return `${svgOpen(W, 1080)}
    ${dunes(W, 820, 110, D_MID)}
    ${rocks}
    ${speedTag('LAYER: NEAR DUNES · 0.5x')}
  ${'</svg>'}`
}

export function raptorMainSVG() {
  const S = RAPTOR_SPOTS
  let ticks = ''
  for (let x = 30, i = 0; x < RAPTOR_W; x += 130, i++) {
    ticks += `<line x1="${x}" y1="880" x2="${x - 20}" y2="914" stroke="${SAND}" stroke-width="2" opacity="0.5"/>`
    if (i % 3 === 0) ticks += `<path d="M${x + 50},880 l9,-22 l15,4 l6,18 Z" fill="${D_MID}" stroke="${SAND}" stroke-width="2"/>`
  }
  return `${svgOpen(RAPTOR_W, 1080)}
    <rect x="0" y="880" width="${RAPTOR_W}" height="200" fill="${D_MAIN}"/>
    <line x1="0" y1="880" x2="${RAPTOR_W}" y2="880" stroke="${SAND}" stroke-width="4"/>
    ${ticks}
    <!-- ‹ back to the dino hall -->
    <g transform="translate(${S.backPost.x + 110},0)">
      <line x1="0" y1="880" x2="0" y2="640" stroke="${GOLD}" stroke-width="4"/>
      <rect x="-120" y="590" width="240" height="60" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    </g>
    ${tag(S.backPost.x + 110, 628, '&#8592; DINO HALL', GOLD, 20)}
    <!-- placard -->
    <g transform="translate(${S.placard.x},0) rotate(-3)">
      <rect x="-85" y="640" width="170" height="200" rx="8" stroke="${SAND}" stroke-width="3" fill="${PAPER_F}"/>
      ${tag(0, 680, 'PLACARD', SAND, 16)}
      ${[706, 726, 746, 766, 786].map((y) => `<line x1="-62" y1="${y}" x2="62" y2="${y}" stroke="${D_MID}" stroke-width="3"/>`).join('')}
    </g>
    <!-- the raptor skeleton mount -->
    <g transform="translate(${S.skeleton.x},0)">
      <line x1="-300" y1="880" x2="300" y2="880" stroke="${SAND}" stroke-width="6"/>
      <g transform="translate(-280,400) scale(0.9)">${SILHOUETTES.raptor(BONE_F, '#2a2415', SAND)}</g>
      <g fill="none" stroke="${SAND}" stroke-width="2" opacity="0.6">
        <rect x="-300" y="330" width="600" height="550" rx="14" stroke-dasharray="10 8"/>
      </g>
    </g>
    <!-- hint -->
    <circle cx="${S.hint.x}" cy="${S.hint.y}" r="56" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    ${tag(S.hint.x, S.hint.y + 7, 'HINT', GOLD, 18)}
    ${speedTag('LAYER: BADLANDS · 1.0x')}
  ${'</svg>'}`
}

export function raptorRockSVG() {
  return `${svgOpen(340, 230)}
    <path d="M10,220 L70,90 L130,150 L196,60 L280,170 L330,220 Z" fill="${D_FORE}" stroke="${SAND}" stroke-width="5"/>
  ${'</svg>'}`
}

/* ===================== shared room furniture ===================== */
// every dino room reuses these: a back-exit post, a placard, the skeleton mount,
// and a hint puck — only the palette + silhouette change.
function roomBackPost(S, label) {
  return `<g transform="translate(${S.backPost.x + 110},0)">
      <line x1="0" y1="880" x2="0" y2="640" stroke="${GOLD}" stroke-width="4"/>
      <rect x="-120" y="590" width="240" height="60" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    </g>
    ${tag(S.backPost.x + 110, 628, label, GOLD, 20)}`
}
function roomPlacard(S, stroke) {
  return `<g transform="translate(${S.placard.x},0) rotate(-3)">
      <rect x="-85" y="640" width="170" height="200" rx="8" stroke="${stroke}" stroke-width="3" fill="${PAPER_F}"/>
      ${tag(0, 680, 'PLACARD', stroke, 16)}
      ${[706, 726, 746, 766, 786].map((y) => `<line x1="-62" y1="${y}" x2="62" y2="${y}" stroke="${stroke}" stroke-width="3" opacity="0.7"/>`).join('')}
    </g>`
}
function roomMount(S, stroke, sil, ty = 400, scale = 0.9) {
  return `<g transform="translate(${S.skeleton.x},0)">
      <line x1="-300" y1="880" x2="300" y2="880" stroke="${stroke}" stroke-width="6"/>
      <g transform="translate(-280,${ty}) scale(${scale})">${sil}</g>
      <g fill="none" stroke="${stroke}" stroke-width="2" opacity="0.55">
        <rect x="-300" y="300" width="600" height="580" rx="14" stroke-dasharray="10 8"/>
      </g>
    </g>`
}
function roomHint(S) {
  return `<circle cx="${S.hint.x}" cy="${S.hint.y}" r="56" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    ${tag(S.hint.x, S.hint.y + 7, 'HINT', GOLD, 18)}`
}
function roomFloorTicks(W, stroke) {
  let t = ''
  for (let x = 30; x < W; x += 130) t += `<line x1="${x}" y1="880" x2="${x - 20}" y2="914" stroke="${stroke}" stroke-width="2" opacity="0.5"/>`
  return t
}

/* ===================== T-REX ROOM — dim conifer forest (world: 3600) ===================== */

export const TREX_W = 3600
export const TREX_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 1500 },
  skeleton: { x: 2300, y: 360, w: 600, h: 520 },
  socket: { x: 2130, y: 662 },   // the T-rex jaw — place the T-REX TOOTH
  clue: { x: 2050, y: 905 },     // a BRACHIOSAURUS egg hidden behind a fern
  foot: { x: 1150, y: 880 },     // the foot-assembly station (drag bones here)
  hint: { x: 3360, y: 1000 },
}

const F_LEAF = '#5f8a63'
const F_FAR = '#16261b'
const F_MID = '#1e3325'
const F_MAIN = '#284233'
const F_FORE = '#35543f'
const conifer = (x, baseY, h, fill) => `<g stroke="${F_LEAF}" stroke-width="3" fill="${fill}">
  <polygon points="${x},${baseY - h} ${x - h * 0.34},${baseY} ${x + h * 0.34},${baseY}"/>
  <polygon points="${x},${baseY - h * 0.66} ${x - h * 0.27},${baseY - h * 0.26} ${x + h * 0.27},${baseY - h * 0.26}"/>
  <line x1="${x}" y1="${baseY}" x2="${x}" y2="${baseY + 22}"/></g>`

export function trexSkySVG() {
  return `${svgOpen(2200, 1080)}
    <rect width="2200" height="1080" fill="#0e1a13"/>
    <ellipse cx="1500" cy="240" rx="260" ry="160" fill="#1c3326" opacity="0.7"/>
    ${speedTag('LAYER: FOREST HAZE · 0.15x')}
  ${'</svg>'}`
}
export function trexFarSVG() {
  const W = 2600
  let t = ''
  for (let x = 60, i = 0; x < W; x += 150, i++) t += conifer(x, 760, 260 + ((i * 7) % 4) * 30, F_FAR)
  return `${svgOpen(W, 1080)}${t}${speedTag('LAYER: FAR CONIFERS · 0.3x')}</svg>`
}
export function trexMidSVG() {
  const W = 2950
  let t = ''
  for (let x = 80, i = 0; x < W; x += 210, i++) t += conifer(x, 850, 330 + ((i * 5) % 3) * 44, F_MID)
  return `${svgOpen(W, 1080)}${t}${speedTag('LAYER: TREELINE · 0.5x')}</svg>`
}
export function trexMainSVG() {
  const S = TREX_SPOTS
  return `${svgOpen(TREX_W, 1080)}
    <rect x="0" y="880" width="${TREX_W}" height="200" fill="${F_MAIN}"/>
    <line x1="0" y1="880" x2="${TREX_W}" y2="880" stroke="${F_LEAF}" stroke-width="4"/>
    ${roomFloorTicks(TREX_W, F_LEAF)}
    ${roomBackPost(S, '&#8592; DINO HALL')}
    ${roomPlacard(S, F_LEAF)}
    ${roomMount(S, F_LEAF, SILHOUETTES.trex(BONE_F, '#1a2a20', F_LEAF))}
    <!-- foot-assembly station -->
    ${tag(S.foot.x, 556, 'REBUILD THE FOOT', GOLD, 18)}
    ${tag(S.foot.x, 582, 'drag the bones — match the catalog’s 3-toed track', F_LEAF, 13)}
    ${roomHint(S)}
    ${speedTag('LAYER: FOREST FLOOR · 1.0x')}
  ${'</svg>'}`
}
export function trexFernSVG() {
  return `${svgOpen(320, 240)}
    <g stroke="${F_LEAF}" stroke-width="4" fill="${F_FORE}">
      <path d="M160,240 C90,180 60,90 150,20 C170,110 180,170 160,240 Z"/>
      <path d="M160,240 C230,180 260,90 170,20 C150,110 140,170 160,240 Z"/>
    </g>
  ${'</svg>'}`
}

/* ===================== BRACHIOSAURUS ROOM — open plains (world: 4000) ===================== */

export const BRACHIO_W = 4000
export const BRACHIO_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 1600 },
  skeleton: { x: 2500, y: 280, w: 700, h: 600 },
  socket: { x: 2150, y: 846 },   // an egg nest on the ground by its feet — place the EGG
  clue: { x: 2050, y: 905 },     // PYCNOFIBERS hidden behind a grass tuft
  hint: { x: 3760, y: 1000 },
}

const P_GRASS = '#b89a5a'
const P_FAR = '#3a3a26'
const P_MID = '#4a4327'
const P_MAIN = '#5a4f2c'
const P_FORE = '#6d6035'

export function brachioSkySVG() {
  return `${svgOpen(2200, 1080)}
    <rect width="2200" height="1080" fill="#2a2410"/>
    <circle cx="1700" cy="260" r="70" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
    ${speedTag('LAYER: PLAINS SKY · 0.1x')}
  ${'</svg>'}`
}
export function brachioHillsSVG() {
  const W = 2600
  let d = `M-40,1080 L-40,780`
  for (let x = -40, i = 0; x <= W + 40; x += 380, i++) d += ` Q ${x + 190},${720 - ((i * 5) % 5) * 24} ${x + 380},760`
  d += ` L${W + 40},1080 Z`
  return `${svgOpen(W, 1080)}<path d="${d}" fill="${P_FAR}" stroke="${P_GRASS}" stroke-width="3"/>${speedTag('LAYER: FAR HILLS · 0.3x')}</svg>`
}
export function brachioTreesSVG() {
  const W = 2950
  let t = ''
  for (let x = 120, i = 0; x < W; x += 520, i++) t += `<g stroke="${P_GRASS}" stroke-width="4" fill="${P_MID}">
    <line x1="${x}" y1="860" x2="${x}" y2="700"/><ellipse cx="${x}" cy="690" rx="${90 + (i % 2) * 24}" ry="34"/></g>`
  return `${svgOpen(W, 1080)}${t}${speedTag('LAYER: ACACIAS · 0.5x')}</svg>`
}
export function brachioMainSVG() {
  const S = BRACHIO_SPOTS
  // a nest ring at the egg socket
  const nest = `<g transform="translate(${S.socket.x},${S.socket.y})">
    <ellipse cx="0" cy="6" rx="86" ry="26" fill="${P_MID}" stroke="${P_GRASS}" stroke-width="3"/>
    <ellipse cx="0" cy="0" rx="58" ry="16" fill="${INK}" stroke="${P_GRASS}" stroke-width="2"/></g>`
  return `${svgOpen(BRACHIO_W, 1080)}
    <rect x="0" y="880" width="${BRACHIO_W}" height="200" fill="${P_MAIN}"/>
    <line x1="0" y1="880" x2="${BRACHIO_W}" y2="880" stroke="${P_GRASS}" stroke-width="4"/>
    ${roomFloorTicks(BRACHIO_W, P_GRASS)}
    ${roomBackPost(S, '&#8592; DINO HALL')}
    ${roomPlacard(S, P_GRASS)}
    ${roomMount(S, P_GRASS, SILHOUETTES.brachio(BONE_F, '#2c2716', P_GRASS), 380, 0.92)}
    ${nest}
    ${roomHint(S)}
    ${speedTag('LAYER: PLAINS · 1.0x')}
  ${'</svg>'}`
}
export function brachioGrassSVG() {
  return `${svgOpen(300, 200)}
    <g stroke="${P_GRASS}" stroke-width="5" fill="none" stroke-linecap="round">
      ${[60, 100, 140, 180, 220].map((x, i) => `<path d="M${x},200 Q${x - 10 + i * 4},90 ${x + 20},40"/>`).join('')}
    </g>
  ${'</svg>'}`
}

/* ===================== PTERODACTYL ROOM — sea cliffs + sky (world: 3400) ===================== */

export const PTERO_W = 3400
export const PTERO_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 1400 },
  skeleton: { x: 2200, y: 240, w: 640, h: 460 },
  socket: { x: 2240, y: 512 },   // on the flying pterosaur's body — place the PYCNOFIBERS
  hint: { x: 3160, y: 1000 },
}

const C_LINE = '#7fa6c0'
const C_SKY = '#16242f'
const C_SEA = '#1d3344'
const C_FAR = '#22384a'
const C_MAIN = '#2c4458'
const C_FORE = '#3a586e'

export function pteroSkySVG() {
  const W = 2200
  const cloud = (cx, cy, rx) => `<g stroke="${C_FAR}" stroke-width="3" fill="#21384a">
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.26}"/>
    <ellipse cx="${cx - rx * 0.35}" cy="${cy - rx * 0.16}" rx="${rx * 0.5}" ry="${rx * 0.18}"/></g>`
  return `${svgOpen(W, 1080)}
    <rect width="${W}" height="1080" fill="${C_SKY}"/>
    <circle cx="1600" cy="250" r="58" fill="#26415a" stroke="${C_LINE}" stroke-width="3"/>
    ${cloud(360, 220, 150)}${cloud(900, 150, 180)}${cloud(1400, 280, 120)}${cloud(1980, 190, 150)}
    ${speedTag('LAYER: SKY · 0.1x')}
  ${'</svg>'}`
}
export function pteroSeaSVG() {
  const W = 2600
  return `${svgOpen(W, 1080)}
    <rect x="0" y="640" width="${W}" height="160" fill="${C_SEA}"/>
    <g stroke="${C_LINE}" stroke-width="2" opacity="0.4">
      ${[670, 700, 730, 760].map((y) => `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`).join('')}
    </g>
    ${speedTag('LAYER: SEA · 0.25x')}
  ${'</svg>'}`
}
export function pteroCliffSVG() {
  const W = 2900
  let t = ''
  for (let x = 0, i = 0; x < W; x += 620, i++) t += `<path d="M${x},880 L${x + 60},${560 - (i % 2) * 60} L${x + 280},${600 - (i % 3) * 40} L${x + 480},${640} L${x + 620},880 Z" fill="${C_FAR}" stroke="${C_LINE}" stroke-width="3"/>`
  return `${svgOpen(W, 1080)}${t}${speedTag('LAYER: CLIFFS · 0.5x')}</svg>`
}
export function pteroMainSVG() {
  const S = PTERO_SPOTS
  return `${svgOpen(PTERO_W, 1080)}
    <rect x="0" y="880" width="${PTERO_W}" height="200" fill="${C_MAIN}"/>
    <line x1="0" y1="880" x2="${PTERO_W}" y2="880" stroke="${C_LINE}" stroke-width="4"/>
    ${roomFloorTicks(PTERO_W, C_LINE)}
    ${roomBackPost(S, '&#8592; DINO HALL')}
    ${roomPlacard(S, C_LINE)}
    <!-- a mount pole holds the flying pterosaur above the ledge -->
    <line x1="${S.skeleton.x}" y1="880" x2="${S.skeleton.x}" y2="560" stroke="${C_LINE}" stroke-width="4" opacity="0.6"/>
    ${roomMount(S, C_LINE, SILHOUETTES.ptero(BONE_F, '#16242f', C_LINE), 220, 0.95)}
    ${roomHint(S)}
    ${speedTag('LAYER: CLIFF LEDGE · 1.0x')}
  ${'</svg>'}`
}
export function pteroRockSVG() {
  return `${svgOpen(320, 220)}
    <path d="M10,220 L80,110 L150,160 L210,80 L290,180 L310,220 Z" fill="${C_FORE}" stroke="${C_LINE}" stroke-width="5"/>
  ${'</svg>'}`
}

/* ===================== SPACE HALL — the space-wing hub (world: 5200) =====================
   The Space Wing's counterpart to the Dino Hall: five framed niches, one per
   diorama, plus the SPACE SUPPLY DESK — the wing's economy hub, and the reason
   this hall is a place you keep coming back to rather than a corridor you pass
   through once. Cooler palette than the dino hall (deep space blues against the
   museum's gold) so the two wings read as different rooms of the same building. */

export const SPACEHUB_W = 5200

export const SPACEHUB_SPOTS = {
  back: { x: 120, label: 'LOBBY' },              // ‹ back to the museum lobby
  desk: { x: 760, w: 420, h: 300 },              // the Space Supply Desk counter
  solar: { x: 1560, w: 460, h: 660 },            // → SOLAR SYSTEM orrery
  mars: { x: 2360, w: 460, h: 660 },             // → MARS rover repair
  moon: { x: 3160, w: 460, h: 660 },             // → MOON landing sequence
  station: { x: 3960, w: 460, h: 660 },          // → SPACE STATION airlock
  webb: { x: 4760, w: 460, h: 660 },             // → JAMES WEBB mirrors
  rock: { x: 1180, y: 908 },                     // a space rock on the hall floor
}

// niche order in the hall — also the order the spec's comic introduces them
export const SPACEHUB_ORDER = [
  ['solar', 'SOLAR SYSTEM'], ['mars', 'MARS'], ['moon', 'MOON MISSIONS'],
  ['station', 'SPACE STATION'], ['webb', 'JAMES WEBB'],
]

const SPACE_FAR = '#3d5a74'
const SPACE_FAR_F = '#111c2b'
const SPACE_WALL_F = '#0c1522'

export function spacehubBackSVG() {
  const W = 4300
  // a starfield behind the hall's high windows — deterministic so the layout is
  // stable between reloads (a twinkling random field would fight the parallax)
  let stars = ''
  for (let i = 0; i < 90; i++) {
    const x = (i * 227) % W
    const y = 170 + ((i * 149) % 620)
    const r = 1.5 + ((i * 37) % 5) * 0.5
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${SPACE_FAR}" opacity="${0.35 + ((i * 17) % 5) * 0.11}"/>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="150" width="${W}" height="710" fill="${SPACE_WALL_F}"/>
    ${stars}
    <g stroke="${SPACE_FAR}" stroke-width="3" fill="none">
      <line x1="0" y1="150" x2="${W}" y2="150"/><line x1="0" y1="860" x2="${W}" y2="860"/>
    </g>
    ${tag(W / 2, 112, 'HALL OF SPACE', SPACE_FAR, 30)}
    ${speedTag('LAYER: BACK WALL · 0.3x')}
  ${'</svg>'}`
}

export function spacehubMainSVG() {
  const S = SPACEHUB_SPOTS
  // same framed-niche language as the Dino Hall, so a child who learned the hub
  // once knows how to read this one
  const diorama = (x, sil, label) => `
    <g transform="translate(${x},0)">
      <rect x="-230" y="200" width="460" height="660" rx="18" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="5"/>
      <path d="M-208,300 A208,150 0 0 1 208,300" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <rect x="-210" y="720" width="420" height="140" fill="${SPACE_FAR_F}"/>
      <g transform="translate(-252,374) scale(0.72)">${sil}</g>
      <rect x="-150" y="772" width="300" height="54" rx="10" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
      ${tag(0, 808, label, GOLD, 18)}
      ${tag(0, 262, '[ ENTER ]', GOLD, 18)}
    </g>`

  // the Supply Desk: a counter you walk up to, with a coin sign so a child can
  // tell at a glance this is where money happens
  const desk = `
    <g transform="translate(${S.desk.x},0)">
      <rect x="-210" y="600" width="420" height="60" rx="10" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="5"/>
      <rect x="-180" y="660" width="360" height="220" fill="${MID_F}" stroke="${GOLD}" stroke-width="4"/>
      <g stroke="${GOLD}" stroke-width="3" opacity="0.55">
        <line x1="-180" y1="730" x2="180" y2="730"/><line x1="-60" y1="660" x2="-60" y2="880"/>
        <line x1="60" y1="660" x2="60" y2="880"/>
      </g>
      <rect x="-150" y="404" width="300" height="150" rx="12" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="4"/>
      ${tag(0, 456, 'SPACE SUPPLY', GOLD, 22)}
      ${tag(0, 492, 'DESK', GOLD, 22)}
      <circle cx="0" cy="528" r="15" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="3"/>
      ${tag(0, 582, '[ TRADE ]', GOLD, 18)}
    </g>`

  let ticks = ''
  for (let x = 40; x < SPACEHUB_W; x += 120) ticks += `<line x1="${x}" y1="880" x2="${x - 18}" y2="912" stroke="${MAIN}" stroke-width="2" opacity="0.5"/>`
  const dioramas = SPACEHUB_ORDER.map(([id, label]) => diorama(S[id].x, SPACE_SILHOUETTES[id](BONE_F, '#223039', MAIN), label)).join('')
  return `${svgOpen(SPACEHUB_W, 1080)}
    <rect x="0" y="880" width="${SPACEHUB_W}" height="200" fill="${MAIN_F}"/>
    <line x1="0" y1="880" x2="${SPACEHUB_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}
    <!-- ‹ back to lobby -->
    <g transform="translate(${S.back.x + 90},0)">
      <line x1="0" y1="880" x2="0" y2="600" stroke="${GOLD}" stroke-width="4"/>
      <rect x="-100" y="552" width="200" height="58" rx="8" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
    </g>
    ${tag(S.back.x + 90, 588, '&#8592; LOBBY', GOLD, 20)}
    ${desk}
    ${dioramas}
    ${speedTag('LAYER: GALLERY · 1.0x')}
  ${'</svg>'}`
}

export function spacehubForeSVG() {
  const W = 5500
  const column = (x) => `
    <g transform="translate(${x},0)" stroke="${FORE}" stroke-width="5">
      <rect x="-44" y="60" width="88" height="980" fill="${FORE_F}"/>
      <rect x="-66" y="20" width="132" height="44" fill="${FORE_F}"/>
      <rect x="-66" y="1010" width="132" height="40" fill="${FORE_F}"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${[420, 1150, 1960, 2760, 3560, 4360, 5120].map(column).join('')}
    ${speedTag('LAYER: FOREGROUND · 1.35x')}
  ${'</svg>'}`
}

/* ===================== SOLAR SYSTEM ROOM — the orrery (world: 3800) =====================
   A darkened planetarium bay. The centrepiece is a walk-up ORRERY: the Sun with
   eight orbit rings around it, five planets already mounted and three EMPTY
   sockets. The player reads the Star Atlas, works out which planet each clue
   describes, and mounts it on the right ring.

   Orbit spacing here is deliberately even and compressed — no orrery can show
   real distances (Neptune is 30x further out than Earth). The Atlas says so
   rather than letting the picture imply otherwise. */

export const SOLAR_W = 4200

// the orrery's centre, and how far apart the eight rings sit
export const ORRERY = { cx: 1500, cy: 560, r0: 190, dr: 116, squash: 0.34 }

/* Where a planet at `order` (1-8) sits. Every planet is mounted at the SAME
   point of its ring — the right-hand edge — so the eight of them march outward
   in a straight, countable line with their ring number printed directly below.
   An earlier version fanned them around the ellipse, which looked more like a
   real orrery and was unusable: you could not tell which planet was on which
   ring, and "fourth from the Sun" became a guess. Countability beats realism
   here; the Atlas already says the model is not to scale. */
export function orbitPoint(order) {
  const rx = ORRERY.r0 + (order - 1) * ORRERY.dr
  return { x: ORRERY.cx + rx, y: ORRERY.cy - 34, rx }
}
// the numbered plate under each orbit, on the ring itself
export const orbitLabelPoint = (order) => ({
  x: ORRERY.cx + ORRERY.r0 + (order - 1) * ORRERY.dr, y: ORRERY.cy + 30,
})

export const SOLAR_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 620 },
  atlas: { x: 1010, y: 700 },       // the Star Atlas lectern — opens the catalog
  orrery: { x: ORRERY.cx, y: ORRERY.cy },
  rockA: { x: 430, y: 906 },        // two space rocks hidden in this room
  rockB: { x: 3900, y: 900 },
  clueMars: { x: 3400, y: 902 },    // the Mars model, tucked behind a console
  orbitStation: { x: 2760 },        // the ORBIT BALANCE mini-game console
  wheel: { x: 1950, y: 908 },       // the Mars rover's wheel, rolled under the orrery
  hint: { x: 4020, y: 1000 },
}

const S_LINE = '#7fa6c0'
const S_DEEP = '#0a1220'
const S_FAR = '#101c2c'
const S_MID = '#182a3c'
const S_MAIN = '#22384e'
const S_FORE = '#2f4a63'

export function solarSkySVG() {
  const W = 2400
  let stars = ''
  for (let i = 0; i < 130; i++) {
    const x = (i * 193) % W
    const y = (i * 271) % 1080
    const r = 1 + ((i * 41) % 6) * 0.42
    stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="${S_LINE}" opacity="${0.25 + ((i * 23) % 6) * 0.1}"/>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="0" width="${W}" height="1080" fill="${S_DEEP}"/>
    ${stars}
    ${speedTag('LAYER: STARFIELD · 0.1x')}
  ${'</svg>'}`
}

export function solarNebulaSVG() {
  const W = 2800
  return `${svgOpen(W, 1080)}
    <ellipse cx="900" cy="360" rx="620" ry="240" fill="${S_FAR}" opacity="0.85"/>
    <ellipse cx="2000" cy="500" rx="520" ry="200" fill="${S_FAR}" opacity="0.6"/>
    <g fill="none" stroke="${S_MID}" stroke-width="3" opacity="0.7">
      <ellipse cx="900" cy="360" rx="500" ry="180"/>
      <ellipse cx="2000" cy="500" rx="400" ry="150"/>
    </g>
    ${speedTag('LAYER: NEBULA · 0.35x')}
  ${'</svg>'}`
}

export function solarDomeSVG() {
  const W = 3200
  // the planetarium's ribbed dome, seen from inside
  let ribs = ''
  for (let i = 0; i <= 10; i++) {
    const x = 200 + i * 280
    ribs += `<path d="M${x},860 Q${x + 60},420 ${W / 2},170" fill="none" stroke="${S_MID}" stroke-width="4" opacity="0.55"/>`
  }
  return `${svgOpen(W, 1080)}
    ${ribs}
    <path d="M0,200 Q${W / 2},60 ${W},200" fill="none" stroke="${S_MID}" stroke-width="5"/>
    ${speedTag('LAYER: DOME · 0.6x')}
  ${'</svg>'}`
}

export function solarMainSVG() {
  const S = SOLAR_SPOTS
  // the orrery: Sun, eight rings, and a numbered tick on each so "fourth from
  // the Sun" is something a child can actually COUNT rather than guess
  let rings = ''
  for (let i = 1; i <= 8; i++) {
    const rx = ORRERY.r0 + (i - 1) * ORRERY.dr
    const lp = orbitLabelPoint(i)
    rings += `<ellipse cx="${ORRERY.cx}" cy="${ORRERY.cy}" rx="${rx}" ry="${rx * ORRERY.squash}"
      fill="none" stroke="${S_LINE}" stroke-width="2.5" opacity="0.45"/>`
    // the ring's number, printed on a plate directly under where its planet sits
    rings += `<rect x="${lp.x - 22}" y="${lp.y - 20}" width="44" height="40" rx="8" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="2.5"/>`
    rings += tag(lp.x, lp.y + 8, String(i), GOLD, 21)
  }
  // a baseline joining the plates, so the row reads as "count outward from the Sun"
  rings += `<line x1="${ORRERY.cx + ORRERY.r0 - 40}" y1="${ORRERY.cy + 30}" x2="${orbitLabelPoint(8).x + 40}" y2="${ORRERY.cy + 30}"
    stroke="${GOLD}" stroke-width="2" opacity="0.35"/>`
  return `${svgOpen(SOLAR_W, 1080)}
    <rect x="0" y="880" width="${SOLAR_W}" height="200" fill="${S_MAIN}"/>
    <line x1="0" y1="880" x2="${SOLAR_W}" y2="880" stroke="${S_LINE}" stroke-width="4"/>
    ${roomFloorTicks(SOLAR_W, S_LINE)}
    ${roomBackPost(S, '&#8592; SPACE HALL')}
    ${roomPlacard(S, S_LINE)}

    <!-- the Star Atlas lectern -->
    <g transform="translate(${S.atlas.x},0)">
      <path d="M-90,880 L-60,700 L60,700 L90,880 Z" fill="${S_MID}" stroke="${GOLD}" stroke-width="4"/>
      <path d="M-96,700 L0,668 L96,700 L0,714 Z" fill="${PAPER_F}" stroke="${GOLD}" stroke-width="4"/>
      ${tag(0, 640, 'STAR ATLAS', GOLD, 18)}
      ${tag(0, 800, '[ READ ]', GOLD, 16)}
    </g>

    <!-- the orrery on its plinth -->
    <g>
      <rect x="${ORRERY.cx - 120}" y="820" width="240" height="60" rx="8" fill="${S_FORE}" stroke="${S_LINE}" stroke-width="4"/>
      <rect x="${ORRERY.cx - 26}" y="${ORRERY.cy}" width="52" height="330" fill="${S_MID}" stroke="${S_LINE}" stroke-width="3"/>
      ${rings}
      <circle cx="${ORRERY.cx}" cy="${ORRERY.cy}" r="54" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="5"/>
      <circle cx="${ORRERY.cx}" cy="${ORRERY.cy}" r="72" fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.45"/>
      ${tag(ORRERY.cx, ORRERY.cy + 6, 'SUN', GOLD, 16)}
      ${tag(ORRERY.cx, 200, 'THE ORRERY', S_LINE, 24)}
    </g>

    <!-- a control console the Mars model has rolled behind -->
    <g transform="translate(${S.clueMars.x + 120},0)">
      <rect x="-140" y="700" width="280" height="180" fill="${S_MID}" stroke="${S_LINE}" stroke-width="4"/>
      <g fill="${GOLD_F}" stroke="${GOLD}" stroke-width="2">
          ${[0, 1, 2].map((i) => `<rect x="${-108 + i * 76}" y="736" width="56" height="34" rx="5"/>`).join('')}
      </g>
      <g fill="none" stroke="${S_LINE}" stroke-width="3" opacity="0.7">
        <line x1="-108" y1="812" x2="108" y2="812"/><line x1="-108" y1="844" x2="60" y2="844"/>
      </g>
    </g>
    ${roomHint(S)}
    ${speedTag('LAYER: PLANETARIUM FLOOR · 1.0x')}
  ${'</svg>'}`
}

export function solarForeSVG() {
  const W = 4500
  const rail = (x) => `
    <g transform="translate(${x},0)" stroke="${S_FORE}" stroke-width="6" fill="none">
      <line x1="0" y1="1080" x2="0" y2="836"/>
      <line x1="-90" y1="836" x2="90" y2="836"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${[200, 640, 3300, 3760, 4160].map(rail).join('')}
    ${speedTag('LAYER: RAIL · 1.35x')}
  ${'</svg>'}`
}

/* ===================== MARS ROOM — the rover bay (world: 3900) =====================
   A rust-coloured Martian landscape under a butterscotch sky (Mars' sky really is
   pale orange-brown by day — the dust does that). The diorama's rover is missing
   a WHEEL and its solar panel is buried in DUST. Fix both, then drive it out to
   the right rock in the Rover Route mini-game. */

export const MARS_W = 3900

export const MARS_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 640 },
  rover: { x: 1900, y: 300, w: 620, h: 520 },   // the rover diorama frame
  wheelSocket: { x: 1760, y: 742 },             // the empty axle, front-left
  panelSocket: { x: 1640, y: 512 },             // the dust-caked solar panel (a deployed wing)
  console: { x: 2860 },                          // the ROVER ROUTE drive console
  card: { x: 3180, y: 902 },                     // a Moon mission card, dropped here
  rockA: { x: 1080, y: 906 },
  rockB: { x: 3560, y: 902 },
  hint: { x: 3720, y: 1000 },
}

const M_SKY = '#7a4a33'
const M_SKY_F = '#4a2a1d'
const M_FAR = '#4a2a1c'
const M_MID = '#5b3322'
const M_MAIN = '#6f4029'
const M_LINE = '#c98a63'
const M_FORE = '#a3654a'
// the hardware reads in a lighter, cooler tone than the landscape: on a small
// screen a rust rover on a rust plain is one shape, not two
const M_ROVER = '#f0cbad'
const M_ROVER_F = '#40251a'

export function marsSkySVG() {
  const W = 2400
  return `${svgOpen(W, 1080)}
    <defs><linearGradient id="marsSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${M_SKY_F}"/><stop offset="100%" stop-color="${M_SKY}"/>
    </linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="1080" fill="url(#marsSky)"/>
    <circle cx="1750" cy="250" r="46" fill="#e8c9a0" opacity="0.75"/>
    ${speedTag('LAYER: MARTIAN SKY · 0.1x')}
  ${'</svg>'}`
}

export function marsFarSVG() {
  const W = 2900
  return `${svgOpen(W, 1080)}
    <path d="M0,700 L360,520 L620,640 L980,430 L1340,620 L1700,500 L2100,650 L2500,540 L2900,690 L2900,880 L0,880 Z"
      fill="${M_FAR}" stroke="${M_LINE}" stroke-width="3" stroke-opacity="0.4"/>
    ${speedTag('LAYER: FAR RIDGE · 0.3x')}
  ${'</svg>'}`
}

export function marsMidSVG() {
  const W = 3200
  // crater rims — the shallow, worn kind that actually cover the Martian plains
  const crater = (x, y, rx) => `
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.28}" fill="none" stroke="${M_LINE}" stroke-width="4" opacity="0.55"/>
    <ellipse cx="${x}" cy="${y - 8}" rx="${rx * 0.72}" ry="${rx * 0.2}" fill="${M_MID}" opacity="0.8"/>`
  return `${svgOpen(W, 1080)}
    <path d="M0,760 L500,690 L900,760 L1400,700 L1900,770 L2400,710 L2900,780 L3200,730 L3200,880 L0,880 Z"
      fill="${M_MID}"/>
    ${crater(520, 812, 170)}${crater(1560, 828, 210)}${crater(2650, 806, 150)}
    ${speedTag('LAYER: CRATER PLAIN · 0.55x')}
  ${'</svg>'}`
}

export function marsMainSVG() {
  const S = MARS_SPOTS
  return `${svgOpen(MARS_W, 1080)}
    <rect x="0" y="880" width="${MARS_W}" height="200" fill="${M_MAIN}"/>
    <line x1="0" y1="880" x2="${MARS_W}" y2="880" stroke="${M_LINE}" stroke-width="4"/>
    ${roomFloorTicks(MARS_W, M_LINE)}
    ${roomBackPost(S, '&#8592; SPACE HALL')}
    ${roomPlacard(S, M_LINE)}

    <!-- the rover diorama: a dashed exhibit frame around the whole vehicle -->
    <g transform="translate(${S.rover.x},0)">
      <rect x="-310" y="290" width="620" height="590" rx="14" fill="none" stroke="${M_LINE}"
        stroke-width="2" stroke-dasharray="10 8" opacity="0.55"/>
      <!-- the strut carrying the deployed solar wing (its panel is a sprite) -->
      <path d="M-160,626 L-232,560" stroke="${M_ROVER}" stroke-width="7" stroke-linecap="round"/>
      <!-- chassis -->
      <rect x="-170" y="600" width="340" height="110" rx="16" fill="${M_ROVER_F}" stroke="${M_ROVER}" stroke-width="5"/>
      <!-- rocker-bogie arms down to the wheels -->
      <path d="M-150,700 L-140,780 M20,700 L60,780 M150,700 L180,780" stroke="${M_ROVER}" stroke-width="9" fill="none"/>
      <!-- the two wheels that ARE there (front-left is missing) -->
      <circle cx="60" cy="790" r="52" fill="${M_ROVER_F}" stroke="${M_ROVER}" stroke-width="5"/>
      <circle cx="60" cy="790" r="22" fill="${M_ROVER}" opacity="0.55"/>
      <circle cx="180" cy="790" r="52" fill="${M_ROVER_F}" stroke="${M_ROVER}" stroke-width="5"/>
      <circle cx="180" cy="790" r="22" fill="${M_ROVER}" opacity="0.55"/>
      <!-- the empty axle, waiting for its wheel -->
      <circle cx="-140" cy="790" r="52" fill="${M_ROVER_F}" fill-opacity="0.5" stroke="${GOLD}" stroke-width="5" stroke-dasharray="9 7"/>
      <circle cx="-140" cy="790" r="9" fill="${GOLD}"/>
      <!-- mast + camera head -->
      <rect x="-14" y="430" width="26" height="176" fill="${M_ROVER_F}" stroke="${M_ROVER}" stroke-width="4"/>
      <rect x="-64" y="380" width="128" height="58" rx="9" fill="${M_ROVER_F}" stroke="${M_ROVER}" stroke-width="4"/>
      <circle cx="-32" cy="409" r="12" fill="#9ed2e6"/><circle cx="32" cy="409" r="12" fill="#9ed2e6"/>
      <!-- robot arm -->
      <path d="M170,640 L280,566 L330,600" fill="none" stroke="${M_ROVER}" stroke-width="8" stroke-linecap="round"/>
      ${tag(0, 340, 'MARS ROVER', M_ROVER, 22)}
    </g>

    <!-- the drive console for the route mini-game -->
    <g transform="translate(${S.console.x},0)">
      <rect x="-150" y="646" width="300" height="234" rx="12" fill="${M_ROVER_F}" stroke="${GOLD}" stroke-width="5"/>
      <rect x="-116" y="676" width="232" height="112" rx="8" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="3"/>
      <g fill="${GOLD}" opacity="0.55">
        ${[0, 1, 2, 3].map((i) => `<rect x="${-104 + i * 58}" y="808" width="44" height="26" rx="5"/>`).join('')}
      </g>
      ${tag(0, 620, 'ROVER ROUTE', GOLD, 20)}
    </g>
    ${roomHint(S)}
    ${speedTag('LAYER: ROVER BAY · 1.0x')}
  ${'</svg>'}`
}

export function marsForeSVG() {
  const W = 4200
  const rock = (x, s) => `
    <g transform="translate(${x},0) scale(${s})">
      <path d="M0,1080 L40,930 L120,890 L200,950 L240,1080 Z" fill="${M_FORE}" stroke="${M_LINE}" stroke-width="4"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${rock(180, 1)}${rock(1240, 0.8)}${rock(3160, 1.1)}${rock(3860, 0.9)}
    ${speedTag('LAYER: FOREGROUND ROCKS · 1.35x')}
  ${'</svg>'}`
}

/* ===================== MOON ROOM — the landing site (world: 3800) =====================
   Grey regolith under a black sky, with Earth hanging in it — the view that makes
   the Moon feel like a PLACE. The lunar module stands in the middle; a mission
   board on the left holds the landing sequence, and a workbench on the right runs
   Build-a-Rocket. */

export const MOON_W = 4300

export const MOON_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 600 },
  board: { x: 1180, w: 380, h: 300 },     // the LANDING SEQUENCE board
  lander: { x: 2050 },                     // the lunar module diorama
  bench: { x: 2960, w: 320, h: 250 },      // the BUILD-A-ROCKET workbench
  cardA: { x: 700, y: 902 },               // seven mission cards hidden in the room
  cardB: { x: 1620, y: 906 },
  cardC: { x: 1900, y: 900 },
  cardD: { x: 2360, y: 904 },
  cardE: { x: 3080, y: 900 },
  cardF: { x: 3320, y: 906 },
  cardG: { x: 4020, y: 902 },
  lamp: { x: 3760, y: 470 },               // the SIGNAL LAMP — the sequence clue
  tether: { x: 2560, y: 902 },             // the Space Station's safety tether
  rockA: { x: 1520, y: 904 },
  rockB: { x: 2760, y: 908 },
  hint: { x: 4120, y: 1000 },
}

const L_LINE = '#c7ccd2'
const L_SKY = '#05070c'
const L_FAR = '#2b3138'
const L_MID = '#3a4048'
const L_MAIN = '#4a5058'
const L_FORE = '#5d646d'

export function moonSkySVG() {
  const W = 2400
  let stars = ''
  for (let i = 0; i < 150; i++) {
    const x = (i * 179) % W
    const y = (i * 233) % 900
    stars += `<circle cx="${x}" cy="${y}" r="${1 + ((i * 31) % 5) * 0.4}" fill="#dfe6ee" opacity="${0.3 + ((i * 19) % 6) * 0.11}"/>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="0" width="${W}" height="1080" fill="${L_SKY}"/>
    ${stars}
    <!-- Earth, seen from the Moon: small, blue, and very far away -->
    <g transform="translate(1780,270)">
      <circle cx="0" cy="0" r="86" fill="#2f6f9e" stroke="#8fb8d4" stroke-width="3"/>
      <path d="M-52,-22 q30,-30 62,-8 q22,16 4,36 q-30,26 -60,4 q-18,-16 -6,-32 Z" fill="#5c9a5c" opacity="0.9"/>
      <ellipse cx="18" cy="42" rx="34" ry="18" fill="#5c9a5c" opacity="0.75"/>
      <circle cx="-30" cy="-30" r="26" fill="#fff" opacity="0.2"/>
    </g>
    ${speedTag('LAYER: DEEP SPACE · 0.1x')}
  ${'</svg>'}`
}

export function moonFarSVG() {
  const W = 2900
  return `${svgOpen(W, 1080)}
    <path d="M0,720 L340,600 L640,700 L980,560 L1320,690 L1680,590 L2060,700 L2460,610 L2900,720 L2900,880 L0,880 Z"
      fill="${L_FAR}"/>
    ${speedTag('LAYER: FAR HILLS · 0.3x')}
  ${'</svg>'}`
}

export function moonMidSVG() {
  const W = 3200
  const crater = (x, y, rx) => `
    <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.3}" fill="${L_MID}" stroke="${L_LINE}" stroke-width="3" stroke-opacity="0.45"/>
    <ellipse cx="${x}" cy="${y - 6}" rx="${rx * 0.7}" ry="${rx * 0.2}" fill="${L_FAR}"/>`
  return `${svgOpen(W, 1080)}
    <path d="M0,780 L520,730 L1000,790 L1520,740 L2040,800 L2560,745 L3200,790 L3200,880 L0,880 Z" fill="${L_MID}"/>
    ${crater(420, 820, 190)}${crater(1450, 832, 230)}${crater(2560, 816, 170)}
    ${speedTag('LAYER: CRATER FIELD · 0.55x')}
  ${'</svg>'}`
}

export function moonMainSVG() {
  const S = MOON_SPOTS
  return `${svgOpen(MOON_W, 1080)}
    <rect x="0" y="880" width="${MOON_W}" height="200" fill="${L_MAIN}"/>
    <line x1="0" y1="880" x2="${MOON_W}" y2="880" stroke="${L_LINE}" stroke-width="4"/>
    ${roomFloorTicks(MOON_W, L_LINE)}
    ${roomBackPost(S, '&#8592; SPACE HALL')}
    ${roomPlacard(S, L_LINE)}

    <!-- the landing-sequence board: six empty frames on an easel -->
    <g transform="translate(${S.board.x},0)">
      <rect x="-190" y="520" width="380" height="300" rx="12" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="5"/>
      ${tag(0, 566, 'LANDING SEQUENCE', GOLD, 20)}
      <g fill="none" stroke="${GOLD}" stroke-width="3" opacity="0.75">
        ${[0, 1, 2, 3, 4, 5].map((i) =>
          `<rect x="${-160 + (i % 3) * 108}" y="${588 + Math.floor(i / 3) * 108}" width="88" height="92" rx="7" stroke-dasharray="8 6"/>`).join('')}
      </g>
      <path d="M-150,820 L-190,880 M150,820 L190,880" stroke="${L_LINE}" stroke-width="6"/>
      ${tag(0, 858, '[ ARRANGE ]', GOLD, 16)}
    </g>

    <!-- the lunar module, standing where it landed -->
    <g transform="translate(${S.lander.x},0)">
      <ellipse cx="0" cy="880" rx="310" ry="42" fill="${L_FAR}" opacity="0.7"/>
      <g transform="translate(-350,392) scale(1.02)">${SPACE_SILHOUETTES.moon(L_LINE, '#8f959c', L_SKY)}</g>
      ${tag(0, 330, 'EAGLE — LUNAR MODULE', L_LINE, 22)}
      <!-- the flag and a footprint trail, because this is a landing SITE -->
      <g transform="translate(250,0)">
        <line x1="0" y1="880" x2="0" y2="742" stroke="${L_LINE}" stroke-width="5"/>
        <path d="M0,742 L74,760 L74,796 L0,782 Z" fill="#b9483f" stroke="${L_LINE}" stroke-width="3"/>
      </g>
      ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${120 + i * 34}" cy="${906 + (i % 2) * 10}" rx="11" ry="6" fill="${L_FAR}" opacity="0.8"/>`).join('')}
    </g>

    <!-- the signal lamp: a mast on the right of the diorama, flashing its
         colour sequence. Its lit face is a sprite so main.js can cycle it. -->
    <g transform="translate(${S.lamp.x},0)">
      <rect x="-16" y="${S.lamp.y}" width="32" height="${880 - S.lamp.y}" fill="${L_MID}" stroke="${L_LINE}" stroke-width="4"/>
      <rect x="-96" y="840" width="192" height="46" rx="8" fill="${L_MID}" stroke="${L_LINE}" stroke-width="4"/>
      <path d="M-86,${S.lamp.y + 118} L0,${S.lamp.y + 60} L86,${S.lamp.y + 118}"
        fill="none" stroke="${L_LINE}" stroke-width="4" opacity="0.7"/>
      ${tag(0, S.lamp.y - 168, 'SIGNAL LAMP', L_LINE, 20)}
      ${tag(0, 812, 'MISSION BEACON', L_LINE, 15)}
    </g>

    <!-- the Build-a-Rocket workbench -->
    <g transform="translate(${S.bench.x},0)">
      <rect x="-160" y="630" width="320" height="250" rx="12" fill="${L_MID}" stroke="${GOLD}" stroke-width="5"/>
      <rect x="-124" y="662" width="248" height="118" rx="8" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="3"/>
      <g fill="${GOLD}" opacity="0.6">
        <rect x="-40" y="686" width="80" height="18" rx="4"/>
        <rect x="-32" y="710" width="64" height="16" rx="4"/>
        <path d="M0,732 l22,26 -44,0 Z"/>
      </g>
      ${tag(0, 604, 'BUILD-A-ROCKET', GOLD, 20)}
      ${tag(0, 826, '[ ASSEMBLE ]', GOLD, 16)}
    </g>
    ${roomHint(S)}
    ${speedTag('LAYER: LANDING SITE · 1.0x')}
  ${'</svg>'}`
}

export function moonForeSVG() {
  const W = 4600
  const boulder = (x, s) => `
    <g transform="translate(${x},0) scale(${s})">
      <path d="M0,1080 L34,946 L106,906 L186,962 L214,1080 Z" fill="${L_FORE}" stroke="${L_LINE}" stroke-width="4"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${boulder(160, 1)}${boulder(1980, 0.85)}${boulder(3320, 1.05)}
    ${speedTag('LAYER: FOREGROUND ROCKS · 1.35x')}
  ${'</svg>'}`
}

/* ===================== SPACE STATION ROOM — the airlock bay (world: 3900) =====================
   Outside the station, in orbit. Earth fills the lower background — at ~400 km up
   it is enormous and always right there, which is the thing photographs of the ISS
   always get across and diagrams never do. The module's solar array is turned the
   wrong way and its airlock tether is unclipped. */

export const STATION_W = 3900

export const STATION_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 620 },
  panelHub: { x: 1560, y: 420 },     // the solar array that won't turn
  tetherHook: { x: 2280, y: 640 },   // the airlock's empty tether anchor
  airlock: { x: 2280 },              // the module itself
  hatch: { x: 3020, w: 300, h: 250 },// the SPACEWALK DRIFT console
  strut: { x: 2740, y: 902 },        // James Webb's mirror support strut
  rockA: { x: 980, y: 902 },
  rockB: { x: 3540, y: 906 },
  hint: { x: 3700, y: 1000 },
}

const T_LINE = '#b9cbd8'
const T_SKY = '#040810'
const T_EARTH = '#1f4f7a'
const T_MID = '#24313d'
const T_MAIN = '#2e3d4b'
const T_FORE = '#41566a'

export function stationSkySVG() {
  const W = 2400
  let stars = ''
  for (let i = 0; i < 140; i++) {
    const x = (i * 167) % W
    const y = (i * 211) % 620
    stars += `<circle cx="${x}" cy="${y}" r="${1 + ((i * 29) % 5) * 0.4}" fill="#e2ecf5" opacity="${0.28 + ((i * 17) % 6) * 0.1}"/>`
  }
  return `${svgOpen(W, 1080)}
    <rect x="0" y="0" width="${W}" height="1080" fill="${T_SKY}"/>
    ${stars}
    ${speedTag('LAYER: ORBITAL NIGHT · 0.1x')}
  ${'</svg>'}`
}

export function stationEarthSVG() {
  const W = 2800
  // the limb of the Earth, curving across the bottom — you are only ~400 km up
  const limb = `M-400,1080 Q${W / 2},420 ${W + 400},1080 Z`
  return `${svgOpen(W, 1080)}
    <defs><clipPath id="earthLimb"><path d="${limb}"/></clipPath></defs>
    <path d="${limb}" fill="${T_EARTH}"/>
    <!-- continents and cloud are CLIPPED to the planet: drawn free they floated
         above the horizon, which read as green blobs hanging in space -->
    <g clip-path="url(#earthLimb)">
      <g fill="#4f8f5f" opacity="0.6">
        <ellipse cx="620" cy="990" rx="260" ry="96"/>
        <ellipse cx="1460" cy="880" rx="300" ry="120"/>
        <ellipse cx="2260" cy="1000" rx="230" ry="90"/>
      </g>
      <g fill="#ffffff" opacity="0.26">
        <ellipse cx="1020" cy="950" rx="220" ry="52"/>
        <ellipse cx="1980" cy="930" rx="260" ry="58"/>
        <ellipse cx="340" cy="1040" rx="200" ry="46"/>
      </g>
    </g>
    <path d="M-400,1080 Q${W / 2},420 ${W + 400},1080" fill="none" stroke="#7fc4e8" stroke-width="7" opacity="0.85"/>
    <path d="M-400,1080 Q${W / 2},468 ${W + 400},1080" fill="none" stroke="#bfe6f7" stroke-width="4" opacity="0.4"/>
    ${speedTag('LAYER: EARTH BELOW · 0.28x')}
  ${'</svg>'}`
}

export function stationTrussSVG() {
  const W = 3200
  // the long truss the modules hang off, receding behind the main plane
  let bays = ''
  for (let x = 100; x < W; x += 200) {
    bays += `<path d="M${x},430 L${x + 200},430 M${x},510 L${x + 200},510 M${x},430 L${x + 200},510 M${x + 200},430 L${x},510"
      stroke="${T_MID}" stroke-width="5" fill="none" opacity="0.85"/>`
  }
  return `${svgOpen(W, 1080)}
    ${bays}
    ${speedTag('LAYER: TRUSS · 0.6x')}
  ${'</svg>'}`
}

export function stationMainSVG() {
  const S = STATION_SPOTS
  const arrayCell = (x, y, w, h) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1d3f5c" stroke="${T_LINE}" stroke-width="3"/>
    ${[1, 2, 3].map((i) => `<line x1="${x + (w / 4) * i}" y1="${y}" x2="${x + (w / 4) * i}" y2="${y + h}" stroke="${T_LINE}" stroke-width="1.5" opacity="0.6"/>`).join('')}
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${T_LINE}" stroke-width="1.5" opacity="0.6"/>`
  return `${svgOpen(STATION_W, 1080)}
    <rect x="0" y="880" width="${STATION_W}" height="200" fill="${T_MAIN}"/>
    <line x1="0" y1="880" x2="${STATION_W}" y2="880" stroke="${T_LINE}" stroke-width="4"/>
    ${roomFloorTicks(STATION_W, T_LINE)}
    ${roomBackPost(S, '&#8592; SPACE HALL')}
    ${roomPlacard(S, T_LINE)}

    <!-- the solar array, currently edge-on to the Sun (the sprite that rotates
         sits on top of this mast) -->
    <g transform="translate(${S.panelHub.x},0)">
      <rect x="-12" y="${S.panelHub.y}" width="24" height="430" fill="${T_MID}" stroke="${T_LINE}" stroke-width="4"/>
      <circle cx="0" cy="${S.panelHub.y}" r="26" fill="${T_MID}" stroke="${GOLD}" stroke-width="5"/>
      <circle cx="0" cy="${S.panelHub.y}" r="9" fill="${GOLD}"/>
      ${tag(0, 250, 'SOLAR ARRAY', T_LINE, 20)}
      <!-- the Sun's direction, so "turn it to face the Sun" is answerable -->
      <g transform="translate(360,196)">
        <circle cx="0" cy="0" r="34" fill="${GOLD}" opacity="0.9"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (Math.PI / 4) * i
          return `<line x1="${Math.cos(a) * 44}" y1="${Math.sin(a) * 44}" x2="${Math.cos(a) * 62}" y2="${Math.sin(a) * 62}" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`
        }).join('')}
        ${tag(0, 104, 'SUN', GOLD, 18)}
      </g>
    </g>

    <!-- the airlock module + its empty tether anchor -->
    <g transform="translate(${S.airlock.x},0)">
      <rect x="-260" y="470" width="520" height="230" rx="70" fill="${T_MID}" stroke="${T_LINE}" stroke-width="5"/>
      ${[-150, -40, 70].map((x) => `<rect x="${x}" y="500" width="60" height="60" rx="8" fill="${T_SKY}" stroke="${T_LINE}" stroke-width="3"/>`).join('')}
      <circle cx="180" cy="585" r="62" fill="${T_SKY}" stroke="${T_LINE}" stroke-width="6"/>
      <circle cx="180" cy="585" r="42" fill="none" stroke="${T_LINE}" stroke-width="4" stroke-dasharray="9 8"/>
      ${tag(0, 430, 'AIRLOCK MODULE', T_LINE, 22)}
      ${tag(180, 592, 'HATCH', T_LINE, 15)}
      <!-- the anchor the safety tether clips onto -->
      <circle cx="0" cy="${S.tetherHook.y}" r="30" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="8 7"/>
      <circle cx="0" cy="${S.tetherHook.y}" r="8" fill="${GOLD}"/>
      <line x1="-260" y1="700" x2="-260" y2="880" stroke="${T_LINE}" stroke-width="5"/>
      <line x1="260" y1="700" x2="260" y2="880" stroke="${T_LINE}" stroke-width="5"/>
    </g>

    <!-- the spacewalk console -->
    <g transform="translate(${S.hatch.x},0)">
      <rect x="-150" y="630" width="300" height="250" rx="12" fill="${T_MID}" stroke="${GOLD}" stroke-width="5"/>
      <rect x="-116" y="662" width="232" height="120" rx="8" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="3"/>
      <g fill="none" stroke="${GOLD}" stroke-width="4" opacity="0.75">
        <circle cx="0" cy="716" r="26"/>
        <path d="M-46,760 q46,-26 92,0"/>
      </g>
      ${tag(0, 604, 'SPACEWALK DRIFT', GOLD, 19)}
      ${tag(0, 830, '[ SUIT UP ]', GOLD, 16)}
    </g>
    ${roomHint(S)}
    ${speedTag('LAYER: STATION EXTERIOR · 1.0x')}
  ${'</svg>'}`
}

// the rotatable solar array wing — drawn separately so main.js can turn it
export function solarWingSVG(w = 460, h = 200) {
  return `${svgOpen(460, 200)}
    <rect x="0" y="0" width="460" height="200" rx="8" fill="#14324a" stroke="${T_LINE}" stroke-width="5"/>
    ${[1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${(460 / 8) * i}" y1="0" x2="${(460 / 8) * i}" y2="200" stroke="${T_LINE}" stroke-width="2.5" opacity="0.7"/>`).join('')}
    <line x1="0" y1="100" x2="460" y2="100" stroke="${T_LINE}" stroke-width="2.5" opacity="0.7"/>
  ${'</svg>'}`
}

export function stationForeSVG() {
  const W = 4200
  const strut = (x) => `
    <g transform="translate(${x},0)" stroke="${T_FORE}" stroke-width="7" fill="none">
      <line x1="0" y1="1080" x2="0" y2="700"/>
      <line x1="-70" y1="740" x2="70" y2="700"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${[240, 1180, 3320, 4020].map(strut).join('')}
    ${speedTag('LAYER: NEAR STRUTS · 1.35x')}
  ${'</svg>'}`
}

/* ===================== JAMES WEBB ROOM — the mirror bay (world: 3900) =====================
   Not in Earth orbit: Webb sits at L2, about 1.5 million km out, always with its
   sunshield between it and the Sun. So this room is the coldest and emptiest in
   the wing — deep space, the layered kite of the sunshield below, and the golden
   honeycomb above it. */

export const WEBB_W = 3900

// the 18 segment positions: a hexagonal close-pack of 19 with the centre left
// open for the secondary mirror's support (see art.js SPACE_SILHOUETTES.webb)
export const WEBB_HUB = { x: 2000, y: 430, r: 62 }
export function webbTilePositions() {
  const R = WEBB_HUB.r, dx = R * Math.sqrt(3), dy = R * 1.5
  const rows = [[-1, -2, 3], [-1.5, -1, 4], [-2, 0, 5], [-1.5, 1, 4], [-1, 2, 3]]
  const out = []
  for (const [start, ry, n] of rows) {
    for (let i = 0; i < n; i++) {
      if (ry === 0 && i === 2) continue                  // the open centre
      out.push({ x: WEBB_HUB.x + (start + i) * dx, y: WEBB_HUB.y + ry * dy })
    }
  }
  return out
}

export const WEBB_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 640 },
  strutSocket: { x: 1560, y: 690 },     // where the support strut clips on
  segmentSocket: { x: 2440, y: 690 },   // the tray the 18th segment drops into
  hub: WEBB_HUB,
  console: { x: 3080, w: 300, h: 250 }, // FOCUS THE STARS
  rockA: { x: 1020, y: 904 },
  rockB: { x: 3560, y: 900 },
  hint: { x: 3720, y: 1000 },
}

const B_LINE = '#cbd6e0'
const B_SKY = '#02040a'
const B_SHIELD = '#2a3346'
const B_MID = '#1a2233'
const B_MAIN = '#27303f'
const B_FORE = '#39465b'

export function webbSkySVG() {
  const W = 2400
  let stuff = ''
  for (let i = 0; i < 170; i++) {
    const x = (i * 149) % W
    const y = (i * 197) % 1080
    stuff += `<circle cx="${x}" cy="${y}" r="${0.9 + ((i * 23) % 5) * 0.42}" fill="#eaf1f8" opacity="${0.25 + ((i * 13) % 6) * 0.1}"/>`
  }
  // a few distant galaxies — what Webb is actually out here to look at
  const galaxy = (x, y, rx, rot) => `
    <g transform="translate(${x},${y}) rotate(${rot})">
      <ellipse cx="0" cy="0" rx="${rx}" ry="${rx * 0.34}" fill="#c9a0e8" opacity="0.28"/>
      <ellipse cx="0" cy="0" rx="${rx * 0.55}" ry="${rx * 0.2}" fill="#f0dcff" opacity="0.35"/>
      <circle cx="0" cy="0" r="${rx * 0.12}" fill="#fff" opacity="0.55"/>
    </g>`
  return `${svgOpen(W, 1080)}
    <rect x="0" y="0" width="${W}" height="1080" fill="${B_SKY}"/>
    ${stuff}
    ${galaxy(420, 220, 90, -18)}${galaxy(1580, 160, 120, 24)}${galaxy(2080, 620, 70, -40)}
    ${speedTag('LAYER: DEEP FIELD · 0.1x')}
  ${'</svg>'}`
}

export function webbShieldSVG() {
  const W = 2800
  // the five-layer sunshield, a tennis-court-sized kite that keeps the mirror
  // colder than -220°C — the whole reason Webb can see infrared at all
  let layers = ''
  for (let i = 0; i < 5; i++) {
    const o = i * 26
    layers += `<path d="M${300 + o},${760 + o} L${W / 2},${640 + o} L${W - 300 - o},${760 + o} L${W / 2},${880 + o} Z"
      fill="${B_SHIELD}" stroke="${B_LINE}" stroke-width="3" stroke-opacity="${0.5 - i * 0.06}" opacity="${0.92 - i * 0.1}"/>`
  }
  return `${svgOpen(W, 1080)}
    ${layers}
    ${speedTag('LAYER: SUNSHIELD · 0.45x')}
  ${'</svg>'}`
}

export function webbMainSVG() {
  const S = WEBB_SPOTS
  return `${svgOpen(WEBB_W, 1080)}
    <rect x="0" y="880" width="${WEBB_W}" height="200" fill="${B_MAIN}"/>
    <line x1="0" y1="880" x2="${WEBB_W}" y2="880" stroke="${B_LINE}" stroke-width="4"/>
    ${roomFloorTicks(WEBB_W, B_LINE)}
    ${roomBackPost(S, '&#8592; SPACE HALL')}
    ${roomPlacard(S, B_LINE)}

    <!-- the backplane the segments mount to, and the secondary-mirror tripod -->
    <g transform="translate(${WEBB_HUB.x},0)">
      <path d="M-260,760 L0,660 L260,760 L260,800 L0,700 L-260,800 Z" fill="${B_MID}" stroke="${B_LINE}" stroke-width="4"/>
      <line x1="0" y1="660" x2="0" y2="${WEBB_HUB.y + 200}" stroke="${B_LINE}" stroke-width="6"/>
      <path d="M-150,${WEBB_HUB.y - 40} L0,${WEBB_HUB.y - 250} L150,${WEBB_HUB.y - 40}"
        fill="none" stroke="${B_LINE}" stroke-width="6"/>
      <ellipse cx="0" cy="${WEBB_HUB.y - 250}" rx="52" ry="18" fill="${GOLD_F}" stroke="${GOLD}" stroke-width="4"/>
      ${tag(0, 120, 'JAMES WEBB SPACE TELESCOPE', B_LINE, 24)}
      ${tag(0, 830, 'L2 &#183; 1.5 MILLION KM FROM EARTH', B_LINE, 17)}
    </g>

    <!-- the empty strut mount -->
    <g transform="translate(${S.strutSocket.x},0)">
      <rect x="-70" y="${S.strutSocket.y - 60}" width="140" height="150" rx="10" fill="${B_MID}" stroke="${B_LINE}" stroke-width="4"/>
      <circle cx="0" cy="${S.strutSocket.y}" r="30" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="8 7"/>
      <circle cx="0" cy="${S.strutSocket.y}" r="8" fill="${GOLD}"/>
      ${tag(0, S.strutSocket.y + 128, 'STRUT MOUNT', B_LINE, 16)}
    </g>

    <!-- the segment tray -->
    <g transform="translate(${S.segmentSocket.x},0)">
      <rect x="-80" y="${S.segmentSocket.y - 60}" width="160" height="150" rx="10" fill="${B_MID}" stroke="${B_LINE}" stroke-width="4"/>
      <circle cx="0" cy="${S.segmentSocket.y}" r="32" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="8 7"/>
      ${tag(0, S.segmentSocket.y + 128, 'SEGMENT TRAY', B_LINE, 16)}
    </g>

    <!-- the focus console -->
    <g transform="translate(${S.console.x},0)">
      <rect x="-150" y="630" width="300" height="250" rx="12" fill="${B_MID}" stroke="${GOLD}" stroke-width="5"/>
      <rect x="-116" y="662" width="232" height="120" rx="8" fill="${PANEL_F}" stroke="${GOLD}" stroke-width="3"/>
      <g fill="none" stroke="${GOLD}" stroke-width="3" opacity="0.8">
        <circle cx="0" cy="722" r="34"/><circle cx="0" cy="722" r="14"/>
        <line x1="-52" y1="722" x2="-40" y2="722"/><line x1="40" y1="722" x2="52" y2="722"/>
      </g>
      ${tag(0, 604, 'FOCUS THE STARS', GOLD, 19)}
      ${tag(0, 830, '[ OBSERVE ]', GOLD, 16)}
    </g>
    ${roomHint(S)}
    ${speedTag('LAYER: MIRROR BAY · 1.0x')}
  ${'</svg>'}`
}

export function webbForeSVG() {
  const W = 4200
  const rail = (x) => `
    <g transform="translate(${x},0)" stroke="${B_FORE}" stroke-width="6" fill="none">
      <line x1="0" y1="1080" x2="0" y2="852"/>
      <line x1="-84" y1="852" x2="84" y2="852"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${[260, 780, 3340, 3980].map(rail).join('')}
    ${speedTag('LAYER: RAIL · 1.35x')}
  ${'</svg>'}`
}
