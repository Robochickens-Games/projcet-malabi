/* =============================================================================
   config.js — THE ONLY FILE YOU NEED TO EDIT to build out the concept.
   -----------------------------------------------------------------------------
   This is a parallax concept test for Science Museum Mystery. Everything on
   screen is declared here: scenes, their parallax layers, and the clickable
   hotspots in each. The engine (engine.js) reads this and builds the world.

   Drop art into  public/assets/…  and point a layer or hotspot at it.
   Anything not dropped yet renders as a labelled placeholder that tells you
   the exact path to drop — so the prototype always runs, even empty.

   COORDINATES — every scene is a wide world measured in "design pixels".
   The world is `width` px wide and `DESIGN_H` (1080) px tall. The camera
   walks left↔right; layers move at their own `speed`. Hotspot x/y are the
   TOP-LEFT corner in world space on the 1.0 (walk) plane.
============================================================================= */

export const DESIGN_H = 1080            // virtual height; everything scales to fit the viewport height

export const GAME = {
  title: 'SCIENCE MUSEUM MYSTERY',
  subtitle: 'concept test',
  startScene: 'lobby',
  bg: '#10161f',                        // letterbox / behind-everything colour
}

/* -----------------------------------------------------------------------------
   LAYERS
   - back→front order in the array (first = farthest)
   - speed: parallax factor. 0 = pinned, 1 = walks with you, >1 = foreground
   - src:  /assets/backgrounds/<scene>/<file>.  Author at  width × 1080  ideally.
   - fit:  'cover' (default) | 'tile' (repeats horizontally — good for skies)
   HOTSPOTS
   - x,y,w,h: clickable rect in world space (design px)
   - art (optional): /assets/props/<file>.png drawn in the rect; else a marker
   - action: what a click does — see the action types at the bottom of the file
----------------------------------------------------------------------------- */

export const SCENES = {

  lobby: {
    name: 'Museum Lobby',
    // The hall painting is 2912×416 (7:1). Shown at full design height (1080)
    // with no crop, it spans 2912 × 1080/416 ≈ 7560 design px — that's the world.
    width: 7560,
    layers: [
      // BACKGROUND — the hall painting is the ground plane (speed 1.0 = no blank edges)
      { id: 'lobby-bg', src: '/assets/backgrounds/lobby/hall.png', speed: 1.0, label: 'Lobby — grand hall background' },

      // The glowing dino door — the doorway into the Dinosaur Wing. The prop
      // itself is the click target (its `action`), so the hit area always tracks
      // the art wherever it's moved/resized.
      { id: 'door-dino', src: '/assets/props/dino-door.png', speed: 1.0, x: 6546, y: 930, h: 520, label: 'Door — Dinosaur Wing',
        action: { type: 'goto', scene: 'grove', toast: 'Through the door, into the Dinosaur Wing…' } },

      // The Space section door, on the left of the hall. Clickable via its own
      // `action`. No Space wing built yet → placeholder toast; swap to
      // { type: 'goto', scene: 'space' } once a Space scene exists.
      { id: 'door-space', src: '/assets/props/edited-image-1781430642920.png', speed: 1.0, x: 1050, y: 930, h: 520, label: 'Door — Space Section',
        action: { type: 'toast', toast: 'The Space Section — coming soon. (Door’s here; the wing isn’t built yet.)' } },

      // GRAND STAIRCASE — the lobby's architectural centrepiece (sweeping stair +
      // gilded globe). On the 1.0 ground plane so it reads as built into the hall;
      // listed early so the foreground colonnade / front desk / signpost sweep in
      // FRONT of it as you walk. 3808×1280 art (≈3:1). Drag/resize in edit mode.
      { id: 'staircase', src: '/assets/props/staircase.png', speed: 1.0, x: 2700, y: 1140, h: 760, label: 'Grand staircase' },

      // CHANDELIERS — hung from the ceiling down the length of the hall. Their
      // baseline (y) sits high so they dangle from the top; on a slower plane
      // (1.15) than the colonnade (1.30) so the columns sweep in FRONT of them
      // as you walk — they read as further back / overhead. A tasteful trio.
      { id: 'chandelier-1', src: '/assets/props/edited-image-1781427297286.png', speed: 1.15, x: 1200, y: 560, h: 600, label: 'Chandelier 1' },
      { id: 'chandelier-2', src: '/assets/props/edited-image-1781427297286.png', speed: 1.15, x: 3400, y: 560, h: 600, label: 'Chandelier 2' },
      { id: 'chandelier-3', src: '/assets/props/edited-image-1781427297286.png', speed: 1.15, x: 5600, y: 560, h: 600, label: 'Chandelier 3' },

      // PROP layers — cut-outs placed at a world x, on faster planes so they
      // slide against the hall as you walk (parallax depth). Tune x / speed / h.
      { id: 'signpost', src: '/assets/backgrounds/lobby/signpost.png', speed: 1.12, x: 2700, y: 1090, h: 820, label: 'Directional signpost' },

      // Reception / front desk near the entrance (foreground set-dressing)
      { id: 'front-desk', src: '/assets/props/front_desk.png', speed: 1.18, x: 1500, y: 1135, h: 560, label: 'Front desk' },

      // The fossil clue, tucked behind column-1. On the SAME plane (speed 1.30)
      // and listed BEFORE the column, so the column always covers its left half
      // and it never slides out from behind — it just peeks. Its click target
      // rides the same plane (see the `fossil-clue-hit` hotspot, speed 1.30).
      { id: 'fossil-clue', src: '/assets/props/tooth.png', speed: 1.30, x: 700, y: 980, h: 240, label: 'Fossil clue (behind column)' },

      // Foreground colonnade — full-height columns (top→bottom of screen) that
      // sweep past as you walk. Same art, alternately flipped, spaced down the
      // hall. h 1140 + baseline 1110 overshoots both screen edges so they always
      // touch top and bottom. ...COLONNADE
      { id: 'column-1', src: '/assets/backgrounds/lobby/column.png', speed: 1.30, x: 500,  y: 1110, h: 1140, label: 'Column 1' },
      { id: 'column-2', src: '/assets/backgrounds/lobby/column.png', speed: 1.30, x: 1950, y: 1110, h: 1140, flip: true, label: 'Column 2' },
      { id: 'column-3', src: '/assets/backgrounds/lobby/column.png', speed: 1.30, x: 3400, y: 1110, h: 1140, label: 'Column 3' },
      { id: 'column-4', src: '/assets/backgrounds/lobby/column.png', speed: 1.30, x: 4850, y: 1110, h: 1140, flip: true, label: 'Column 4' },
      { id: 'column-5', src: '/assets/backgrounds/lobby/column.png', speed: 1.30, x: 7250, y: 1110, h: 1140, label: 'Column 5' },

      { id: 'palm-pot',  src: '/assets/backgrounds/lobby/pot.png',      speed: 1.42, x: 5400, y: 1100, h: 720, label: 'Palm in terracotta pot' },
    ],
    hotspots: [
      // A clue glints near the entrance display (left of the hall)
      // Invisible hit area over the part of the fossil that peeks past column-1.
      // speed 1.30 locks it to the fossil-clue prop + column, so it tracks the peek.
      { id: 'fossil-clue-hit', x: 690, y: 760, w: 170, h: 240, speed: 1.30, bare: true,
        label: 'A fossil, half-hidden behind a column…',
        action: { type: 'collect', item: 'Fossil', toast: 'A fossil clue, tucked behind a column! Take it to compare in the wing.' } },

      // NOTE: the two wing doors (door-dino, door-space) are clickable via their
      // own prop `action` — no separate hotspot needed, so the hit area follows
      // the art when it's repositioned.

      // The mounted T-rex skeleton — a look, not a door
      { id: 'trex-look', x: 3950, y: 200, w: 1000, h: 680, label: 'The great skeleton',
        action: { type: 'toast', toast: 'A mounted Tyrannosaurus, mid-stride. The wing is through the stone arch →' } },
    ],
  },

  grove: {
    name: 'Dinosaur Wing',
    // gallery panorama is 2912×416 (7:1), same full-height world as the lobby
    width: 7560,
    back: 'lobby',                       // shows a "‹ back" button returning here
    layers: [
      // BACKGROUND — the dinosaur hall is the backdrop (speed 1.0 ground plane)
      { id: 'dino-hall-bg', src: '/assets/backgrounds/grove/gallery.png', speed: 1.0, label: 'Dino hall background' },

      // MAIN DISPLAY — the Triceratops skeleton, the hero exhibit. Kept on the
      // 1.0 plane so its hotspot (and the clues placed next to it) stay locked
      // to it. Sits left-of-centre to leave room on its right for clue items.
      { id: 'triceratops', src: '/assets/props/skeleton.png', speed: 1.0, x: 3300, y: 980, h: 720, label: 'Triceratops (main display)' },

      // FRONT LAYER — foreground plants sweeping past (fastest planes), spread
      // down the hall, some flipped. Two tall portrait images alternated:
      //   fern.png (single leafy fern)   tree-fern.png (tropical tree fern)
      { id: 'fern-1',      src: '/assets/props/fern.png',      speed: 1.50, x: 700,  y: 1150, h: 720, label: 'Fern 1' },
      { id: 'tree-fern-1', src: '/assets/props/tree-fern.png', speed: 1.55, x: 1650, y: 1150, h: 880, label: 'Tree fern 1' },
      { id: 'fern-2',      src: '/assets/props/fern.png',      speed: 1.46, x: 5100, y: 1150, h: 700, flip: true, label: 'Fern 2' },
      { id: 'tree-fern-2', src: '/assets/props/tree-fern.png', speed: 1.58, x: 6100, y: 1150, h: 900, label: 'Tree fern 2' },
      { id: 'fern-3',      src: '/assets/props/fern.png',      speed: 1.44, x: 7200, y: 1150, h: 680, flip: true, label: 'Fern 3' },
    ],
    hotspots: [
      // The main display itself — examine / the match target. Clue items will be
      // dropped in as prop layers + hotspots just to its RIGHT (around x 4300+).
      { id: 'triceratops-look', x: 2850, y: 360, w: 900, h: 620, label: 'The Triceratops',
        action: { type: 'toast', toast: 'TRICERATOPS — “three-horned face”. Compare the fossil you found…' } },
    ],
  },

}

/* -----------------------------------------------------------------------------
   ACTION TYPES (the `action` on a hotspot)
     { type: 'goto',    scene: 'grove', toast?: '…' }   → switch scene
     { type: 'collect', item: 'Name', toast?: '…' }     → add to the HUD bag, hide hotspot
     { type: 'toast',   toast: '…' }                    → just show a message
     { type: 'link',    url: 'https://…' }              → open a URL
   Add new types in engine.js → runAction().
----------------------------------------------------------------------------- */
