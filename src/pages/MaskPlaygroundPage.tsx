import React, { useState, useEffect } from 'react';
import { useWCCAgent } from '@/hooks/useWCCAgent';
import { PlaygroundCanvas } from '@/components/mask-playground/PlaygroundCanvas';
import { PlaygroundControls } from '@/components/mask-playground/PlaygroundControls';
import { MaskControls } from '@/components/mask-playground/MaskControls';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MaskConfig, AgentSnapshot } from '@/lib/wcc-agent';

export default function MaskPlaygroundPage() {
  const [maskImageUrl, setMaskImageUrl] = useState<string | null>(null);
  const [maskImageSize, setMaskImageSize] = useState<{ width: number; height: number } | null>(null);
  const [computedSnapshot, setComputedSnapshot] = useState<AgentSnapshot | null>(null);

  const {
    agent,
    snapshot,
    config,
    setContainer,
    setSafeZone,
    setHighlight,
    setGrid,
    applyMask,
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

  // Load image dimensions when mask image changes
  useEffect(() => {
    if (maskImageUrl) {
      const img = new Image();
      img.onload = () => {
        setMaskImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = maskImageUrl;
    } else {
      setMaskImageSize(null);
    }
  }, [maskImageUrl]);

  // Recompute snapshot when image size or config changes
  useEffect(() => {
    if (agent && maskImageSize) {
      setComputedSnapshot(agent.getSnapshot(maskImageSize));
    } else if (snapshot) {
      setComputedSnapshot(snapshot);
    }
  }, [agent, snapshot, maskImageSize, config]);

  const handleImageUpload = (url: string) => {
    setMaskImageUrl(url);
  };

  const handleImageClear = () => {
    if (maskImageUrl) {
      URL.revokeObjectURL(maskImageUrl);
    }
    setMaskImageUrl(null);
    setMaskImageSize(null);
    applyMask(null);
  };

  const handleMaskChange = (mask: MaskConfig | null) => {
    applyMask(mask);
  };

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
          <p className="text-xs text-muted-foreground">Version 1 — Agent Core + Canvas + Mask</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-6 p-6">
        {/* Canvas Area */}
        <div className="flex-1 overflow-auto">
          <div className="inline-block">
            <PlaygroundCanvas 
              config={config} 
              snapshot={computedSnapshot} 
              maskImageUrl={maskImageUrl}
            />
          </div>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          <MaskControls
            mask={config.mask}
            maskImageUrl={maskImageUrl}
            onMaskChange={handleMaskChange}
            onImageUpload={handleImageUpload}
            onImageClear={handleImageClear}
          />
          
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
      </div>

      {/* Debug Info */}
      {computedSnapshot && (
        <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg p-3 text-xs font-mono opacity-70 hover:opacity-100 transition-opacity max-w-sm">
          <div className="text-muted-foreground mb-1">Agent Snapshot:</div>
          <div>Container: {computedSnapshot.containerRect.width}×{computedSnapshot.containerRect.height}</div>
          <div>SafeZone: {computedSnapshot.safeRect.width}×{computedSnapshot.safeRect.height}</div>
          {computedSnapshot.maskRect && (
            <div>Mask: {Math.round(computedSnapshot.maskRect.width)}×{Math.round(computedSnapshot.maskRect.height)} @ ({Math.round(computedSnapshot.maskRect.x)}, {Math.round(computedSnapshot.maskRect.y)})</div>
          )}
          {maskImageSize && (
            <div className="text-muted-foreground">Original: {maskImageSize.width}×{maskImageSize.height}</div>
          )}
        </div>
      )}
    </div>
  );
}
