import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/scholarship-vault-2025/',
  server: {
    port: 3000,
  },
}) 