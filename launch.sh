#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "==========================================================="
echo "⚡ UOR-R4 Geometric Engine + Nous Research Hermes Desktop ☤"
echo "==========================================================="

# 1. Start Local UOR-R4 API Server in background
echo "🚀 [1/3] Starting UOR-R4 FastAPI Server (GLM-5.3 Substrate)..."
"$DIR/server/.venv/bin/python" "$DIR/server/app.py" &
SERVER_PID=$!

cleanup() {
    echo ""
    echo "🛑 Shutting down UOR-R4 server (PID: $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    echo "✨ Clean shutdown complete."
}
trap cleanup EXIT INT TERM

# 2. Wait for server to become healthy
echo "⏳ [2/3] Waiting for API server to become ready on http://127.0.0.1:8000/v1..."
READY=0
for i in {1..20}; do
    if curl -s "http://127.0.0.1:8000/health" | grep -q "healthy"; then
        READY=1
        echo "✅ API Server is live and healthy!"
        break
    fi
    sleep 1
done

if [ "$READY" -ne 1 ]; then
    echo "⚠️ Server took longer than expected to start, proceeding to launch..."
fi

# 3. Configure Hermes Environment
export HERMES_HOME="$DIR/.hermes"
export HERMES_DESKTOP_PYTHON="$DIR/hermes-agent/.venv/bin/python"
export HERMES_DESKTOP_HERMES_ROOT="$DIR/hermes-agent"
export OPENAI_BASE_URL="http://127.0.0.1:8000/v1"
export OPENAI_API_KEY="uor-local"
export MODEL_NAME="qwen2.5-0.5b"

# 4. Launch Hermes Desktop GUI
echo "🖥️  [3/3] Launching Hermes Desktop App connected to Qwen 2.5 / GLM-5.3..."
cd "$DIR/hermes-agent/apps/desktop"
npm run dev

