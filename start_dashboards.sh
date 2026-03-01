#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 GenTrust Dashboards Startup${NC}"
echo "=================================="

# Install dependencies for City Hall Dashboard
if [ ! -d "city-hall-dashboard/node_modules" ]; then
  echo "📦 Installing City Hall Dashboard dependencies..."
  cd city-hall-dashboard && npm install && cd ..
fi

# Start City Hall Dashboard
echo -e "${GREEN}✓${NC} Starting City Hall Dashboard on port 5173..."
cd city-hall-dashboard && npm run dev &
CITYHALL_PID=$!

echo ""
echo "=================================="
echo -e "${GREEN}✅ Dashboards Ready!${NC}"
echo ""
echo "🏛️ City Hall Dashboard:"
echo "   URL: http://localhost:5173"
echo "   PID: $CITYHALL_PID"
echo ""
echo "📊 Features:"
echo "   • Real-time reports monitoring"
echo "   • User registration approval"
echo "   • Statistics & charts"
echo "   • Auto-forwarding to utilities"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================="

# Wait for interrupt
wait
