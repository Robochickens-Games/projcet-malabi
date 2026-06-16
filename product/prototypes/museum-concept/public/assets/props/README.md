# props/ — clickable object art (optional)

Art for individual hotspots (the tooth, an interactive door, a clue, …).
A hotspot in [`src/config.js`](../../../src/config.js) points at one with
`art: '/assets/props/tooth.png'`. Size it to roughly fill the hotspot's
`w × h` rect; transparent PNG.

If a hotspot has no `art`, the engine draws a dashed clickable marker with its
icon + label instead — so every interaction is visible and testable before art
exists.
