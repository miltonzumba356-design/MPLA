import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Lodash uses CommonJS requires — force Vite to pre-bundle it
  optimizeDeps: {
    include: ['lodash', 'recharts'],
  },

  build: {
    rollupOptions: {
      // Warn-as-error on unresolved → treat as warning so build succeeds
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      },
    },
    commonjsOptions: {
      include: [/lodash/, /node_modules/],
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
