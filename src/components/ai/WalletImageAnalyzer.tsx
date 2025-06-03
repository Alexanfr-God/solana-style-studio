
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
    setWalletStyle, 
    setAiPetZone, 
    setAiPetEmotion,
    setAiPetBodyType,
    triggerAiPetInteraction 
  } = useWalletCustomizationStore();

  const handleAnalyzeAndApply = async () => {
    if (!uploadedImage) {
      toast.error('Пожалуйста, загрузите изображение для анализа');
      return;
    }

    setIsAnalyzing(true);
    try {
      toast.info('🔍 Начинаю детальный анализ изображения...');
      
      const result = await analyzeWalletImage(uploadedImage);
      
      if (!result.success) {
        throw new Error(result.error || 'Анализ не удался');
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
      setWalletStyle({
        backgroundColor: analysis.colors.background,
        primaryColor: analysis.colors.primary,
        font: analysis.typography.primary,
        image: uploadedImage
      });
      
      toast.success(`🎨 Анализ завершен! Стиль "${analysis.style}" применен ко всем компонентам`);
      
      // Notify parent component
      if (onStylesGenerated) {
        onStylesGenerated(walletStyles, analysis);
      }
      
    } catch (error) {
      console.error('Ошибка анализа:', error);
      toast.error('Ошибка при анализе изображения. Попробуйте другое изображение.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!lastStyles || !lastAnalysis || !uploadedImage) {
      toast.error('Нет данных для сохранения');
      return;
    }

    try {
      const styleName = `${lastAnalysis.style} - ${lastAnalysis.mood}`;
      await saveWalletStyleToLibrary(styleName, lastStyles, lastAnalysis, uploadedImage);
      toast.success('🎉 Стиль сохранен в библиотеку!');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении стиля');
    }
  };

  const renderColorPalette = (colors: DetailedImageAnalysis['colors']) => (
    <div className="flex items-center space-x-1">
      <span className="text-purple-400 text-xs">Палитра:</span>
      {Object.entries(colors).slice(0, 5).map(([key, color], index) => (
        <div 
          key={index}
          className="w-4 h-4 rounded-full border border-white/20 relative group"
          style={{ backgroundColor: color }}
          title={`${key}: ${color}`}
        />
      ))}
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
          Загрузите изображение для детального анализа и применения стилей ко всем компонентам кошелька
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
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Анализирую детально...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Применить детальный анализ
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
                  Сохранить
                </Button>
                
                <Button 
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  variant="outline"
                  className="flex-1 border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showDetailedAnalysis ? 'Скрыть' : 'Детали'}
                </Button>
              </div>
            )}
          </div>
        )}

        {lastAnalysis && (
          <div className="mt-4 p-3 bg-black/20 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Результат анализа:</h4>
            <div className="text-xs text-gray-300 space-y-1">
              <p><span className="text-purple-400">Стиль:</span> {lastAnalysis.style}</p>
              <p><span className="text-purple-400">Настроение:</span> {lastAnalysis.mood}</p>
              <p><span className="text-purple-400">Шрифт:</span> {lastAnalysis.typography.primary}</p>
              <p><span className="text-purple-400">Освещение:</span> {lastAnalysis.lighting}</p>
              <p><span className="text-purple-400">Контраст:</span> {lastAnalysis.contrast}</p>
              {renderColorPalette(lastAnalysis.colors)}
              
              <div className="mt-2 pt-2 border-t border-gray-600">
                <p><span className="text-blue-400">AI Pet зона:</span> {lastAnalysis.aiPetCharacteristics.recommendedZone}</p>
                <p><span className="text-blue-400">AI Pet тип:</span> {lastAnalysis.aiPetCharacteristics.recommendedBodyType}</p>
                <p><span className="text-blue-400">AI Pet эмоция:</span> {lastAnalysis.aiPetCharacteristics.recommendedEmotion}</p>
              </div>
            </div>
          </div>
        )}

        {showDetailedAnalysis && lastAnalysis && (
          <div className="mt-4 p-3 bg-black/30 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-3">Детальный анализ:</h4>
            <div className="text-xs text-gray-300 space-y-2">
              
              <div>
                <span className="text-yellow-400">Дизайн элементы:</span>
                <ul className="ml-2 space-y-1">
                  <li>• Градиенты: {lastAnalysis.designElements.hasGradients ? '✅' : '❌'}</li>
                  <li>• Паттерны: {lastAnalysis.designElements.hasPatterns ? '✅' : '❌'}</li>
                  <li>• Текстуры: {lastAnalysis.designElements.hasTextures ? '✅' : '❌'}</li>
                  <li>• Геометрия: {lastAnalysis.designElements.hasGeometry ? '✅' : '❌'}</li>
                  <li>• Тени: {lastAnalysis.designElements.hasShadows ? '✅' : '❌'}</li>
                </ul>
              </div>

              <div>
                <span className="text-green-400">Композиция:</span>
                <ul className="ml-2 space-y-1">
                  <li>• Баланс: {lastAnalysis.composition.balance}</li>
                  <li>• Фокус: {lastAnalysis.composition.focusArea}</li>
                  <li>• Сложность: {lastAnalysis.composition.complexity}</li>
                </ul>
              </div>

              {lastAnalysis.textures.length > 0 && (
                <div>
                  <span className="text-orange-400">Текстуры:</span> {lastAnalysis.textures.join(', ')}
                </div>
              )}

              {lastAnalysis.patterns.length > 0 && (
                <div>
                  <span className="text-pink-400">Паттерны:</span> {lastAnalysis.patterns.join(', ')}
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
