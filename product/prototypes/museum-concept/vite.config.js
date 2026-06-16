import { defineConfig } from 'vite'
import { writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Local-only concept test. `npm run dev` serves it; not wired for deploy.
// Edit mode "Save" POSTs the scene layout to /__save_layout; we store it in
// .layout.json (project root, outside public so it never triggers a reload) and
// serve it back at /layout.json, which the app loads on boot so edits persist.
const layoutFile = fileURLToPath(new URL('./.layout.json', import.meta.url))
// Prop art lives in public/, but the asset tool often writes to dist/ — so we
// treat dist/assets/props as a fallback source (served + listed) to avoid the
// "drop in dist → invisible in dev" trap.
const propsDir = fileURLToPath(new URL('./public/assets/props', import.meta.url))
const distPropsDir = fileURLToPath(new URL('./dist/assets/props', import.meta.url))
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif' }
const IMG_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i
const listImgs = (dir) => { try { return readdirSync(dir).filter((f) => IMG_RE.test(f)) } catch { return [] } }

export default defineConfig({
  server: { host: true, open: true, watch: { ignored: ['**/.layout.json'] } },
  plugins: [{
    name: 'layout-save',
    configureServer(server) {
      server.middlewares.use('/layout.json', (req, res, next) => {
        if (req.method !== 'GET') return next()
        res.setHeader('content-type', 'application/json')
        try { res.end(readFileSync(layoutFile)) }
        catch { res.end('{}') }                 // no saved layout yet → empty (no 404 noise)
      })
      // list the prop images so edit mode can offer a file picker (dev only).
      // merges public/ + dist/ (deduped) so dist-only drops still show up.
      server.middlewares.use('/__assets', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const files = [...new Set([...listImgs(propsDir), ...listImgs(distPropsDir)])]
          .sort((a, b) => a.localeCompare(b))
          .map((f) => '/assets/props/' + f)
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(files))
      })
      // serve /assets/props/<file> from dist/ when public/ doesn't have it, so
      // art dropped into dist/ is visible in dev without a manual copy
      server.middlewares.use('/assets/props/', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const name = decodeURIComponent(req.url.split('?')[0].replace(/^\//, ''))
        if (!name || name.includes('/') || !IMG_RE.test(name)) return next()
        if (existsSync(join(propsDir, name))) return next()     // public wins → let Vite serve it
        const distFile = join(distPropsDir, name)
        if (!existsSync(distFile)) return next()                 // not in dist either → 404 as usual
        const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
        res.setHeader('content-type', MIME[ext] || 'application/octet-stream')
        res.end(readFileSync(distFile))
      })
      server.middlewares.use('/__save_layout', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', () => {
          try {
            writeFileSync(layoutFile, body)
            res.setHeader('content-type', 'application/json')
            res.end('{"ok":true}')
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ ok: false, error: String(e) }))
          }
        })
      })
    },
  }],
})
