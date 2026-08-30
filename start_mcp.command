#!/bin/bash
# UOR-R4 Sovereign AI - Local MCP Bridge 1-Click Launcher (macOS)
cd "$(dirname "$0")"

echo "================================================================"
echo "  ⚡ UOR-R4 Geometric AI - Local MCP Bridge Daemon"
echo "  💻 Local PC Filesystem & Terminal Execution"
echo "  🐙 GitHub Integration (Inherits local 'gh' CLI credentials)"
echo "================================================================"
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not found on PATH. Please install Node.js (https://nodejs.org)."
    read -p "Press Enter to exit..."
    exit 1
fi

# Run bridge daemon
node mcp_bridge.js
