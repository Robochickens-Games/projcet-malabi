# Museum Parallax — playable prototype (wireframe / blockout)

First playable slice of **Science Museum Mystery**, in the format the game will
use: a **wide, continuous side-scrolling world with platformer parallax** —
layers scroll at different speeds as you walk. Art is intentionally low-fi
wireframe (outlines + labels on ink); real painted layers replace it 1:1 later.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL (works on a phone over the same Wi-Fi).

## The slice

1. **Lobby** (2880px world) — walk right past three wing doors. A fossil tooth
   hides behind the PLANTER on a *slower* layer than the planter: walking past
   reveals it. Tap it → collection slot.
2. **Dinosaur Wing → Nesting Grove** (3840px world) — a jungle trail. Layer
   stack: clouds+sun 0.1× · mountains 0.3× · treeline 0.5× · trail+scene 1.0× ·
   canopy/bush foreground 1.42×. Each wireframe layer carries its speed tag.
3. Arrive at the **skeleton with a missing tooth**. Open the **Inventory** panel
   (right) and **drag the fossil tooth onto the dinosaur** — drop it on the
   skeleton and it flies into the jaw, locks in (Triceratops), a **placeholder
   success video** plays, and you earn Fossil Fragment 1/4. (The old field-guide
   tooth-matching mini-game was removed.)

**Two side panels** (toggle with the 📖 Catalog / 🎒 Inventory buttons in the HUD):
- **Catalog** (left) — a **field guide that opens on a cover**: a crest, a title,
  and a tappable list of **sections** (start: **Teeth** · **Covering**). Tap a
  section to read it, **‹ Sections** to return. *Teeth* is the species/tooth
  reference; *Covering* is scaffolded ("Soon") for scales/skin/feathers content. Add a section
  by pushing to `CATALOG_SECTIONS` in `src/main.js`.
- **Inventory** (right) — your finds; drag an item onto an exhibit to use it.

**Controls:** drag / fling, scroll wheel, arrow keys (with acceleration), or
device tilt to walk. Gestures that start on a panel or the HUD don't move the
camera. HINT nudges.

**Mobile:** the game is landscape — phones held in portrait get a
rotate-your-phone overlay. The ⛶ HUD button enters fullscreen and (on Android)
locks landscape. iPhone Safari has no fullscreen API, so the button hides
there; "Add to Home Screen" gives true fullscreen instead.

On phones both side panels **start closed** so the world fills the screen, and
only **one is open at a time** (opening one tucks the other away). When opened
they become **roomy sheets** instead of thin rails: the Catalog browses items in
a readable 2-up grid you can scan; the Inventory shows big, grabbable slots. The
game still surfaces the inventory automatically at the moments that need it —
when the tooth is found and when you reach the skeleton. Desktop is unchanged
(both panels open as side rails).

## Structure (for the art handoff)

- `src/wireframe.js` — all blockout art + the world layout constants
  (`LOBBY_SPOTS`, `GROVE_SPOTS` incl. the jaw `socket`). Drawings and hotspots share these,
  so repositioning is one edit. Replacing a wireframe layer = swapping the SVG
  string for a painted texture of the same world width.
- `src/main.js` — camera/scroll engine, input, game flow. Scene = a world width
  + layers with `_speed`; nothing else is scene-specific.
- `scripts/generate-assets.mjs` — the painted-asset slicing pipeline from the
  earlier art experiment (cuts concept paintings into parallax layers with
  feathered masks + inpainted base). Re-use it when real art lands
  (`public/img/` output is gitignored; needs `npm i -D playwright-core` + Chrome).

## Notes

- No top-level `await` in the entry: it deadlocks pixi's dynamically-imported
  renderer chunks in the Rollup build (dev mode masks it). Boot via `boot()`.
- Science note: herbivore copy says **ferns and leaves**, not grass — grass
  barely existed in the dinosaurs' era. Vet final copy with the
  `paleontologist` skill.
- Deploy gotcha: `src/brachioGame.js` imports the Brachio minigame from the
  sibling `../../brachio-runner/src/runner.js`. That sibling prototype **must be
  committed** or the Vercel build fails (`Could not resolve …/brachio-runner`).
  The cloud build clones the whole repo, so the import resolves there — it just
  needs the files in git. Vercel's Root Directory is this folder, so a deploy is
  only triggered by commits that touch `product/prototypes/museum-parallax/`.
