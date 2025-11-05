import React from 'react';
import { ScanControlPanel } from '@/components/admin/scanner/ScanControlPanel';
import { ScanFlowVisualization } from '@/components/admin/scanner/ScanFlowVisualization';
import { WalletPreviewCanvas } from '@/components/admin/scanner/WalletPreviewCanvas';
import { ScanLogsPanel } from '@/components/admin/scanner/ScanLogsPanel';
import { DevToolsPanel } from '@/components/admin/scanner/DevToolsPanel';
import { AiCommentaryPanel } from '@/components/admin/scanner/AiCommentaryPanel';
import { ManualEditorPanel } from '@/components/admin/scanner/ManualEditorPanel';
import { FoundElementsList } from '@/components/admin/scanner/FoundElementsList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-[280px_1fr_320px] gap-4 h-[calc(100vh-120px)]"
        >
          {/* Left Panel - Controls & Flow */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="border rounded-lg bg-card overflow-hidden flex flex-col shadow-sm"
          >
            <ScanControlPanel />
            <div className="border-t flex-1 overflow-auto">
              <ScanFlowVisualization />
            </div>
          </motion.div>

          {/* Center Panel - Preview & Logs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border rounded-lg bg-card overflow-hidden flex flex-col shadow-sm"
          >
            <div className="flex-1 overflow-hidden">
              <WalletPreviewCanvas />
            </div>
            <ScanLogsPanel />
          </motion.div>

          {/* Right Panel - DevTools & AI Commentary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="border rounded-lg bg-card overflow-hidden flex flex-col shadow-sm"
          >
            <div className="p-4 border-b bg-gradient-to-r from-background to-muted/20">
              <h3 className="text-sm font-semibold text-foreground/80">Analysis Tools</h3>
            </div>
            <div className="flex-1 overflow-auto">
              <DevToolsPanel />
              <div className="px-4">
                <AiCommentaryPanel />
                <ManualEditorPanel />
              </div>
              <FoundElementsList />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAiScannerPage;
