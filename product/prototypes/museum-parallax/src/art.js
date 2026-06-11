// All scene art, authored as layered SVG in the captured art direction:
// warm Art Deco museum — amber/gold + deep teal (see brain/memory/shared/art-direction).
// Layers are oversized (2400x1350 vs the 1920x1080 design space) so parallax
// never shows an edge. Design coords = svg coords - (240, 135).

export const LAYER_W = 2400
export const LAYER_H = 1350

const GOLD = '#e8a948'
const GOLD_DEEP = '#c9802e'
const CREAM = '#f4e6c8'
const BONE = '#ece0c2'
const BONE_DIM = '#cdbd97'
const TEAL = '#14525c'
const TEAL_DEEP = '#0c343c'

const SERIF = `Iowan Old Style, Palatino, Georgia, serif`

const svgOpen = (w = LAYER_W, h = LAYER_H) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`

/* ============================== LOBBY ============================== */

export function lobbyBack() {
  // wall + floor + arched windows + title — the far plane
  let windows = ''
  for (const cx of [600, 1200, 1800]) {
    windows += `
      <g transform="translate(${cx},0)">
        <path d="M-135,760 L-135,365 A135,135 0 0 1 135,365 L135,760 Z"
              fill="url(#winGlow)" stroke="${GOLD_DEEP}" stroke-width="10"/>
        ${[-90, -45, 0, 45, 90].map(x =>
          `<line x1="0" y1="300" x2="${x}" y2="500" stroke="${GOLD_DEEP}" stroke-width="5" opacity="0.7"/>`).join('')}
        <line x1="-135" y1="500" x2="135" y2="500" stroke="${GOLD_DEEP}" stroke-width="7" opacity="0.8"/>
        <line x1="0" y1="500" x2="0" y2="760" stroke="${GOLD_DEEP}" stroke-width="7" opacity="0.8"/>
        <path d="M-200,790 L200,790 L185,820 L-185,820 Z" fill="#3d2715"/>
      </g>`
  }

  // perspective floor lines toward a vanishing point
  let floorLines = ''
  for (let i = 0; i <= 12; i++) {
    const x = i * 200
    floorLines += `<line x1="1200" y1="1015" x2="${x}" y2="1350" stroke="#3d2b18" stroke-width="4" opacity="0.5"/>`
  }
  for (const y of [1080, 1170, 1280]) {
    floorLines += `<line x1="0" y1="${y}" x2="2400" y2="${y}" stroke="#3d2b18" stroke-width="3" opacity="0.4"/>`
  }

  return `${svgOpen()}
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7a4e2a"/><stop offset="0.7" stop-color="#5c3a20"/>
        <stop offset="1" stop-color="#462c17"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8a6a45"/><stop offset="1" stop-color="#55402a"/>
      </linearGradient>
      <radialGradient id="winGlow" cx="0.5" cy="0.35" r="0.9">
        <stop offset="0" stop-color="#ffe9b0"/><stop offset="0.6" stop-color="#f5c46a"/>
        <stop offset="1" stop-color="#d99c3f"/>
      </radialGradient>
    </defs>
    <rect width="2400" height="1015" fill="url(#wall)"/>
    <rect y="1015" width="2400" height="335" fill="url(#floor)"/>
    ${floorLines}
    ${windows}
    <!-- cornice -->
    <rect y="855" width="2400" height="14" fill="${GOLD_DEEP}" opacity="0.9"/>
    ${Array.from({ length: 60 }, (_, i) =>
      `<rect x="${i * 40 + 8}" y="872" width="18" height="14" fill="${GOLD_DEEP}" opacity="0.55"/>`).join('')}
    <text x="1200" y="190" text-anchor="middle" font-family="${SERIF}" font-size="52"
          letter-spacing="16" fill="${GOLD}" opacity="0.95">MUSEUM OF NATURAL SCIENCE</text>
    <text x="1200" y="240" text-anchor="middle" font-family="${SERIF}" font-size="22"
          letter-spacing="14" fill="${GOLD_DEEP}">· EST. 1899 ·</text>
  ${'</svg>'}`
}

export function lobbyMid() {
  // the grand archway to the Dinosaur Wing + a roped-off Space Wing teaser
  return `${svgOpen()}
    <defs>
      <linearGradient id="archIn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1d1108"/><stop offset="1" stop-color="#0d0703"/>
      </linearGradient>
      <radialGradient id="archWarm" cx="0.5" cy="1" r="1">
        <stop offset="0" stop-color="#a8682b" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="spaceIn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b2a3a"/><stop offset="1" stop-color="#06141d"/>
      </linearGradient>
    </defs>

    <!-- DINOSAUR WING grand arch (center-left) -->
    <g transform="translate(950,0)">
      <ellipse cx="0" cy="1118" rx="320" ry="26" fill="#000" opacity="0.3"/>
      <!-- stepped deco surround -->
      <path d="M-300,1110 L-300,640 A300,300 0 0 1 300,640 L300,1110 Z" fill="#704522"/>
      <path d="M-260,1110 L-260,640 A260,260 0 0 1 260,640 L260,1110 Z" fill="${GOLD_DEEP}"/>
      <path d="M-225,1110 L-225,645 A225,225 0 0 1 225,645 L225,1110 Z" fill="#704522"/>
      <!-- opening -->
      <path d="M-195,1110 L-195,650 A195,195 0 0 1 195,650 L195,1110 Z" fill="url(#archIn)"/>
      <path d="M-195,1110 L-195,650 A195,195 0 0 1 195,650 L195,1110 Z" fill="url(#archWarm)"/>
      <!-- a long shadow of something big inside… -->
      <path d="M-120,1110 C-100,1010 -40,960 10,950 C70,940 110,900 120,850 L150,860
               C140,930 90,975 40,990 C-10,1005 -60,1040 -70,1110 Z"
            fill="#000" opacity="0.5"/>
      <!-- sunburst keystone -->
      <g transform="translate(0,455)">
        <circle r="46" fill="${GOLD}"/>
        ${Array.from({ length: 12 }, (_, i) =>
          `<line x1="0" y1="0" x2="${Math.round(78 * Math.cos((i * 30 * Math.PI) / 180))}"
                 y2="${Math.round(78 * Math.sin((i * 30 * Math.PI) / 180))}"
                 stroke="${GOLD}" stroke-width="9"/>`).join('')}
      </g>
      <!-- plaque -->
      <g transform="translate(0,372)">
        <rect x="-262" y="-44" width="524" height="84" rx="12" fill="#241409" stroke="${GOLD}" stroke-width="5"/>
        <text x="0" y="14" text-anchor="middle" font-family="${SERIF}" font-size="40"
              letter-spacing="12" fill="${GOLD}">DINOSAUR WING</text>
      </g>
    </g>

    <!-- SPACE WING (right, roped off — teaser) -->
    <g transform="translate(1880,0)" opacity="0.95">
      <ellipse cx="0" cy="1098" rx="200" ry="18" fill="#000" opacity="0.3"/>
      <path d="M-185,1090 L-185,760 A185,185 0 0 1 185,760 L185,1090 Z" fill="#5d3a1e"/>
      <path d="M-150,1090 L-150,762 A150,150 0 0 1 150,762 L150,1090 Z" fill="url(#spaceIn)"/>
      <circle cx="-40" cy="840" r="6" fill="#bfe3ef"/><circle cx="55" cy="800" r="4" fill="#bfe3ef"/>
      <circle cx="20" cy="900" r="3" fill="#bfe3ef"/><circle cx="90" cy="880" r="5" fill="#8fc7da" opacity="0.8"/>
      <circle cx="-80" cy="930" r="3" fill="#bfe3ef" opacity="0.7"/>
      <g transform="translate(0,648)">
        <rect x="-140" y="-32" width="280" height="62" rx="10" fill="#241409" stroke="${GOLD_DEEP}" stroke-width="4"/>
        <text x="0" y="11" text-anchor="middle" font-family="${SERIF}" font-size="30"
              letter-spacing="9" fill="${GOLD_DEEP}">SPACE WING</text>
      </g>
      <!-- rope across -->
      <rect x="-205" y="940" width="16" height="190" rx="7" fill="#6e4a22"/>
      <rect x="190" y="940" width="16" height="190" rx="7" fill="#6e4a22"/>
      <circle cx="-197" cy="935" r="14" fill="${GOLD}"/><circle cx="198" cy="935" r="14" fill="${GOLD}"/>
      <path d="M-197,945 Q0,1035 198,945" fill="none" stroke="#a33a3a" stroke-width="13" stroke-linecap="round"/>
      <text x="0" y="1010" text-anchor="middle" font-family="${SERIF}" font-size="24"
            letter-spacing="4" fill="${CREAM}" opacity="0.85">opening soon</text>
    </g>
  ${'</svg>'}`
}

export function lobbyFore() {
  // big flanking columns + the planter the tooth hides behind + rope barrier
  const column = (cx) => `
    <g transform="translate(${cx},0)">
      <rect x="-130" y="0" width="260" height="1350" fill="url(#col)"/>
      <rect x="-150" y="120" width="300" height="34" fill="${GOLD_DEEP}"/>
      <rect x="-142" y="158" width="284" height="18" fill="#704522"/>
      <rect x="-150" y="1180" width="300" height="40" fill="#704522"/>
      <rect x="-160" y="1224" width="320" height="126" fill="#5b3a1e"/>
      ${[-86, -30, 26, 82].map(x =>
        `<line x1="${x}" y1="190" x2="${x}" y2="1170" stroke="#4a2e16" stroke-width="9" opacity="0.55"/>`).join('')}
      <rect x="-130" y="0" width="56" height="1350" fill="#fff" opacity="0.06"/>
    </g>`

  const leaf = (rot, len, w) =>
    `<path transform="rotate(${rot})" d="M0,0 C ${w},-${len * 0.35} ${w},-${len * 0.75} 0,-${len}
           C -${w},-${len * 0.75} -${w},-${len * 0.35} 0,0 Z" fill="url(#leaf)"/>
     <line transform="rotate(${rot})" x1="0" y1="0" x2="0" y2="-${len - 14}" stroke="#274d33" stroke-width="6" opacity="0.7"/>`

  return `${svgOpen()}
    <defs>
      <linearGradient id="col" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#6e4624"/><stop offset="0.45" stop-color="#8a5c30"/>
        <stop offset="1" stop-color="#54351b"/>
      </linearGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a6b46"/><stop offset="1" stop-color="#2a4f34"/>
      </linearGradient>
      <linearGradient id="pot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9c6a33"/><stop offset="1" stop-color="#6e4622"/>
      </linearGradient>
    </defs>
    ${column(190)}
    ${column(2210)}

    <!-- planter, bottom right — the tooth hides behind this pot -->
    <g transform="translate(1880,0)">
      <ellipse cx="0" cy="1322" rx="210" ry="22" fill="#000" opacity="0.35"/>
      <g transform="translate(0,1085)">
        ${leaf(-64, 330, 64)} ${leaf(-32, 390, 72)} ${leaf(0, 430, 78)}
        ${leaf(32, 390, 72)} ${leaf(64, 330, 64)} ${leaf(-15, 350, 60)} ${leaf(15, 350, 60)}
      </g>
      <path d="M-150,1080 L150,1080 L122,1316 L-122,1316 Z" fill="url(#pot)"/>
      <rect x="-160" y="1068" width="320" height="30" rx="8" fill="${GOLD_DEEP}"/>
      <rect x="-136" y="1150" width="272" height="14" fill="${GOLD_DEEP}" opacity="0.7"/>
      ${[-90, -45, 0, 45, 90].map(x =>
        `<line x1="${x}" y1="1175" x2="${x * 0.88}" y2="1300" stroke="#54351b" stroke-width="7" opacity="0.6"/>`).join('')}
    </g>

    <!-- rope barrier, bottom left -->
    <g>
      <ellipse cx="640" cy="1330" rx="330" ry="20" fill="#000" opacity="0.28"/>
      <rect x="368" y="1130" width="22" height="200" rx="9" fill="#6e4a22"/>
      <rect x="890" y="1130" width="22" height="200" rx="9" fill="#6e4a22"/>
      <circle cx="379" cy="1122" r="18" fill="${GOLD}"/><circle cx="901" cy="1122" r="18" fill="${GOLD}"/>
      <path d="M379,1132 Q640,1240 901,1132" fill="none" stroke="#a33a3a" stroke-width="16" stroke-linecap="round"/>
      <path d="M379,1132 Q640,1240 901,1132" fill="none" stroke="#c95454" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
    </g>
  ${'</svg>'}`
}

/* ============================== DINO HALL ============================== */

export function hallBack() {
  return `${svgOpen()}
    <defs>
      <linearGradient id="hwall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a5a66"/><stop offset="1" stop-color="${TEAL_DEEP}"/>
      </linearGradient>
      <linearGradient id="hfloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#143840"/><stop offset="1" stop-color="#0a242b"/>
      </linearGradient>
      <radialGradient id="spot" cx="0.5" cy="0" r="1">
        <stop offset="0" stop-color="#e8a948" stop-opacity="0.34"/>
        <stop offset="1" stop-color="#e8a948" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="banner" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1d6473"/><stop offset="1" stop-color="#11434d"/>
      </linearGradient>
    </defs>
    <rect width="2400" height="1040" fill="url(#hwall)"/>
    <rect y="1040" width="2400" height="310" fill="url(#hfloor)"/>
    <line x1="0" y1="1040" x2="2400" y2="1040" stroke="#072026" stroke-width="6"/>

    <!-- ceiling spots over each diorama position -->
    ${[570, 1200, 1830].map(x => `<ellipse cx="${x}" cy="120" rx="430" ry="560" fill="url(#spot)"/>`).join('')}

    <!-- deco frieze -->
    <rect y="930" width="2400" height="10" fill="${GOLD_DEEP}" opacity="0.5"/>
    ${Array.from({ length: 40 }, (_, i) =>
      `<path d="M${i * 60 + 14},952 l16,-14 l16,14" fill="none" stroke="${GOLD_DEEP}" stroke-width="4" opacity="0.4"/>`).join('')}

    <!-- hanging banner -->
    <g transform="translate(1200,0)">
      <line x1="-330" y1="0" x2="-330" y2="120" stroke="#072026" stroke-width="8"/>
      <line x1="330" y1="0" x2="330" y2="120" stroke="#072026" stroke-width="8"/>
      <path d="M-370,118 L370,118 L370,330 L0,392 L-370,330 Z" fill="url(#banner)"
            stroke="${GOLD_DEEP}" stroke-width="7"/>
      <text x="0" y="218" text-anchor="middle" font-family="${SERIF}" font-size="58"
            letter-spacing="15" fill="${GOLD}">HALL OF</text>
      <text x="0" y="298" text-anchor="middle" font-family="${SERIF}" font-size="62"
            letter-spacing="13" fill="${GOLD}">DINOSAURS</text>
    </g>
  ${'</svg>'}`
}

export function hallFore() {
  // brass visitor railing across the bottom
  const posts = [120, 420, 720, 1020, 1320, 1620, 1920, 2220]
  return `${svgOpen()}
    <defs>
      <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0c578"/><stop offset="0.5" stop-color="${GOLD_DEEP}"/>
        <stop offset="1" stop-color="#8a5a23"/>
      </linearGradient>
    </defs>
    ${posts.map(x => `
      <rect x="${x - 11}" y="1138" width="22" height="212" rx="9" fill="url(#brass)"/>
      <circle cx="${x}" cy="1132" r="17" fill="url(#brass)"/>`).join('')}
    <rect y="1148" width="2400" height="20" rx="10" fill="url(#brass)"/>
    <rect y="1238" width="2400" height="14" rx="7" fill="url(#brass)" opacity="0.85"/>
  ${'</svg>'}`
}

/* ============================== DINOS ============================== */

// Each silhouette lives in a 700x520 box, standing on y≈480, facing left.
// `bone` fills the body, `dim` the far limbs, `bg` cuts the mouth/eye.
function trikeSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <rect x="200" y="330" width="52" height="148" rx="14" fill="${dim}"/>
    <rect x="415" y="330" width="56" height="148" rx="14" fill="${dim}"/>
    <polygon points="468,268 678,345 472,382" fill="${bone}"/>
    <ellipse cx="330" cy="315" rx="162" ry="94" fill="${bone}"/>
    <rect x="245" y="345" width="58" height="135" rx="14" fill="${bone}"/>
    <rect x="372" y="350" width="58" height="130" rx="14" fill="${bone}"/>
    <!-- frill + face -->
    <ellipse cx="168" cy="262" rx="80" ry="95" fill="${bone}"/>
    <ellipse cx="168" cy="262" rx="52" ry="66" fill="${dim}" opacity="0.45"/>
    <ellipse cx="108" cy="300" rx="72" ry="56" fill="${bone}"/>
    <polygon points="52,295 14,348 80,350" fill="${bone}"/>
    <!-- horns -->
    <polygon points="132,238 38,148 64,242" fill="${bone}"/>
    <polygon points="172,228 84,132 108,228" fill="${bone}"/>
    <polygon points="62,288 44,250 82,282" fill="${bone}"/>
    <circle cx="118" cy="288" r="8" fill="${bg}"/>
    <!-- beak smile line -->
    <path d="M30,338 Q60,352 92,348" fill="none" stroke="${bg}" stroke-width="6" stroke-linecap="round"/>
  </g>`
}

function alloSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <polygon points="432,252 692,178 446,330" fill="${bone}"/>
    <ellipse cx="398" cy="345" rx="48" ry="58" fill="${dim}"/>
    <polygon points="388,380 372,462 406,462 410,386" fill="${dim}"/>
    <rect x="362" y="456" width="70" height="18" rx="8" fill="${dim}"/>
    <g transform="rotate(-8 350 290)"><ellipse cx="350" cy="290" rx="132" ry="80" fill="${bone}"/></g>
    <ellipse cx="328" cy="352" rx="52" ry="62" fill="${bone}"/>
    <polygon points="316,396 296,468 336,468 346,400" fill="${bone}"/>
    <rect x="284" y="462" width="82" height="18" rx="8" fill="${bone}"/>
    <polygon points="300,470 286,486 312,478" fill="${bone}"/>
    <!-- neck + head -->
    <polygon points="244,252 162,176 218,160 290,232" fill="${bone}"/>
    <ellipse cx="142" cy="182" rx="78" ry="48" fill="${bone}"/>
    <!-- open mouth -->
    <polygon points="62,182 152,170 152,202" fill="${bg}"/>
    <polygon points="68,206 152,198 146,228" fill="${bone}"/>
    ${[84, 104, 124].map(x => `<polygon points="${x},176 ${x + 7},190 ${x + 13},175" fill="${bone}"/>`).join('')}
    <!-- little arm -->
    <polygon points="262,300 240,336 254,342 274,312" fill="${dim}"/>
    <circle cx="164" cy="166" r="7" fill="${bg}"/>
  </g>`
}

function spinoSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <polygon points="442,298 702,262 452,372" fill="${bone}"/>
    <path d="M192,300 Q332,108 474,300 Z" fill="${dim}"/>
    ${[250, 295, 340, 385, 430].map(x =>
      `<line x1="${x}" y1="296" x2="${x}" y2="${188 + Math.abs(x - 340) * 0.45}" stroke="${bone}" stroke-width="7" opacity="0.55"/>`).join('')}
    <rect x="378" y="360" width="48" height="108" rx="12" fill="${dim}"/>
    <ellipse cx="330" cy="338" rx="156" ry="70" fill="${bone}"/>
    <rect x="298" y="375" width="52" height="100" rx="12" fill="${bone}"/>
    <rect x="282" y="466" width="78" height="16" rx="8" fill="${bone}"/>
    <!-- neck + long snout -->
    <polygon points="206,312 132,252 178,236 240,292" fill="${bone}"/>
    <ellipse cx="118" cy="248" rx="78" ry="30" fill="${bone}"/>
    <rect x="18" y="236" width="84" height="28" rx="12" fill="${bone}"/>
    <rect x="20" y="258" width="92" height="5" fill="${bg}"/>
    <circle cx="146" cy="240" r="6" fill="${bg}"/>
    <path d="M150,222 q10,-18 22,-4" fill="none" stroke="${bone}" stroke-width="8"/>
    <!-- little arm -->
    <polygon points="232,358 214,392 228,398 246,368" fill="${dim}"/>
  </g>`
}

export const SILHOUETTES = { trike: trikeSilhouette, allo: alloSilhouette, spino: spinoSilhouette }

/* ============================== TEETH ============================== */

// 100x130 box, crown up / root down. Outline keeps them readable at small sizes.
export function toothSVGInner(kind, fill = '#efe2c0', stroke = '#6b4f2a') {
  if (kind === 'leaf') {
    // herbivore — wide, flat-edged crown with grinding ridges
    return `
      <path d="M22,74 L17,42 C15,22 31,9 50,9 C69,9 85,22 83,42 L78,74 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="38" y1="18" x2="36" y2="68" stroke="${stroke}" stroke-width="3" opacity="0.5"/>
      <line x1="62" y1="18" x2="64" y2="68" stroke="${stroke}" stroke-width="3" opacity="0.5"/>
      <line x1="22" y1="74" x2="78" y2="74" stroke="${stroke}" stroke-width="4"/>
      <rect x="27" y="76" width="17" height="42" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
      <rect x="56" y="76" width="17" height="42" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`
  }
  if (kind === 'blade') {
    // carnivore — curved, serrated blade
    return `
      <path d="M60,8 C84,40 82,86 56,120 C49,108 39,80 37,52 C36,30 46,14 60,8 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M44,34 l-5,6 l6,5 l-5,6 l6,5 l-5,6 l6,5 l-4,6"
            fill="none" stroke="${stroke}" stroke-width="3" opacity="0.8"/>`
  }
  // cone — fish-eater
  return `
    <path d="M50,8 C61,30 67,72 58,120 L42,120 C33,72 39,30 50,8 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <line x1="50" y1="20" x2="50" y2="108" stroke="${stroke}" stroke-width="3" opacity="0.4"/>`
}

export function toothSVG(kind, w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">
    ${toothSVGInner(kind)}
  </svg>`
}

// the tooth lying on the lobby floor (slightly tilted, with a soft shadow)
export function floorToothSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <ellipse cx="60" cy="104" rx="40" ry="9" fill="#000" opacity="0.35"/>
    <g transform="translate(60,58) rotate(24) translate(-50,-60) scale(0.82)">
      ${toothSVGInner('leaf', '#f6ecd4', '#7a5c33')}
    </g>
  </svg>`
}

/* ============================== DIORAMAS ============================== */

export const DINOS = [
  {
    id: 'spino', name: 'SPINOSAURUS', diet: 'Eats fish 🐟', tooth: 'cone',
    toothNote: 'Smooth cone-shaped teeth — made for gripping slippery fish.',
    wrongHint: 'Hmm — Spinosaurus has smooth, pointy cone teeth for catching fish. Your tooth is wide and flat…',
  },
  {
    id: 'allo', name: 'ALLOSAURUS', diet: 'Eats meat 🍖', tooth: 'blade',
    toothNote: 'Sharp, jagged teeth — like steak knives for slicing meat.',
    wrongHint: 'Careful — Allosaurus teeth are sharp and jagged, for meat. Your tooth has a flat edge…',
  },
  {
    id: 'trike', name: 'TRICERATOPS', diet: 'Eats plants 🌿', tooth: 'leaf', correct: true,
    toothNote: 'Wide, flat-edged teeth — for chopping ferns and leaves.',
    successText: 'Triceratops, the plant eater! Its wide flat teeth chopped ferns and leaves — a perfect match for your fossil tooth.',
  },
]

export const DIORAMA_W = 560
export const DIORAMA_H = 720

export function dioramaSVG(dino) {
  const sil = SILHOUETTES[dino.id]()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DIORAMA_W}" height="${DIORAMA_H}" viewBox="0 0 ${DIORAMA_W} ${DIORAMA_H}">
    <defs>
      <radialGradient id="niche-${dino.id}" cx="0.5" cy="0.12" r="1.05">
        <stop offset="0" stop-color="#2c6a5e"/>
        <stop offset="0.45" stop-color="#17444a"/>
        <stop offset="1" stop-color="#0a2930"/>
      </radialGradient>
      <radialGradient id="halo-${dino.id}" cx="0.5" cy="0" r="0.9">
        <stop offset="0" stop-color="#ffd98a" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#ffd98a" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="clip-${dino.id}">
        <path d="M44,610 L44,260 A236,220 0 0 1 516,260 L516,610 Z"/>
      </clipPath>
    </defs>

    <!-- frame -->
    <path d="M10,610 L10,250 A270,250 0 0 1 550,250 L550,610 Z" fill="#6b4423"/>
    <path d="M26,610 L26,254 A254,236 0 0 1 534,254 L534,610 Z" fill="${GOLD_DEEP}"/>
    <path d="M44,610 L44,260 A236,220 0 0 1 516,260 L516,610 Z" fill="url(#niche-${dino.id})"/>
    <path d="M44,610 L44,260 A236,220 0 0 1 516,260 L516,610 Z" fill="url(#halo-${dino.id})"/>

    <g clip-path="url(#clip-${dino.id})">
      <!-- ground inside the niche -->
      <path d="M44,560 Q160,538 300,552 Q440,566 516,548 L516,610 L44,610 Z" fill="#0e2126"/>

      <!-- skeleton-silhouette mount -->
      <g transform="translate(280,400) scale(0.66) translate(-350,-300)">${sil}</g>

      <!-- glass glint -->
      <path d="M70,560 L210,210 L260,210 L120,580 Z" fill="#fff" opacity="0.07"/>
      <path d="M150,575 L300,215 L322,215 L172,585 Z" fill="#fff" opacity="0.05"/>
    </g>

    <!-- plaque -->
    <rect x="120" y="632" width="320" height="64" rx="10" fill="#241409" stroke="${GOLD}" stroke-width="4"/>
    <text x="280" y="674" text-anchor="middle" font-family="${SERIF}" font-size="30"
          letter-spacing="6" fill="${GOLD}">${dino.name}</text>
  </svg>`
}

/* ============================== CATALOG CARD ART ============================== */

function dietVignette(id) {
  if (id === 'trike') {
    // ferns by the beak — plants existed; grass (mostly) didn't, so: ferns.
    const frond = (x, y, rot, s) => `
      <g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
        <line x1="0" y1="0" x2="0" y2="-110" stroke="#4e8a52" stroke-width="7"/>
        ${[-88, -68, -48, -28].map(yy => `
          <path d="M0,${yy} C-26,${yy - 12} -40,${yy - 4} -48,${yy + 8}" fill="none" stroke="#5fa763" stroke-width="6"/>
          <path d="M0,${yy} C26,${yy - 12} 40,${yy - 4} 48,${yy + 8}" fill="none" stroke="#5fa763" stroke-width="6"/>`).join('')}
      </g>`
    return frond(60, 480, -8, 1) + frond(120, 488, 10, 0.8) + frond(28, 488, -22, 0.7)
  }
  if (id === 'allo') {
    return `<g transform="translate(70,440) rotate(-18)">
      <rect x="-10" y="-12" width="120" height="24" rx="12" fill="#e8dcc0"/>
      <circle cx="-12" cy="-10" r="13" fill="#e8dcc0"/><circle cx="-12" cy="10" r="13" fill="#e8dcc0"/>
      <circle cx="112" cy="-10" r="13" fill="#e8dcc0"/><circle cx="112" cy="10" r="13" fill="#e8dcc0"/>
      <ellipse cx="50" cy="0" rx="46" ry="20" fill="#c96a5a"/>
    </g>`
  }
  return `<g transform="translate(72,452) rotate(-12)">
    <path d="M0,0 C30,-22 80,-22 104,0 C80,22 30,22 0,0 Z" fill="#7fb6c9"/>
    <polygon points="100,0 134,-20 134,20" fill="#7fb6c9"/>
    <circle cx="28" cy="-4" r="5" fill="#0c343c"/>
  </g>`
}

export function catalogCardArt(dino) {
  const sil = SILHOUETTES[dino.id]('#f4e6c8', '#d6c49b', '#123c44')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 560">
    <rect width="700" height="560" rx="18" fill="#123c44"/>
    <ellipse cx="350" cy="498" rx="280" ry="26" fill="#0a2930"/>
    <g transform="translate(350,300) scale(0.86) translate(-350,-290)">${sil}</g>
    ${dietVignette(dino.id)}
  </svg>`
}
