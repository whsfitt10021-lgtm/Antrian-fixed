import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_BASE_PATH if you deploy to GitHub Pages under a repo subpath,
// e.g. base: '/wahana-queue-display/'. Leave as '/' for a custom domain
// or a root-level host (Vercel, Netlify, Apps Script iframe, etc).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173
  }
})
