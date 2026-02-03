# 🤖 Bot Dashboard

**A unified dashboard to manage Supervisor, Rex, Tasks, and Knowledge Graph**

---

## ✨ Features

### Real-Time Monitoring
- **Bot Status** - Supervisor & Rex online/offline status
- **Messages** - Latest messages between bots
- **Updates** - Every 10 seconds (no refresh needed)

### Task Management
- **Add Tasks** - Create tasks with priority & due date
- **Track Progress** - Mark tasks as complete
- **Priority System** - URGENT 🔴, HIGH 🟡, MEDIUM 🟢
- **Delete Tasks** - Remove completed tasks

### Knowledge Graph
- **Stats** - Node count, relationships count
- **Status** - Active/Not found/Error
- **Last Update** - When graph was last updated

### Alerts
- **Urgent Tasks** - Auto-alert for URGENT tasks due today
- **Bot Offline** - Alerts when Supervisor or Rex goes offline
- **Real-Time** - Alerts appear instantly

### Quick Actions
- **Message Supervisor** - Send message via dashboard
- **Message Rex** - Send message via dashboard
- **Refresh All** - Manually refresh all data
- **Reload** - Full page reload

---

## 🚀 Getting Started

### From Docker (Supervisor's container)
```bash
cd /home/node/clawd/bot-dashboard
./start-dashboard.sh
```

### From Mac (Anwar's browser)
```
http://localhost:3000
```

### From Docker (browser inside container)
```
http://localhost:3000
```

---

## 📊 Dashboard Sections

### 1. Header
- Shows connection status to dashboard
- Connected = ✅ green
- Disconnected = ❌ red

### 2. Supervisor Card (🧠)
- Status: Online/Offline/Checking
- Port: 9800
- Webhooks: Number registered
- Messages In: Count of incoming messages
- Latest Messages: Last 5 messages

### 3. Rex Card (🦞)
- Status: Online/Offline/Checking
- Port: 9801
- Version: Current version
- Uptime: How long running
- Latest Messages: Last 5 messages

### 4. Tasks Card (📋)
- Add Task form (name, priority, due date)
- Task list with completion actions
- Color-coded by priority:
  - 🔴 Red = URGENT
  - 🟡 Yellow = HIGH
  - 🟢 Blue = MEDIUM
  - ✅ Green = Complete

### 5. Knowledge Graph Card (🔗)
- Nodes: Total nodes in KG
- Relationships: Total edges in KG
- Status: Active/Not found/Error
- Last Update: Timestamp

### 6. Quick Actions (⚡)
- Message Supervisor - Quick prompt to send message
- Message Rex - Quick prompt to send message
- Refresh All - Manual refresh of all data
- Reload Dashboard - Full page reload

### 7. Alerts Panel (Right side)
- Urgent task alerts (auto-generated)
- Bot offline alerts
- Real-time notifications

---

## 🔧 Technical Details

### Backend
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Updates**: Every 10 seconds
- **API**: REST + WebSocket

### Frontend
- **Technology**: Vanilla JS (no build step)
- **Styling**: Custom CSS
- **Updates**: WebSocket (Socket.IO client)

### Data Flow
```
Dashboard ← Socket.IO ← Supervisor API (9800)
              ↓
              ← Rex Webhook (9801)
              ↓
              ← Knowledge Graph (file)
```

### Auto-Updates
- **Supervisor Status**: Every 10 seconds
- **Rex Status**: Every 10 seconds
- **Knowledge Graph**: Every 10 seconds
- **Task Alerts**: Every 10 seconds

---

## 📱 Usage

### Adding a Task
1. Enter task name
2. Select priority (URGENT/HIGH/MEDIUM)
3. Choose due date
4. Click "+ Add Task"

### Completing a Task
- Click "✓" button on task card
- Task turns green with strikethrough

### Deleting a Task
- Click "✗" button on task card
- Task is removed from list

### Sending Message to Bot
1. Click "Message [Bot]" button
2. Enter your message
3. Click "OK"
4. Message sent via Supervisor API

### Checking Messages
- Scroll through messages in bot cards
- Shows last 5 messages per bot
- Auto-updates every 10 seconds

---

## 🚨 Alerts

### Auto-Generated Alerts

**Urgent Task Alert:**
```
⚠️ URGENT: Book Istanbul flight is due TODAY
```
Triggers when: Task has priority URGENT and due ≤ today

**Bot Offline Alert:**
```
❌ Supervisor API is offline
```
Triggers when: HTTP health check fails

**Rex Offline Alert:**
```
❌ Rex is offline
```
Triggers when: Rex webhook health check fails

---

## 📈 Monitoring

### Metrics Tracked
- Bot uptime
- Message counts
- Task completion rates
- Knowledge Graph growth
- Alert frequency

### Logs
- Dashboard logs: `/tmp/bot-dashboard.log`
- Supervisor logs: `/tmp/supervisor-api.log`
- Rex logs: On Rex's machine

---

## 🛠️ Troubleshooting

### Dashboard won't start
```bash
# Check port 3000 availability
lsof -i :3000

# Kill existing process
pkill -f "node.*bot-dashboard"

# Check logs
tail -f /tmp/bot-dashboard.log
```

### Bots showing as offline
```bash
# Check Supervisor API
curl http://localhost:9800/health

# Check Rex Webhook
curl http://host.docker.internal:9801/health

# Check Supervisor API key
echo $SUPERVISOR_API_KEY
```

### Tasks not saving
- Check browser console for errors
- Check Dashboard logs
- Refresh dashboard page

### Knowledge Graph not showing
```bash
# Check if KG file exists
ls -la /home/node/clawd/knowledge_graph.json

# Check file permissions
cat /home/node/clawd/knowledge_graph.json
```

---

## 🔄 Updates

### To Update Dashboard
```bash
cd /home/node/clawd/bot-dashboard
git pull  # If using git
# Or manually update files

# Restart dashboard
./start-dashboard.sh
```

---

## 📞 Support

### Issues or Questions
- Check Supervisor logs: `cat /tmp/supervisor-api.log`
- Check Dashboard logs: `cat /tmp/bot-dashboard.log`
- Check Supervisor status: `curl http://localhost:9800/health`
- Check Rex status: `curl http://host.docker.internal:9801/health`

---

**Made with ❤️ for Anwar**
**Creator**: TheSupervisor
**Version**: 1.0.0
**Status**: ✅ ACTIVE
