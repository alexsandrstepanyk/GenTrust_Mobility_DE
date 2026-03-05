#!/bin/bash

################################################################################
# 🚀 QUICK START: Auto-Start All Services (Except Expo) + Auto-Check
# 
# 📋 ОПИС:
#   Цей скрипт запускає ВСІ сервіси GenTrust Mobility (окрім Expo емуляторів)
#   Після запуску автоматично перевіряє чи всі сервіси працюють
#   Відкриває Monitor Dashboard (9000) з феєрверком або попередженням
#
# ✅ ЩО ЗАПУСКАЄТЬСЯ:
#   - Monitor Dashboard (9000)
#   - Backend API + Telegram Botи (3000)
#   - Admin Panel (5174)
#   - City-Hall Dashboard (5173)
#   - Department Dashboard Base (5175)
#   - 8 Департаментів (5180-5187)
#
# 🚫 ЩО НЕ ЗАПУСКАЄТЬСЯ:
#   - Expo School (8082) - запускай окремо
#   - Expo Parent (8083) - запускай окремо
#   - Expo Client (8081) - запускай окремо
#
# 🎉 ФІНАЛ:
#   - Якщо ВСЕ працює: феєрверк на Monitor Dashboard
#   - Якщо щось НЕ працює: червоне мигання + список помилок
#
# 🚀 ВИКОРИСТАННЯ:
#   ./start.sh
#
################################################################################

cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh
