
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { Search, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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
        <h3 className="text-sm font-medium text-white">Wallet Structure Analysis</h3>
        {isAnalysisValid && (
          <Badge 
            variant="outline" 
            className="bg-green-500/10 border-green-500/30 text-green-300 text-xs"
          >
            ✅ Analyzed
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Analysis Complete</span>
            </div>
            
            <div className="text-xs text-white/60 space-y-1">
              <div>📱 Layer: <span className="text-purple-300">{walletAnalysis.uiStructure.layout.type}</span></div>
              <div>🎨 Elements: <span className="text-blue-300">{walletAnalysis.uiStructure.layout.primaryElements.length}</span></div>
              <div>🔘 Interactive: <span className="text-yellow-300">{walletAnalysis.uiStructure.layout.interactiveElements.length}</span></div>
              <div>⏱️ Age: <span className="text-orange-300">{analysisAge}s ago</span></div>
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
            <span className="text-sm">No analysis available</span>
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
              {isAnalysisValid ? 'Re-analyze' : 'Analyze'} Wallet
            </>
          )}
        </Button>
      </div>
      
      {isAnalysisValid && (
        <div className="text-xs text-white/50 bg-black/10 p-2 rounded">
          💡 This analysis will enhance AI generation with detailed wallet context
        </div>
      )}
    </div>
  );
};

export default WalletAnalysisIndicator;
