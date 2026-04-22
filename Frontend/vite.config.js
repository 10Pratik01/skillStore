import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const gatewayTarget = process.env.VITE_GATEWAY_URL || 'http://localhost:8080'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: gatewayTarget,
        changeOrigin: true
      },
      '/ws': {
        target: gatewayTarget,
        ws: true,
        changeOrigin: true
      }
    }
  }
})
