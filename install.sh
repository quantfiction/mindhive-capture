#!/bin/bash
set -e

echo "🚀 Mindhive Capture Installer"
echo ""

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
    echo "Detected: macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
    echo "Detected: Linux"
else
    echo "❌ Unsupported platform: $OSTYPE"
    exit 1
fi

# Check if we're in the repo or need to clone
if [[ -f "package.json" ]] && grep -q "mindhive-capture" package.json; then
    echo "✓ Already in mindhive-capture directory"
    REPO_DIR="."
else
    echo "📦 Cloning repository..."
    if [[ -d "mindhive-capture" ]]; then
        echo "Directory exists, pulling latest..."
        cd mindhive-capture
        git pull
        REPO_DIR="."
    else
        git clone https://github.com/quantfiction/mindhive-capture.git
        cd mindhive-capture
        REPO_DIR="."
    fi
fi

cd "$REPO_DIR"

# Install dependencies
echo ""
echo "📚 Installing dependencies..."
npm install

# Build
echo ""
echo "🔨 Building app..."
npm run build

# Package
echo ""
echo "📦 Packaging for $PLATFORM..."
if [[ "$PLATFORM" == "mac" ]]; then
    npm run package:mac

    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📍 Your app is ready at:"
    echo "   $(pwd)/dist-build/Mindhive Capture-1.0.0.dmg"
    echo ""
    echo "To install:"
    echo "   open 'dist-build/Mindhive Capture-1.0.0.dmg'"
    echo "   Drag to Applications folder"

elif [[ "$PLATFORM" == "linux" ]]; then
    npm run package:linux

    APPIMAGE="$(pwd)/dist-build/Mindhive Capture-1.0.0.AppImage"
    chmod +x "$APPIMAGE"

    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📍 Your app is ready at:"
    echo "   $APPIMAGE"
    echo ""
    echo "To run:"
    echo "   '$APPIMAGE'"
    echo ""
    echo "Or move to your applications:"
    echo "   mv '$APPIMAGE' ~/.local/bin/mindhive-capture"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Launch the app"
echo "2. Configure your Mindhive endpoint and API key"
echo "3. Press Cmd+Shift+Space (Mac) or Ctrl+Shift+Space (Linux) to capture"
