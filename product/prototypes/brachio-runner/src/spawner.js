import * as THREE from 'three'
import { COLORS, LANES, SPAWN_Z, DESPAWN_Z, HEAD_Y } from './config.js'

// Spawns canopy obstacles (boughs, dense foliage knots) and food (leaves, berries)
// into the lanes — all at HEAD_Y, where the long neck browses. Scrolls them toward
// the camera, recycles them when they pass, and reports pickups + hits back to the
// game. No jumping: an obstacle in your lane can only be avoided by switching lanes.
// Uses simple pooling so we never thrash the GC mid-run.

function flat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, flatShading: true, ...opts })
}

const matBranch = flat(COLORS.branch)
const matClump = flat(COLORS.clump)
const matLeaf = flat(COLORS.leaf, { roughness: 0.5 })
const matBerry = flat(COLORS.berry, { roughness: 0.4 })

function makeBranch() {
  // a bough slung across the lane at head height
  const g = new THREE.Group()
  const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3.2, 8), matBranch)
  bough.rotation.z = Math.PI / 2
  bough.castShadow = true
  g.add(bough)
  // a couple of leafy tufts so it reads as canopy, not a ground log
  for (const dx of [-0.7, 0.7]) {
    const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), matClump)
    tuft.position.set(dx, 0.35, 0)
    g.add(tuft)
  }
  return g
}
function makeClump() {
  // a dense dark knot of foliage blocking the lane
  const g = new THREE.Group()
  for (const [dx, dy, s] of [[0, 0, 1], [0.55, 0.2, 0.7], [-0.5, 0.25, 0.7], [0.1, -0.45, 0.6]]) {
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85 * s, 0), matClump)
    blob.position.set(dx, dy, 0)
    blob.castShadow = true
    g.add(blob)
  }
  return g
}
function makeLeaf() {
  const g = new THREE.Group()
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.95, 4), matLeaf)
  blade.rotation.x = Math.PI / 2
  g.add(blade)
  return g
}
function makeBerry() {
  const g = new THREE.Group()
  for (const [dx, dy] of [[0, 0.18], [-0.18, -0.12], [0.18, -0.12]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), matBerry)
    b.position.set(dx, dy, 0)
    g.add(b)
  }
  return g
}

export function createSpawner(scene) {
  const group = new THREE.Group()
  scene.add(group)

  const active = []          // live items in the world
  let spawnZ = SPAWN_Z       // running cursor for the next row's depth

  function spawnRow(speed) {
    // difficulty scales with speed: faster → tighter rows + more obstacles
    const t = THREE.MathUtils.clamp((speed - 22) / 24, 0, 1)

    // choose 1 obstacle lane (sometimes 2 at high speed) — always leave a gap
    const obstacleLanes = new Set()
    obstacleLanes.add(Math.floor(Math.random() * 3))
    if (t > 0.5 && Math.random() < t * 0.6) {
      obstacleLanes.add(Math.floor(Math.random() * 3))
    }
    if (obstacleLanes.size >= 3) obstacleLanes.delete(Math.floor(Math.random() * 3))  // never block all lanes

    for (let lane = 0; lane < 3; lane++) {
      if (obstacleLanes.has(lane)) {
        const isBranch = Math.random() < 0.55
        const mesh = isBranch ? makeBranch() : makeClump()
        mesh.position.set(LANES[lane], HEAD_Y, spawnZ)
        group.add(mesh)
        active.push({ mesh, lane, kind: 'obstacle', sub: isBranch ? 'branch' : 'clump' })
      } else if (Math.random() < 0.7) {
        // food in the open lanes, at head height
        const isLeaf = Math.random() < 0.7
        const mesh = isLeaf ? makeLeaf() : makeBerry()
        mesh.position.set(LANES[lane], HEAD_Y, spawnZ)
        group.add(mesh)
        active.push({ mesh, lane, kind: 'pickup', sub: isLeaf ? 'leaf' : 'berry', t: 0 })
      }
    }

    // gap before next row shrinks as we speed up
    const gap = THREE.MathUtils.lerp(11, 6.5, t)
    spawnZ -= gap
  }

  return {
    group,
    reset() {
      for (const it of active) group.remove(it.mesh)
      active.length = 0
      spawnZ = SPAWN_Z
    },

    // dz: world scroll this frame. dino: for collision. callbacks fire on events.
    update(dz, dt, speed, dino, onPickup, onHit) {
      // keep the spawn cursor ahead of the far plane as the world scrolls in
      spawnZ += dz
      while (spawnZ > SPAWN_Z) spawnRow(speed)

      for (let i = active.length - 1; i >= 0; i--) {
        const it = active[i]
        it.mesh.position.z += dz

        // spin/bob food for juice
        if (it.kind === 'pickup') {
          it.t += dt
          it.mesh.rotation.y += dt * 3
          it.mesh.position.y = HEAD_Y + Math.sin(it.t * 4) * 0.12
        }

        // recycle once past the camera
        if (it.mesh.position.z > DESPAWN_Z) {
          group.remove(it.mesh)
          active.splice(i, 1)
          continue
        }

        // collision only near the dino's z-plane and only in the dino's lane
        if (it.lane === dino.lane && Math.abs(it.mesh.position.z) < 1.4) {
          if (it.kind === 'pickup') {
            onPickup(it.sub, it.mesh.position.clone())
            group.remove(it.mesh)
            active.splice(i, 1)
          } else if (it.kind === 'obstacle') {
            // no jumping — being in the lane means you hit it
            const hit = onHit(it.mesh.position.clone())
            if (hit) {                 // game registered the hit (not invulnerable)
              group.remove(it.mesh)
              active.splice(i, 1)
            }
          }
        }
      }
    },
  }
}
