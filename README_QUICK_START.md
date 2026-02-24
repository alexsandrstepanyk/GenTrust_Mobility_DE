# GenTrust Mobility — Quick Start (macOS)

## 1) Передумови
- macOS + Xcode Command Line Tools
- Node.js 18+ (npm)
- Expo CLI (через npx достатньо)

## 2) Перевірка залежностей
Відкрийте термінал у корені проєкту і виконайте:
- node -v
- npm -v

## 3) Встановлення залежностей
- Backend: npm install
- Mobile: cd mobile && npm install

## 4) Запуск бази та підготовка
- npx prisma generate
- npx prisma migrate dev --name init

## 5) Запуск бекенда + ботів
- npm run build
- npm start

## 6) Запуск мобільного додатку
- cd mobile
- npx expo start --ios

## 7) Перевірка
- API: http://localhost:3000/health
- Боти: див. .bot.log
- Expo: див. .frontend.log

## 8) Тестові доставки
- npx ts-node scripts/seed_quests.ts

## 9) Старт одним скриптом (опціонально)
- ./dev.sh

## Якщо щось не запускається
- Перезапусти Expo: pkill -f "expo start"
- Перезапусти боти: pkill -f "node dist"
- Перевір логи: .bot.log та .frontend.log
