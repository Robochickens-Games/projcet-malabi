// render-element-controls.mjs — single-ELEMENT silhouettes (one cloud, one hill,
// one tree) as ControlNet inputs + identical cut masks. Generation is locked to
// the shape and the SAME shape cuts the result -> guaranteed isolated diorama
// pieces regardless of what SDXL paints around them.
//   node scripts/render-element-controls.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'out/control'), { recursive: true })

const SHAPES = {
  // soft cumulus: overlapping ellipses
  'el-cloud': { w: 1024, h: 640, svg: `
    <ellipse cx="512" cy="400" rx="380" ry="150"/>
    <ellipse cx="350" cy="300" rx="200" ry="120"/>
    <ellipse cx="600" cy="260" rx="230" ry="140"/>
    <ellipse cx="760" cy="350" rx="160" ry="100"/>`, inner: `
    <path d="M260,420 Q360,360 470,410 M480,330 Q560,280 660,330 M600,430 Q700,380 800,420" fill="none" stroke-width="8"/>` },
  // rounded jungle hill rising from the bottom edge
  'el-mountain': { w: 1216, h: 832, svg: `
    <path d="M0,832 C120,520 320,300 600,260 C880,300 1100,540 1216,832 Z"/>`, inner: `
    <path d="M180,700 Q400,560 640,620 M320,520 Q540,420 760,500 M480,380 Q620,330 780,400 M240,780 Q500,700 820,750 M700,560 Q880,520 1020,640" fill="none" stroke-width="9"/>` },
  // mountain ridge band: jagged peaks silhouette across the full width
  'dino-ridgeband': { w: 2816, h: 640, svg: `
    <path d="M0,640 L0,420 L180,300 L340,400 L520,210 L700,380 L900,260 L1080,420 L1260,180 L1450,360 L1620,250 L1800,430 L1980,200 L2180,380 L2360,290 L2540,420 L2700,330 L2816,400 L2816,640 Z"/>`, inner: `
    <path d="M120,460 L300,380 L470,440 M600,380 L760,320 L920,400 M1100,400 L1260,300 L1430,400 M1550,380 L1700,330 L1860,420 M2050,360 L2220,310 L2400,410" fill="none" stroke-width="9"/>` },
  // treeline band: scalloped round canopy tops across the full width
  'dino-treeband': { w: 2816, h: 512, svg: `
    <rect x="0" y="300" width="2816" height="212"/>
    <circle cx="40" cy="209" r="111"/><circle cx="170" cy="199" r="76"/><circle cx="318" cy="236" r="82"/><circle cx="405" cy="217" r="134"/><circle cx="489" cy="245" r="81"/><circle cx="622" cy="220" r="78"/><circle cx="713" cy="244" r="140"/><circle cx="800" cy="205" r="142"/><circle cx="908" cy="270" r="150"/><circle cx="995" cy="264" r="143"/><circle cx="1125" cy="218" r="76"/><circle cx="1210" cy="207" r="141"/><circle cx="1327" cy="208" r="123"/><circle cx="1476" cy="263" r="85"/><circle cx="1595" cy="277" r="141"/><circle cx="1698" cy="264" r="83"/><circle cx="1802" cy="202" r="117"/><circle cx="1952" cy="262" r="78"/><circle cx="2039" cy="216" r="149"/><circle cx="2182" cy="244" r="138"/><circle cx="2302" cy="264" r="129"/><circle cx="2440" cy="228" r="116"/><circle cx="2551" cy="279" r="93"/><circle cx="2662" cy="263" r="80"/><circle cx="2780" cy="253" r="137"/>`, inner: `
    <path d="M1860,256 Q1938,178 2016,256 M327,235 Q399,163 471,235 M1751,241 Q1812,180 1873,241 M651,339 Q722,268 793,339 M1783,225 Q1827,181 1871,225 M2325,293 Q2385,233 2445,293 M1431,308 Q1493,246 1555,308 M2457,283 Q2534,206 2611,283 M1923,228 Q1968,183 2013,228 M1161,280 Q1205,236 1249,280 M289,313 Q348,254 407,313 M2399,307 Q2467,239 2535,307 M1201,311 Q1265,247 1329,311 M1452,222 Q1521,153 1590,222" fill="none" stroke-width="8"/>` },
  // ground strip: full-width band rising from the bottom, wavy grassy top edge
  'dino-groundband': { w: 2816, h: 512, svg: `
    <path d="M0,512 L0,180 Q120,140 260,170 Q420,200 560,160 Q720,120 900,170 Q1080,210 1260,160 Q1440,120 1640,175 Q1840,215 2040,160 Q2240,115 2440,170 Q2640,210 2816,165 L2816,512 Z"/>` },
  // round-canopy tree + trunk
  'el-tree': { w: 832, h: 1216, svg: `
    <circle cx="416" cy="400" r="310"/>
    <ellipse cx="240" cy="560" rx="150" ry="110"/>
    <ellipse cx="600" cy="560" rx="150" ry="110"/>
    <rect x="366" y="600" width="100" height="616"/>
    <path d="M366,640 C330,700 300,720 260,740 L300,760 C340,730 360,700 380,670 Z"/>`, inner: `
    <path d="M250,300 Q380,220 540,290 M300,470 Q420,390 580,460 M420,180 Q500,160 590,230 M396,700 L396,1150 M436,680 L436,1140" fill="none" stroke-width="8"/>` },
}

for (const [name, { w, h, svg }] of Object.entries(SHAPES)) {
  const inner = SHAPES[name].inner || ''
  const control = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#9a9a9a"/>
    <g fill="#4a4a4a" stroke="#181818" stroke-width="10">${svg}</g>
    <g stroke="#181818" opacity="0.85">${inner}</g>
  </svg>`
  const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#000"/>
    <g fill="#fff" stroke="#fff" stroke-width="10">${svg}</g>
  </svg>`
  await sharp(Buffer.from(control)).png().toFile(join(root, `out/control/${name}.png`))
  await sharp(Buffer.from(mask)).png().toFile(join(root, `out/control/${name}-mask.png`))
  console.log(`  ✓ ${name} control + mask (${w}x${h})`)
}
