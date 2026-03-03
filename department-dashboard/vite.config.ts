import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ФІКСОВАНИЙ ПОРТ для Department Dashboard - 5175
// Ніхто інший не має права займати цей порт!
const PORT = 5175
const deptId = process.env.VITE_DEPT_ID || 'roads'

console.log(`Starting Department Dashboard: ${deptId} on FIXED port: ${PORT}`)

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
  },
  server: {
    port: PORT,
    strictPort: true, // ← ПОМІЛКА якщо порт зайнятий (не змінювати!)
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
