// ⚠️ СТАРИЙ КОД (2.3.2026 - ЗАКОММЕНТОВАНО):
// БУЛО: import tailwindcss from 'tailwindcss'
//       import autoprefixer from 'autoprefixer'
//       export default { plugins: [tailwindcss, autoprefixer] }
// ПРОБЛЕМА: PostCSS не розпізнавав плагіни в цьому форматі, викликало CSS помилки
// ДАТА ЗМІСТИ: 2.3.2026

// ✅ НОВИЙ КОД (2.3.2026):
// ЗАМІНЕНО НА: export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
// ЧИМ КРАЩЕ: Скопійовано з city-hall-dashboard що працює без помилок
//            PostCSS правильно розпізнає плагіни в object форматі

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
