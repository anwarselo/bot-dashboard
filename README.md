# Bot Dashboard

Unified Bot Dashboard for monitoring Supervisor, Rex, Tasks, and Knowledge Graph.

## Features

- **Real-time Monitoring**: WebSocket-powered live updates
- **Multi-Bot Support**: Monitor Supervisor and Rex simultaneously
- **Task Management**: View and track tasks with priorities and due dates
- **Knowledge Graph Stats**: Visualize graph nodes and relationships
- **Alert System**: Real-time notifications and alerts
- **Express + Socket.IO**: Built with Node.js, Express, and Socket.IO

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start the dashboard
npm start
# OR
node server.js

# Dashboard will be available at http://localhost:3000
```

### Environment Variables

```bash
SUPERVISOR_API=http://localhost:9800
SUPERVISOR_API_KEY=supervisor-token-1769976836
DASHBOARD_PORT=3000
```

## Vercel Deployment

### Option 1: Import from GitHub

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import repository: `https://github.com/anwarselo/bot-dashboard`
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
   - **Root Directory**: `./`
4. Add Environment Variables:
   ```
   SUPERVISOR_API = http://localhost:9800
   SUPERVISOR_API_KEY = supervisor-token-1769976836
   DASHBOARD_PORT = 3000
   ```
5. Click **Deploy**

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

## API Endpoints

- `GET /` - Dashboard UI
- `GET /api/status` - Get all bot statuses
- `GET /api/tasks` - Get all tasks
- `GET /api/kg-stats` - Get knowledge graph statistics
- WebSocket `/` - Real-time updates

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web server
- **Socket.IO** - WebSocket communication
- **Axios** - HTTP client
- **Helmet** - Security headers
- **Express Session** - Session management

## License

MIT

## Author

TheSupervisor

---

**GitHub Repository**: https://github.com/anwarselo/bot-dashboard
