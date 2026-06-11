# Museum Parallax — feel prototype

First playable slice of **Science Museum Mystery**, built to test the *feel*:
parallax depth (find things hiding behind things), and scenario 1 —
**lobby → find the tooth → dinosaur hall → match it to the right diorama using the catalog.**

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. `--host` is on, so you can open it on your phone over
the same Wi-Fi (tilt works on Android over LAN; iOS needs HTTPS for tilt —
use touch-drag there, or `npm run build` + any HTTPS static host).

## The slice

1. **Lobby** — warm Art Deco museum hall. Move the mouse / drag / tilt to look
   around — layers shift at different depths. A fossil tooth is half-hidden
   behind the planter on the right; you have to *look around* to spot it.
2. Tap the tooth → it flies into your collection slot.
3. The **📖 Catalog** shows three dinosaurs, what they eat, and their tooth
   shapes. The found tooth is wide and flat → plant eater.
4. Enter the **Dinosaur Wing** → three dioramas (Spinosaurus / Allosaurus /
   Triceratops). Wrong picks shake and teach ("sharp jagged teeth are for
   meat…"); the right one celebrates and awards **Fossil Fragment 1/4**.

## Stack & why

- **Vite + Pixi.js (WebGL) + GSAP** — hot-reload iteration, 60fps layered
  scene graph, animation with feel. Free, runs everywhere, deploys to any
  static host (GitHub Pages) as a URL the team can open on a phone.
- All art is code-authored layered SVG in the captured art direction
  (amber/gold Art Deco + deep teal — see `brain/memory/shared/art-direction`),
  rendered to WebGL textures. Swappable 1:1 for painted illustration later —
  the layer/depth structure is the real deliverable.
- Sound is a tiny built-in synth (no asset files).

## Notes

- Science note: the herbivore copy says **ferns and leaves**, not grass —
  grass barely existed in the dinosaurs' era. Run ideas past the
  `paleontologist` skill before final copy/art.
- Textures are 2400px wide per layer — fine on modern devices, slightly soft
  on 3× phone screens. Real art pass would export @2x slices.
