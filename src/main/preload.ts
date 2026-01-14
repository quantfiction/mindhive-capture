import { contextBridge, ipcRenderer } from 'electron';
import { Config } from '../shared/types';

contextBridge.exposeInMainWorld('electron', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: Config) => ipcRenderer.invoke('save-config', config),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showNotification: (options: { title: string; body: string }) =>
    ipcRenderer.invoke('show-notification', options)
});
