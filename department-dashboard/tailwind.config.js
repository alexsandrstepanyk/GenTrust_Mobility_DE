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
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
