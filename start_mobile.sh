#!/bin/bash
echo "Starting LocalTunnel..."
lt --port 3000 --subdomain gentrust-api &
LT_PID=$!
sleep 3
echo "Tunnel started at https://gentrust-api.loca.lt"
echo "Starting Expo..."
cd mobile && npx expo start --tunnel
kill $LT_PID
