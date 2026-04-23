#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"
PROJECT_DIR="/Users/oleksandrstepaniuk/Downloads/GenTrust_Mobility_DE"

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
  echo "📦 Fixing dependencies for $DASH..."
  cd "$PROJECT_DIR/$DASH" || continue
  
  # Force install and save to package.json
  npm install i18next react-i18next --save --no-audit --no-fund --legacy-peer-deps
  
  # Verify installation
  if grep -q "i18next" package.json; then
    echo "✅ Success for $DASH"
  else
    echo "❌ Failed for $DASH"
  fi
done

echo "🚀 All dashboards should be fixed now."
