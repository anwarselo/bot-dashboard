#!/usr/bin/env node
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const session = require('express-session');

// Configuration
const PORT = process.env.DASHBOARD_PORT || 3000;
const SUPERVISOR_API = process.env.SUPERVISOR_API || 'http://localhost:9800';
const REX_WEBHOOK = process.env.REX_WEBHOOK || 'http://host.docker.internal:9801';
const SUPERVISOR_API_KEY = process.env.SUPERVISOR_API_KEY || 'supervisor-secret-key';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Session management
app.use(session({
  secret: 'bot-dashboard-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTP only
}));

// In-memory state
let state = {
  supervisor: { status: 'unknown', lastCheck: null, messages: [] },
  rex: { status: 'unknown', lastCheck: null, messages: [] },
  tasks: [
    { id: 1, name: 'Book Istanbul flight', priority: 'URGENT', due: '2026-02-03', status: 'pending' },
    { id: 2, name: 'Clone buildermethods.com in Next.js', priority: 'HIGH', due: '2026-02-07', status: 'in_progress' },
    { id: 3, name: 'Deploy website to Vercel', priority: 'HIGH', due: '2026-02-10', status: 'pending' }
  ],
  kgStats: { nodes: 0, relationships: 0, lastUpdate: null },
  alerts: []
};

// Helper: Check Supervisor API
async function checkSupervisor() {
  try {
    const response = await axios.get(`${SUPERVISOR_API}/health`, {
      headers: { 'X-API-Key': SUPERVISOR_API_KEY },
      timeout: 2000
    });

    state.supervisor.status = 'online';
    state.supervisor.lastCheck = new Date().toISOString();

    // Get messages
    const msgs = await axios.get(`${SUPERVISOR_API}/messages?bot=Supervisor`, {
      headers: { 'X-API-Key': SUPERVISOR_API_KEY },
      timeout: 2000
    });

    state.supervisor.messages = msgs.data.messages || [];

    // Get webhooks
    const webhooks = await axios.get(`${SUPERVISOR_API}/webhooks`, {
      headers: { 'X-API-Key': SUPERVISOR_API_KEY },
      timeout: 2000
    });

    state.supervisor.webhooks = webhooks.data.webhooks || [];

  } catch (error) {
    state.supervisor.status = 'offline';
    state.supervisor.lastError = error.message;
  }

  io.emit('update', { supervisor: state.supervisor });
}

// Helper: Check Rex
async function checkRex() {
  try {
    const response = await axios.get(`${REX_WEBHOOK}/health`, {
      timeout: 2000
    });

    state.rex.status = 'online';
    state.rex.lastCheck = new Date().toISOString();
    state.rex.uptime = response.data.uptime;
    state.rex.version = response.data.version;

    // Get messages to Rex
    const msgs = await axios.get(`${SUPERVISOR_API}/messages?bot=Rex`, {
      headers: { 'X-API-Key': SUPERVISOR_API_KEY },
      timeout: 2000
    });

    state.rex.messages = msgs.data.messages || [];

  } catch (error) {
    state.rex.status = 'offline';
    state.rex.lastError = error.message;
  }

  io.emit('update', { rex: state.rex });
}

// Helper: Check Knowledge Graph
async function checkKnowledgeGraph() {
  try {
    // Try to read KG from filesystem
    const fs = require('fs');
    const kgPath = '/home/node/clawd/knowledge_graph.json';

    if (fs.existsSync(kgPath)) {
      const kgData = JSON.parse(fs.readFileSync(kgPath, 'utf8'));
      state.kgStats.nodes = kgData.nodes?.length || 0;
      state.kgStats.relationships = kgData.relationships?.length || 0;
      state.kgStats.lastUpdate = new Date().toISOString();
      state.kgStats.status = 'active';
    } else {
      state.kgStats.status = 'not_found';
    }

  } catch (error) {
    state.kgStats.status = 'error';
    state.kgStats.lastError = error.message;
  }

  io.emit('update', { kgStats: state.kgStats });
}

// Helper: Check for urgent alerts
function checkAlerts() {
  state.alerts = [];

  // Check urgent tasks due today
  const today = new Date().toISOString().split('T')[0];
  state.tasks.forEach(task => {
    if (task.priority === 'URGENT' && task.due <= today && task.status !== 'complete') {
      state.alerts.push({
        type: 'urgent_task',
        message: `⚠️ URGENT: ${task.name} is due TODAY`,
        task
      });
    }
  });

  // Check if bots are offline
  if (state.supervisor.status === 'offline') {
    state.alerts.push({
      type: 'bot_offline',
      message: '❌ Supervisor API is offline'
    });
  }

  if (state.rex.status === 'offline') {
    state.alerts.push({
      type: 'bot_offline',
      message: '❌ Rex is offline'
    });
  }

  io.emit('update', { alerts: state.alerts });
}

// Periodic checks
setInterval(() => {
  checkSupervisor();
  checkRex();
  checkKnowledgeGraph();
  checkAlerts();
}, 10000); // Check every 10 seconds

// Initial check
checkSupervisor();
checkRex();
checkKnowledgeGraph();
checkAlerts();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send full state on connect
  socket.emit('update', state);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// REST API Routes

// Get full state
app.get('/api/state', (req, res) => {
  res.json(state);
});

// Get Supervisor status
app.get('/api/supervisor', async (req, res) => {
  await checkSupervisor();
  res.json(state.supervisor);
});

// Get Rex status
app.get('/api/rex', async (req, res) => {
  await checkRex();
  res.json(state.rex);
});

// Get tasks
app.get('/api/tasks', (req, res) => {
  res.json(state.tasks);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = state.tasks.findIndex(t => t.id === taskId);

  if (taskIndex !== -1) {
    state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...req.body };
    io.emit('update', { tasks: state.tasks });
    res.json(state.tasks[taskIndex]);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Add task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: Math.max(...state.tasks.map(t => t.id), 0) + 1,
    ...req.body,
    created: new Date().toISOString()
  };
  state.tasks.push(newTask);
  io.emit('update', { tasks: state.tasks });
  res.json(newTask);
});

// Send message to bot
app.post('/api/send', async (req, res) => {
  const { to, message } = req.body;

  try {
    await axios.post(`${SUPERVISOR_API}/send`, {
      to,
      from: 'Dashboard',
      message,
      type: 'message'
    }, {
      headers: { 'X-API-Key': SUPERVISOR_API_KEY }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts
app.get('/api/alerts', (req, res) => {
  res.json(state.alerts);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Bot Dashboard', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════╗
║  🤖 BOT DASHBOARD                         ║
╠═══════════════════════════════════════════╣
║  📡 Port: ${PORT}                             ║
║  🌐 URL: http://localhost:${PORT}            ║
║  🔄 Updates: Every 10 seconds               ║
╚═══════════════════════════════════════════╝
  `);
});
