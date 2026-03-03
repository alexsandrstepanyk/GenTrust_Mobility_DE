import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ФІКСОВАНИЙ ПОРТ для Transport (Транспорт) Dashboard
const PORT = 5185
const deptId = 'transport'
const deptName = 'Транспорт'
const deptEmoji = '🚌'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __DEPT_ID__: JSON.stringify(deptId),
    __DEPT_PORT__: PORT,
    __DEPT_NAME__: JSON.stringify(deptName),
    __DEPT_EMOJI__: JSON.stringify(deptEmoji),
  },
  server: {
    port: PORT,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
