#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "==========================================================="
echo "⚡ UOR-R4 Sovereign AI Studio & Geometric Engine ⚡"
echo "==========================================================="

MODE="${1:-web}"

# Ensure dist/index.html is synchronized with index.html
mkdir -p "$DIR/dist"
cp "$DIR/index.html" "$DIR/dist/index.html"

# Ensure native Rust release binary is compiled
if [ ! -f "$DIR/target/release/uor_server" ]; then
    echo "🔨 Compiling native Rust release binary (uor_server)..."
    cargo build --release --bin uor_server
fi

if [ "$MODE" == "desktop" ] || [ "$MODE" == "tauri" ]; then
    echo "🦀 Launching Native Tauri v2 Sovereign Desktop Studio..."
    cargo run --release --manifest-path "$DIR/src-tauri/Cargo.toml"
elif [ "$MODE" == "server" ] || [ "$MODE" == "--server" ]; then
    echo "🚀 Starting UOR-R4 Headless API Server on http://0.0.0.0:8000..."
    exec "$DIR/target/release/uor_server"
else
    # Default: Web Studio Mode
    echo "🚀 [1/2] Starting UOR-R4 Sovereign Engine & Web Server..."
    "$DIR/target/release/uor_server" &
    SERVER_PID=$!

    cleanup() {
        echo ""
        echo "🛑 Shutting down UOR-R4 server (PID: $SERVER_PID)..."
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
        echo "✨ Clean shutdown complete."
    }
    trap cleanup EXIT INT TERM

    echo "⏳ [2/2] Waiting for server to become ready on http://localhost:8000..."
    READY=0
    for i in {1..20}; do
        if curl -s "http://127.0.0.1:8000/health" | grep -q "healthy"; then
            READY=1
            echo "✅ Sovereign Web Studio is live at: http://localhost:8000"
            break
        fi
        sleep 0.5
    done

    # Open default browser on macOS/Linux
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:8000"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:8000"
    fi

    echo "🌐 Studio running in foreground. Press Ctrl+C to stop."
    wait "$SERVER_PID"
fi


