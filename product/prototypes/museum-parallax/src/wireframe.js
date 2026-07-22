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
