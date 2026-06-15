import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// base './' so the built bundle runs from any static host (GitHub Pages, a USB stick…)
// target 'esnext' for top-level await (every browser that runs WebGL2 handles it)
export default defineConfig({
  base: './',
  build: { target: 'esnext' },
  esbuild: { target: 'esnext' },
  optimizeDeps: { esbuildOptions: { target: 'esnext' } },
  resolve: {
    // The Brachio Run mini-game (src/brachioGame.js) reuses the runner source from the
    // sibling ../brachio-runner prototype. Pin bare `three` imports — including the
    // ones inside those sibling files — to THIS project's three, so the dev server and
    // the production build both resolve it here (no need to install the sibling).
    alias: [{ find: /^three$/, replacement: resolve(__dirname, 'node_modules/three') }],
  },
  // dev server must be allowed to read the sibling prototype folder
  server: { fs: { allow: [resolve(__dirname, '..')] } },
})
