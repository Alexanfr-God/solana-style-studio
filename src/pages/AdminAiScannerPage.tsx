import React from 'react';
import { ScanControlPanel } from '@/components/admin/scanner/ScanControlPanel';
import { ScanFlowVisualization } from '@/components/admin/scanner/ScanFlowVisualization';
import { WalletPreviewCanvas } from '@/components/admin/scanner/WalletPreviewCanvas';
import { ScanLogsPanel } from '@/components/admin/scanner/ScanLogsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminAiScannerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin AI Scanner</h1>
            <p className="text-xs text-muted-foreground">Visual wallet interface analyzer</p>
          </div>
        </div>
      </header>

      {/* Main 3-column layout */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-[280px_1fr_320px] gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - Controls & Flow */}
          <div className="border rounded-lg bg-card overflow-hidden flex flex-col">
            <ScanControlPanel />
            <div className="border-t flex-1 overflow-auto">
              <ScanFlowVisualization />
            </div>
          </div>

          {/* Center Panel - Preview & Logs */}
          <div className="border rounded-lg bg-card overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden">
              <WalletPreviewCanvas />
            </div>
            <ScanLogsPanel />
          </div>

          {/* Right Panel - DevTools & AI Commentary */}
          <div className="border rounded-lg bg-card overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-sm font-semibold text-foreground/80">DevTools</h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {/* DevTools Panel - Placeholder */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    Select an element to view metrics
                  </p>
                </div>
                
                {/* AI Commentary - Placeholder */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">AI Commentary</h4>
                  <p className="text-sm text-muted-foreground">
                    AI analysis will appear here during scanning...
                  </p>
                </div>
                
                {/* Manual Editor - Placeholder */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Vision Tools</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                      GPT-Vision
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                      DevTools-API
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                      Snapshot Analyzer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAiScannerPage;
