import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'monaco-editor/esm/vs/editor/editor.api.js': path.resolve(__dirname, 'node_modules/monaco-editor/esm/vs/editor/editor.api.js'),
      'monaco-editor/esm/vs/editor/editor.api': path.resolve(__dirname, 'node_modules/monaco-editor/esm/vs/editor/editor.api.js')
    }
  },
  css: {
    postcss: {},
  },
  server: {
    proxy: {
      // Any request starting with /api will be routed to your backend
      '/api': {
        target: 'http://localhost:5000', // Your Express server address
        changeOrigin: true,
        secure: false, // Set to false if you are not using https locally
      }
    }
  }
})

