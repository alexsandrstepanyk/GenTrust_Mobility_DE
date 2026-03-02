import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Отримуємо порт з аргументів командного рядка або environment
const args = process.argv
const portArg = args.findIndex(arg => arg === '--port') + 1
const port = portArg && args[portArg] ? parseInt(args[portArg]) : (parseInt(process.env.VITE_DEPT_PORT || '5176'))
const deptId = process.env.VITE_DEPT_ID || 'roads'

console.log(`Starting department: ${deptId} on port: ${port}`)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __DEPT_ID__: JSON.stringify(deptId),
    __DEPT_PORT__: port,
  },
  server: {
    port,
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
