import { Config, CaptureRequest, PendingCapture } from '../shared/types';

// Type declarations for window.electron
declare global {
  interface Window {
    electron: {
      getConfig: () => Promise<Config | undefined>;
      saveConfig: (config: Config) => Promise<{ success: boolean }>;
      hideWindow: () => Promise<{ success: boolean }>;
      showNotification: (options: { title: string; body: string }) => Promise<{ success: boolean }>;
    };
  }
}

// Local storage for offline queue
const QUEUE_KEY = 'mindhive-pending-captures';

class CaptureApp {
  private config: Config | null = null;
  private currentAttachment: { data: string; type: string } | null = null;
  private pendingQueue: PendingCapture[] = [];

  constructor() {
    this.init();
  }

  async init() {
    console.log('CaptureApp initializing...');
    console.log('window.electron available?', !!window.electron);

    await this.loadConfig();
    this.setupEventListeners();
    this.loadQueue();
    this.updateQueueUI();

    if (this.config) {
      this.showCaptureScreen();
      this.checkOnlineStatus();
    } else {
      this.showConfigScreen();
    }
  }

  async loadConfig() {
    this.config = (await window.electron.getConfig()) || null;
  }

  loadQueue() {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (stored) {
      try {
        this.pendingQueue = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load queue:', e);
        this.pendingQueue = [];
      }
    }
  }

  saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.pendingQueue));
    this.updateQueueUI();
  }

  setupEventListeners() {
    // Config screen
    document.getElementById('save-config-btn')?.addEventListener('click', () => this.saveConfig());

    // Capture screen
    document.getElementById('capture-btn')?.addEventListener('click', () => this.submitCapture());
    document.getElementById('close-btn')?.addEventListener('click', () => this.hideWindow());
    document.getElementById('remove-attachment')?.addEventListener('click', () => this.removeAttachment());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideWindow();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        this.submitCapture();
      }
    });

    // Drag and drop
    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        this.handleDrop(e);
      });
    }

    // Paste support
    document.addEventListener('paste', (e) => {
      this.handlePaste(e);
    });

    // Retry queue periodically
    setInterval(() => {
      if (this.pendingQueue.length > 0) {
        this.processQueue();
      }
    }, 30000); // Every 30 seconds
  }

  async saveConfig() {
    console.log('saveConfig called');
    const endpoint = (document.getElementById('api-endpoint') as HTMLInputElement).value.trim();
    const apiKey = (document.getElementById('api-key') as HTMLInputElement).value.trim();

    console.log('Endpoint:', endpoint, 'API Key length:', apiKey.length);

    if (!endpoint || !apiKey) {
      alert('Please fill in all fields');
      return;
    }

    if (!window.electron) {
      console.error('window.electron is not available!');
      alert('App initialization error - check console');
      return;
    }

    console.log('Saving config...');
    this.config = { apiEndpoint: endpoint, apiKey };
    await window.electron.saveConfig(this.config);

    console.log('Config saved, showing capture screen');
    this.showCaptureScreen();
    this.checkOnlineStatus();
  }

  showConfigScreen() {
    document.getElementById('config-screen')?.classList.remove('hidden');
    document.getElementById('capture-screen')?.classList.add('hidden');
  }

  showCaptureScreen() {
    document.getElementById('config-screen')?.classList.add('hidden');
    document.getElementById('capture-screen')?.classList.remove('hidden');
    this.focusInput();
  }

  focusInput() {
    setTimeout(() => {
      const input = document.getElementById('capture-input') as HTMLTextAreaElement;
      input?.focus();
    }, 100);
  }

  hideWindow() {
    window.electron.hideWindow();
  }

  async checkOnlineStatus() {
    if (!this.config) return;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/api/capture`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`
        }
      });

      if (response.ok) {
        this.setStatus('online', 'Ready');
        this.processQueue(); // Try to sync pending
      } else {
        this.setStatus('offline', 'API Error');
      }
    } catch (error) {
      this.setStatus('offline', 'Offline');
    }
  }

  setStatus(type: 'online' | 'offline' | 'sending', text: string) {
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');

    if (indicator) {
      indicator.className = `status-indicator ${type}`;
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  handleDrop(e: DragEvent) {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          this.handleFile(file);
        }
        break;
      }
    }
  }

  async handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('Only images are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      this.currentAttachment = { data, type: file.type };
      this.showAttachmentPreview(data);
    };
    reader.readAsDataURL(file);
  }

  showAttachmentPreview(dataUrl: string) {
    const preview = document.getElementById('attachment-preview');
    const img = document.getElementById('preview-image') as HTMLImageElement;

    if (preview && img) {
      img.src = dataUrl;
      preview.classList.remove('hidden');
    }
  }

  removeAttachment() {
    this.currentAttachment = null;
    const preview = document.getElementById('attachment-preview');
    if (preview) {
      preview.classList.add('hidden');
    }
  }

  async submitCapture() {
    const input = document.getElementById('capture-input') as HTMLTextAreaElement;
    const content = input.value.trim();

    if (!content && !this.currentAttachment) {
      return;
    }

    // Build capture content
    let captureContent = content;
    if (this.currentAttachment) {
      // Embed image as markdown
      captureContent += `\n\n![Image](${this.currentAttachment.data})`;
    }

    const capture: PendingCapture = {
      id: this.generateId(),
      content: captureContent,
      source: 'desktop',
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    // Queue first
    this.pendingQueue.push(capture);
    this.saveQueue();

    // Try to send immediately
    this.setStatus('sending', 'Sending...');
    const success = await this.sendCapture(capture);

    if (success) {
      // Remove from queue
      this.pendingQueue = this.pendingQueue.filter((c) => c.id !== capture.id);
      this.saveQueue();

      // Clear UI
      input.value = '';
      this.removeAttachment();

      // Show success
      this.setStatus('online', 'Captured!');
      window.electron.showNotification({
        title: 'Capture Saved',
        body: 'Your capture was sent to Mindhive'
      });

      setTimeout(() => {
        this.setStatus('online', 'Ready');
        this.focusInput();
      }, 1500);
    } else {
      // Stay in queue, will retry later
      this.setStatus('offline', 'Queued');
      window.electron.showNotification({
        title: 'Capture Queued',
        body: 'Will sync when connection is restored'
      });

      // Still clear UI so user can continue
      input.value = '';
      this.removeAttachment();

      setTimeout(() => {
        this.focusInput();
      }, 500);
    }
  }

  async sendCapture(capture: PendingCapture): Promise<boolean> {
    if (!this.config) return false;

    try {
      const payload: CaptureRequest = {
        content: capture.content,
        source: 'desktop',
        clientId: capture.id
      };

      const response = await fetch(`${this.config.apiEndpoint}/api/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send capture:', error);
      return false;
    }
  }

  async processQueue() {
    if (this.pendingQueue.length === 0) return;

    const toProcess = [...this.pendingQueue];
    let syncedCount = 0;

    for (const capture of toProcess) {
      if (capture.retryCount >= 3) {
        // Give up after 3 retries
        this.pendingQueue = this.pendingQueue.filter((c) => c.id !== capture.id);
        continue;
      }

      const success = await this.sendCapture(capture);
      if (success) {
        this.pendingQueue = this.pendingQueue.filter((c) => c.id !== capture.id);
        syncedCount++;
      } else {
        // Increment retry count
        const index = this.pendingQueue.findIndex((c) => c.id === capture.id);
        if (index >= 0) {
          this.pendingQueue[index].retryCount++;
        }
      }
    }

    this.saveQueue();

    if (syncedCount > 0) {
      window.electron.showNotification({
        title: 'Captures Synced',
        body: `${syncedCount} queued capture(s) sent to Mindhive`
      });
    }
  }

  updateQueueUI() {
    const queueInfo = document.getElementById('queue-info');
    const queueCount = document.getElementById('queue-count');

    if (queueInfo && queueCount) {
      if (this.pendingQueue.length > 0) {
        queueCount.textContent = this.pendingQueue.length.toString();
        queueInfo.classList.remove('hidden');
      } else {
        queueInfo.classList.add('hidden');
      }
    }
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Initialize app
new CaptureApp();
