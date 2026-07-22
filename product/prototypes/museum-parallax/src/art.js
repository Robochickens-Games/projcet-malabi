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

// Velociraptor — turkey-sized, FEATHERED, horizontal spine + long balancing tail,
// raised sickle claw. (Quill knobs on the ulna confirm wing feathers — Turner et al.
// 2007, Science.) Box 700x520, standing on y≈480, facing left like the others.
function raptorSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <!-- far leg -->
    <path d="M372,344 C366,400 360,440 374,478 L344,478 L330,400 L348,344 Z" fill="${dim}"/>
    <rect x="320" y="474" width="74" height="16" rx="8" fill="${dim}"/>
    <!-- long balancing tail, swept up to the right + feather tufts -->
    <polygon points="430,262 694,196 702,218 440,318" fill="${bone}"/>
    ${[470, 540, 610].map((x) => `<path d="M${x},230 q26,-34 54,-26 q-30,16 -34,40 Z" fill="${dim}" opacity="0.85"/>`).join('')}
    <!-- body -->
    <ellipse cx="332" cy="300" rx="128" ry="66" fill="${bone}"/>
    <!-- feathered arm hanging from the body -->
    <polygon points="262,300 206,352 222,362 286,318" fill="${dim}"/>
    ${[214, 236, 258].map((x) => `<path d="M${x},348 q-16,22 -8,42 q18,-14 26,-34 Z" fill="${dim}" opacity="0.85"/>`).join('')}
    <!-- near leg + raised sickle claw -->
    <path d="M302,352 C296,406 290,442 304,478 L270,478 L256,398 L282,350 Z" fill="${bone}"/>
    <rect x="246" y="474" width="86" height="16" rx="8" fill="${bone}"/>
    <polygon points="246,478 226,460 260,470" fill="${bone}"/>
    <path d="M300,456 q-22,-4 -30,-26 q16,8 34,8 Z" fill="${bg}"/>
    <!-- neck + head, low and forward (left) -->
    <polygon points="248,258 150,300 182,326 282,288" fill="${bone}"/>
    <ellipse cx="142" cy="312" rx="72" ry="36" fill="${bone}"/>
    <rect x="44" y="306" width="86" height="24" rx="8" fill="${bone}"/>
    <line x1="48" y1="330" x2="124" y2="332" stroke="${bg}" stroke-width="4"/>
    ${[58, 78, 98].map((x) => `<polygon points="${x},330 ${x + 6},342 ${x + 12},330" fill="${bone}"/>`).join('')}
    <circle cx="152" cy="302" r="7" fill="${bg}"/>
  </g>`
}

// Tyrannosaurus rex — huge head, tiny two-fingered arms, horizontal spine,
// heavy balancing tail. Box 700x520, standing on y≈480, facing left.
function trexSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <!-- far leg -->
    <path d="M364,330 C354,402 348,452 364,480 L330,480 L316,400 L340,330 Z" fill="${dim}"/>
    <rect x="306" y="476" width="84" height="16" rx="8" fill="${dim}"/>
    <!-- heavy tail, swept right -->
    <polygon points="438,296 700,330 700,366 446,360" fill="${bone}"/>
    <!-- body -->
    <ellipse cx="344" cy="298" rx="142" ry="88" fill="${bone}"/>
    <!-- tiny arm -->
    <path d="M256,322 q-26,16 -28,42 q14,-6 22,-16 Z" fill="${dim}"/>
    <!-- near leg, muscular -->
    <path d="M300,338 C292,410 286,454 304,480 L260,480 L246,396 L280,336 Z" fill="${bone}"/>
    <rect x="238" y="476" width="96" height="16" rx="8" fill="${bone}"/>
    <polygon points="238,480 214,460 256,472" fill="${bone}"/>
    <!-- thick neck + huge skull (left) -->
    <polygon points="262,238 196,222 206,300 286,286" fill="${bone}"/>
    <path d="M210,196 L58,224 L62,300 L214,300 Z" fill="${bone}"/>
    <!-- lower jaw + teeth -->
    <path d="M66,300 L210,300 L202,338 L92,334 Z" fill="${bone}"/>
    ${[86, 112, 138, 164].map((x) => `<polygon points="${x},300 ${x + 9},324 ${x + 18},300" fill="${bone}"/>`).join('')}
    <circle cx="126" cy="240" r="8" fill="${bg}"/>
  </g>`
}

// Brachiosaurus — sauropod: tiny head on a long neck reaching up-left, huge
// body, columnar legs, long tail. Box 700x520, standing on y≈480, facing left.
function brachioSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <!-- far legs -->
    <rect x="318" y="318" width="54" height="164" rx="16" fill="${dim}"/>
    <rect x="448" y="318" width="54" height="164" rx="16" fill="${dim}"/>
    <!-- tail right -->
    <polygon points="486,300 692,366 692,394 492,348" fill="${bone}"/>
    <!-- giant body -->
    <ellipse cx="390" cy="300" rx="164" ry="112" fill="${bone}"/>
    <!-- near legs -->
    <rect x="282" y="328" width="62" height="154" rx="18" fill="${bone}"/>
    <rect x="422" y="328" width="62" height="154" rx="18" fill="${bone}"/>
    <!-- long neck rising up-left + small head -->
    <polygon points="306,256 150,86 198,64 350,236" fill="${bone}"/>
    <ellipse cx="150" cy="74" rx="50" ry="30" fill="${bone}"/>
    <rect x="106" y="60" width="52" height="22" rx="9" fill="${bone}"/>
    <path d="M146,50 q14,-18 28,4 Z" fill="${bone}"/>
    <circle cx="160" cy="68" r="6" fill="${bg}"/>
  </g>`
}

// Pteranodon — the famous "pterodactyl" (a PTEROSAUR, not a dinosaur): huge
// wings, long toothless beak, swept-back head crest. Drawn in a flying pose,
// centred in the box (mounted hanging, not standing).
function pteroSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  return `<g>
    <!-- far wing (behind) -->
    <path d="M344,250 L636,150 L662,196 L372,300 Z" fill="${dim}"/>
    <!-- near wing (big, foreground) -->
    <path d="M336,256 L60,150 L34,202 L312,304 Z" fill="${bone}"/>
    <path d="M60,150 L300,268" stroke="${bg}" stroke-width="3" opacity="0.5" fill="none"/>
    <!-- body + short legs -->
    <ellipse cx="336" cy="284" rx="66" ry="40" fill="${bone}"/>
    <path d="M330,318 l-8,70 M352,318 l10,70" stroke="${bone}" stroke-width="13" stroke-linecap="round"/>
    <!-- neck + head: long beak (left) + swept-back crest -->
    <polygon points="304,256 226,214 244,244 320,278" fill="${bone}"/>
    <ellipse cx="214" cy="210" rx="34" ry="22" fill="${bone}"/>
    <polygon points="190,210 84,198 190,228" fill="${bone}"/>
    <polygon points="226,198 292,150 250,202" fill="${bone}"/>
    <circle cx="210" cy="204" r="6" fill="${bg}"/>
  </g>`
}

export const SILHOUETTES = {
  trike: trikeSilhouette, allo: alloSilhouette, spino: spinoSilhouette, raptor: raptorSilhouette,
  trex: trexSilhouette, brachio: brachioSilhouette, ptero: pteroSilhouette,
}

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
    // big carnivore — a large, curved, serrated blade (T-rex)
    return `
      <path d="M60,8 C84,40 82,86 56,120 C49,108 39,80 37,52 C36,30 46,14 60,8 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M44,34 l-5,6 l6,5 l-5,6 l6,5 l-5,6 l6,5 l-4,6"
            fill="none" stroke="${stroke}" stroke-width="3" opacity="0.8"/>`
  }
  if (kind === 'fang') {
    // small carnivore — a slim, strongly recurved serrated fang, drawn smaller in
    // the box so it clearly reads tinier than the T-rex blade (Velociraptor)
    return `
      <path d="M58,26 C76,52 70,86 48,106 C44,94 39,74 39,56 C39,40 47,30 58,26 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M46,50 l-5,5 l6,4 l-5,5 l6,4 l-5,5"
            fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.8"/>`
  }
  if (kind === 'peg') {
    // sauropod — chisel / peg tooth for stripping leaves
    return `
      <path d="M34,14 L66,14 L60,92 C60,112 40,112 40,92 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="42" y1="100" x2="58" y2="100" stroke="${stroke}" stroke-width="4"/>`
  }
  if (kind === 'beak' || kind === 'none') {
    // pterosaur — a toothless, pointed beak
    return `
      <path d="M14,46 C40,20 82,30 88,52 C70,58 42,58 26,70 C18,62 12,54 14,46 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="30" y1="50" x2="74" y2="50" stroke="${stroke}" stroke-width="3" opacity="0.5"/>`
  }
  // cone — fish-eater
  return `
    <path d="M50,8 C61,30 67,72 58,120 L42,120 C33,72 39,30 50,8 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <line x1="50" y1="20" x2="50" y2="108" stroke="${stroke}" stroke-width="3" opacity="0.4"/>`
}

/* ============================== CLUE / SECTION ICON ART ============================== */
// Iconic, low-fi art shared by the inventory clues, the drag ghost, and the
// catalog sections (Covering · Footprints · Eggs). Drawn in a 100x130 box.

// an egg (Brachiosaurus clue + the Eggs section). Each kind has a deliberately
// DISTINCT silhouette + surface so they don't read as the same egg at four sizes:
//   round → near-sphere · oval → plump asymmetric egg · elongated → long & slim ·
//   leathery → soft, saggy shell with wrinkles (no hard speckles).
export function eggSVGInner(kind = 'round', fill = '#e7dcc0', stroke = '#6b4f2a') {
  const speck = (pts) => pts.map(([x, y, r = 3]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${stroke}" opacity="0.38"/>`).join('')
  if (kind === 'oval') {
    // T-rex — a plump, asymmetric egg: pointier top, rounder base
    return `
      <path d="M50,12 C69,12 76,40 76,66 C76,96 64,116 50,116 C36,116 24,96 24,66 C24,40 31,12 50,12 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      ${speck([[42, 44], [58, 64], [46, 86], [60, 98], [50, 30]])}`
  }
  if (kind === 'elongated') {
    // raptor — long and slim, stood on end like a bird's egg
    return `
      <ellipse cx="50" cy="66" rx="20" ry="58" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
      <path d="M42,20 C36,46 36,86 44,110" fill="none" stroke="#fff" stroke-width="3" opacity="0.18"/>
      ${speck([[53, 46], [48, 72], [54, 94]])}`
  }
  if (kind === 'leathery') {
    // pterosaur — a soft, saggy shell: dimpled outline with creases, not speckles
    return `
      <path d="M22,72 C20,50 34,32 50,34 C62,35 70,28 79,40 C87,51 84,66 82,76 C79,100 64,114 49,113 C31,112 24,94 22,72 Z"
            fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <g fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.5" stroke-linecap="round">
        <path d="M34,58 q14,-8 26,-2"/>
        <path d="M32,80 q16,8 34,1"/>
        <path d="M40,98 q10,6 22,0"/>
      </g>`
  }
  // round — near-sphere (Triceratops, Brachiosaurus), lightly speckled
  return `
    <ellipse cx="50" cy="66" rx="40" ry="43" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
    ${speck([[40, 50], [60, 74], [44, 86], [62, 56], [50, 40], [54, 92]])}`
}
export function eggSVG(kind = 'round', w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${eggSVGInner(kind)}</svg>`
}

// a toe bone (phalanx) — a shaft with knobby ends. `len` sets how long it is, so
// short/long bones read differently (used by the T-rex foot-assembly puzzle).
export function boneSVGInner(len = 80, fill = '#ece0c2', stroke = '#7a5c33', outline = false) {
  const top = 20
  const bot = top + len
  const f = outline ? `fill="none" stroke="${stroke}" stroke-width="4" stroke-dasharray="7 6"` : `fill="${fill}" stroke="${stroke}" stroke-width="4"`
  return `<g ${f}>
    <circle cx="38" cy="${top}" r="16"/><circle cx="62" cy="${top}" r="16"/>
    <rect x="34" y="${top}" width="32" height="${len}" rx="14"/>
    <circle cx="38" cy="${bot}" r="15"/><circle cx="62" cy="${bot}" r="15"/>
  </g>`
}
export function boneSVG(len = 80, w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 ${Math.max(130, len + 60)}">${boneSVGInner(len)}</svg>`
}

// pycnofibers — the pterosaur "fuzz" (Pterodactyl clue + a Covering icon)
export function pycnofiberInner(fill = '#d9c9a6', stroke = '#6b4f2a') {
  const hair = (i) => {
    const dx = (i - 3) * 9
    return `<path d="M50,114 q${dx * 0.6},-46 ${dx},-92" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>`
  }
  return `
    <ellipse cx="50" cy="114" rx="24" ry="8" fill="${fill}" opacity="0.6"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(hair).join('')}`
}
export function pycnofiberSVG(w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${pycnofiberInner()}</svg>`
}

// a fossil footprint / track (the Footprints section)
export function footprintInner(kind, fill = '#3a2c1a', stroke = '#6b4f2a') {
  const F = `fill="${fill}" stroke="${stroke}" stroke-width="3"`
  if (kind === 'round') return `<ellipse cx="50" cy="66" rx="40" ry="46" ${F}/>` // sauropod
  if (kind === 'round3') return `<g ${F}>
    <ellipse cx="50" cy="80" rx="30" ry="20"/>
    <path d="M50,72 L34,38 L46,36 Z"/><path d="M50,70 L50,32 L58,34 Z"/><path d="M50,72 L66,38 L76,46 Z"/></g>` // ceratopsian
  if (kind === 'two-toe') return `<g ${F}>
    <ellipse cx="50" cy="92" rx="16" ry="12"/>
    <path d="M50,86 L34,28 L46,28 Z"/><path d="M50,86 L64,26 L76,32 Z"/></g>` // raptor
  if (kind === 'wing') return `<g ${F}>
    <ellipse cx="40" cy="84" rx="16" ry="11"/>
    <g fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round">
      <path d="M58,68 l28,-26"/><path d="M58,80 l30,-4"/><path d="M58,92 l26,18"/></g></g>` // pterosaur
  // three-toe (theropod)
  return `<g ${F}>
    <ellipse cx="50" cy="86" rx="22" ry="15"/>
    <path d="M50,80 L28,30 L40,28 Z"/><path d="M50,78 L50,20 L58,22 Z"/><path d="M50,80 L72,30 L80,40 Z"/></g>`
}
export function footprintSVG(kind, w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${footprintInner(kind)}</svg>`
}

// body covering (the Covering section): scales / feathers / pycnofibers
export function coveringInner(kind, fill = '#e7dcc0', stroke = '#6b4f2a') {
  if (kind === 'feathers') return featherInner(fill, stroke)
  if (kind === 'pycnofibers') return pycnofiberInner(fill, stroke)
  // scales — rows of overlapping scallops
  let s = ''
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const x = 22 + c * 19 + (r % 2 ? 9 : 0)
      const y = 32 + r * 22
      s += `<path d="M${x - 12},${y} a12,12 0 0 1 24,0" fill="none" stroke="${stroke}" stroke-width="3"/>`
    }
  }
  return s
}
export function coveringSVG(kind, w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${coveringInner(kind)}</svg>`
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

// The museum roster — one entry per dino in the game, with the science for every
// catalog section (Teeth · Covering · Footprints · Eggs). `kind` flags that
// Pterodactyl is a pterosaur, not a dinosaur.
export const DINOS = [
  {
    id: 'trike', name: 'TRICERATOPS', kind: 'dinosaur', diet: 'Eats plants 🌿',
    tooth: 'leaf', toothNote: 'Wide, flat teeth — for grinding ferns and leaves.',
    covering: 'scales', coveringNote: 'Scaly, pebbly skin — like a lizard’s.',
    footprint: 'round3', footprintNote: 'Broad footprints with short, stubby toes.',
    egg: 'round', eggNote: 'Round eggs, laid in a nest on the ground.',
  },
  {
    id: 'ptero', name: 'PTERODACTYL', kind: 'pterosaur', diet: 'Eats fish 🐟',
    tooth: 'beak', toothNote: 'No teeth at all — a long, pointed beak to snatch fish.',
    covering: 'pycnofibers', coveringNote: 'Pycnofibers — a soft fuzz (not feathers, not scales).',
    footprint: 'wing', footprintNote: 'Odd four-part tracks — it walked on its folded wings.',
    egg: 'leathery', eggNote: 'Soft, leathery eggs, buried like a turtle’s.',
  },
  {
    id: 'trex', name: 'T-REX', kind: 'dinosaur', diet: 'Eats meat 🍖',
    tooth: 'blade', toothNote: 'Banana-sized, serrated teeth — strong enough to crush bone.',
    covering: 'scales', coveringNote: 'Mostly scaly skin (maybe a few feathers).',
    footprint: 'three-toe', footprintNote: 'Huge three-toed footprints, longer than your arm.',
    egg: 'oval', eggNote: 'Big oval eggs — though none are confirmed yet!',
  },
  {
    id: 'raptor', name: 'VELOCIRAPTOR', kind: 'dinosaur', diet: 'Eats meat 🍖',
    tooth: 'fang', toothNote: 'Small, curved, serrated teeth.',
    covering: 'feathers', coveringNote: 'Feathers — like a bird. Quill knobs prove it.',
    footprint: 'two-toe', footprintNote: 'Two-toed tracks — the killing claw was held off the ground.',
    egg: 'elongated', eggNote: 'Long eggs, brooded in a nest like a bird.',
  },
  {
    id: 'brachio', name: 'BRACHIOSAURUS', kind: 'dinosaur', diet: 'Eats plants 🌿',
    tooth: 'peg', toothNote: 'Chisel-shaped peg teeth — for stripping leaves.',
    covering: 'scales', coveringNote: 'Scaly skin over a giant body.',
    footprint: 'round', footprintNote: 'Enormous round footprints — like tractor tyres.',
    egg: 'round', eggNote: 'Surprisingly small round eggs, laid in long lines.',
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
  if (id === 'raptor') {
    // a drifting feather — Velociraptor's signature
    return `<g transform="translate(58,408) rotate(-12) scale(1.4)">${featherInner('#e7d9b6', '#6b4f2a')}</g>`
  }
  if (id === 'trex') {
    // a gnawed bone — the apex predator
    return `<g transform="translate(64,452) rotate(-16)" fill="#e8dcc0">
      <rect x="-6" y="-11" width="116" height="22" rx="11"/>
      <circle cx="-8" cy="-9" r="12"/><circle cx="-8" cy="9" r="12"/>
      <circle cx="108" cy="-9" r="12"/><circle cx="108" cy="9" r="12"/>
    </g>`
  }
  if (id === 'brachio') {
    // a tall leafy branch it reached up to browse
    return `<g transform="translate(86,500)" stroke="#4e8a52" stroke-width="7" fill="none">
      <line x1="0" y1="0" x2="-6" y2="-150"/>
      ${[-40, -78, -116].map((y) => `<path d="M-4,${y} C-30,${y - 16} -46,${y - 8} -56,${y + 6}" stroke="#5fa763" stroke-width="6"/>
        <path d="M-4,${y} C22,${y - 16} 38,${y - 8} 48,${y + 6}" stroke="#5fa763" stroke-width="6"/>`).join('')}
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

/* ============================== CATALOG COVER ART ============================== */
// Section icons + the field-guide crest. Authored in the same gold/teal language
// as the tooth art so the cover reads as one book with the cards inside it.

function featherInner(fill = '#efe2c0', stroke = '#6b4f2a') {
  // a single vane — pointed tip, symmetric barbs, bare shaft below
  const barbs = [28, 37, 46, 55, 64, 73, 82, 91].map((y) => {
    const w = 16 - Math.abs(y - 56) * 0.22
    return `<line x1="50" y1="${y}" x2="${(50 - w).toFixed(1)}" y2="${y - 7}" stroke="${stroke}" stroke-width="2.2" opacity=".55"/>
            <line x1="50" y1="${y}" x2="${(50 + w).toFixed(1)}" y2="${y - 7}" stroke="${stroke}" stroke-width="2.2" opacity=".55"/>`
  }).join('')
  return `
    <path d="M50,12 C68,34 68,66 50,100 C32,66 32,34 50,12 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    ${barbs}
    <line x1="50" y1="16" x2="52" y2="124" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>`
}

export function featherSVG(w = 100, h = 130) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">
    ${featherInner()}
  </svg>`
}

export function catalogCrest(size = 92) {
  // field-guide medallion: a magnifying glass — the game's "investigate" motif
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="${TEAL_DEEP}" stroke="${GOLD}" stroke-width="3"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="${GOLD_DEEP}" stroke-width="1.5" opacity=".6"/>
    <g stroke="${GOLD}" fill="none" stroke-linecap="round">
      <circle cx="45" cy="44" r="17" stroke-width="5"/>
      <line x1="57" y1="56" x2="72" y2="71" stroke-width="6"/>
    </g>
    <circle cx="40" cy="39" r="4" fill="${CREAM}" opacity=".8"/>
  </svg>`
}

/* ============================== SPACE WING ==============================
   Item art for the Space Wing: the five space-rock types the player sells at
   the Supply Desk, and the five tools they buy back. Wireframe-grade SVG in
   the museum palette — painted art drops in 1:1 later (team norm).
   The economy's RULES (values, prices) live in economy.js; this file only
   draws. Rock accuracy per brain/memory/projects/science-museum-mystery/
   space-accuracy-rulings (Mars = iron-oxide red, lunar = grey basalt). */

const SPACE_ROCK_INNER = {
  // a bright crystalline shard — the most valuable common find
  starShard: () => `
    <path d="M50,14 L64,52 L50,116 L36,52 Z" fill="${CREAM}" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50,14 L50,116" stroke="${GOLD_DEEP}" stroke-width="2" opacity=".7"/>
    <path d="M36,52 L64,52" stroke="${GOLD_DEEP}" stroke-width="2" opacity=".5"/>
    <circle cx="43" cy="40" r="4" fill="#fff" opacity=".85"/>`,
  // rusty red — Mars is red from iron oxide in its dust
  marsRock: () => `
    <path d="M24,86 q-6,-26 14,-38 q22,-16 40,-2 q16,12 10,34 q-6,20 -32,20 q-26,0 -32,-14 Z"
      fill="#a4472b" stroke="#6b2f1c" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="42" cy="60" rx="7" ry="5" fill="#c2603c" opacity=".9"/>
    <ellipse cx="66" cy="74" rx="5" ry="4" fill="#c2603c" opacity=".7"/>
    <ellipse cx="55" cy="47" rx="4" ry="3" fill="#8c3a22" opacity=".8"/>`,
  // grey basalt with impact pits — lunar regolith
  lunarChip: () => `
    <path d="M28,80 q-4,-22 16,-32 q20,-10 34,2 q14,12 6,32 q-8,18 -30,16 q-22,-2 -26,-18 Z"
      fill="#9a9a94" stroke="#5f5f5a" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="45" cy="58" r="6" fill="#7d7d78"/>
    <circle cx="64" cy="72" r="4" fill="#7d7d78"/>
    <circle cx="52" cy="78" r="3" fill="#7d7d78"/>`,
  // dark, fusion-crusted, metallic glint — a fallen meteorite
  meteorite: () => `
    <path d="M26,78 q-2,-24 18,-34 q22,-11 36,4 q13,14 4,32 q-10,19 -32,16 q-24,-3 -26,-18 Z"
      fill="#3d3630" stroke="#221d19" stroke-width="3" stroke-linejoin="round"/>
    <path d="M40,52 l10,12 -8,10 12,6" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round" opacity=".85"/>
    <circle cx="66" cy="60" r="3.5" fill="${CREAM}" opacity=".7"/>`,
  // a loose cluster of glittering grains — the rarest, highest-value find
  stardust: () => {
    const g = (x, y, r, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CREAM}" opacity="${o}"/>`
    return `
      <ellipse cx="50" cy="66" rx="30" ry="26" fill="${TEAL}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      ${g(40, 54, 4, .95)}${g(58, 50, 3, .8)}${g(64, 68, 4.5, .9)}
      ${g(44, 76, 3.5, .75)}${g(54, 66, 5, 1)}${g(34, 66, 2.5, .6)}${g(56, 80, 2.5, .65)}`
  },
}

export function spaceRockSVG(kind, w = 100, h = 130) {
  const inner = SPACE_ROCK_INNER[kind] || SPACE_ROCK_INNER.lunarChip
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${inner()}</svg>`
}

const SPACE_TOOL_INNER = {
  // an orrery planet on its mounting pin — slots onto an orbit ring
  planetModel: () => `
    <circle cx="50" cy="52" r="26" fill="${TEAL}" stroke="${GOLD}" stroke-width="3"/>
    <ellipse cx="50" cy="52" rx="38" ry="11" fill="none" stroke="${GOLD}" stroke-width="3" opacity=".9"/>
    <circle cx="41" cy="43" r="6" fill="${CREAM}" opacity=".5"/>
    <path d="M50,78 L50,108" stroke="${GOLD_DEEP}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="50" cy="112" rx="16" ry="5" fill="${GOLD_DEEP}"/>`,
  // a soft brush for the rover's dusty solar panel (a museum tool, not a real
  // rover part — see space-accuracy-rulings)
  solarBrush: () => `
    <rect x="42" y="22" width="16" height="52" rx="7" fill="${GOLD_DEEP}" stroke="${TEAL_DEEP}" stroke-width="2"/>
    <rect x="36" y="72" width="28" height="14" rx="4" fill="${GOLD}" stroke="${TEAL_DEEP}" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${39 + i * 4.4}" y1="86" x2="${37 + i * 5.2}" y2="112" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
  // a punched mission-sequence card
  missionCard: () => `
    <rect x="22" y="34" width="56" height="62" rx="5" fill="${CREAM}" stroke="${GOLD_DEEP}" stroke-width="3"/>
    <circle cx="34" cy="46" r="4" fill="${TEAL_DEEP}"/>
    <line x1="44" y1="46" x2="68" y2="46" stroke="${TEAL}" stroke-width="3" stroke-linecap="round"/>
    <line x1="32" y1="62" x2="68" y2="62" stroke="${TEAL}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <line x1="32" y1="74" x2="60" y2="74" stroke="${TEAL}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <line x1="32" y1="86" x2="64" y2="86" stroke="${TEAL}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
  // a cranked key — turns the station's solar panels to face the Sun
  rotateKey: () => `
    <circle cx="50" cy="44" r="18" fill="none" stroke="${GOLD}" stroke-width="7"/>
    <path d="M62,56 A18,18 0 0 1 38,56" fill="none" stroke="${GOLD_DEEP}" stroke-width="4" opacity=".8"/>
    <rect x="45" y="60" width="10" height="44" rx="3" fill="${GOLD}" stroke="${GOLD_DEEP}" stroke-width="2"/>
    <rect x="55" y="86" width="14" height="8" rx="2" fill="${GOLD}"/>
    <rect x="55" y="98" width="10" height="8" rx="2" fill="${GOLD}"/>`,
  // one hexagonal gold-coated mirror segment (JWST has 18 — see rulings)
  mirrorPart: () => `
    <path d="M50,20 L79,37 L79,71 L50,88 L21,71 L21,37 Z" fill="${GOLD}" stroke="${GOLD_DEEP}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50,30 L70,42 L70,66 L50,78 L30,66 L30,42 Z" fill="none" stroke="${CREAM}" stroke-width="2" opacity=".55"/>
    <path d="M34,40 L46,33" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
}

export function spaceToolSVG(kind, w = 100, h = 130) {
  const inner = SPACE_TOOL_INNER[kind] || SPACE_TOOL_INNER.planetModel
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">${inner()}</svg>`
}

// the coin the Supply Desk trades in — drawn small for the HUD counter
export function coinSVG(size = 40) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="42" fill="${GOLD}" stroke="${GOLD_DEEP}" stroke-width="5"/>
    <circle cx="50" cy="50" r="31" fill="none" stroke="${GOLD_DEEP}" stroke-width="3" opacity=".7"/>
    <path d="M50,28 L56,44 L72,44 L59,54 L64,70 L50,60 L36,70 L41,54 L28,44 L44,44 Z" fill="${CREAM}" opacity=".9"/>
  </svg>`
}

/* ====================== SPACE WING SILHOUETTES ======================
   One per space diorama, drawn in the same ~700x500 box as the dino
   silhouettes so the hub's framed niches can reuse the same transform.
   Real subjects only ([[scientific-realism-rule]]): an orrery, a Mars rover,
   the Apollo lunar module, the ISS, and JWST. Accuracy notes live in
   brain/memory/projects/science-museum-mystery/space-accuracy-rulings. */

// Solar System orrery — the Sun plus eight planets on their rings.
// Only the sixth planet carries visible rings: the "giant with rings is sixth"
// clue stops being solvable if the other giants are drawn ringed too.
function solarSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  const planets = [
    [232, 9], [286, 14], [342, 15], [396, 12],   // Mercury Venus Earth Mars
    [470, 30], [552, 26], [620, 19], [676, 18],  // Jupiter Saturn Uranus Neptune
  ]
  const rings = planets.map(([x, r]) =>
    `<ellipse cx="150" cy="300" rx="${x - 150}" ry="${(x - 150) * 0.30}" fill="none" stroke="${dim}" stroke-width="2.5" opacity="0.55"/>`).join('')
  const bodies = planets.map(([x, r], i) =>
    `<circle cx="${x}" cy="300" r="${r}" fill="${i === 5 ? bone : dim}"/>` +
    (i === 5 ? `<ellipse cx="${x}" cy="300" rx="${r * 1.95}" ry="${r * 0.5}" fill="none" stroke="${bone}" stroke-width="4"/>` : '')).join('')
  return `<g>
    ${rings}
    <circle cx="150" cy="300" r="54" fill="${bone}"/>
    <circle cx="150" cy="300" r="72" fill="none" stroke="${bone}" stroke-width="3" opacity="0.5"/>
    ${bodies}
    <rect x="120" y="420" width="60" height="60" fill="${dim}"/>
  </g>`
}

// Mars rover — six wheels, rocker-bogie, mast with camera head, solar wings
function roverSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  const wheel = (x) => `<circle cx="${x}" cy="418" r="42" fill="${dim}"/><circle cx="${x}" cy="418" r="20" fill="${bone}"/>`
  return `<g>
    ${[210, 350, 490].map(wheel).join('')}
    <path d="M200,380 L280,318 L420,318 L500,380" fill="none" stroke="${dim}" stroke-width="9"/>
    <rect x="250" y="252" width="220" height="80" rx="12" fill="${bone}"/>
    <rect x="120" y="262" width="130" height="34" fill="${dim}"/>
    <rect x="470" y="262" width="130" height="34" fill="${dim}"/>
    <rect x="336" y="150" width="16" height="104" fill="${bone}"/>
    <rect x="300" y="118" width="92" height="42" rx="8" fill="${bone}"/>
    <circle cx="322" cy="139" r="10" fill="${bg}"/><circle cx="368" cy="139" r="10" fill="${bg}"/>
    <path d="M470,290 L560,214" stroke="${bone}" stroke-width="8"/>
    <rect x="546" y="192" width="46" height="30" rx="6" fill="${bone}"/>
  </g>`
}

// Apollo lunar module — descent stage, four legs, angled ascent stage
function landerSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  const leg = (x1, x2) => `
    <path d="M${x1},330 L${x2},452" stroke="${dim}" stroke-width="11"/>
    <ellipse cx="${x2}" cy="460" rx="30" ry="10" fill="${bone}"/>`
  return `<g>
    ${leg(258, 150)}${leg(442, 550)}${leg(300, 236)}${leg(400, 464)}
    <rect x="248" y="272" width="204" height="66" rx="8" fill="${dim}"/>
    <path d="M262,272 L438,272 L410,196 L290,196 Z" fill="${bone}"/>
    <rect x="300" y="140" width="100" height="58" rx="10" fill="${bone}"/>
    <rect x="318" y="156" width="28" height="26" fill="${bg}"/>
    <rect x="356" y="156" width="28" height="26" fill="${bg}"/>
    <rect x="340" y="338" width="20" height="34" fill="${dim}"/>
    <path d="M330,372 L370,372 L384,412 L316,412 Z" fill="${dim}"/>
    <rect x="336" y="106" width="12" height="36" fill="${dim}"/>
  </g>`
}

// The ISS — a truss with pressurised modules and four big solar arrays
function stationSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  const array = (x, y) => `
    <rect x="${x}" y="${y}" width="150" height="66" fill="${dim}"/>
    <g stroke="${bg}" stroke-width="3">
      ${[1, 2, 3, 4].map((i) => `<line x1="${x + i * 30}" y1="${y}" x2="${x + i * 30}" y2="${y + 66}"/>`).join('')}
      <line x1="${x}" y1="${y + 33}" x2="${x + 150}" y2="${y + 33}"/>
    </g>`
  return `<g>
    <rect x="120" y="292" width="470" height="18" fill="${bone}"/>
    ${array(130, 196)}${array(130, 316)}${array(460, 196)}${array(460, 316)}
    <rect x="296" y="256" width="130" height="92" rx="26" fill="${bone}"/>
    <rect x="256" y="278" width="46" height="48" rx="10" fill="${dim}"/>
    <rect x="420" y="278" width="52" height="48" rx="10" fill="${dim}"/>
    <rect x="344" y="348" width="36" height="52" rx="8" fill="${dim}"/>
    <circle cx="362" cy="416" r="22" fill="${bone}"/>
    <rect x="352" y="196" width="20" height="60" fill="${dim}"/>
  </g>`
}

// JWST — 18 hexagonal mirror segments over the layered sunshield
function webbSilhouette(bone = BONE, dim = BONE_DIM, bg = TEAL_DEEP) {
  // a hex of radius r at (cx,cy), flat-top like Webb's segments
  const hex = (cx, cy, r) => {
    const pts = [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (Math.PI / 180) * (60 * i - 30)
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
    }).join(' ')
    return `<polygon points="${pts}" fill="${bone}" stroke="${bg}" stroke-width="3"/>`
  }
  // Webb's primary is EXACTLY 18 segments: a hexagonal close-pack of 19
  // positions (centre + two rings) with the centre left open for the secondary
  // mirror's support. Rows of 3·4·5·4·3 = 19, minus the centre = 18. The count
  // is the fact this room teaches, so it has to be right on sight.
  const R = 30, dx = R * Math.sqrt(3), dy = R * 1.5
  const rows = [[-1, -2, 3], [-1.5, -1, 4], [-2, 0, 5], [-1.5, 1, 4], [-1, 2, 3]]
  let tiles = ''
  for (const [start, ry, n] of rows) {
    for (let i = 0; i < n; i++) {
      if (ry === 0 && i === 2) continue        // the open centre
      tiles += hex(350 + (start + i) * dx, 250 + ry * dy, R - 2)
    }
  }
  return `<g>
    <path d="M90,470 L610,470 L520,392 L180,392 Z" fill="${dim}"/>
    <path d="M120,432 L580,432" stroke="${bg}" stroke-width="3"/>
    <path d="M150,398 L550,398" stroke="${bg}" stroke-width="3"/>
    ${tiles}
    <path d="M350,180 L280,120 M350,180 L420,120" stroke="${dim}" stroke-width="7"/>
    <ellipse cx="350" cy="112" rx="40" ry="14" fill="${bone}"/>
    <rect x="336" y="322" width="28" height="76" fill="${dim}"/>
  </g>`
}

export const SPACE_SILHOUETTES = {
  solar: solarSilhouette, mars: roverSilhouette, moon: landerSilhouette,
  station: stationSilhouette, webb: webbSilhouette,
}

/* ============================== PLANETS ==============================
   The eight planets, for the Solar System orrery and the Star Atlas.
   `order` is the real distance rank from the Sun — it IS the puzzle's answer,
   so it comes from one place only. `r` is DRAW size: relative, not to scale
   (every orrery compresses distance and inflates planets — the Atlas says so
   out loud rather than implying the spacing is real; see space-accuracy-rulings).
   Only Saturn is drawn with visible rings: Jupiter, Uranus and Neptune have
   rings too, but drawing them would break the "giant with rings is sixth" clue. */
export const PLANETS = [
  {
    id: 'mercury', why: 'the closest world to the Sun.', name: 'Mercury', order: 1, r: 15, color: '#8c8681', ringed: false,
    trait: 'Small, grey and cratered — the closest world to the Sun.',
    atlas: 'The smallest planet, and the nearest to the Sun. It is scorched by day and freezing by night, because it has almost no air to hold the heat in.',
  },
  {
    id: 'venus', why: 'hottest of all — its clouds trap the heat.', name: 'Venus', order: 2, r: 22, color: '#d9b877', ringed: false,
    trait: 'Wrapped in thick, pale cloud.',
    atlas: 'The <b>hottest</b> planet of them all — about 465°C. Not because it is closest to the Sun (it isn’t), but because its thick clouds trap the heat like a blanket.',
  },
  {
    id: 'earth', why: 'our own blue world.', name: 'Earth', order: 3, r: 23, color: '#3f7fb5', ringed: false,
    trait: 'Blue oceans, white cloud, green land.',
    atlas: 'Our own world — the only place we know of with liquid water on the surface, and the only one with life.',
  },
  {
    id: 'mars', why: 'red because its dust is rusty.', name: 'Mars', order: 4, r: 18, color: '#a4472b', ringed: false,
    trait: 'Rusty red, dusty and dry.',
    atlas: 'The <b>red</b> planet. Its dust is full of iron oxide — rust! — which is exactly what makes it red. Robot rovers are driving across it right now.',
  },
  {
    id: 'jupiter', why: 'the biggest planet of them all.', name: 'Jupiter', order: 5, r: 42, color: '#c69a6d', ringed: false,
    trait: 'Enormous, with swirling cream and brown bands.',
    atlas: 'The biggest planet — all of the others would fit inside it. Its Great Red Spot is a storm wider than the Earth.',
  },
  {
    id: 'saturn', why: 'the giant with the bright rings.', name: 'Saturn', order: 6, r: 36, color: '#d8c188', ringed: true,
    trait: 'A giant wearing bright, wide rings.',
    atlas: 'The <b>ringed</b> giant. Its rings are billions of pieces of ice and rock, most no bigger than a snowball. Other giants have rings too — Saturn’s are just the ones you can’t miss.',
  },
  {
    id: 'uranus', why: 'the one that rolls along on its side.', name: 'Uranus', order: 7, r: 28, color: '#8fd0d8', ringed: false,
    trait: 'Pale blue-green, and tipped right over.',
    atlas: 'This one rolls around the Sun on its side, as though it has been knocked over. Its pale colour comes from methane gas in its air.',
  },
  {
    id: 'neptune', why: 'the farthest and the windiest.', name: 'Neptune', order: 8, r: 27, color: '#3f63b5', ringed: false,
    trait: 'Deep blue, and the furthest out.',
    atlas: 'The farthest planet from the Sun, and the windiest — its storms blow faster than any other planet’s.',
  },
]

export const PLANET_BY_ID = Object.fromEntries(PLANETS.map((p) => [p.id, p]))

// one planet, drawn as an orrery model. `sc` scales the body inside the box.
export function planetSVG(id, w = 100, h = 130) {
  const p = PLANET_BY_ID[id]
  if (!p) return ''
  const cx = 50, cy = 58
  const R = Math.max(16, Math.min(34, p.r * 0.8))
  const shade = `<circle cx="${cx - R * 0.28}" cy="${cy - R * 0.28}" r="${R * 0.42}" fill="#fff" opacity="0.22"/>`
  // Saturn's rings sit BEHIND and in front of the body so it reads as a ring, not a belt
  const ringBack = p.ringed
    ? `<path d="M${cx - R * 2},${cy} a${R * 2},${R * 0.62} 0 0 1 ${R * 4},0" fill="none" stroke="${CREAM}" stroke-width="5"/>` : ''
  const ringFront = p.ringed
    ? `<path d="M${cx + R * 2},${cy} a${R * 2},${R * 0.62} 0 0 1 ${-R * 4},0" fill="none" stroke="${CREAM}" stroke-width="5"/>` : ''
  // Jupiter and Saturn get bands; Earth gets a hint of land
  const bands = (id === 'jupiter' || id === 'saturn')
    ? [0.42, 0.06, -0.34].map((f) =>
      `<ellipse cx="${cx}" cy="${cy + R * f}" rx="${R * Math.sqrt(Math.max(0.06, 1 - f * f)) * 0.96}" ry="${R * 0.11}" fill="${GOLD_DEEP}" opacity="0.45"/>`).join('')
    : ''
  const land = id === 'earth'
    ? `<path d="M${cx - R * 0.6},${cy - R * 0.2} q${R * 0.4},${-R * 0.5} ${R * 0.8},${-R * 0.1} q${R * 0.3},${R * 0.4} ${-R * 0.2},${R * 0.5} q${-R * 0.5},${R * 0.2} ${-R * 0.6},${-R * 0.4} Z" fill="#5c9a5c" opacity="0.9"/>
       <ellipse cx="${cx + R * 0.35}" cy="${cy + R * 0.45}" rx="${R * 0.34}" ry="${R * 0.24}" fill="#5c9a5c" opacity="0.8"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">
    ${ringBack}
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="${p.color}" stroke="${TEAL_DEEP}" stroke-width="2.5"/>
    ${bands}${land}${shade}
    ${ringFront}
    <rect x="${cx - 3}" y="${cy + R}" width="6" height="${104 - cy - R}" fill="${GOLD_DEEP}"/>
    <ellipse cx="${cx}" cy="106" rx="17" ry="5.5" fill="${GOLD_DEEP}"/>
  </svg>`
}

/* ====================== MARS ROOM ITEMS ====================== */

// the rover's missing wheel — a cleated drive wheel, the kind that leaves the
// tracks you see in real rover photos
export function roverWheelSVG(w = 100, h = 130) {
  const cleat = (i) => {
    const a = (Math.PI / 6) * i
    const x1 = 50 + Math.cos(a) * 26, y1 = 62 + Math.sin(a) * 26
    const x2 = 50 + Math.cos(a) * 38, y2 = 62 + Math.sin(a) * 38
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE_DIM}" stroke-width="5" stroke-linecap="round"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 100 130">
    <circle cx="50" cy="62" r="38" fill="${TEAL_DEEP}" stroke="${BONE_DIM}" stroke-width="4"/>
    ${[...Array(12).keys()].map(cleat).join('')}
    <circle cx="50" cy="62" r="20" fill="${BONE_DIM}"/>
    <circle cx="50" cy="62" r="9" fill="${TEAL_DEEP}"/>
    ${[0, 1, 2, 3, 4].map((i) => {
      const a = (Math.PI * 2 / 5) * i - Math.PI / 2
      return `<circle cx="${50 + Math.cos(a) * 14}" cy="${62 + Math.sin(a) * 14}" r="2.6" fill="${TEAL_DEEP}"/>`
    }).join('')}
  </svg>`
}

// the rover's solar panel — `dust` 0..1 fades a rusty film over the blue cells
export function solarPanelSVG(dust = 1, w = 180, h = 120) {
  const cells = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      cells.push(`<rect x="${8 + c * 33}" y="${8 + r * 34}" width="30" height="31" rx="3" fill="#2f6f9e" stroke="#17384f" stroke-width="2"/>`)
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 175 115">
    <rect x="0" y="0" width="175" height="115" rx="6" fill="#123048" stroke="${BONE_DIM}" stroke-width="3"/>
    ${cells.join('')}
    <g opacity="${dust}">
      <rect x="0" y="0" width="175" height="115" rx="6" fill="#a4472b" opacity="0.72"/>
      <g fill="#c2603c" opacity="0.55">
        <ellipse cx="42" cy="30" rx="30" ry="16"/><ellipse cx="120" cy="52" rx="36" ry="19"/>
        <ellipse cx="70" cy="88" rx="34" ry="15"/><ellipse cx="150" cy="92" rx="22" ry="12"/>
      </g>
    </g>
  </svg>`
}

/* ============================== MOON MISSIONS ==============================
   The Apollo 11 landing, as six ordered cards. Verified against NASA's Apollo 11
   mission overview and the Smithsonian Air & Space timeline — see
   brain/memory/projects/science-museum-mystery/space-accuracy-rulings.

   The COUNT is simplified for ages 5-10; the ORDER never is. Most of it is
   causally deducible by a child (you must launch before you travel, land before
   you walk, come home last), which is the real reasoning this puzzle wants — the
   catalog supplies the facts for the step that isn't obvious, namely that Eagle
   separates only once they are already in orbit around the Moon.

   Michael Collins stayed aboard Columbia and never walked on the Moon; card 3
   says so, because "all three bounced about on the surface" is the single most
   common Apollo mistake in kids' media. */
export const MOON_STEPS = [
  {
    id: 'liftoff', order: 1, name: 'Lift-off', color: '#e8a948',
    blurb: 'The Saturn V leaves the pad.',
    atlas: 'On <b>16 July 1969</b> the Saturn V — still the most powerful rocket ever flown — lifted Apollo 11 off Launch Complex 39A in Florida.',
  },
  {
    id: 'onTheWay', order: 2, name: 'On the way', color: '#c9d86a',
    blurb: 'The engine fires again to leave Earth behind.',
    atlas: 'After a lap and a half around the Earth, the third stage fired a second time to fling the spacecraft out of Earth orbit and toward the Moon. It took about <b>three days</b> to get there.',
  },
  {
    id: 'eagleSeparates', order: 3, name: 'Eagle separates', color: '#7fd8c9',
    blurb: 'The lander leaves the mothership.',
    atlas: 'Only <b>once they were already circling the Moon</b> did Armstrong and Aldrin move into the lunar module <b>Eagle</b> and undock. <b>Michael Collins stayed behind</b> in the command module <i>Columbia</i> — he never walked on the Moon.',
  },
  {
    id: 'touchdown', order: 4, name: 'Touchdown', color: '#7fb6e8',
    blurb: 'Eagle lands on the grey dust.',
    atlas: '<b>20 July 1969.</b> Eagle came down in the <b>Sea of Tranquility</b> — a flat, dusty plain, not a sea at all. “The Eagle has landed.”',
  },
  {
    id: 'firstSteps', order: 5, name: 'First steps', color: '#c9a0e8',
    blurb: 'Boots on the Moon.',
    atlas: 'Armstrong stepped down first, then Aldrin. They were outside for about <b>two and a half hours</b>. Their footprints are still there — with no wind or rain, nothing wipes them away.',
  },
  {
    id: 'splashdown', order: 6, name: 'Splashdown', color: '#e88f7f',
    blurb: 'Home, in the middle of the ocean.',
    atlas: 'On <b>24 July 1969</b> Columbia parachuted into the Pacific Ocean and a ship came to pick the crew up. Every Apollo crew came home by splashing into the sea.',
  },
]
export const MOON_STEP_BY_ID = Object.fromEntries(MOON_STEPS.map((s) => [s.id, s]))

// a mission card: a coloured header band, a simple pictogram, and its name
export function missionCardSVG(id, w = 150, h = 200) {
  const s = MOON_STEP_BY_ID[id]
  if (!s) return ''
  const art = {
    liftoff: `<path d="M75,34 q16,26 16,58 l0,30 -32,0 0,-30 q0,-32 16,-58 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M59,104 l-16,26 16,0 Z M91,104 l16,26 -16,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M64,132 q11,26 22,0 q-11,16 -22,0 Z" fill="${GOLD}"/>
      <ellipse cx="75" cy="150" rx="26" ry="9" fill="${GOLD}" opacity="0.55"/>`,
    onTheWay: `<circle cx="40" cy="120" r="24" fill="#3f7fb5" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <circle cx="118" cy="56" r="17" fill="${BONE_DIM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M56,104 q34,-34 50,-38" fill="none" stroke="${GOLD}" stroke-width="4" stroke-dasharray="7 6"/>
      <path d="M96,74 l14,-6 -4,14 Z" fill="${GOLD}"/>`,
    eagleSeparates: `<rect x="26" y="72" width="42" height="34" rx="9" fill="${BONE_DIM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M92,66 l34,0 -6,26 -22,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M96,92 l26,0 6,20 -38,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M74,88 l12,0" stroke="${GOLD}" stroke-width="4" stroke-dasharray="4 4"/>
      <path d="M96,112 l-8,18 M126,112 l8,18" stroke="${CREAM}" stroke-width="4"/>`,
    touchdown: `<path d="M56,58 l38,0 -6,26 -26,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M58,84 l34,0 8,24 -50,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M52,108 l-14,26 M98,108 l14,26" stroke="${CREAM}" stroke-width="4"/>
      <path d="M20,140 q55,-14 110,0 l0,20 -110,0 Z" fill="${BONE_DIM}"/>`,
    firstSteps: `<circle cx="75" cy="62" r="16" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M75,42 a16,16 0 0 1 12,8" fill="none" stroke="${GOLD}" stroke-width="4"/>
      <rect x="60" y="78" width="30" height="40" rx="10" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M60,88 l-16,18 M90,88 l16,18 M66,118 l-6,22 M84,118 l6,22" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/>
      <path d="M20,150 q55,-10 110,0 l0,14 -110,0 Z" fill="${BONE_DIM}"/>`,
    splashdown: `<path d="M56,50 q19,-16 38,0 l-6,44 -26,0 Z" fill="${CREAM}" stroke="${TEAL_DEEP}" stroke-width="3"/>
      <path d="M46,36 q29,-22 58,0" fill="none" stroke="${GOLD}" stroke-width="4"/>
      <path d="M46,36 l16,16 M104,36 l-16,16 M75,26 l0,20" stroke="${GOLD}" stroke-width="3"/>
      <path d="M14,116 q18,-12 34,0 t34,0 t34,0 t20,0 l0,44 -122,0 Z" fill="#2f6f9e" opacity="0.9"/>
      <path d="M14,134 q18,-10 34,0 t34,0 t34,0" fill="none" stroke="${CREAM}" stroke-width="3" opacity="0.6"/>`,
  }[id]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 150 200">
    <rect x="4" y="4" width="142" height="192" rx="12" fill="${TEAL_DEEP}" stroke="${GOLD_DEEP}" stroke-width="3"/>
    <rect x="4" y="4" width="142" height="26" rx="12" fill="${s.color}"/>
    <rect x="4" y="22" width="142" height="10" fill="${s.color}"/>
    ${art}
    <text x="75" y="182" text-anchor="middle" font-family="${SERIF}" font-size="17" fill="${CREAM}">${s.name}</text>
  </svg>`
}
