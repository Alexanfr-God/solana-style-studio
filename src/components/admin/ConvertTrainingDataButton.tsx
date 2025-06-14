import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { trainingDataConverter } from '@/services/trainingDataConverter';

export const ConvertTrainingDataButton = () => {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    setIsConverting(true);
    
    try {
      const result = await trainingDataConverter.convertToFewShots();
      
      toast({
        title: "Конвертация завершена",
        description: `Обработано ${result.processedFiles} файлов. JSON сохранен в ${result.jsonPath}`,
      });

      console.log('Converted examples:', result.examples);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка конвертации",
        description: "Не удалось преобразовать training data в JSON",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Конвертация Training Data</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Преобразует ваши 20 примеров из Supabase Storage в JSON формат для Few-Shots
      </p>
      
      <Button 
        onClick={handleConvert} 
        disabled={isConverting}
        className="w-full"
      >
        {isConverting ? 'Конвертация...' : 'Конвертировать в JSON'}
      </Button>
      
      <div className="mt-2 text-xs text-muted-foreground">
        <p>Источник: training-data/image-background1/</p>
        <p>Описания: training-data/Image-background1-description/</p>
        <p>Результат: prompts/background_generation.json</p>
      </div>
    </div>
  );
};