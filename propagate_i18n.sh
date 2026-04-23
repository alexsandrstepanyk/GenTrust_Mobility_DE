#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
PROJECT_DIR="/Users/oleksandrstepaniuk/Downloads/GenTrust_Mobility_DE"
I18N_SOURCE="$PROJECT_DIR/city-hall-dashboard/src/i18n.ts"
SWITCHER_SOURCE="$PROJECT_DIR/city-hall-dashboard/src/components/LanguageSwitcher.tsx"

DASHBOARDS=(
  "admin-panel"
  "staff-panel"
  "department-dashboard"
  "departments/roads"
  "departments/lighting"
  "departments/waste"
  "departments/parks"
  "departments/water"
  "departments/transport"
  "departments/ecology"
  "departments/vandalism"
)

for DASH in "${DASHBOARDS[@]}"; do
  echo "🚀 Propagating i18n to $DASH..."
  mkdir -p "$PROJECT_DIR/$DASH/src/components"
  cp "$I18N_SOURCE" "$PROJECT_DIR/$DASH/src/i18n.ts"
  cp "$SWITCHER_SOURCE" "$PROJECT_DIR/$DASH/src/components/LanguageSwitcher.tsx"
done

echo "✅ Propagated i18n config to all dashboards."
