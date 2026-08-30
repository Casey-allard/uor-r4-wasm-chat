#!/bin/bash
# ==============================================================================
# UOR-R4 Sovereign AI - macOS 1-Click Protocol & Local MCP Bridge Installer
# ==============================================================================

INSTALL_DIR="$HOME/.uor-mcp"
APP_DIR="$INSTALL_DIR/UOR Bridge.app"
NODE_PATH="$(which node 2>/dev/null || echo "/opt/homebrew/bin/node")"

echo "================================================================"
echo "  ⚡ UOR-R4 Sovereign AI - Local MCP Bridge Installer"
echo "  📦 Destination: $INSTALL_DIR"
echo "  ⚙️  Node Engine: $NODE_PATH"
echo "================================================================"

mkdir -p "$INSTALL_DIR"

# If mcp_bridge.js exists locally next to script, copy it; else download from repo
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/mcp_bridge.js" ]; then
    cp "$SCRIPT_DIR/mcp_bridge.js" "$INSTALL_DIR/mcp_bridge.js"
else
    echo "⬇️  Fetching latest mcp_bridge.js from repository..."
    curl -sSL "https://raw.githubusercontent.com/Casey-allard/uor-r4-wasm-chat/main/mcp_bridge.js" -o "$INSTALL_DIR/mcp_bridge.js"
fi

# Check Node.js
if ! command -v "$NODE_PATH" &> /dev/null && ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js from https://nodejs.org"
    read -p "Press Enter to exit..."
    exit 1
fi

NODE_BIN="$(which node 2>/dev/null || echo "$NODE_PATH")"

rm -rf "$APP_DIR"

# Create AppleScript protocol handler
APPLESCRIPT_SRC=$(cat <<EOF
on open location this_URL
    do shell script "cd \"$HOME\" && nohup \"$NODE_BIN\" \"$INSTALL_DIR/mcp_bridge.js\" > /dev/null 2>&1 &"
end open location

on run
    do shell script "cd \"$HOME\" && nohup \"$NODE_BIN\" \"$INSTALL_DIR/mcp_bridge.js\" > /dev/null 2>&1 &"
end run
EOF
)

echo "$APPLESCRIPT_SRC" | osacompile -o "$APP_DIR"

# Add custom URL scheme 'uor' to Info.plist
PLIST="$APP_DIR/Contents/Info.plist"

if [ -f "$PLIST" ]; then
    /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string 'UOR Protocol'" "$PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string 'uor'" "$PLIST" 2>/dev/null || true
    /usr/libexec/PlistBuddy -c "Set :LSUIElement true" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :LSUIElement bool true" "$PLIST" 2>/dev/null || true
fi

# Register with macOS LaunchServices
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_DIR" 2>/dev/null || true

# Start the bridge right now so browser connects immediately
nohup "$NODE_BIN" "$INSTALL_DIR/mcp_bridge.js" > /dev/null 2>&1 &

echo ""
echo "✅ UOR Protocol Handler ('uor://start') is installed and active!"
echo "🚀 Local MCP Bridge started on localhost:3000"
echo "👉 You can now click '⚡ Launch Local Bridge' directly on the webpage anytime."
echo "💡 The bridge auto-terminates 60 seconds after your browser tab closes."
echo ""
