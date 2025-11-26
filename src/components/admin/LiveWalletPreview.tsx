import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, WifiOff, Wifi, Chrome, ScanSearch, Palette } from 'lucide-react';
import { LiveWalletControls } from './LiveWalletControls';

interface LiveWalletPreviewProps {
  walletType: 'metamask' | 'phantom';
  onClose?: () => void;
}

export const LiveWalletPreview: React.FC<LiveWalletPreviewProps> = ({
  walletType,
  onClose
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [domHtml, setDomHtml] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🟢 Connected to CDP Bridge');
      setIsConnected(true);
      setError(null);
      addLog('Connected to CDP Bridge Server');
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Disconnected from CDP Bridge');
      setIsConnected(false);
      addLog('Disconnected from CDP Bridge Server');
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Connection error:', err);
      setError('Cannot connect to CDP Bridge Server. Make sure it\'s running on localhost:4000');
      setIsConnected(false);
    });

    // CDP Bridge events
    newSocket.on('log', (message: string) => {
      console.log('[CDP Bridge]', message);
      addLog(message);
    });

    newSocket.on('domSnapshot', (payload: { html: string }) => {
      console.log('📄 DOM Snapshot received');
      setDomHtml(payload.html);
      addLog(`DOM snapshot received (${payload.html.length} chars)`);
    });

    newSocket.on('screenshot', (payload: { dataUrl: string }) => {
      console.log('📸 Screenshot received');
      setScreenshot(payload.dataUrl);
      addLog('Screenshot received');
      setIsLoading(false);
    });

    newSocket.on('themeApplied', (payload: { ok: boolean; error?: string }) => {
      if (payload.ok) {
        console.log('✅ Theme applied successfully');
        addLog('Theme applied successfully');
        // Re-scan to see changes
        setTimeout(() => handleScanDom(), 500);
      } else {
        console.error('❌ Theme apply failed:', payload.error);
        addLog(`Theme apply failed: ${payload.error}`);
      }
      setIsLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-20));
  };

  const handleStartChrome = () => {
    if (!socket || !isConnected) {
      setError('Not connected to CDP Bridge');
      return;
    }

    setIsLoading(true);
    addLog(`Starting Chrome with ${walletType}...`);
    socket.emit('startChrome', { walletType });

    // Wait for Chrome to start
    setTimeout(() => {
      setIsLoading(false);
      addLog('Chrome started. Ready to scan.');
    }, 3000);
  };

  const handleScanDom = () => {
    if (!socket || !isConnected) {
      setError('Not connected to CDP Bridge');
      return;
    }

    setIsLoading(true);
    addLog('Scanning DOM and capturing screenshot...');
    socket.emit('scanDom');
  };

  const handleApplyTheme = (cssRules: string[]) => {
    if (!socket || !isConnected) {
      setError('Not connected to CDP Bridge');
      return;
    }

    setIsLoading(true);
    addLog(`Applying theme (${cssRules.length} rules)...`);
    socket.emit('applyTheme', { cssRules });
  };

  // Draw screenshot on canvas
  useEffect(() => {
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 600;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = screenshot;
    }
  }, [screenshot]);

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Left: Preview Canvas */}
      <Card className="bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-5 w-5" />
              {walletType === 'metamask' ? 'MetaMask' : 'Phantom'} Live Preview
            </CardTitle>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Connection Instructions */}
          {!isConnected && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">CDP Bridge Server not running</p>
                  <p className="text-sm">To connect:</p>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Navigate to CDP Bridge folder</li>
                    <li>Run: <code className="bg-muted px-1 rounded">node server.js</code></li>
                    <li>Server should start on localhost:4000</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleStartChrome}
              disabled={!isConnected || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Chrome className="h-4 w-4 mr-2" />
                  Start Chrome
                </>
              )}
            </Button>
            <Button
              onClick={handleScanDom}
              disabled={!isConnected || isLoading}
              variant="outline"
            >
              <ScanSearch className="h-4 w-4 mr-2" />
              Scan DOM
            </Button>
          </div>

          {/* Canvas Preview */}
          <div className="relative bg-muted/20 rounded-lg p-4 flex items-center justify-center min-h-[600px]">
            {screenshot ? (
              <canvas
                ref={canvasRef}
                className="border border-border rounded-lg shadow-lg"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Chrome className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>No preview available</p>
                <p className="text-sm mt-2">Click "Start Chrome" and then "Scan DOM"</p>
              </div>
            )}
          </div>

          {/* Logs */}
          <Card className="bg-muted/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">No activity yet...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-muted-foreground">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Right: Theme Controls */}
      <Card className="bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveWalletControls
            onApplyTheme={handleApplyTheme}
            disabled={!isConnected || !screenshot}
          />
        </CardContent>
      </Card>
    </div>
  );
};
