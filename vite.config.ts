import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 프론트에서 /api/... 로 요청하면 백엔드로 전달
      '/api': {
        target: 'https://3-39-65-219.nip.io', // 로컬 백엔드를 쓸 때는 http://localhost:8080
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
