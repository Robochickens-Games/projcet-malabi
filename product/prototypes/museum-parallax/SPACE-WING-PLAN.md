# Plan — Add the Space Wing to the parallax wireframe museum

## Context

The museum prototype (`product/prototypes/museum-parallax/`) currently ships **one
playable wing** — the Dinosaur Wing: a lobby with three doors (Dino open, Space &
Inventions roped off), a Dino Hall hub, and 5 dioramas, each solved by finding a clue
and dragging it onto a skeleton, plus two mini-games (Fish Run, Brachio Run) and a
T-rex foot-assembly puzzle. Completing all 5 rooms fires a wing finale.

We're adding the **second wing — Space** — per Gidi's spec. The product goal mirrors the
dino wing: **fix/complete 5 dioramas to progress.** It reuses the same core language
(dioramas, inventory, catalog/knowledge, riddles, mini-games, exploration) but is
deliberately *different* in feel and introduces three systems the dino wing never had:

1. **An economy** — the **Space Supply Desk / Lost Astronaut Kiosk**: find space rocks,
   sell them for coins, spend coins to buy items needed to complete dioramas.
2. **Cross-room item dependencies** — some items needed in one diorama are hidden in
   *other* dioramas, so exploration across rooms gates completion.
3. **New puzzle types** — multi-slot ordered placement (Planet Path), a card-sequence
   puzzle (Moon landing), a Star Atlas catalog with **textual clues/riddles**, and 5
   new mini-games.

**Scope decided with Gidi:** full playable wing — all 5 dioramas interactive, all 5
mini-games built for real, full sell+buy economy. Placeholder wireframe SVG art now
(painted layers drop in 1:1 later, per the team norm).

---

## Architecture we reuse (do not reinvent)

All in `product/prototypes/museum-parallax/`:

- **Scene/world model** — `src/main.js`: `WORLDS` registry (main.js:25), one `buildXxx()`
  per scene, parallax layers via `scrollLayer(speed)` (main.js:276), `placeAt()`, world
  coords + placeholder art in `src/wireframe.js` (`*_W`, `*_SPOTS`, `*SVG()` functions).
- **Navigation** — `goScene(target)` (main.js:1017), `SCENE_BACK`/`BACK_LABEL`/`DEPTH`
  maps (main.js:996-998), hub→room mapping pattern (`DIORAMA_ROOM`, main.js:588).
- **Inventory** — `state.has{itemId}` (main.js:106), `ITEM_INFO`/`ITEM_SVG` (main.js:1066+),
  `addHiddenClue(layer, spot, itemId, tex)` + `pickUpClue(itemId)` fly-into-slot.
- **Catalog** — `CATALOG_SECTIONS` + `SECTION()` factory (main.js:1648+), driven by the
  `DINOS` data array in `src/art.js:644`.
- **Drag/place + rotate** — `startItemDrag/moveItemDrag/endItemDrag`, `placeItem(d)` with
  `_drop` descriptor on each scene; dual-mode bone drag/rotate + tolerances
  (`FOOT_POS_TOL`, `FOOT_ANG_TOL`) in the foot puzzle (main.js:1330-1558); `screenToWorld`.
- **Mini-game contract** — bespoke per game but a shared shape:
  `openXxxGame({ goal, onComplete, onClose })` + `closeXxxGame()` + `isXxxGameOpen()`
  (see `src/pteroGame.js`, `src/brachioGame.js`). Wired via `onMinigameSolved(room)` →
  `sc._gameDone = true` and `afterMinigameClose(room)` → success card. Each `isXxxOpen()`
  must be added to the camera-walk guard (main.js:~164).
- **Device input** — `tiltValue(e)` + the `base ??= v` calibration + iOS
  `DeviceOrientationEvent.requestPermission()` flow (main.js:186-216) → **reuse directly
  for Orbit Balance**.
- **Completion + finale** — `roomComplete(name)` (main.js:1005), `dinoWingComplete()`,
  `markRoomComplete()`, hub seals (`_marks`, main.js:597), lobby `_wingMark`,
  `showWingFinale()`, success reel via `showSuccess()` + `#success-video`.

---

## Net-new systems (build these first — rooms depend on them)

### A. Generalize the wing engine (so two wings coexist without breaking dino)
The dino wing hardcodes `ROOMS`, `DIORAMA_ROOM`, `dinoWingComplete()`, and per-room
challenge requirements inside `roomComplete()`. Generalize *carefully* (dino wing must
keep working):
- Add a **`WINGS` registry** in `main.js`: `{ dino: { hub, rooms[], door, lobbyMark },
  space: { hub:'spacehub', rooms:[...5], door:'doorSpace', lobbyMark } }`.
- Replace `roomComplete()`'s hardcoded `if (name==='trex')` chain with a per-scene
  **`sc._challenges`** descriptor (array of required flags, e.g. `['drop']`,
  `['drop','game']`, `['sequence','game']`). Refactor the 5 dino rooms to set
  `_challenges` too — mechanical, low risk.
- `wingComplete(wingId) = WINGS[wingId].rooms.every(roomComplete)`; finale + lobby seal
  look up by wing. Extend `SCENE_BACK`/`BACK_LABEL`/`DEPTH`/`cams` to include the space
  hub (depth 1) and 5 space rooms (depth 2).
- Lobby: replace the `doorSpace` toast (main.js:405) with `goScene('spacehub')`.

### B. Economy module — `src/economy.js` (new) + `index.html`/`style.css`
- State: `state.coins` (start 0) and treat space rocks as sellable inventory items.
- **Supply Desk** as a tappable location in the space hub (and/or lobby) → opens an
  overlay (model on the foot-puzzle full-screen overlay or a dedicated rail panel):
  - **Sell:** pick a space rock from inventory → `+coins` (value from the rock index).
  - **Buy:** list of purchasable items with prices; deduct coins → `pickUpClue(item)`.
- **Coin HUD** (small counter near the existing HUD buttons in `index.html`).
- Catalog gets a **"Space Rocks" index** section showing each rock + its coin value.

### C. Catalog → Star Atlas with clues
Extend `CATALOG_SECTIONS` with space sections sourced from a new `src/art.js` data array
(see below). Add a **clue/riddle** capability: sections can carry short text clues
("the red planet is fourth", "the giant with rings is sixth", "the hottest planet is not
closest to the Sun"; Apollo color-order; rock-type ID for Mars; tool-need hints for
airlock). Today clues are only ephemeral toasts — here they live in the catalog so the
player can re-read them.

### D. New data — `src/art.js`
- `PLANETS` roster (id, name, order, size, ringed?, color, atlas note + placement clue)
  for the Solar System + Star Atlas.
- `SPACE_ROCKS` (id, name, coin value, art) for the economy index.
- Space item set with placeholder SVGs: planets, rocks, **rover wheel**, **Solar Brush**,
  **oxygen hose**, **rotate key**, **mirror segment**, **mission cards** (with the
  background colors that encode the sequence), rover, telescope mirror tiles.

---

## The 5 dioramas (each = a new `buildXxx()` in main.js + layout in wireframe.js)

Net-new world widths/spots/SVGs go in `src/wireframe.js` (`SPACE_HUB_W`, per-room `_W`,
`_SPOTS`, `*SVG()`); space-hub niche order like `DINOHUB_ORDER`. Each room sets
`_challenges`, `_drop` (or its puzzle-specific descriptor), and a `ROOM_ENTER` entry.

| # | Room (id) | Core puzzle | Reuses | Cross-room / economy items |
|---|-----------|-------------|--------|----------------------------|
| 1 | Solar System (`solar`) | **Planet Path** — drag planets onto correct orbit rings, ordered by Star Atlas clues | multi-target `_drop` (extend placement to N sockets + order validation) | 2 planets hidden in other rooms; 1 planet **bought** at desk; 1 planet from **Orbit Balance** mini-game; 2 space rocks in room |
| 2 | Mars (`mars`) | **Rover Repair** — find wheel, clean panel, route rover to correct rock | drag-place + catalog rock-type match | broken **rover wheel** in another diorama; **Solar Brush** bought at desk (catalog says dusting needed); **Rover Route** mini-game |
| 3 | Moon (`moon`) | **Landing Sequence** — arrange mission cards in order; room's color-light cycle is the clue | **NEW** sequence/ordering puzzle (card row + validate against color order) | cards found around room; 1 card **exchanged** at desk; 1 card from **Build-a-Rocket** mini-game |
| 4 | Space Station (`station`) | **Fix the Airlock** — find oxygen hose, reconnect tether, rotate solar panels | drag-place + rotate (reuse bone-rotate) | **oxygen hose** in another diorama (catalog clue); **rotate key** bought at desk (catalog clue); **Spacewalk Drift** mini-game |
| 5 | James Webb (`webb`) | **Align Golden Mirrors** — rotate hex mirror tiles + focus until stars sharpen; aligning swaps the parallax backdrop | rotate (reuse bone-rotate) + slider; parallax layer swap | a **mirror segment** in another room + 1 bought at desk; **Focus the Stars** mini-game |

**Cross-room dependency graph (exploration gating):** define an explicit item→source map
so the player must visit multiple rooms — e.g. Solar System needs planets hidden in Mars
& Station; Mars needs the wheel from Moon; Station needs the hose from Webb; etc. Finalize
the exact graph during build so every room is both a *source* and a *consumer* (no
deadlocks, no room fully solvable on first visit).

---

## The 5 mini-games (new files, model on `src/pteroGame.js` DOM-overlay pattern)

Each exports `openXxxGame({...opts, onComplete, onClose})`, `closeXxxGame()`,
`isXxxGameOpen()`; reward grants the relevant item via `onMinigameSolved` and (for games
that yield an inventory item) `pickUpClue(item)` on close.

| Game | File | Mechanic | Input reuse |
|------|------|----------|-------------|
| Orbit Balance | `src/orbitGame.js` | tilt to keep a satellite balanced in orbit → win a planet | **`tiltValue()` accelerometer** (main.js:186-216) |
| Rover Route | `src/roverGame.js` | tap/draw a path through craters, avoid soft sand/rocks (simple maze) | canvas tap-path (Fish Run pattern) |
| Build-a-Rocket | `src/rocketGame.js` | assemble rocket parts in any order, press Play, find the order that launches + lands | drag-to-slot (drag pattern) |
| Spacewalk Drift | `src/spacewalkGame.js` | tap thrusters to guide an astronaut along a tether, grab floating tools | binary-tap physics (Fish Run flap) |
| Focus the Stars | `src/telescopeGame.js` | rotate hex mirror tiles + lens-wheel slider until blurry galaxy → sharp | bone-rotate + slider (foot-puzzle) |

Add each `isXxxGameOpen()` to the camera-walk guard and `goScene` puzzle-close checks.

---

## Files touched (summary)

- **`src/main.js`** (largest) — wing generalization; lobby door wiring; `buildSpaceHub`
  + 5 `buildXxx` room builders; space `ROOM_ENTER` entries; catalog space sections;
  economy/supply-desk wiring; 5 mini-game imports + guards; new puzzle types
  (multi-slot placement, card sequence).
- **`src/wireframe.js`** — `SPACE_HUB_W`/`_SPOTS`/order + per-room `_W`/`_SPOTS` +
  placeholder `*SVG()` layer art for hub and 5 rooms.
- **`src/art.js`** — `PLANETS`, `SPACE_ROCKS`, space-item SVGs, Star Atlas notes/clues.
- **New:** `src/economy.js`, `src/orbitGame.js`, `src/roverGame.js`, `src/rocketGame.js`,
  `src/spacewalkGame.js`, `src/telescopeGame.js`.
- **`index.html`** — coin HUD, supply-desk overlay container, success card already reused.
- **`src/style.css`** — supply desk, coin HUD, space-catalog styling.
- **`public/`** — placeholder assets only; real art + success reels (`/video/*.mp4`) later.

## Brain capture (Malabi norm)
A second wing is a directional product addition — after the build lands, record a
short memory under `brain/memory/projects/` (or shared) noting the Space Wing spec +
the three new systems, and cross-link `[[prototype-parallax-first-slice]]`. If the team
treats "two-wing structure / economy" as architectural, raise an ADR via `/decide`.
Content accuracy (planet order, Apollo sequence, rock types) should be sanity-checked —
there's a `paleontologist` skill for dino facts but none for space, so verify space
facts against the catalog data directly.

---

## Verification (end-to-end)

1. `cd product/prototypes/museum-parallax && npm i && npm run dev` — open the local URL.
2. **Lobby:** Space door now enters the wing (no longer a "roped off" toast).
3. **Hub + nav:** all 5 dioramas reachable; back buttons read correctly; depth/whoosh
   transitions behave; **dino wing still fully works** (regression check).
4. **Economy:** find rocks → sell at Supply Desk → coins increase; buy a required item →
   it lands in inventory; catalog "Space Rocks" index shows values.
5. **Each diorama:** solve its puzzle, including cross-room fetches (confirm no deadlock —
   every room completable only after the right other rooms are visited).
6. **Mini-games:** each opens, is winnable, grants its reward, returns control, and marks
   its room challenge done. Test **Orbit Balance on a phone** (iOS needs the tilt-permission
   button; reuse the existing flow) and the low-FX mobile path.
7. **Completion:** finishing all 5 space rooms stamps hub seals + lobby Space seal and
   fires the space **wing finale** (once). Confirm `wingComplete('dino')` still independent.
8. Sanity-check the deployed Vercel build (`base: './'`, no top-level await) so it doesn't
   regress the live prototype.
