
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import AiStyleAnalyzer from '@/components/ai/AiStyleAnalyzer';
import WalletImageAnalyzer from '@/components/ai/WalletImageAnalyzer';

const ImageUploadSection = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'detailed'>('detailed');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        toast.success('Изображение загружено');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Ошибка загрузки изображения');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Ошибка обработки файла');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    toast.info('Изображение удалено');
  };

  const handleStyleGenerated = (styleData: any, analysis?: any) => {
    console.log('Style generated:', { styleData, analysis });
    toast.success('Стиль успешно применен к кошельку!');
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              AI Image Analysis & Style Generation
            </h2>
            <p className="text-gray-400 text-sm">
              Загрузите изображение для создания уникального стиля кошелька
            </p>
          </div>

          {/* Analysis Mode Selector */}
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant={analysisMode === 'basic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisMode('basic')}
              className="text-xs"
            >
              Базовый анализ
            </Button>
            <Button
              variant={analysisMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAnalysisMode('detailed')}
              className="text-xs"
            >
              Детальный анализ
            </Button>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  ) : (
                    <Upload className="w-12 h-12 text-white/60" />
                  )}
                  <div className="text-white/80">
                    <p className="font-medium">
                      {isUploading ? 'Загрузка...' : 'Загрузить изображение'}
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      PNG, JPG, WebP до 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                  <Image className="w-3 h-3 inline mr-1" />
                  Изображение готово к анализу
                </div>
              </div>
            )}
          </div>

          {/* AI Analysis Components */}
          {analysisMode === 'basic' ? (
            <AiStyleAnalyzer 
              uploadedImage={uploadedImage} 
              onStyleGenerated={handleStyleGenerated}
            />
          ) : (
            <WalletImageAnalyzer 
              uploadedImage={uploadedImage} 
              onStylesGenerated={handleStyleGenerated}
            />
          )}

          {/* Info Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <h4 className="text-blue-300 font-medium mb-2 text-sm">
              ℹ️ Режимы анализа
            </h4>
            <div className="text-blue-200 text-xs space-y-1">
              <p><strong>Базовый:</strong> Быстрый анализ с применением общих стилей</p>
              <p><strong>Детальный:</strong> Глубокий анализ всех компонентов кошелька</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
