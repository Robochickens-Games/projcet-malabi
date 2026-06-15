import * as THREE from 'three'
import { COLORS, LANES, LANE_LERP } from './config.js'

// A low-poly Brachiosaurus built from primitives: box torso, four pillar legs,
// a tapered raised neck + small head, and a long tapered tail. Quadruped, raised
// neck, long tail — a reasonable sauropod silhouette for a mechanics test.
// Returns an object with the THREE.Group plus run/lane/jump state + an update().

function flat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true })
}

export function createDino() {
  const group = new THREE.Group()
  const bodyMat = flat(COLORS.dinoBody)
  const bellyMat = flat(COLORS.dinoBelly)
  const plateMat = flat(COLORS.dinoPlate)

  // ---- torso ----
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.35, 2.9), bodyMat)
  torso.position.y = 1.85
  torso.castShadow = true
  group.add(torso)

  // belly underside (lighter)
  const belly = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.6), bellyMat)
  belly.position.set(0, 1.35, 0)
  group.add(belly)

  // back plates (small triangular ridge — readable as a sauropod back line)
  for (let i = 0; i < 4; i++) {
    const plate = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 4), plateMat)
    plate.position.set(0, 2.6, 0.9 - i * 0.6)
    group.add(plate)
  }

  // ---- legs (4 pillars) ----
  const legs = []
  const legGeo = new THREE.CylinderGeometry(0.32, 0.4, 1.5, 8)
  const legPos = [
    [-0.6, -1.0],  // front-left  [x, z]
    [0.6, -1.0],   // front-right
    [-0.6, 1.0],   // back-left
    [0.6, 1.0],    // back-right
  ]
  for (const [x, z] of legPos) {
    const leg = new THREE.Mesh(legGeo, bodyMat)
    leg.position.set(x, 0.75, z)
    leg.castShadow = true
    group.add(leg)
    legs.push(leg)
  }

  // ---- neck (tapered, raised) ----
  const neck = new THREE.Group()
  neck.position.set(0, 2.4, -1.3)
  group.add(neck)
  let ny = 0, nz = 0
  const segCount = 5
  for (let i = 0; i < segCount; i++) {
    const r = 0.42 - i * 0.05
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, 0.7, 8), bodyMat)
    // lean the neck up-and-forward
    seg.position.set(0, ny + 0.32, nz - 0.16)
    seg.rotation.x = -0.32
    seg.castShadow = true
    neck.add(seg)
    ny += 0.6
    nz -= 0.22
  }

  // ---- head ----
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.85), bodyMat)
  head.position.set(0, ny + 0.35, nz - 0.25)
  neck.add(head)
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.4), bellyMat)
  snout.position.set(0, ny + 0.28, nz - 0.7)
  neck.add(snout)
  // eyes
  const eyeGeo = new THREE.SphereGeometry(0.09, 8, 8)
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x10171a, roughness: 0.4 })
  for (const sx of [-0.22, 0.22]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(sx, ny + 0.45, nz - 0.5)
    neck.add(eye)
  }

  // ---- tail (tapered, long, sloping down behind) ----
  const tail = new THREE.Group()
  tail.position.set(0, 2.0, 1.4)
  group.add(tail)
  let ty = 0, tz = 0
  for (let i = 0; i < 5; i++) {
    const r = 0.4 - i * 0.07
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.04, 0.65, 8), bodyMat)
    seg.position.set(0, ty - 0.1, tz + 0.28)
    seg.rotation.x = 0.34
    seg.castShadow = true
    tail.add(seg)
    ty -= 0.16
    tz += 0.34
  }

  // start in the middle lane
  const state = {
    group,
    lane: 1,
    x: LANES[1],
    runT: 0,
    legs, neck, tail,
    // collision footprint (half-extents around the torso centre)
    radius: 1.1,
  }
  group.position.set(state.x, 0, 0)
  return state
}

export function moveLane(dino, dir) {
  dino.lane = Math.max(0, Math.min(LANES.length - 1, dino.lane + dir))
}

// dt in seconds, speed = current world speed (drives the run-cycle tempo).
export function updateDino(dino, dt, speed) {
  // slide toward target lane
  const targetX = LANES[dino.lane]
  dino.x += (targetX - dino.x) * LANE_LERP
  // a little banking into the turn
  dino.group.rotation.z = (targetX - dino.x) * 0.12

  // run cycle: leg swing + body bob + neck/tail sway, tempo scales with speed
  dino.runT += dt * speed * 0.5
  const swing = Math.sin(dino.runT)
  dino.legs[0].rotation.x = swing * 0.5
  dino.legs[1].rotation.x = -swing * 0.5
  dino.legs[2].rotation.x = -swing * 0.5
  dino.legs[3].rotation.x = swing * 0.5
  const bob = Math.abs(Math.sin(dino.runT)) * 0.12
  dino.neck.rotation.x = swing * 0.05
  dino.tail.rotation.y = swing * 0.12

  dino.group.position.set(dino.x, bob, 0)
}
