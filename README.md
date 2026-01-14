# Mindhive Capture

A lightweight cross-platform desktop app for quickly capturing thoughts, images, and links into your Mindhive system.

## Features

- **Universal Capture**: Text, images, links - just paste or drop them in
- **Global Hotkey**: Instant access from anywhere
  - **macOS**: `Cmd+Shift+Space`
  - **Linux**: `Ctrl+Shift+Space`
- **System Tray**: Always accessible, stays out of the way
- **Offline Queue**: Captures are queued locally and synced when online
- **Image Support**: Paste from clipboard or drag-and-drop
- **Clean & Fast**: Minimal UI, optimized for speed

## Installation

### Prerequisites

- Node.js 18+ and npm
- Your Mindhive instance running (local or hosted)
- API key or auth token from your Mindhive setup

### Setup

1. **Clone and install:**
   ```bash
   cd /home/ubuntu/repositories/mindhive-capture
   npm install
   ```

2. **Development mode:**
   ```bash
   npm run dev
   ```

3. **Build for your platform:**

   **macOS:**
   ```bash
   npm run package:mac
   ```

   **Linux:**
   ```bash
   npm run package:linux
   ```

   **Both:**
   ```bash
   npm run package:all
   ```

4. **Install the built app:**
   - Find the built package in `dist-build/`
   - **macOS**: Open the `.dmg` and drag to Applications
   - **Linux**: Install the `.AppImage` or `.deb` package

## Configuration

When you first launch the app, you'll need to configure:

1. **API Endpoint**: Your Mindhive URL
   - Local: `http://localhost:3000`
   - Hosted: `https://your-domain.com`

2. **API Key**: Your authentication token
   - Use `AUTH_TOKEN` from your Mindhive `.env`
   - Or use `CAPTURE_API_KEY` if you set one up

The config is stored locally and persists across sessions.

## Usage

### Opening the Capture Window

1. **Global Hotkey**: Press `Cmd+Shift+Space` (Mac) or `Ctrl+Shift+Space` (Linux)
2. **System Tray**: Click the Mindhive icon in your menu bar/tray

### Capturing Content

**Text Capture:**
- Type your thought in the text area
- Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Linux) to capture
- Or click the "Capture" button

**Image Capture:**
- **Paste**: Copy an image and paste it (`Cmd+V` / `Ctrl+V`)
- **Drag & Drop**: Drag an image file into the window
- Add optional text before capturing

**Links:**
- Just paste the URL into the text field
- Add notes or context around it
- The capture agent will process it appropriately

### Offline Mode

When offline:
- Captures are queued locally
- A yellow banner shows pending count
- Auto-syncs when connection restores
- Maximum 3 retry attempts per capture

### Hiding the Window

- Press `Esc` to hide (doesn't quit)
- Click the `×` button
- App stays in system tray

### Quitting

Right-click the tray icon and select "Quit"

## Project Structure

```
mindhive-capture/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # App initialization, tray, shortcuts
│   │   └── preload.ts  # IPC bridge
│   ├── renderer/       # UI (frontend)
│   │   ├── index.html  # Main window
│   │   ├── styles.css  # Styling
│   │   └── renderer.ts # UI logic & API calls
│   └── shared/         # Shared types
│       └── types.ts
├── assets/             # Icons (to be added)
├── dist/               # Compiled TypeScript
├── dist-build/         # Built packages
└── package.json
```

## Development

### Scripts

- `npm run dev` - Start in development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer only
- `npm run package:mac` - Package for macOS
- `npm run package:linux` - Package for Linux

### Architecture

**Main Process** (`src/main/main.ts`):
- Creates the capture window (frameless, always-on-top)
- Registers global shortcuts
- Manages system tray
- Handles IPC communication

**Renderer Process** (`src/renderer/renderer.ts`):
- Captures user input (text, images, links)
- Manages offline queue in localStorage
- Submits to Mindhive `/api/capture` endpoint
- Auto-retries failed captures

**IPC Bridge** (`src/main/preload.ts`):
- Secure context bridge between renderer and main
- Exposes: `getConfig`, `saveConfig`, `hideWindow`, `showNotification`

## API Integration

The app sends captures to your Mindhive instance via:

**Endpoint:** `POST /api/capture`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your-api-key}
```

**Payload:**
```json
{
  "content": "Your capture text",
  "source": "desktop",
  "clientId": "unique-id-for-idempotency"
}
```

Images are embedded as base64 data URLs in the content (Markdown format).

## Troubleshooting

**Global shortcut not working:**
- Check if another app is using the same shortcut
- Try quitting and restarting the app
- On Linux, ensure you have proper X11/Wayland permissions

**"Offline" status always showing:**
- Check your API endpoint URL (no trailing slash)
- Verify your API key is correct
- Ensure your Mindhive instance is running
- Check CORS settings if hosted remotely

**Captures not syncing:**
- Open the app to trigger sync
- Check browser dev tools (Help → Toggle Developer Tools)
- Look for network errors in console

**App won't start on Linux:**
- Ensure you have `libgtk-3-0` installed
- For AppImage: `chmod +x Mindhive-Capture.AppImage`
- Try the `.deb` package instead

## Customization

### Change Keyboard Shortcut

Edit `src/main/main.ts` line 73:
```typescript
const shortcut = process.platform === 'darwin'
  ? 'Command+Shift+Space'  // Change this
  : 'Control+Shift+Space'; // Or this
```

### Add Custom Icon

Replace placeholder icons in `assets/`:
- `icon.icns` - macOS icon (512x512)
- `icon.png` - Linux icon (512x512)

Generate from SVG/PNG using:
- macOS: `iconutil` or Image2Icon
- Linux: Use PNG directly

## License

MIT

## Contributing

This is a personal tool, but feel free to fork and customize for your needs!
