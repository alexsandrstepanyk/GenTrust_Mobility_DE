import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ФІКСОВАНИЙ ПОРТ для Roads (Дороги) Dashboard
// Ніхто інший не має права займати цей порт!
const PORT = 5180
const deptId = 'roads'
const deptName = 'Дороги'
const deptEmoji = '🛣️'

console.log(`Starting ${deptEmoji} ${deptName} Dashboard on FIXED port: ${PORT}`)

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
    strictPort: true,  // ПОМІЛКА якщо порт зайнятий (не змінювати!)
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
