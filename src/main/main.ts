import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, nativeImage, Notification } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { Config } from '../shared/types';

const store = new Store<{ config?: Config }>();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    transparent: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Center window when shown
  mainWindow.on('show', () => {
    mainWindow?.center();
  });

  mainWindow.on('blur', () => {
    // Don't hide immediately - let user interact
  });
}

function createTray() {
  // Create a simple tray icon (we'll use a colored square for now)
  const trayIcon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGGSURBVFiF7ZYxT8MwEIW/S5qGgSExMLCzIvEDYGBgYWJg6MjKwsDOysbGwsDAwsDGxMDGT2BgYUJiQKIVKu04TuskbZpU4pNOse5833tnOzsAh8MxHAiwKjKwB8wDU8AY8AG8Aq/AObBft0EBeAAyoMt/aVjzrAsswDnQq/GpW2Cxij8FUmBUw5diaaW8gYUcWK/ha/EGZuRnSfl+4E3ijzpqCazJ/GcEOwzMyvwaeJD4046ahUANgYX/BFawJvPPNeKvZX5G5u86/UEJrED1RLJw0vDXE8hrrg3A9xgF4E2QBTa90AscAs/AO3AIPEnsMDAB3AOzeY2dwJUXugZm5HsMvACXwEGFKVlh3Y1GRs6AR1m7L/O81ErgEpgUgxnggvK3paxHsEPyIM9sMf8EThqYkgk2RaVbxW/LGp88gm0uBybFvE4RrEofCKzLWs8Ga3IUzJRYm5S1ReCjiq+Cb+G/jGBPcV2hPwwO5KtJgZP/MqzJrwKLwBz2TqTAjfzfV+m8w+FwDJsfwKKEaKNQk58AAAAASUVORK5CYII='
  );

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Capture',
      click: () => {
        showWindow();
      }
    },
    {
      label: 'Settings',
      click: () => {
        // TODO: Open settings window
        console.log('Settings clicked');
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Mindhive Capture');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    showWindow();
  });
}

function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global shortcut
  const shortcut = process.platform === 'darwin' ? 'Command+Shift+Space' : 'Control+Shift+Space';
  const registered = globalShortcut.register(shortcut, () => {
    showWindow();
  });

  if (!registered) {
    console.error('Failed to register global shortcut');
  }

  // IPC handlers
  ipcMain.handle('get-config', () => {
    return store.get('config');
  });

  ipcMain.handle('save-config', (_, config: Config) => {
    store.set('config', config);
    return { success: true };
  });

  ipcMain.handle('hide-window', () => {
    hideWindow();
    return { success: true };
  });

  ipcMain.handle('show-notification', (_, options: { title: string; body: string }) => {
    new Notification({
      title: options.title,
      body: options.body
    }).show();
    return { success: true };
  });
});

app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
  // Don't quit on window close - keep running in tray
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
