import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'content-script': resolve(__dirname, 'src/content/content-script.ts'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'content-script') return 'src/content/content-script.js'
          if (chunk.name === 'background') return 'src/background/background.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
