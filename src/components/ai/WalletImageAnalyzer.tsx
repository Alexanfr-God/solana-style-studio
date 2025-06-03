import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Save, Eye, Users } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { 
  analyzeWalletImage, 
  applyWalletStyles,
  saveWalletStyleToLibrary,
  type WalletComponentStyles,
  type DetailedImageAnalysis 
} from '@/services/walletImageAnalysisService';
import { generateHeroesForAllLayers } from '@/services/heroGenerationService';
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
  const [isGeneratingHeroes, setIsGeneratingHeroes] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<DetailedImageAnalysis | null>(null);
  const [lastStyles, setLastStyles] = useState<WalletComponentStyles | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const { 
    setWalletStyle, 
    setAiPetZone, 
    setAiPetEmotion,
    setAiPetBodyType,
    triggerAiPetInteraction,
    setAllHeroes
  } = useWalletCustomizationStore();

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
      
      // Apply global wallet styles
      const backgroundColor = Array.isArray(analysis.colors.background) 
        ? analysis.colors.background[0] 
        : analysis.colors.background;
      
      setWalletStyle({
        backgroundColor: backgroundColor,
        primaryColor: analysis.colors.primary,
        font: analysis.typography.primary,
        image: uploadedImage
      });
      
      toast.success(`🎨 Analysis complete! Style "${analysis.style}" applied to all components`);
      
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

  const handleGenerateHeroes = async () => {
    if (!lastAnalysis) {
      toast.error('Please analyze an image first');
      return;
    }

    setIsGeneratingHeroes(true);
    try {
      toast.info('🎭 Generating hero characters for all wallet layers...');
      
      const heroes = await generateHeroesForAllLayers({
        style: lastAnalysis.style,
        mood: lastAnalysis.mood,
        colors: {
          primary: lastAnalysis.colors.primary,
          secondary: lastAnalysis.colors.secondary,
          accent: lastAnalysis.colors.accent
        }
      });

      setAllHeroes(heroes);
      
      const heroCount = Object.keys(heroes).length;
      toast.success(`🎉 Generated ${heroCount} hero characters for wallet layers!`);
      
    } catch (error) {
      console.error('Hero generation error:', error);
      toast.error('Error generating heroes. Please try again.');
    } finally {
      setIsGeneratingHeroes(false);
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
          Upload an image for detailed analysis and apply styles to all wallet components
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
                  Analyzing in detail...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply Detailed Analysis
                </>
              )}
            </Button>

            {lastAnalysis && (
              <Button 
                onClick={handleGenerateHeroes}
                disabled={isGeneratingHeroes}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGeneratingHeroes ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating Heroes...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Generate Heroes for All Layers
                  </>
                )}
              </Button>
            )}

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletImageAnalyzer;
