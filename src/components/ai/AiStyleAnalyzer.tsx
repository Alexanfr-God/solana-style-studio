
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Heart } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';

interface AiStyleAnalyzerProps {
  uploadedImage: string | null;
  onStyleGenerated?: (styleData: any) => void;
}

const AiStyleAnalyzer: React.FC<AiStyleAnalyzerProps> = ({ uploadedImage, onStyleGenerated }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastGeneratedStyle, setLastGeneratedStyle] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const { setWalletStyle, walletStyle } = useWalletCustomizationStore();

  const handleAnalyzeAndApply = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image for analysis');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast.info('🤖 AI is analyzing your image...');
      
      console.log('🔍 Starting AI style analysis...');
      
      // Mock analysis process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const mockAnalysis = {
        style: 'Modern Minimalist',
        mood: 'Professional',
        fontRecommendation: 'Inter',
        colors: ['#667eea', '#764ba2', '#f093fb']
      };
      
      const mockWalletStyleSet = {
        global: {
          backgroundColor: '#667eea',
          fontFamily: 'Inter'
        },
        buttons: {
          backgroundColor: '#764ba2'
        }
      };
      
      setLastAnalysis(mockAnalysis);
      setLastGeneratedStyle(mockWalletStyleSet);
      
      // Apply styles to wallet
      const completeStyle = {
        ...walletStyle,
        backgroundColor: mockWalletStyleSet.global.backgroundColor,
        accentColor: mockWalletStyleSet.buttons.backgroundColor,
        primaryColor: mockWalletStyleSet.buttons.backgroundColor,
        fontFamily: mockWalletStyleSet.global.fontFamily,
        font: mockWalletStyleSet.global.fontFamily
      };
      
      setWalletStyle(completeStyle);
      
      toast.success(`🎨 Style "${mockAnalysis.style}" applied successfully!`);
      
      // Notify parent component
      if (onStyleGenerated) {
        onStyleGenerated(mockWalletStyleSet);
      }
      
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Error analyzing image. Please try a different image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!lastGeneratedStyle || !lastAnalysis || !uploadedImage) {
      toast.error('No data to save');
      return;
    }

    try {
      const styleName = `${lastAnalysis.style} ${lastAnalysis.mood}`;
      
      // Mock save to library
      console.log('Saving style to library:', styleName);
      
      toast.success('🎉 Style saved to library!');
    } catch (error) {
      console.error('Error saving style:', error);
      toast.error('Error saving style');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">AI Style Analyzer</h3>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Upload an image and AI will analyze its style, applying it to all wallet elements
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing style...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Apply AI Style
                </>
              )}
            </Button>

            {lastGeneratedStyle && (
              <Button 
                onClick={handleSaveToLibrary}
                variant="outline"
                className="w-full border-pink-500/50 text-pink-300 hover:bg-pink-500/10"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save to Library
              </Button>
            )}
          </div>
        )}

        {lastAnalysis && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Analysis Result:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><span className="text-purple-400">Style:</span> {lastAnalysis.style}</p>
              <p><span className="text-purple-400">Mood:</span> {lastAnalysis.mood}</p>
              <p><span className="text-purple-400">Font:</span> {lastAnalysis.fontRecommendation}</p>
              <div className="flex items-center space-x-1">
                <span className="text-purple-400">Colors:</span>
                {lastAnalysis.colors.map((color: string, index: number) => (
                  <div 
                    key={index}
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiStyleAnalyzer;
