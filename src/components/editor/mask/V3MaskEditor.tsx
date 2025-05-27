
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskPromptInput from './MaskPromptInput';
import MaskUploadImage from './MaskUploadImage';
import GenerateMaskButton from './GenerateMaskButton';
import CharacterButtons from './CharacterButtons';
import WalletAnalysisIndicator from './WalletAnalysisIndicator';
import { Button } from '@/components/ui/button';
import { RotateCcw, Info, Eye, EyeOff } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const V3MaskEditor = () => {
  const {
    resetEditor,
    maskImageUrl,
    prompt,
    safeZoneVisible,
    setSafeZoneVisible
  } = useMaskEditorStore();

  const { 
    activeLayer, 
    walletAnalysis, 
    analyzeCurrentWallet, 
    isAnalyzing 
  } = useCustomizationStore();

  const [showGuide, setShowGuide] = useState(true);

  // Автоматически анализируем кошелек при загрузке компонента
  useEffect(() => {
    if (!walletAnalysis && !isAnalyzing) {
      console.log('🚀 Auto-analyzing wallet on component mount');
      analyzeCurrentWallet().catch(error => {
        console.warn('Auto-analysis failed:', error);
      });
    }
  }, [activeLayer]); // Перезапускаем анализ при смене слоя

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };

  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create Wallet Costume (DEMO)</h2>
                <div className="bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-xs px-2 py-1 rounded">AI-Powered</div>
              </div>
              
              {showGuide && (
                <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-purple-300 mb-1">How it works:</h3>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleGuide}>
                      <EyeOff className="h-4 w-4 text-white/60" />
                    </Button>
                  </div>
                  <p className="text-xs text-white/70">
                    AI analyzes your wallet UI structure first, then creates decorative characters around it while keeping the wallet interface visible and functional.
                  </p>
                </div>
              )}
              
              {!showGuide && (
                <div className="flex justify-end mb-4">
                  <Button variant="ghost" size="sm" className="h-6" onClick={toggleGuide}>
                    <Info className="h-4 w-4 mr-1 text-white/60" />
                    <span className="text-xs text-white/60">Show Guide</span>
                  </Button>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Новая секция анализа кошелька */}
                <div>
                  <WalletAnalysisIndicator />
                </div>
                
                <Separator orientation="horizontal" className="bg-white/10" />
                
                {/* Секция с кнопками персонажей */}
                <div>
                  <CharacterButtons />
                </div>
                
                <Separator orientation="horizontal" className="bg-white/10" />
                
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload Reference Image (Optional)</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" className="bg-white/10" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    Describe Your Character
                  </h3>
                  <p className="text-xs text-white/70">
                    Tell AI what character you want around your wallet. The analysis above helps AI understand your wallet's structure.
                  </p>
                  <MaskPromptInput />
                </div>
                
                <SafeZoneToggle />
                
                <div className="space-y-3">
                  <GenerateMaskButton />
                  <Button variant="outline" onClick={handleReset} className="w-full border-white/10 text-white/80 hover:text-white">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-between py-2 px-4">
            <h3 className="text-sm font-medium text-white">
              Wallet Preview {walletAnalysis && `(${walletAnalysis.uiStructure.layout.type})`}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setSafeZoneVisible(!safeZoneVisible)}>
                    {safeZoneVisible ? <Eye className="h-4 w-4 text-purple-400" /> : <EyeOff className="h-4 w-4 text-white/60" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{safeZoneVisible ? "Hide" : "Show"} Safe Zone</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="w-full h-full">
              <V3MaskPreviewCanvas />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default V3MaskEditor;
