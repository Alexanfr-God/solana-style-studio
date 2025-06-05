import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Upload, Heart } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { analyzeImageWithAI, generateWalletStyleFromAnalysis, saveStyleToLibrary } from '@/services/aiStyleAnalysisService';
import { toast } from 'sonner';
import { frontendLogger } from '@/services/frontendLogger';

interface AiStyleAnalyzerProps {
  uploadedImage: string | null;
  onStyleGenerated?: (styleData: any) => void;
}

const AiStyleAnalyzer: React.FC<AiStyleAnalyzerProps> = ({ uploadedImage, onStyleGenerated }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastGeneratedStyle, setLastGeneratedStyle] = useState<any>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const { setWalletStyle, setAiPetZone, triggerAiPetInteraction, walletStyle } = useWalletCustomizationStore();

  const handleAnalyzeAndApply = async () => {
    if (!uploadedImage) {
      toast.error('Пожалуйста, загрузите изображение для анализа');
      return;
    }

    setIsAnalyzing(true);
    
    // Log the start of style generation
    await frontendLogger.logStyleGeneration('AI Style Analysis', true);
    
    try {
      toast.info('🤖 AI анализирует ваше изображение...');
      
      // Log image analysis start
      console.log('🔍 Starting AI style analysis...');
      
      // Анализируем изображение с помощью AI
      const analysis = await analyzeImageWithAI(uploadedImage);
      setLastAnalysis(analysis);
      
      // Генерируем стили для всех компонентов
      const walletStyleSet = generateWalletStyleFromAnalysis(analysis);
      setLastGeneratedStyle(walletStyleSet);
      
      // Применяем глобальные стили к кошельку с полным объектом WalletStyle
      const completeStyle = {
        ...walletStyle, // Keep existing properties
        backgroundColor: walletStyleSet.global.backgroundColor,
        accentColor: walletStyleSet.buttons.backgroundColor,
        primaryColor: walletStyleSet.buttons.backgroundColor,
        fontFamily: walletStyleSet.global.fontFamily,
        font: walletStyleSet.global.fontFamily
      };
      
      setWalletStyle(completeStyle);
      
      // Устанавливаем AI Pet в режим циркуляции вокруг кошелька
      setAiPetZone('outside');
      triggerAiPetInteraction();
      
      // Log successful application
      await frontendLogger.logStyleApplication(`AI ${analysis.style}`, completeStyle);
      
      toast.success(`🎨 Стиль "${analysis.style}" применен! AI Pet теперь циркулирует вокруг кошелька`);
      
      // Уведомляем родительский компонент
      if (onStyleGenerated) {
        onStyleGenerated(walletStyleSet);
      }
      
    } catch (error) {
      console.error('Ошибка AI анализа:', error);
      
      // Log the error
      await frontendLogger.logUserError('AI_ANALYSIS_ERROR', error.message, 'ai_style_analyzer');
      
      toast.error('Ошибка при анализе изображения. Попробуйте другое изображение.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!lastGeneratedStyle || !lastAnalysis || !uploadedImage) {
      toast.error('Нет данных для сохранения');
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
      
      // Log save to library
      await frontendLogger.logSaveToLibrary(styleName);
      
      toast.success('🎉 Стиль сохранен в библиотеку!');
    } catch (error) {
      console.error('Ошибка сохранения стиля:', error);
      
      // Log the error
      await frontendLogger.logUserError('SAVE_TO_LIBRARY_ERROR', error.message, 'ai_style_analyzer');
      
      toast.error('Ошибка при сохранении стиля');
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
          Загрузите изображение, и AI проанализирует его стиль, применив его ко всем элементам кошелька
        </p>

        {!uploadedImage ? (
          <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Загрузите изображение выше</p>
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
                  Анализирую стиль...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Применить AI стиль
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
                Сохранить в библиотеку
              </Button>
            )}
          </div>
        )}

        {lastAnalysis && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Результат анализа:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><span className="text-purple-400">Стиль:</span> {lastAnalysis.style}</p>
              <p><span className="text-purple-400">Настроение:</span> {lastAnalysis.mood}</p>
              <p><span className="text-purple-400">Шрифт:</span> {lastAnalysis.fontRecommendation}</p>
              <div className="flex items-center space-x-1">
                <span className="text-purple-400">Цвета:</span>
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
