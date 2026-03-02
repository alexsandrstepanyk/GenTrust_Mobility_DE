// ⚠️ СТАРИЙ КОД (2.3.2026 - ЗАКОММЕНТОВАНО):
// БУЛО: import { defineConfig } from 'tailwindcss'
//       import defaultTheme from 'tailwindcss/defaultConfig'
//       export default defineConfig({ ... })
// ПРОБЛЕМА: defineConfig при завантаженні викликав помилку:
//           "Cannot read properties of undefined (reading 'call')"
//           Це сталося тому що Vite неправильно обробляв конфіг
// ДАТА ЗМІСТИ: 2.3.2026

// ✅ НОВИЙ КОД (2.3.2026):
// ЗАМІНЕНО НА: export default { ... } (звичайний об'єкт без defineConfig)
// ЧИМ КРАЩЕ: Скопійовано з city-hall-dashboard що працює без помилок
//            Простіший синтаксис, немає проблем з Vite обробкою

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
