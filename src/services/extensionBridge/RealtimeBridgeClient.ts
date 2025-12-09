/**
 * Realtime Bridge Client
 * 
 * Клиент для Extension Bridge, работающий через Supabase Edge Function.
 * Не требует локального WebSocket сервера!
 * 
 * Использует HTTP polling + Supabase Realtime для коммуникации.
 */

import { supabase } from '@/integrations/supabase/client';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import type { ExtensionUISnapshot } from '@/stores/aiScannerStore';

// Supabase credentials
const SUPABASE_URL = 'https://opxordptvpvzmhakvdde.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weG9yZHB0dnB2em1oYWt2ZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTY2NjgsImV4cCI6MjA2MjI5MjY2OH0.uHDqEycZqhQ02zMvmikDjMXsqeVU792Ei61ceavk6iw';

// Edge Function URL
const getEdgeFunctionUrl = () => `${SUPABASE_URL}/functions/v1/extension-bridge`;

// Common headers for Edge Function calls
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
});

export interface RealtimeBridgeState {
  isConnected: boolean;
  extensionName: string | null;
  extensionVersion: string | null;
  lastSnapshotAt: number | null;
  lastError: string | null;
}

class RealtimeBridgeClient {
  private pollingInterval: NodeJS.Timeout | null = null;
  private realtimeChannel: any = null;
  private state: RealtimeBridgeState = {
    isConnected: false,
    extensionName: null,
    extensionVersion: null,
    lastSnapshotAt: null,
    lastError: null,
  };
  
  private listeners: Set<(state: RealtimeBridgeState) => void> = new Set();
  
  /**
   * Подключиться к Extension Bridge через Edge Function
   */
  async connect(): Promise<boolean> {
    const store = useAiScannerStore.getState();
    const url = getEdgeFunctionUrl();
    
    console.log(`[RealtimeBridge] 🔌 Connecting to ${url}...`);
    store.addLog('scanning', '🟢', `Connecting to extension bridge: ${url}`);
    
    try {
      // Test connection with GET request
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[RealtimeBridge] ✅ Connected, initial state:', data);
      
      this.state.isConnected = true;
      this.state.lastError = null;
      
      // Check if extension already connected
      if (data.extensions && data.extensions.length > 0) {
        const ext = data.extensions[0];
        this.state.extensionName = ext.name;
        this.state.extensionVersion = ext.version;
        store.addLog('verified', '✅', `Extension already connected: ${ext.name} v${ext.version}`);
        store.setWalletConnected(true);
      }
      
      // Check for existing snapshot
      if (data.hasSnapshot && data.snapshot) {
        this.handleSnapshot(data.lastSnapshotFrom, data.snapshot);
      }
      
      // Start polling for updates
      this.startPolling();
      
      // Subscribe to Supabase Realtime channel for instant updates
      this.subscribeToRealtime();
      
      store.addLog('verified', '✅', 'Connected to extension bridge server');
      store.updateWsMetrics({ isConnected: true });
      store.updateBridgeConnection({ isConnected: true });
      
      this.notifyListeners();
      return true;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[RealtimeBridge] ❌ Connection failed:', errorMsg);
      
      this.state.isConnected = false;
      this.state.lastError = errorMsg;
      
      store.addLog('error', '❌', `Extension bridge error: ${errorMsg}`);
      store.updateBridgeConnection({ isConnected: false });
      
      this.notifyListeners();
      return false;
    }
  }
  
  /**
   * Отключиться от bridge
   */
  disconnect(): void {
    console.log('[RealtimeBridge] Disconnecting...');
    
    this.stopPolling();
    this.unsubscribeFromRealtime();
    
    this.state = {
      isConnected: false,
      extensionName: null,
      extensionVersion: null,
      lastSnapshotAt: null,
      lastError: null,
    };
    
    const store = useAiScannerStore.getState();
    store.updateWsMetrics({ isConnected: false });
    store.updateBridgeConnection({ isConnected: false });
    
    this.notifyListeners();
  }
  
  /**
   * Получить текущее состояние
   */
  getState(): RealtimeBridgeState {
    return { ...this.state };
  }
  
  /**
   * Проверить подключение
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }
  
  /**
   * Проверить, подключено ли расширение
   */
  isExtensionConnected(): boolean {
    return this.state.extensionName !== null;
  }
  
  /**
   * Запросить снапшот (trigger poll)
   */
  async requestSnapshot(): Promise<void> {
    await this.pollForUpdates();
  }
  
  /**
   * Подписаться на изменения состояния
   */
  subscribe(listener: (state: RealtimeBridgeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // === Private Methods ===
  
  private startPolling(): void {
    this.stopPolling();
    
    // Poll every 2 seconds for updates
    this.pollingInterval = setInterval(() => {
      this.pollForUpdates();
    }, 2000);
    
    console.log('[RealtimeBridge] Started polling');
  }
  
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[RealtimeBridge] Stopped polling');
    }
  }
  
  private async pollForUpdates(): Promise<void> {
    if (!this.state.isConnected) return;
    
    try {
      const response = await fetch(getEdgeFunctionUrl(), {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      
      // Check for new extension
      if (data.extensions && data.extensions.length > 0) {
        const ext = data.extensions[0];
        if (this.state.extensionName !== ext.name) {
          this.state.extensionName = ext.name;
          this.state.extensionVersion = ext.version;
          
          const store = useAiScannerStore.getState();
          console.log(`[RealtimeBridge] 🤝 Extension connected: ${ext.name} v${ext.version}`);
          store.addLog('verified', '✅', `Extension connected: ${ext.name} v${ext.version}`);
          store.setWalletConnected(true);
          
          this.notifyListeners();
        }
      }
      
      // Check for new snapshot
      if (data.hasSnapshot && data.lastSnapshotAt !== this.state.lastSnapshotAt) {
        this.handleSnapshot(data.lastSnapshotFrom, data.snapshot);
        this.state.lastSnapshotAt = data.lastSnapshotAt;
      }
      
    } catch (error) {
      // Silent fail for polling
      console.debug('[RealtimeBridge] Poll error:', error);
    }
  }
  
  private handleSnapshot(extension: string, snapshot: any): void {
    const store = useAiScannerStore.getState();
    
    const snapshotSize = JSON.stringify(snapshot).length;
    console.log(`[RealtimeBridge] 📸 Snapshot received from ${extension}, ${snapshotSize} bytes`);
    store.addLog('snapshot', '🔵', `Snapshot: ${extension} (${snapshotSize} bytes)`);
    
    // Convert to ExtensionUISnapshot format
    const uiSnapshot: ExtensionUISnapshot = {
      type: 'EXTENSION_UI_SNAPSHOT',
      extension: extension,
      timestamp: Date.now(),
      screen: snapshot.screen || 'unknown',
      ui: {
        elements: snapshot.elements?.map((el: any) => ({
          id: el.id,
          selector: el.selector,
          tagName: el.tag || el.tagName,
          className: el.classes?.join(' ') || el.className,
          textContent: el.text || el.textContent,
          rect: el.rect,
          styles: el.styles,
        })),
        theme: snapshot.theme,
      },
    };
    
    store.setExtensionSnapshot(uiSnapshot);
    this.notifyListeners();
  }
  
  private subscribeToRealtime(): void {
    // Use Supabase Realtime for instant updates (optional enhancement)
    try {
      this.realtimeChannel = supabase.channel('extension-bridge')
        .on('broadcast', { event: 'snapshot' }, (payload: any) => {
          console.log('[RealtimeBridge] Realtime snapshot:', payload);
          if (payload.payload?.snapshot) {
            this.handleSnapshot(payload.payload.extension, payload.payload.snapshot);
          }
        })
        .on('broadcast', { event: 'hello' }, (payload: any) => {
          console.log('[RealtimeBridge] Realtime hello:', payload);
          if (payload.payload?.extension) {
            this.state.extensionName = payload.payload.extension;
            this.state.extensionVersion = payload.payload.version;
            this.notifyListeners();
          }
        })
        .subscribe();
        
      console.log('[RealtimeBridge] Subscribed to realtime channel');
    } catch (error) {
      console.warn('[RealtimeBridge] Realtime subscription failed:', error);
    }
  }
  
  private unsubscribeFromRealtime(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
  
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }
}

// Singleton instance
export const realtimeBridgeClient = new RealtimeBridgeClient();

// Export the Edge Function URL for extensions to use
export const getExtensionBridgeUrl = getEdgeFunctionUrl;
