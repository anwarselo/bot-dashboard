#!/bin/bash
# start-bot-dashboard.sh - Start Bot Dashboard

cd /home/node/clawd/bot-dashboard

# Kill existing dashboard
pkill -f "node.*bot-dashboard/server.js" 2>/dev/null || true
sleep 1

# Start dashboard
nohup node server.js > /tmp/bot-dashboard.log 2>&1 &
PID=$!

# Wait for startup
sleep 3

# Check if running
if ps -p $PID > /dev/null 2>&1; then
  echo "✅ Bot Dashboard started (PID: $PID)"
  echo "📡 Port: 3000"
  echo "🌐 URL: http://localhost:3000"
  echo ""
  echo "Access from Mac: http://localhost:3000"
  echo "Access from Docker: http://host.docker.internal:3000"
  echo ""
  echo "Logs: tail -f /tmp/bot-dashboard.log"
  echo "Stop: kill $PID"
else
  echo "❌ Failed to start"
  exit 1
fi
