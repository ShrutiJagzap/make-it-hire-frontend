import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  darkMode: 'class',
  plugins: [
    tailwindcss(),
  ],
  build: {
    outDir: 'build',
  },
})