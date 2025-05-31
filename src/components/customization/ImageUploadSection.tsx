
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image, Sparkles, Heart } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { analyzeImageWithAI, generateWalletStyleFromAnalysis, saveStyleToLibrary } from '@/services/aiStyleAnalysisService';
import { toast } from 'sonner';

const ImageUploadSection = () => {
  const { 
    uploadedImage, 
    setUploadedImage, 
    setWalletStyle, 
    setAiPetZone, 
    triggerAiPetInteraction 
  } = useWalletCustomizationStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastGeneratedStyle, setLastGeneratedStyle] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setIsUploading(false);
      toast.success("Style inspiration image uploaded!");
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to upload image. Please try again.");
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setLastGeneratedStyle(null);
    setLastAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success("Image removed");
  };

  const handleAnalyzeAndApply = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      toast.info('🤖 AI analyzing your image...');
      
      // Анализируем изображение с помощью AI
      const analysis = await analyzeImageWithAI(uploadedImage);
      setLastAnalysis(analysis);
      
      // Генерируем стили для всех компонентов
      const walletStyleSet = generateWalletStyleFromAnalysis(analysis);
      setLastGeneratedStyle(walletStyleSet);
      
      // Применяем глобальные стили к кошельку
      setWalletStyle({
        backgroundColor: walletStyleSet.global.backgroundColor,
        primaryColor: walletStyleSet.buttons.backgroundColor,
        font: walletStyleSet.global.fontFamily
      });
      
      // Устанавливаем AI Pet в режим циркуляции вокруг кошелька
      setAiPetZone('outside');
      triggerAiPetInteraction();
      
      toast.success(`🎨 Style "${analysis.style}" applied! AI Pet now orbits around the wallet`);
      
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
      await saveStyleToLibrary(
        styleName,
        lastGeneratedStyle,
        lastAnalysis,
        '', // TODO: Generate preview image
        uploadedImage
      );
      
      toast.success('🎉 Style saved to library!');
    } catch (error) {
      console.error('Error saving style:', error);
      toast.error('Error saving style');
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          AI Style Analysis
        </h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {uploadedImage ? (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Style inspiration" 
                className="w-full h-48 rounded-lg object-cover"
              />
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                Style Reference
              </div>
            </div>
            
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

            {lastAnalysis && (
              <div className="p-3 bg-black/20 rounded-lg">
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
        ) : (
          <div className="w-full py-12 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Image className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">Upload inspiration image</p>
              <p className="text-white/60 text-sm">
                AI will analyze colors, patterns, and style
              </p>
            </div>
            <Button 
              onClick={handleUploadClick} 
              variant="secondary" 
              className="mt-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
