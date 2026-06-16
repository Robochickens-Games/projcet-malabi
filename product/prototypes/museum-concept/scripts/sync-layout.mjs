// Bake the edit-mode layout into the production build.
// Edit mode saves to .layout.json (dev-server only, git-ignored). The deployed
// build has no dev server, so it can't read .layout.json — it would fall back to
// config.js defaults (props appear "moved"). Copying it to public/layout.json
// makes Vite ship it to dist/layout.json, which the app fetches on boot.
// Runs automatically before `npm run build` (see package.json "prebuild").
import { existsSync, copyFileSync } from 'node:fs'

const src = new URL('../.layout.json', import.meta.url)
const dest = new URL('../public/layout.json', import.meta.url)

if (existsSync(src)) {
  copyFileSync(src, dest)
  console.log('[sync-layout] baked .layout.json → public/layout.json')
} else {
  // No local save (e.g. CI / git-triggered build) — keep the committed public/layout.json as-is.
  console.log('[sync-layout] no .layout.json; using existing public/layout.json if present')
}
