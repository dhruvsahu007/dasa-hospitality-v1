# Agent Support Dashboard Setup

## Overview
The agent support system is now on a **separate webpage** for a professional demo experience. The customer uses the main chat interface while the agent has their own dedicated dashboard.

## How It Works

### Customer Side (Main Website - index.html)
1. Customer clicks the chatbot button (👤)
2. Customer types: "I need an agent" or "connect me to support"
3. AI responds and connects them to agent mode
4. A **green agent button (👨‍💼)** appears on the homepage
5. Customer continues chatting in the same window
6. All customer messages are synced to agent dashboard via localStorage

### Agent Side (Agent Dashboard - agent.html)
1. Click the green agent button or open `/agent.html` in a new tab/window
2. Agent sees a full-page dashboard with:
   - Professional header with connection status
   - Waiting state until customer connects
   - Real-time customer messages
   - Reply interface
3. Agent types responses that appear in customer's chat

## Running the Demo

### Development Mode:
```bash
cd frontend
npm run dev
```

Then open two browser windows:
- **Customer**: http://localhost:3000/
- **Agent**: http://localhost:3000/agent.html

### Testing Flow:
1. Open agent dashboard first (it will show "Waiting for customer")
2. Open main website in another window/tab
3. Click customer chat button
4. Type "I need to speak with an agent"
5. Green agent button appears (optional - dashboard already open)
6. Continue conversation as customer
7. Watch messages appear in agent dashboard
8. Reply as agent - responses appear in customer chat

## Features

✅ **Separate professional dashboards** for customer and agent
✅ **Real-time message sync** using localStorage
✅ **Beautiful animations** and status indicators
✅ **Instructions built-in** to agent dashboard
✅ **Perfect for client demos** - open both windows side-by-side

## Architecture

- **Customer Chat**: Main React app (`App.jsx`)
- **Agent Dashboard**: Separate React app (`Agent.jsx`)  
- **Communication**: localStorage for real-time sync
- **Build**: Vite multi-page application

## Files Created

- `frontend/agent.html` - Agent dashboard entry point
- `frontend/src/Agent.jsx` - Agent dashboard React component
- `frontend/src/Agent.css` - Agent dashboard styles
- `frontend/src/agent-main.jsx` - Agent dashboard React mount point
- `frontend/vite.config.js` - Updated for multi-page build

## URLs

- **Customer Chat**: `/` or `/index.html`
- **Agent Dashboard**: `/agent.html`

Both pages work independently and sync messages automatically!
