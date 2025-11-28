#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Start Backend Server on port 5005
echo "Starting backend server on port 5005..."
cd "$PROJECT_ROOT/backend"
python3 main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
echo "Backend logs: /tmp/backend.log"

# Start Frontend Server on port 9001
echo "Starting frontend server on port 9001..."
cd "$PROJECT_ROOT/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
echo "Frontend logs: /tmp/frontend.log"

echo ""
echo "✅ Servers are starting..."
echo "📡 Backend: http://localhost:5005"
echo "🌐 Frontend: http://localhost:9001"
echo ""
echo "To stop servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo "Or use: pkill -f 'python3 main.py' and pkill -f 'vite'"



