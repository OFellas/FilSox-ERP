import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // <--- ADICIONE ESSA LINHA (Importante!)
  server: {
    port: 5173, // (Opcional, se já tiver)
  }
})