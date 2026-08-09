import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [react(), tailwindcss()],

    // ── Drop console.* and debugger in production ─────────────────────────────
    // The top-level `esbuild` key controls Vite's esbuild transform for ALL
    // files (not just the final bundle minification step).
    // `drop` removes entire call expressions at the AST level — zero runtime cost.
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },

    build: {
      // Warn when any single chunk exceeds 500KB (was 1200 — tighter budget)
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        output: {
          // ── Manual chunk splitting ───────────────────────────────────────────
          // Combined with React.lazy() in App.jsx, this ensures:
          //   - /discover downloads GSAP + Motion but NOT Firebase auth
          //   - /checkout downloads Firebase but NOT GSAP
          //   - Each vendor is independently cacheable between deploys
          manualChunks(id) {
            // 1. Firebase — split into sub-chunks for maximum tree-shaking
            if (id.includes('node_modules/firebase')) {
              if (id.includes('/auth')) return 'vendor-firebase-auth'
              if (id.includes('/firestore')) return 'vendor-firebase-firestore'
              return 'vendor-firebase-core'
            }

            // 2. GSAP — animation engine (~60KB gz)
            if (id.includes('node_modules/gsap') || id.includes('node_modules/@gsap')) {
              return 'vendor-gsap'
            }

            // 3. Motion / Framer Motion — kept separate from GSAP
            if (id.includes('node_modules/motion')) {
              return 'vendor-motion'
            }

            // 4. OGL — 3D canvas lib (Aurora background effects)
            if (id.includes('node_modules/ogl')) {
              return 'vendor-ogl'
            }

            // 5. React Router
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router'
            }

            // 6. All other node_modules → shared vendor chunk
            if (id.includes('node_modules')) {
              return 'vendor-shared'
            }
          },

          // Deterministic names — prevents stale CDN/browser cache after deploys
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
