import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Save, Eye } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { 
  analyzeWalletImage, 
  applyWalletStyles,
  saveWalletStyleToLibrary,
  type WalletComponentStyles,
  type DetailedImageAnalysis 
} from '@/services/walletImageAnalysisService';
import { toast } from 'sonner';

interface WalletImageAnalyzerProps {
  uploadedImage: string | null;
  onStylesGenerated?: (styles: WalletComponentStyles, analysis: DetailedImageAnalysis) => void;
}

const WalletImageAnalyzer: React.FC<WalletImageAnalyzerProps> = ({ 
  uploadedImage, 
  onStylesGenerated 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<DetailedImageAnalysis | null>(null);
  const [lastStyles, setLastStyles] = useState<WalletComponentStyles | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const { 
    applyStyleSet,
    setAiPetZone, 
    setAiPetEmotion,
    setAiPetBodyType,
    triggerAiPetInteraction 
  } = useWalletCustomizationStore();

  const applyComprehensiveStyles = (styles: WalletComponentStyles, analysis: DetailedImageAnalysis) => {
    // Create comprehensive style set for the store
    const comprehensiveStyleSet = {
      global: {
        backgroundColor: analysis.colors.background,
        backgroundImage: styles.globalBackground?.backgroundImage,
        fontFamily: analysis.typography.primary,
        textColor: analysis.colors.text,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      },
      header: {
        backgroundColor: styles.headerContainer?.backgroundColor,
        backdropFilter: styles.headerContainer?.backdropFilter,
        borderRadius: styles.headerContainer?.borderRadius,
        border: `1px solid ${analysis.colors.secondary}30`,
        textColor: analysis.colors.text
      },
      buttons: {
        backgroundColor: analysis.colors.primary,
        gradient: styles.sendButton?.backgroundColor,
        textColor: analysis.colors.background,
        borderRadius: '12px',
        boxShadow: `0 4px 12px ${analysis.colors.primary}30`
      },
      panels: {
        backgroundColor: styles.balanceSection?.backgroundColor,
        backdropFilter: styles.balanceSection?.backdropFilter,
        borderRadius: '16px',
        border: `1px solid ${analysis.colors.secondary}30`,
        boxShadow: `0 2px 16px ${analysis.colors.primary}15`
      },
      navigation: {
        backgroundColor: styles.bottomNavigation?.backgroundColor,
        backdropFilter: styles.bottomNavigation?.backdropFilter,
        borderRadius: '16px 16px 0 0',
        border: `1px solid ${analysis.colors.secondary}30`
      },
      inputs: {
        backgroundColor: styles.searchInput?.backgroundColor,
        textColor: analysis.colors.text,
        borderRadius: '8px',
        border: `1px solid ${analysis.colors.secondary}40`,
        backdropFilter: 'blur(8px)'
      },
      cards: {
        backgroundColor: styles.assetItem?.backgroundColor,
        borderRadius: '12px',
        border: `1px solid ${analysis.colors.secondary}20`,
        boxShadow: `0 2px 8px ${analysis.colors.primary}10`
      },
      overlays: {
        backgroundColor: styles.accountSidebar?.backgroundColor,
        backdropFilter: styles.accountSidebar?.backdropFilter,
        borderRadius: '16px',
        border: `1px solid ${analysis.colors.secondary}40`
      },
      containers: {
        backgroundColor: styles.swapContainer?.backgroundColor,
        borderRadius: '16px',
        border: `1px solid ${analysis.colors.secondary}30`,
        backdropFilter: 'blur(16px)'
      },
      searchInputs: {
        backgroundColor: styles.searchInput?.backgroundColor,
        textColor: analysis.colors.text,
        borderRadius: '12px',
        border: `2px solid ${analysis.colors.primary}30`,
        backdropFilter: 'blur(8px)'
      },
      aiPet: {
        zone: analysis.aiPetCharacteristics.recommendedZone as 'inside' | 'outside',
        bodyType: analysis.aiPetCharacteristics.recommendedBodyType as 'phantom' | 'lottie',
        emotion: analysis.aiPetCharacteristics.recommendedEmotion as any
      }
    };

    // Apply the comprehensive style set
    applyStyleSet(comprehensiveStyleSet);

    // Apply CSS variables for dynamic styling
    const root = document.documentElement;
    root.style.setProperty('--wallet-bg-primary', analysis.colors.background);
    root.style.setProperty('--wallet-bg-secondary', `${analysis.colors.background}80`);
    root.style.setProperty('--wallet-color-primary', analysis.colors.primary);
    root.style.setProperty('--wallet-color-secondary', analysis.colors.secondary);
    root.style.setProperty('--wallet-color-accent', analysis.colors.accent);
    root.style.setProperty('--wallet-color-text', analysis.colors.text);
    root.style.setProperty('--wallet-font-primary', analysis.typography.primary);

    // Apply layer-specific background styles
    const layers = [
      { selector: '[data-layer="login"]', style: styles.loginLayerBackground },
      { selector: '[data-layer="home"]', style: styles.homeLayerBackground },
      { selector: '[data-layer="swap"]', style: styles.swapLayerBackground },
      { selector: '[data-layer="apps"]', style: styles.appsLayerBackground },
      { selector: '[data-layer="history"]', style: styles.historyLayerBackground },
      { selector: '[data-layer="search"]', style: styles.searchLayerBackground }
    ];

    layers.forEach(({ selector, style }) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && style) {
        Object.entries(style).forEach(([property, value]) => {
          if (value && typeof value === 'string') {
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
            element.style.setProperty(cssProperty, value);
          }
        });
      }
    });

    console.log('Comprehensive styles applied:', comprehensiveStyleSet);
  };

  const handleAnalyzeAndApply = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      toast.info('🔍 Starting detailed image analysis...');
      
      const result = await analyzeWalletImage(uploadedImage);
      
      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      const { analysis, walletStyles } = result;
      setLastAnalysis(analysis);
      setLastStyles(walletStyles);
      
      // Apply AI Pet recommendations
      if (analysis.aiPetCharacteristics) {
        setAiPetZone(analysis.aiPetCharacteristics.recommendedZone);
        setAiPetEmotion(analysis.aiPetCharacteristics.recommendedEmotion as any);
        setAiPetBodyType(analysis.aiPetCharacteristics.recommendedBodyType);
        triggerAiPetInteraction();
      }
      
      // Apply comprehensive styles
      applyComprehensiveStyles(walletStyles, analysis);
      
      toast.success(`🎨 Analysis complete! Style "${analysis.style}" applied to all wallet components including backgrounds and layers`);
      
      // Notify parent component
      if (onStylesGenerated) {
        onStylesGenerated(walletStyles, analysis);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Error analyzing image. Please try a different image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!lastStyles || !lastAnalysis || !uploadedImage) {
      toast.error('No data to save');
      return;
    }

    try {
      const styleName = `${lastAnalysis.style} - ${lastAnalysis.mood}`;
      await saveWalletStyleToLibrary(styleName, lastStyles, lastAnalysis, uploadedImage);
      toast.success('🎉 Style saved to library!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving style');
    }
  };

  const renderColorPalette = (colors: DetailedImageAnalysis['colors']) => (
    <div className="flex items-center space-x-1">
      <span className="text-purple-400 text-xs">Palette:</span>
      {Object.entries(colors).slice(0, 5).map(([key, color], index) => {
        const colorValue = Array.isArray(color) ? color[0] : color;
        return (
          <div 
            key={index}
            className="w-4 h-4 rounded-full border border-white/20 relative group"
            style={{ backgroundColor: colorValue }}
            title={`${key}: ${colorValue}`}
          />
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-medium text-white">Wallet Image Analyzer</h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Upload an image for detailed analysis and apply comprehensive styles to all wallet components, layers, and backgrounds
        </p>

        {!uploadedImage ? (
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Upload an image above</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <img 
              src={uploadedImage} 
              alt="Uploaded for analysis" 
              className="w-full h-32 object-cover rounded-lg"
            />
            
            <Button 
              onClick={handleAnalyzeAndApply}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing and applying styles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply Comprehensive Analysis
                </>
              )}
            </Button>

            {lastStyles && lastAnalysis && (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSaveToLibrary}
                  variant="outline"
                  className="flex-1 border-green-500/50 text-green-300 hover:bg-green-500/10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                
                <Button 
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  variant="outline"
                  className="flex-1 border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showDetailedAnalysis ? 'Hide' : 'Details'}
                </Button>
              </div>
            )}
          </div>
        )}

        {lastAnalysis && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Analysis Result:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><span className="text-purple-400">Style:</span> {lastAnalysis.style}</p>
              <p><span className="text-purple-400">Mood:</span> {lastAnalysis.mood}</p>
              <p><span className="text-purple-400">Font:</span> {lastAnalysis.typography.primary}</p>
              <p><span className="text-purple-400">Lighting:</span> {lastAnalysis.lighting}</p>
              <p><span className="text-purple-400">Contrast:</span> {lastAnalysis.contrast}</p>
              {renderColorPalette(lastAnalysis.colors)}
              
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p><span className="text-green-400">✅ Backgrounds:</span> All layers styled</p>
                <p><span className="text-green-400">✅ Components:</span> Assets, Swap, Apps styled</p>
                <p><span className="text-blue-400">AI Pet Zone:</span> {lastAnalysis.aiPetCharacteristics.recommendedZone}</p>
                <p><span className="text-blue-400">AI Pet Type:</span> {lastAnalysis.aiPetCharacteristics.recommendedBodyType}</p>
                <p><span className="text-blue-400">AI Pet Emotion:</span> {lastAnalysis.aiPetCharacteristics.recommendedEmotion}</p>
              </div>
            </div>
          </div>
        )}

        {showDetailedAnalysis && lastAnalysis && (
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">Detailed Analysis:</h4>
            <div className="text-xs text-gray-300 space-y-2">
              
              <div>
                <span className="text-yellow-400">Design Elements:</span>
                <ul className="ml-2 space-y-1">
                  <li>• Gradients: {lastAnalysis.designElements.hasGradients ? '✅' : '❌'}</li>
                  <li>• Patterns: {lastAnalysis.designElements.hasPatterns ? '✅' : '❌'}</li>
                  <li>• Textures: {lastAnalysis.designElements.hasTextures ? '✅' : '❌'}</li>
                  <li>• Geometry: {lastAnalysis.designElements.hasGeometry ? '✅' : '❌'}</li>
                  <li>• Shadows: {lastAnalysis.designElements.hasShadows ? '✅' : '❌'}</li>
                </ul>
              </div>

              <div>
                <span className="text-green-400">Composition:</span>
                <ul className="ml-2 space-y-1">
                  <li>• Balance: {lastAnalysis.composition.balance}</li>
                  <li>• Focus: {lastAnalysis.composition.focusArea}</li>
                  <li>• Complexity: {lastAnalysis.composition.complexity}</li>
                </ul>
              </div>

              {lastAnalysis.textures.length > 0 && (
                <div>
                  <span className="text-orange-400">Textures:</span> {lastAnalysis.textures.join(', ')}
                </div>
              )}

              {lastAnalysis.patterns.length > 0 && (
                <div>
                  <span className="text-pink-400">Patterns:</span> {lastAnalysis.patterns.join(', ')}
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-gray-600">
                <span className="text-cyan-400">Applied Styles:</span>
                <ul className="ml-2 space-y-1">
                  <li>• Layer backgrounds: Login, Home, Swap, Apps, History, Search</li>
                  <li>• Component styling: Assets, Transactions, Navigation</li>
                  <li>• CSS variables: Dynamic color theming</li>
                  <li>• Global theming: Fonts, borders, shadows</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletImageAnalyzer;
