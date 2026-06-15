import { defineConfig } from 'vite'

// base './' so the built bundle runs from any static host (GitHub Pages, a USB stick…)
// target 'esnext' for top-level await (every browser that runs WebGL2 handles it)
export default defineConfig({
  base: './',
  build: { target: 'esnext' },
  esbuild: { target: 'esnext' },
  optimizeDeps: { esbuildOptions: { target: 'esnext' } },
})
