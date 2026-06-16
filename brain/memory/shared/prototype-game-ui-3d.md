---
name: prototype-game-ui-3d
description: Toon-3D game-UI design system + showcase prototype (chunky extruded buttons/nav/banners, token-driven, warm museum palette) in product/prototypes/game-ui-3d; the interactive UI-chrome layer, distinct from the painterly scene art
owner: dor
scope: shared
created: 2026-06-14
tags: [prototype, design-system, ui, design, tokens, theming]
---

# Toon-3D game UI — design system + showcase (built, local-only)

**What:** A new prototype in `product/prototypes/game-ui-3d/` establishing the
**games' UI-chrome language** — the chunky, extruded "casual game" look (King /
Playrix style): thick dark outlines, big radii, a colored bottom *lip* that
compresses on press, glossy inner highlight, soft contact shadow. The *form* came from a
reference image Dor shared (a snow-capped "Christmas Special" hub); the *palette*
is the game's own **warm museum world** — aged wood, parchment, candlelight gold,
brass, teal-space accent (per [[art-direction]]). The snow/Christmas skin was
dropped on Dor's call. **No build — open `index.html`.**

**Shape:**
- `design-system.css` — the source of truth: tokens (`:root`) + components.
- `index.html` — living showcase of every component + the reference screen rebuilt.
- One core primitive **`.toon`** paints the 3D chunk; recolor anything by setting
  two vars on it — `--face` (top) and `--edge` (darker bottom lip) — and add
  `is-press` to make it compress on tap.
- Components: `.btn` (6 colors × sm/lg/block/icon), `.banner` + `.title-gold`,
  `.navbar`/`.nav-tab`, `.tile`, `.pill`/`.badge`, `.progress`, `.panel` (dialog),
  `.toggle`.
- **Warm museum palette in `:root`:** candlelit-wood backdrop, parchment surfaces,
  candlelight-gold/exhibit-red/moss-green/space-teal/brass fills. Re-skinning (e.g.
  a future seasonal event) is a token override — components never change.

**Stack:** plain HTML + CSS (+ tiny JS for tab/toggle/press state), Google Fonts
(Baloo 2 + Fredoka). No framework, no build step — aligns with [[budget-constraint]].

**Why:** gives the games a single, consistent, reusable interactive shell so every
screen reads as one product and seasonal events (Christmas etc.) are a token swap,
not a redesign. **Important scope note:** this is the *UI-chrome* layer and is
deliberately separate from the *scene* art language — the painterly, scientifically
accurate illustration in [[art-direction]] / [[scientific-realism-rule]] stays as-is;
this is the buttons/nav/dialogs that sit on top.

**Adopted in the parallax prototype (2026-06-14):** `design-system.css` was copied
into `museum-concept` as `src/ui-3d.css` and now drives that prototype's whole UI
(HUD, inventory + menu modals, toast, edit panel) — see
[[prototype-concept-asset-driven]]. First real consumer of the system; if it keeps
spreading, promote the CSS to one shared file instead of per-prototype copies.

**Pivot — "museum-placard", not toon (2026-06-14):** the first cut was a chunky
King/Playrix toon look (thick black outlines, glossy plastic lip, Baloo font). It
clashed with the painterly assets, so the system was re-pitched to match the art:
thin warm sepia linework, **carved/embossed** depth (short edge + inner shadow, no
plastic gloss), aged brass / parchment / walnut palette, Art-Deco hairline inner
frames, engraved **gold-leaf** titles, **Cinzel + Fraunces** type. Same component
class API — only the feel changed. Controls moved off a center bar to **small
edge buttons split left/right** (44px medallions, `env(safe-area-inset-*)`) for
two-thumb mobile reach; top holds info banners.

**Icons — interim vector, AI blocked (2026-06-14):** Dor asked for AI-generated
icon assets in the game's style and no emoji. The emoji are gone, replaced by
hand-authored **in-style vector (inline SVG) line icons** (back / satchel / menu /
pencil / bone) that match the thin warm museum linework. True text-to-image AI
icons are **not currently possible**: the local engine was dropped (see [[0004-drop-local-comfyui-engine]])
and [[budget-constraint]] = no spend. **Decided 2026-06-14 (Dor): keep the vector
icons** — no spend, they match the linework and stay editable. Raster/AI icons can
be revisited if/when a paid image API is approved. See [[asset-generation-pipeline]].

Related: [[art-direction]], [[scientific-realism-rule]], [[gameplay-principles]],
[[prototype-concept-asset-driven]], [[north-star]].
