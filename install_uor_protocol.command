#!/bin/bash
# ==============================================================================
# UOR-R4 Sovereign AI - macOS Browser Protocol Installer
# Registers the custom URL scheme 'uor://start' so clicking "Launch Local Bridge"
# directly inside the web browser spawns the local MCP bridge on demand!
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$PROJECT_DIR/UOR Bridge.app"
NODE_PATH="$(which node 2>/dev/null || echo "/opt/homebrew/bin/node")"

echo "================================================================"
echo "  ⚡ Installing UOR Browser-to-Desktop Protocol Handler..."
echo "  📂 Target Project: $PROJECT_DIR"
echo "  ⚙️  Node Path: $NODE_PATH"
echo "  📦 App Destination: $APP_DIR"
echo "================================================================"

rm -rf "$APP_DIR"

# Create AppleScript runner
APPLESCRIPT_SRC=$(cat <<EOF
on open location this_URL
    do shell script "cd \"$PROJECT_DIR\" && nohup \"$NODE_PATH\" \"$PROJECT_DIR/mcp_bridge.js\" > /dev/null 2>&1 &"
end open location

on run
    do shell script "cd \"$PROJECT_DIR\" && nohup \"$NODE_PATH\" \"$PROJECT_DIR/mcp_bridge.js\" > /dev/null 2>&1 &"
end run
EOF
)

# Compile into macOS Application
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

echo ""
echo "✅ UOR Protocol Handler ('uor://start') successfully registered!"
echo "👉 You can now click '⚡ Launch Local Bridge' directly on the webpage anytime to start the bridge automatically."
echo "💡 The bridge will auto-terminate 60 seconds after your browser tab closes."
echo ""
