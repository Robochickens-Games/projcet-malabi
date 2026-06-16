# Museum-Placard Game UI — prototype + design system

A tactile UI language tuned to the game's **painterly** art: aged brass, carved
wood, parchment, Art-Deco hairline framing, and engraved gold-leaf titles.
Depth reads as **carved/embossed** (a short edge + soft inner shadow), *not*
glossy plastic; linework is **thin and warm** (sepia-bistre), never thick cartoon
black. Type pairs **Cinzel** (engraved deco caps) with **Fraunces** (warm
old-style serif). Built to be **consistent from tokens alone**.

> Earlier iteration was a chunky King/Playrix "toon" look; pivoted to this
> museum-placard treatment so the UI sits with the painterly assets rather than
> fighting them. Class API is unchanged — only the *feel*.

> Scope: this is the **UI chrome** layer (buttons, nav, banners, dialogs) — a
> separate layer from the painterly *scene* art in `art-direction` /
> `scientific-realism-rule`. Those stay illustrated; this is the interactive shell.

## Run

No build. Just open it:

```
open product/prototypes/game-ui-3d/index.html
```

(or serve the folder: `python3 -m http.server` then visit `/index.html`)

## Files

- `design-system.css` — the whole system: tokens + components. **Source of truth.**
- `index.html` — living showcase: every component + the reference screen rebuilt.

## How it works

Everything is one primitive, `.toon`, that paints the 3D extruded chunk. Recolor any
chunk by setting two CSS vars on it:

```html
<button class="toon is-press btn" style="--face:var(--red); --edge:var(--red-edge);">Play</button>
```

`--face` is the top color, `--edge` is the darker bottom-lip color. Add `is-press`
to make it compress on tap.

### Components
`.btn` (+ `--red/green/blue/yellow/cream/purple`, `--sm/lg/block/icon`) ·
`.banner` + `.title-gold` · `.navbar` + `.nav-tab` · `.tile` · `.pill` + `.badge` ·
`.progress` · `.panel` (dialog) · `.toggle`.

### Palette / theming
The warm museum palette lives in `:root` — `--bg`/`--bg-2` (candlelit wood backdrop),
parchment `--cream`, candlelight `--yellow` (gold), exhibit `--red`, moss `--green`,
space-teal `--blue`, aged-wood/brass `--purple`. Re-theme (e.g. for a seasonal event)
by overriding those tokens; components never change.

## Tokens worth knowing
`--ink` (the unifying dark line) · `--depth` (lip height) · `--outline` (border weight)
· `--r-sm…xl` (radii) · `--gloss` (top highlight) · per-color `--x` / `--x-edge` pairs.
