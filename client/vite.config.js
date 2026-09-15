import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
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

