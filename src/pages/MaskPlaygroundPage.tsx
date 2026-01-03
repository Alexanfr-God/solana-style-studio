import React from 'react';
import { useWCCAgent } from '@/hooks/useWCCAgent';
import { PlaygroundCanvas } from '@/components/mask-playground/PlaygroundCanvas';
import { PlaygroundControls } from '@/components/mask-playground/PlaygroundControls';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaskPlaygroundPage() {
  const {
    snapshot,
    config,
    setContainer,
    setSafeZone,
    setHighlight,
    setGrid,
    copyJSON,
    downloadJSON,
  } = useWCCAgent({
    containerWidth: 480,
    containerHeight: 480,
    canvasWidth: 1400,
    canvasHeight: 1400,
    safeZone: { padding: 16 },
    highlightEnabled: true,
    gridEnabled: false,
    gridStep: 20,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">WCC Mask Playground</h1>
          <p className="text-xs text-muted-foreground">Version 1 — Step A+B: Agent Core + Canvas</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <div className="inline-block">
            <PlaygroundCanvas config={config} snapshot={snapshot} />
          </div>
        </div>

        {/* Controls Sidebar */}
        <PlaygroundControls
          config={config}
          onContainerChange={setContainer}
          onSafeZoneChange={setSafeZone}
          onHighlightChange={setHighlight}
          onGridChange={setGrid}
          onCopyJSON={copyJSON}
          onDownloadJSON={downloadJSON}
        />
      </div>

      {/* Debug Info */}
      {snapshot && (
        <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg p-3 text-xs font-mono opacity-70 hover:opacity-100 transition-opacity">
          <div className="text-muted-foreground mb-1">Agent Snapshot:</div>
          <div>Container: {snapshot.containerRect.width}×{snapshot.containerRect.height} @ ({snapshot.containerRect.x}, {snapshot.containerRect.y})</div>
          <div>SafeZone: {snapshot.safeRect.width}×{snapshot.safeRect.height}</div>
        </div>
      )}
    </div>
  );
}
