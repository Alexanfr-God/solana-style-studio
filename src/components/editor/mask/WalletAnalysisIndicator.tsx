
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { Search, CheckCircle, AlertCircle, RefreshCw, Brain, Eye, Palette, Layout } from 'lucide-react';

const WalletAnalysisIndicator = () => {
  const { 
    walletAnalysis, 
    isAnalyzing, 
    analysisTimestamp,
    activeLayer,
    analyzeCurrentWallet 
  } = useCustomizationStore();

  const handleAnalyze = async () => {
    try {
      toast.info("🔍 Analyzing wallet structure...");
      await analyzeCurrentWallet();
      toast.success("✅ Wallet analysis completed!");
    } catch (error) {
      toast.error("❌ Analysis failed. Please try again.");
      console.error("Analysis error:", error);
    }
  };

  const isAnalysisValid = walletAnalysis && analysisTimestamp;
  const analysisAge = isAnalysisValid ? 
    Math.floor((Date.now() - new Date(analysisTimestamp!).getTime()) / 1000) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Wallet Layout Analysis
        </h3>
        {isAnalysisValid && (
          <Badge 
            variant="outline" 
            className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
          >
            ✅ Enhanced
          </Badge>
        )}
      </div>
      
      <div className="p-3 bg-black/20 border border-white/10 rounded-md space-y-3">
        {isAnalyzing ? (
          <div className="flex items-center space-x-2 text-blue-300">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing {activeLayer} wallet UI...</span>
          </div>
        ) : isAnalysisValid ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Layout Analysis Complete</span>
            </div>
            
            {/* UI Structure Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded">
                <div className="flex items-center gap-1 text-purple-300 mb-1">
                  <Layout className="h-3 w-3" />
                  <span className="font-medium">Layout</span>
                </div>
                <div className="text-white/70">
                  {walletAnalysis.uiStructure.layout.type} • {walletAnalysis.uiStructure.layout.primaryElements.length} elements
                </div>
              </div>
              
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                <div className="flex items-center gap-1 text-blue-300 mb-1">
                  <Eye className="h-3 w-3" />
                  <span className="font-medium">Interactive</span>
                </div>
                <div className="text-white/70">
                  {walletAnalysis.uiStructure.interactivity.buttons.length} buttons • {walletAnalysis.uiStructure.interactivity.inputs.length} inputs
                </div>
              </div>
              
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded col-span-2">
                <div className="flex items-center gap-1 text-yellow-300 mb-1">
                  <Palette className="h-3 w-3" />
                  <span className="font-medium">Color Palette</span>
                </div>
                <div className="text-white/70 text-xs">
                  {walletAnalysis.uiStructure.colorPalette.primary} • {walletAnalysis.uiStructure.colorPalette.accent}
                </div>
              </div>
            </div>
            
            {/* Safe Zone Info */}
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
              <div className="text-green-300 font-medium mb-1">Safe Zone Detected</div>
              <div className="text-white/70">
                {walletAnalysis.uiStructure.safeZone.width}×{walletAnalysis.uiStructure.safeZone.height}px preserved area
              </div>
              <div className="text-white/50 text-xs mt-1">
                Critical: {walletAnalysis.uiStructure.safeZone.criticalElements.length} elements protected
              </div>
            </div>
            
            <div className="text-xs text-white/60 space-y-1">
              <div>⏱️ Age: <span className="text-orange-300">{analysisAge}s ago</span></div>
              <div>🎯 Purpose: <span className="text-cyan-300">{walletAnalysis.functionalContext.purpose}</span></div>
            </div>
            
            {analysisAge > 30 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Analysis may be outdated</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-yellow-300">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No layout analysis available</span>
          </div>
        )}
        
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          size="sm"
          variant="outline"
          className="w-full border-white/20 text-white hover:text-white"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-3 w-3" />
              {isAnalysisValid ? 'Re-analyze' : 'Analyze'} Layout
            </>
          )}
        </Button>
      </div>
      
      {isAnalysisValid && (
        <div className="text-xs text-white/50 bg-black/10 p-2 rounded">
          🧠 Layout-aware AI will generate characters that respect your wallet's UI structure and interact naturally with interface elements
        </div>
      )}
    </div>
  );
};

export default WalletAnalysisIndicator;
