// Shared constants for the runner. Pure values, no imports — safe for everyone.
//
// Concept: the Brachiosaurus walks ACROSS THE FOREST CANOPY, weaving its long neck
// between the treetops to browse leaves & berries at head height — no jumping, the
// long neck is the whole point. World axis: forward (into the screen) is -Z. The dino
// stays at z = 0; the canopy scrolls toward the camera (+Z). Far things spawn at large
// negative Z and travel to positive Z, where they recycle out of view.

export const LANES = [-2.2, 0, 2.2]          // x-centre of left / mid / right lane
export const LANE_LERP = 0.18                 // how snappily the dino slides between lanes

export const SPAWN_Z = -90                    // where new objects appear (far ahead)
export const DESPAWN_Z = 12                   // past the camera → recycle

export const BASE_SPEED = 22                  // world units / second at the start
export const MAX_SPEED = 46
export const SPEED_RAMP = 0.45                // speed gained per second of play

// everything the dino interacts with (food + canopy obstacles) sits up where the
// long neck's head browses — not on the ground.
export const HEAD_Y = 3.3

export const LIVES = 3
export const INVULN_TIME = 1.1                // seconds of i-frames after a hit

// Palette — a sea of treetops under a bright sky; teal dino echoes the reference.
export const COLORS = {
  sky:          0x9fd9ff,
  fog:          0xc7e8d6,
  canopyLight:  0x5fae44,   // the walkable canopy path, lit
  canopyDark:   0x4f9b39,   // alternating shade for motion cue
  canopyEdge:   0x3c7e2c,   // verges dropping into deeper forest
  treetopA:     0x4aa23c,   // surrounding sea-of-canopy blobs
  treetopB:     0x3f8f34,
  treetopC:     0x57b048,
  emergent:     0x2f7a2a,   // taller emergent crowns
  trunk:        0x6b4a2b,
  dinoBody:     0x35a0a6,
  dinoBelly:    0x7fd0cf,
  dinoPlate:    0xb5651d,
  branch:       0x7a5230,   // obstacle: a bough across a lane
  clump:        0x29662a,   // obstacle: a dense dark foliage knot
  leaf:         0x9fe04a,   // food: bright leaf (pops against the canopy)
  berry:        0x8e44ad,   // food: berry cluster
}
