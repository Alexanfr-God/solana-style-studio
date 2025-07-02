
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIconManager, IconElement } from '@/hooks/useIconManager';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Palette, Layers, Info } from 'lucide-react';

interface IconManagerProps {
  userId?: string;
}

const IconManager: React.FC<IconManagerProps> = ({ userId = 'demo-user' }) => {
  const {
    loading,
    icons,
    variants,
    userCustomIcons,
    loadIconsByCategory,
    loadIconVariants,
    loadUserCustomIcons,
    getIconPublicUrl,
    replaceIconThroughChat,
    getStorageStructure
  } = useIconManager();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replaceMessage, setReplaceMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadIconsByCategory();
    loadIconVariants();
    if (userId) {
      loadUserCustomIcons(userId);
    }
  }, [userId, loadIconsByCategory, loadIconVariants, loadUserCustomIcons]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
        setSelectedFile(file);
        toast({
          title: "Файл выбран",
          description: `Выбран файл: ${file.name}`,
        });
      } else {
        toast({
          title: "Неверный формат",
          description: "Пожалуйста, выберите SVG файл",
          variant: "destructive"
        });
      }
    }
  };

  const handleReplaceIcon = async () => {
    if (!selectedFile || !replaceMessage.trim()) {
      toast({
        title: "Недостаточно данных",
        description: "Выберите файл и введите команду замены",
        variant: "destructive"
      });
      return;
    }

    const success = await replaceIconThroughChat(replaceMessage, selectedFile, userId);
    if (success) {
      setSelectedFile(null);
      setReplaceMessage('');
      // Сброс input
      const fileInput = document.getElementById('icon-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const getTotalIconsCount = () => {
    return Object.values(icons).reduce((total, categoryIcons) => total + categoryIcons.length, 0);
  };

  const renderIconCard = (icon: IconElement) => {
    const publicUrl = getIconPublicUrl(`${icon.asset_library_path}${icon.storage_file_name}`);
    
    return (
      <Card key={icon.id} className="p-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
            <Palette className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{icon.name}</h4>
            <p className="text-xs text-gray-500">{icon.storage_file_name}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">{icon.screen}</Badge>
              {icon.icon_group && (
                <Badge variant="outline" className="text-xs">
                  Группа: {icon.icon_group}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(publicUrl, '_blank')}
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    );
  };

  const storageStructure = getStorageStructure();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Менеджер Иконок</h2>
          <p className="text-gray-600">Управление иконками wallet приложения</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Layers className="w-3 h-3 mr-1" />
            Всего: {getTotalIconsCount()}
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Palette className="w-3 h-3 mr-1" />
            Пользовательских: {userCustomIcons.length}
          </Badge>
        </div>
      </div>

      {/* Инструменты загрузки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Замена Иконки</span>
          </CardTitle>
          <CardDescription>
            Загрузите SVG файл и введите команду для замены конкретной иконки или группы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="icon-file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Выберите SVG файл
            </label>
            <Input
              id="icon-file-input"
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Выбран файл: {selectedFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Команда замены
            </label>
            <Input
              value={replaceMessage}
              onChange={(e) => setReplaceMessage(e.target.value)}
              placeholder="Например: поменяй иконку home или замени группу search"
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleReplaceIcon}
            disabled={!selectedFile || !replaceMessage.trim() || loading}
            className="w-full"
          >
            {loading ? 'Обновление...' : 'Заменить Иконку'}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Примеры команд:</strong></p>
            <p>• "поменяй иконку home" - заменить home иконку</p>
            <p>• "замени группу search" - заменить все поисковые иконки</p>
            <p>• "обнови иконки navigation" - заменить навигационные иконки</p>
          </div>
        </CardContent>
      </Card>

      {/* Табы с категориями */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="variants">Группы</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(icons).map(([category, categoryIcons]) => (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{categoryIcons.length}</div>
                  <p className="text-xs text-gray-500">иконок</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {userCustomIcons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ваши Пользовательские Иконки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userCustomIcons.map((customIcon) => (
                    <div key={customIcon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{customIcon.element_id}</p>
                        <p className="text-xs text-gray-500">{customIcon.custom_storage_path}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Активна</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {Object.entries(icons).map(([category, categoryIcons]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>{categoryIcons.length} иконок</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryIcons.map(renderIconCard)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Группы Дублирующихся Иконок</CardTitle>
              <CardDescription>
                Эти группы используют одну иконку для нескольких элементов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{variant.group_name}</h3>
                      <Badge variant="outline">{variant.element_ids.length} элементов</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Файл: {variant.storage_file_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variant.element_ids.map((elementId) => (
                        <Badge key={elementId} variant="secondary" className="text-xs">
                          {elementId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Структура Storage</span>
              </CardTitle>
              <CardDescription>
                Организация файлов в Supabase Storage (bucket: wallet-icons)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(storageStructure).map(([folder, files]) => (
                  <div key={folder} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center space-x-2">
                      <span className="text-purple-600">📁</span>
                      <span>{folder}/</span>
                      <Badge variant="outline" className="text-xs">{files.length} файлов</Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {files.map((file) => (
                        <div key={file} className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IconManager;
