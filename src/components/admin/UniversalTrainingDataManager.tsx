import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { trainingDataConverter } from '@/services/trainingDataConverter';
import { Loader2, FolderOpen, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TrainingFolder {
  name: string;
  elementType: string;
  hasDescriptions: boolean;
}

interface ConversionResult {
  folder: string;
  elementType: string;
  elementName?: string;
  jsonPath?: string;
  examplesCount?: number;
  success: boolean;
  error?: string;
}

export const UniversalTrainingDataManager = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [folders, setFolders] = useState<TrainingFolder[]>([]);
  const [lastResults, setLastResults] = useState<ConversionResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    scanFolders();
  }, []);

  const scanFolders = async () => {
    setIsScanning(true);
    try {
      const result = await trainingDataConverter.scanTrainingFolders();
      if (result.success) {
        setFolders(result.folders);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка сканирования",
        description: "Не удалось просканировать папки training data",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const convertAll = async () => {
    setIsConverting(true);
    try {
      const result = await trainingDataConverter.autoConvertAll();
      
      if (result.success) {
        setLastResults(result.results);
        
        const successCount = result.results.filter((r: ConversionResult) => r.success).length;
        const totalCount = result.results.length;
        
        toast({
          title: "Конвертация завершена",
          description: `Успешно: ${successCount}/${totalCount} папок. Проверьте детали ниже.`,
        });
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка конвертации",
        description: "Не удалось выполнить автоматическую конвертацию",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const getElementTypeColor = (elementType: string) => {
    const colors: { [key: string]: string } = {
      'backgrounds': 'bg-blue-500/20 text-blue-300',
      'fonts': 'bg-purple-500/20 text-purple-300',
      'buttons': 'bg-green-500/20 text-green-300',
      'icons': 'bg-yellow-500/20 text-yellow-300',
      'containers': 'bg-pink-500/20 text-pink-300',
      'borders': 'bg-orange-500/20 text-orange-300',
      'inputs': 'bg-cyan-500/20 text-cyan-300',
      'cards': 'bg-red-500/20 text-red-300',
      'navigation': 'bg-indigo-500/20 text-indigo-300',
      'headers': 'bg-emerald-500/20 text-emerald-300',
      'footers': 'bg-violet-500/20 text-violet-300'
    };
    return colors[elementType] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Универсальный конвертер Training Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Автоматически преобразует все папки с примерами в соответствующие JSON файлы для различных типов элементов.
          </p>
          
          <div className="flex gap-3">
            <Button 
              onClick={scanFolders} 
              disabled={isScanning}
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сканирование...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Сканировать папки
                </>
              )}
            </Button>
            
            <Button 
              onClick={convertAll} 
              disabled={isConverting || folders.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Конвертация...
                </>
              ) : (
                'Конвертировать все'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Обнаруженные папки */}
      {folders.length > 0 && (
        <Card className="bg-black/30 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Обнаруженные папки ({folders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {folders.map((folder, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-white/60" />
                    <div>
                      <div className="text-white font-medium">{folder.name}</div>
                      <div className="text-xs text-white/60">
                        {folder.hasDescriptions ? 'Описания найдены' : 'Описания отсутствуют'}
                      </div>
                    </div>
                  </div>
                  <Badge className={getElementTypeColor(folder.elementType)}>
                    {folder.elementType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Результаты последней конвертации */}
      {lastResults.length > 0 && (
        <Card className="bg-black/30 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              Результаты конвертации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">{result.folder}</div>
                      {result.success ? (
                        <div className="text-xs text-green-400">
                          Создан: {result.jsonPath} ({result.examplesCount} примеров)
                        </div>
                      ) : (
                        <div className="text-xs text-red-400">
                          Ошибка: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getElementTypeColor(result.elementType)}>
                    {result.elementType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="bg-white/10" />

      {/* Информация о структуре */}
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Структура файлов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-white/70 space-y-2">
            <div><strong>Источник:</strong> training-data/[тип-элемента]/</div>
            <div><strong>Описания:</strong> training-data/[тип-элемента]-description/</div>
            <div><strong>Результат:</strong> prompts/[тип]/[имя].json</div>
            
            <div className="mt-4">
              <strong className="text-white">Поддерживаемые типы:</strong>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  'backgrounds', 'fonts', 'buttons', 'icons', 
                  'containers', 'borders', 'inputs', 'cards',
                  'navigation', 'headers', 'footers'
                ].map(type => (
                  <Badge key={type} className={getElementTypeColor(type)}>
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};