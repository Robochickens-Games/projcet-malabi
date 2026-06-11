// Low-fidelity wireframe/blockout art for the side-scrolling prototype.
// Everything is outlines + labels on ink — placeholder geometry to be replaced
// 1:1 by painted layers later. Single source of truth for world layout: the
// exported *_SPOTS / GUIDE constants drive both the drawings and the hotspots.
import { SILHOUETTES, toothSVGInner } from './art.js'

export const INK = '#0d141d'
const FAR = '#44606f'
const MID = '#5d7e91'
const MAIN = '#9cb6c7'
const FORE = '#c2d6e2'
const GOLD = '#e8a948'
const ROPE = '#b96a6a'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

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
      <g transform="translate(${cx},0)" stroke="${FAR}" fill="none" stroke-width="3">
        <path d="M-90,640 L-90,330 A90,90 0 0 1 90,330 L90,640 Z"/>
        <line x1="0" y1="245" x2="0" y2="640"/><line x1="-90" y1="430" x2="90" y2="430"/>
      </g>`
  }
  return `${svgOpen(W, 1080)}
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
      <g stroke="${open ? GOLD : MID}" stroke-width="${open ? 5 : 3}" fill="none">
        <path d="M-160,880 L-160,480 A160,160 0 0 1 160,480 L160,880 Z"/>
        ${open ? '' : `<line x1="-150" y1="500" x2="150" y2="860" stroke="${ROPE}"/>
                       <line x1="150" y1="500" x2="-150" y2="860" stroke="${ROPE}"/>`}
      </g>
      ${tag(0, 300, label, open ? GOLD : MID, 26)}
      ${tag(0, 340, open ? '[ ENTER ]' : '· soon ·', open ? GOLD : FAR, 20)}
    </g>`
  let ticks = ''
  for (let x = 40; x < LOBBY_W; x += 120) ticks += `<line x1="${x}" y1="880" x2="${x - 18}" y2="912" stroke="${MID}" stroke-width="2" opacity="0.5"/>`
  return `${svgOpen(LOBBY_W, 1080)}
    <line x1="0" y1="880" x2="${LOBBY_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}
    ${door(LOBBY_SPOTS.doorInventions.x, 'INVENTIONS', false)}
    ${door(LOBBY_SPOTS.doorSpace.x, 'SPACE', false)}
    ${door(LOBBY_SPOTS.doorDino.x, 'DINOSAUR WING', true)}
    <!-- info desk -->
    <g transform="translate(330,0)" stroke="${MID}" fill="none" stroke-width="3">
      <rect x="-130" y="700" width="260" height="180"/>
      <line x1="-130" y1="745" x2="130" y2="745"/>
    </g>
    ${tag(330, 675, 'INFO DESK', MID, 18)}
    <!-- bench -->
    <g transform="translate(1950,0)" stroke="${MID}" fill="none" stroke-width="3">
      <rect x="-150" y="790" width="300" height="34"/>
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
    <g transform="translate(${x},0)" stroke="${FORE}" stroke-width="5" fill="none">
      <line x1="-52" y1="80" x2="-52" y2="1020"/><line x1="52" y1="80" x2="52" y2="1020"/>
      <rect x="-78" y="40" width="156" height="42"/>
      <rect x="-78" y="1020" width="156" height="42"/>
    </g>`
  return `${svgOpen(W, 1080)}
    ${column(200)}${column(1750)}${column(2480)}${column(3150)}
    <!-- planter: the tooth hides behind this -->
    <g transform="translate(${LOBBY_SPOTS.planter.x},0)">
      <g stroke="${FORE}" stroke-width="5" fill="${INK}">
        <path d="M-120,780 L120,780 L92,1000 L-92,1000 Z"/>
      </g>
      <g stroke="${FORE}" stroke-width="4" fill="none">
        <path d="M0,780 C-30,690 -90,650 -130,640"/>
        <path d="M0,780 C-10,670 -30,610 -20,560"/>
        <path d="M0,780 C30,680 90,640 135,635"/>
        <path d="M0,780 C15,690 55,640 60,590"/>
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

export const GUIDE = {
  cards: [
    { name: 'carnivore', tooth: 'blade', label: 'CARNIVORE', sub: 'sharp + pointed', x: 3140, y: 330, w: 210, h: 200,
      hint: 'Sharp & pointed — a meat slicer! Your tooth has a broad, flat edge…' },
    { name: 'piscivore', tooth: 'cone', label: 'PISCIVORE', sub: 'smooth cone', x: 3390, y: 330, w: 210, h: 200,
      hint: 'A smooth cone for gripping slippery fish. Yours is wide and flat…' },
    { name: 'insectivore', tooth: 'cone', small: true, label: 'INSECTIVORE', sub: 'tiny + pointy', x: 3140, y: 570, w: 210, h: 200,
      hint: 'Tiny and pointy, for crunching bugs. Yours is much bigger — and flat…' },
    { name: 'herbivore', tooth: 'leaf', label: 'HERBIVORE', sub: 'broad + flat', x: 3390, y: 570, w: 210, h: 200, correct: true },
  ],
}

export const GROVE_SPOTS = {
  backPost: { x: 130, y: 600, w: 220, h: 300 },
  placard: { x: 2130 },
  skeleton: { x: 2700, y: 430, w: 640, h: 460 },
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
                   stroke="${FAR}" stroke-width="3"/>`
  }
  const cloud = (cx, cy, rx) => `
    <g stroke="${FAR}" stroke-width="3" fill="none">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.24}"/>
      <ellipse cx="${cx - rx * 0.35}" cy="${cy - rx * 0.16}" rx="${rx * 0.45}" ry="${rx * 0.16}"/>
    </g>`
  return `${svgOpen(W, 1080)}
    <circle cx="1620" cy="300" r="54" stroke="${FAR}" stroke-width="3" fill="none"/>
    ${rays}
    ${cloud(300, 210, 140)}${cloud(840, 140, 170)}${cloud(1280, 250, 110)}${cloud(1900, 180, 150)}
    ${speedTag('LAYER: CLOUDS + SUN · 0.1x')}
  ${'</svg>'}`
}

// mountain ridges: their own speed, clearly sliding between clouds and treeline
export function groveMountainsSVG() {
  const W = 2520
  const ridge = (baseY, amp, step) => {
    let pts = ''
    for (let x = -40, i = 0; x <= W + 40; x += step, i++) {
      pts += `${x},${baseY - amp * (0.35 + ((i * 7) % 10) / 11)} ${x + step / 2},${baseY - amp * 0.12} `
    }
    return `<polyline points="${pts}" stroke="${FAR}" stroke-width="3" fill="none"/>`
  }
  return `${svgOpen(W, 1080)}
    ${ridge(520, 240, 420)}
    ${ridge(590, 160, 300)}
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
      <path d="M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y}" stroke="${MID}" stroke-width="3" fill="none"/>
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
    if (i % 3 === 0) ticks += `<path d="M${x + 60},880 l10,-26 l16,4 l8,22 Z" stroke="${MID}" stroke-width="2" fill="none"/>`
    if (i % 4 === 1) ticks += `<g stroke="${MID}" stroke-width="2">
      <line x1="${x + 30}" y1="880" x2="${x + 24}" y2="852"/><line x1="${x + 36}" y1="880" x2="${x + 38}" y2="850"/>
      <line x1="${x + 42}" y1="880" x2="${x + 50}" y2="856"/></g>`
  }

  // tooth-type cards in the field guide
  const card = (c) => `
    <g transform="translate(${c.x},${c.y})">
      <rect x="0" y="0" width="${c.w}" height="${c.h}" rx="10" stroke="${MAIN}" stroke-width="3" fill="${INK}"/>
      <g transform="translate(${c.w / 2 - 38},22) scale(0.76) ${c.small ? 'translate(22,30) scale(0.6)' : ''}">
        ${toothSVGInner(c.tooth, INK, MAIN)}
      </g>
      ${tag(c.w / 2, c.h - 32, c.label, MAIN, 17)}
      ${tag(c.w / 2, c.h - 10, c.sub, FAR, 14)}
    </g>`

  const S = GROVE_SPOTS
  return `${svgOpen(GROVE_W, 1080)}
    <line x1="0" y1="880" x2="${GROVE_W}" y2="880" stroke="${MAIN}" stroke-width="4"/>
    ${ticks}

    <!-- trailhead -->
    <g transform="translate(${S.backPost.x + 110},0)" stroke="${GOLD}" stroke-width="4" fill="none">
      <line x1="0" y1="880" x2="0" y2="640"/><rect x="-105" y="590" width="210" height="60"/>
    </g>
    ${tag(S.backPost.x + 110, 628, '&#8592; LOBBY', GOLD, 22)}
    <g transform="translate(620,0)" stroke="${MID}" stroke-width="3" fill="none">
      <line x1="0" y1="880" x2="0" y2="660"/><rect x="-150" y="610" width="300" height="56"/>
    </g>
    ${tag(620, 646, 'NESTING GROVE &#8594;', MID, 20)}

    <!-- placard -->
    <g transform="translate(${S.placard.x},0) rotate(-3)">
      <rect x="-85" y="640" width="170" height="200" rx="8" stroke="${MAIN}" stroke-width="3" fill="${INK}"/>
      ${tag(0, 680, 'PLACARD', MAIN, 16)}
      ${[706, 726, 746, 766, 786].map((y) => `<line x1="-62" y1="${y}" x2="62" y2="${y}" stroke="${FAR}" stroke-width="3"/>`).join('')}
    </g>

    <!-- the skeleton mount -->
    <g transform="translate(${S.skeleton.x},0)">
      <line x1="-320" y1="880" x2="320" y2="880" stroke="${MAIN}" stroke-width="6"/>
      <g transform="translate(-310,388) scale(0.9)">${SILHOUETTES.trike('#22313d', '#1a2630', MAIN)}</g>
      <g fill="none" stroke="${MAIN}" stroke-width="2" opacity="0.6">
        <rect x="-320" y="350" width="640" height="530" rx="14" stroke-dasharray="10 8"/>
      </g>
      ${tag(0, 330, 'SKELETON — WHOSE TOOTH?', GOLD, 22)}
    </g>

    <!-- field guide -->
    <g stroke="${MAIN}" stroke-width="4" fill="${INK}">
      <rect x="3105" y="290" width="530" height="520" rx="14"/>
      <line x1="3370" y1="290" x2="3370" y2="810"/>
      <line x1="3370" y1="810" x2="3370" y2="880"/>
    </g>
    ${tag(3370, 270, 'FIELD GUIDE — TAP THE MATCHING TOOTH', GOLD, 20)}
    ${GUIDE.cards.map(card).join('')}

    <!-- found clues tray -->
    <g transform="translate(${S.tray.x},${S.tray.y})" stroke="${MAIN}" stroke-width="3" fill="none">
      <rect x="0" y="0" width="620" height="110" rx="12"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${24 + i * 152}" y="18" width="120" height="74" rx="8" stroke="${FAR}"/>`).join('')}
    </g>
    ${tag(S.tray.x + 310, S.tray.y - 14, 'FOUND CLUES', MAIN, 18)}

    <!-- bag + hint -->
    <circle cx="${S.bag.x}" cy="${S.bag.y}" r="56" stroke="${GOLD}" stroke-width="4" fill="${INK}"/>
    ${tag(S.bag.x, S.bag.y + 7, 'BAG', GOLD, 18)}
    <circle cx="${S.hint.x}" cy="${S.hint.y}" r="56" stroke="${GOLD}" stroke-width="4" fill="${INK}"/>
    ${tag(S.hint.x, S.hint.y + 7, 'HINT', GOLD, 18)}

    ${speedTag('LAYER: TRAIL + SCENE · 1.0x')}
  ${'</svg>'}`
}

// small repeated foreground sprites (fastest layer)
export function canopySVG() {
  return `${svgOpen(360, 250)}
    <g stroke="${FORE}" stroke-width="5" fill="none">
      <path d="M10,0 Q60,90 30,180"/>
      <path d="M120,0 Q150,110 110,210"/>
      <path d="M230,0 Q240,100 290,170"/>
      <path d="M330,0 Q300,80 340,150"/>
      <path d="M60,0 Q110,70 95,150"/>
    </g>
  ${'</svg>'}`
}

export function bushSVG() {
  return `${svgOpen(280, 170)}
    <g stroke="${FORE}" stroke-width="5" fill="${INK}">
      <path d="M10,165 Q30,60 90,55 Q140,-10 200,55 Q260,60 272,165 Z"/>
    </g>
    <g stroke="${FORE}" stroke-width="3" fill="none">
      <line x1="95" y1="160" x2="105" y2="80"/><line x1="160" y1="160" x2="150" y2="60"/>
    </g>
  ${'</svg>'}`
}
