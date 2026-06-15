import * as THREE from 'three'
import { COLORS, SPAWN_Z, DESPAWN_Z } from './config.js'

// The world is the forest CANOPY: a scrolling green treetop "path" the dino weaves
// along, framed by a surrounding sea of rounded treetops (with the odd taller
// emergent crown). Obstacles + food live in spawner.js; this is just the scenery.

function flat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, flatShading: true })
}

const PATH_WIDTH = 8
const TILE_LEN = 6
const TILE_COUNT = Math.ceil((Math.abs(SPAWN_Z) + DESPAWN_Z) / TILE_LEN) + 2

export function createWorld(scene) {
  const group = new THREE.Group()
  scene.add(group)

  // ---- the walkable canopy path (alternating green shades = motion cue) ----
  const lightMat = flat(COLORS.canopyLight)
  const darkMat = flat(COLORS.canopyDark)
  const tileGeo = new THREE.BoxGeometry(PATH_WIDTH, 0.4, TILE_LEN)
  const tiles = []
  for (let i = 0; i < TILE_COUNT; i++) {
    const tile = new THREE.Mesh(tileGeo, i % 2 ? lightMat : darkMat)
    tile.position.set(0, -0.2, DESPAWN_Z - i * TILE_LEN)
    tile.receiveShadow = true
    group.add(tile)
    tiles.push(tile)
  }

  // ---- deeper-forest verges either side (the canopy drops away) ----
  const edgeMat = flat(COLORS.canopyEdge)
  for (const sx of [-1, 1]) {
    const edge = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1.4, Math.abs(SPAWN_Z) + DESPAWN_Z + 40),
      edgeMat,
    )
    edge.position.set(sx * (PATH_WIDTH / 2 + 20), -1.1, (SPAWN_Z + DESPAWN_Z) / 2)
    edge.receiveShadow = true
    group.add(edge)
  }

  // ---- surrounding sea of treetops (recycling decor) ----
  const topMats = [flat(COLORS.treetopA), flat(COLORS.treetopB), flat(COLORS.treetopC)]
  const emergentMat = flat(COLORS.emergent)
  const trunkMat = flat(COLORS.trunk)
  const decor = []

  function makeTreetop() {
    // a low cluster of rounded blobs sitting at canopy level
    const t = new THREE.Group()
    const n = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < n; i++) {
      const r = 1.1 + Math.random() * 1.1
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), topMats[i % topMats.length])
      blob.position.set((Math.random() - 0.5) * 2.4, Math.random() * 0.6 - 0.2, (Math.random() - 0.5) * 2.4)
      blob.castShadow = true
      t.add(blob)
    }
    return t
  }
  function makeEmergent() {
    // a taller crown poking above the canopy, with a hint of trunk
    const t = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.0, 6), trunkMat)
    trunk.position.y = 1.0
    t.add(trunk)
    for (let i = 0; i < 3; i++) {
      const crown = new THREE.Mesh(new THREE.ConeGeometry(2.1 - i * 0.45, 2.0, 7), emergentMat)
      crown.position.y = 2.6 + i * 1.0
      crown.castShadow = true
      t.add(crown)
    }
    return t
  }

  const SIDE = PATH_WIDTH / 2 + 1.5
  let z = DESPAWN_Z
  while (z > SPAWN_Z) {
    for (const sx of [-1, 1]) {
      const emergent = Math.random() < 0.22
      const item = emergent ? makeEmergent() : makeTreetop()
      const jitter = (Math.random() - 0.5) * 4
      item.position.x = sx * (SIDE + Math.random() * 8)
      item.position.y = emergent ? -0.6 : 0.2          // treetops sit at canopy level
      item.position.z = z + jitter
      item.rotation.y = Math.random() * Math.PI
      const s = 0.85 + Math.random() * 0.7
      item.scale.setScalar(s)
      group.add(item)
      decor.push(item)
    }
    z -= 4 + Math.random() * 3.5
  }

  return {
    group,
    // scroll everything toward the camera (+Z) by dz this frame; recycle past the
    // camera back to the far end so the canopy appears endless.
    scroll(dz) {
      for (const d of decor) {
        d.position.z += dz
        if (d.position.z > DESPAWN_Z + 6) {
          d.position.z -= (Math.abs(SPAWN_Z) + DESPAWN_Z) + 6
        }
      }
      const span = TILE_COUNT * TILE_LEN
      for (const tile of tiles) {
        tile.position.z += dz
        if (tile.position.z > DESPAWN_Z) tile.position.z -= span
      }
    },
  }
}
