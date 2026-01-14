# Quick Start Guide

## First Time Setup

1. **Install dependencies** (if not done already):
   ```bash
   npm install
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Start in development mode**:
   ```bash
   npm run dev
   ```

4. **Configure on first launch**:
   - The app will open showing a config screen
   - Enter your Mindhive API endpoint:
     - Local development: `http://localhost:3000`
     - Production: `https://your-mindhive-domain.com`
   - Enter your API key (found in your Mindhive `.env` as `AUTH_TOKEN` or `CAPTURE_API_KEY`)
   - Click "Save & Start"

5. **Test it out**:
   - Type a test capture
   - Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Linux)
   - Check your Mindhive inbox for the capture

## Daily Usage

Once installed, the app runs in your system tray.

**Open capture window:**
- Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Linux) from anywhere
- Or click the tray icon

**Capture something:**
- Type text, paste an image, or drop a file
- Press `Cmd+Enter` or click "Capture"
- Window clears and stays open for next capture

**Hide window:**
- Press `Esc`
- Or click the `×` button

**Quit app:**
- Right-click tray icon → Quit

## Building for Distribution

### macOS

```bash
npm run package:mac
```

Outputs:
- `dist-build/Mindhive Capture-1.0.0.dmg` - Installer
- `dist-build/Mindhive Capture-1.0.0-mac.zip` - Portable

### Linux (Ubuntu)

```bash
npm run package:linux
```

Outputs:
- `dist-build/Mindhive Capture-1.0.0.AppImage` - Portable (recommended)
- `dist-build/mindhive-capture_1.0.0_amd64.deb` - Debian package

**To run AppImage:**
```bash
chmod +x dist-build/Mindhive*.AppImage
./dist-build/Mindhive*.AppImage
```

**To install .deb:**
```bash
sudo dpkg -i dist-build/mindhive-capture_*.deb
```

## Troubleshooting

**Build fails on macOS:**
- You may need Xcode Command Line Tools: `xcode-select --install`

**Build fails on Linux:**
- Install required libs: `sudo apt-get install libgtk-3-dev libwebkit2gtk-4.0-dev`

**App won't start:**
- Check terminal output for errors
- Try `npm run dev` to see detailed logs

**Keyboard shortcut not working:**
- Make sure no other app is using `Cmd+Shift+Space` / `Ctrl+Shift+Space`
- Check system permissions (macOS: System Settings → Privacy → Accessibility)

**"Offline" always shows:**
- Verify API endpoint URL (no trailing slash)
- Check API key is correct
- Ensure Mindhive is running: `curl http://localhost:3000/api/capture`

## Development Tips

**Hot reload:**
```bash
npm run dev
```
Changes to TypeScript files will auto-rebuild.

**Debug renderer:**
- When app is open, go to View → Toggle Developer Tools
- Or add this to `main.ts`: `mainWindow.webContents.openDevTools()`

**Test without building:**
```bash
npm run watch:main & npm run watch:renderer & npm run start:electron
```

**Clean rebuild:**
```bash
rm -rf dist dist-build node_modules
npm install
npm run build
```

## Next Steps

- Customize keyboard shortcut in `src/main/main.ts`
- Add your own app icon in `assets/`
- Adjust window size in `src/main/main.ts` (width/height)
- Tweak UI colors in `src/renderer/styles.css`
