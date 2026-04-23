#!/bin/bash

# Додавання Homebrew у PATH
export PATH="/opt/homebrew/bin:$PATH"

PROJECT_DIR="/Users/oleksandrstepaniuk/Downloads/GenTrust_Mobility_DE"
SOURCE_I18N="$PROJECT_DIR/city-hall-dashboard/src/i18n.ts"
SOURCE_SWITCHER="$PROJECT_DIR/city-hall-dashboard/src/components/LanguageSwitcher.tsx"

# Всі дашборди
DASHBOARDS=(
  "admin-panel"
  "staff-panel"
  "departments/roads"
  "departments/lighting"
  "departments/waste"
  "departments/parks"
  "departments/water"
  "departments/transport"
  "departments/ecology"
  "departments/vandalism"
)

# Перебір усіх проектів
for DASHBOARD in "${DASHBOARDS[@]}"; do
  echo "🚀 Встановлюємо i18next для $DASHBOARD..."
  cd "$PROJECT_DIR/$DASHBOARD" || continue
  
  # Встановлюємо пакети тихо (без зайвого спаму)
  npm install i18next react-i18next --silent

  # Копіюємо конфігурацію та компонент
  mkdir -p src/components
  cp "$SOURCE_I18N" src/i18n.ts
  cp "$SOURCE_SWITCHER" src/components/LanguageSwitcher.tsx

  # Інтегруємо i18n в main.tsx якщо ще не інтегровано
  if ! grep -q "import './i18n" src/main.tsx 2>/dev/null; then
    sed -i '' "s/import '.\/index.css'/import '.\/index.css'\nimport '.\/i18n.ts'/g" src/main.tsx
  fi

  echo "✅ $DASHBOARD успішно налаштовано для багатомовності."
done

echo "🎉 Всі дашборди успішно масштабовано для i18n!"
