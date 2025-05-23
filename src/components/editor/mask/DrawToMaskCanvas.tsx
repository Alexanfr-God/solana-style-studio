
import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner';
import { generateMaskFromDrawing } from '@/services/drawToMaskService';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { setMaskImageUrl, setSafeZoneVisible } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useStyleTransfer, setUseStyleTransfer] = useState(false);

  // Safe zone dimensions
  const SAFE_ZONE = {
    x: 0,
    y: 0,
    width: 320,
    height: 569,
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 480,
      height: 800,
      backgroundColor: 'rgba(0, 0, 0, 0.02)'
    });
    fabricCanvasRef.current = canvas;

    // Set up brush
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = '#ff3333';
    freeDrawingBrush.width = brushSize;

    // Add safe zone indicator
    const centerX = canvas.width! / 2 - SAFE_ZONE.width / 2;
    const centerY = canvas.height! / 2 - SAFE_ZONE.height / 2;
    
    const safeZoneRect = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'rgba(255, 255, 255, 0.8)',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);

    const warningText = new fabric.Text('WALLET AREA\n(БУДЕТ ПРОЗРАЧНЫМ)', {
      left: centerX + SAFE_ZONE.width / 2,
      top: centerY + SAFE_ZONE.height / 2,
      fontSize: 14,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: 'rgba(255, 255, 255, 0.6)',
      selectable: false,
      evented: false,
    });
    canvas.add(warningText);

    setSafeZoneVisible(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update brush size
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
  }, [brushSize]);

  // Tool switching
  const handleToolChange = (tool: DrawToolType) => {
    if (!fabricCanvasRef.current) return;
    
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    
    if (tool === 'brush') {
      canvas.freeDrawingBrush.color = '#ff3333';
    } else {
      canvas.freeDrawingBrush.color = '#000000';
    }
  };

  // Clear canvas
  const handleClearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.clear();
    
    // Re-add safe zone
    const centerX = canvas.width! / 2 - SAFE_ZONE.width / 2;
    const centerY = canvas.height! / 2 - SAFE_ZONE.height / 2;
    
    const safeZoneRect = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'rgba(255, 255, 255, 0.8)',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);
    
    const warningText = new fabric.Text('WALLET AREA\n(БУДЕТ ПРОЗРАЧНЫМ)', {
      left: centerX + SAFE_ZONE.width / 2,
      top: centerY + SAFE_ZONE.height / 2,
      fontSize: 14,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: 'rgba(255, 255, 255, 0.6)',
      selectable: false,
      evented: false,
    });
    canvas.add(warningText);
    
    toast.success("Холст очищен");
  };

  // Generate mask using AI
  const handleGenerateMask = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = fabricCanvasRef.current;
      
      // Convert canvas to high quality image
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      
      console.log('🎨 Starting AI mask generation from drawing...');
      
      // Generate mask using new AI approach
      const result = await generateMaskFromDrawing(dataUrl, useStyleTransfer);
      
      if (!result) {
        throw new Error('No result returned from AI mask generation');
      }
      
      // Set the generated mask
      setMaskImageUrl(result.imageUrl);
      
      console.log('✅ AI mask generation completed successfully');
      toast.success("ИИ маска создана!", {
        description: useStyleTransfer 
          ? "Ваш рисунок преобразован с применением стилизации"
          : "Точная маска создана на основе вашего рисунка"
      });
    } catch (err) {
      console.error("❌ Error generating AI mask:", err);
      toast.error("Ошибка создания маски. Попробуйте снова.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Info banner */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start space-x-2">
        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-300">
          <strong>Новый ИИ подход:</strong> Рисуйте декоративные элементы вокруг области кошелька. 
          ИИ точно определит ваши рисунки и создаст прозрачную маску только в нужных местах.
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant={activeTool === 'brush' ? "default" : "outline"} 
            onClick={() => handleToolChange('brush')}
            className={activeTool === 'brush' ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Brush className="h-4 w-4 mr-2" />
            Кисть
          </Button>
          
          <Button 
            size="sm" 
            variant={activeTool === 'eraser' ? "default" : "outline"} 
            onClick={() => handleToolChange('eraser')}
            className={activeTool === 'eraser' ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Ластик
          </Button>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-white/70">Размер:</span>
            <Slider
              value={[brushSize]}
              min={1}
              max={50}
              step={1}
              onValueChange={(values) => setBrushSize(values[0])}
              className="w-24"
            />
            <span className="text-xs text-white/70">{brushSize}px</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleClearCanvas}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Очистить
        </Button>
      </div>

      {/* Style transfer option */}
      <div className="flex items-center space-x-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
        <Switch
          id="style-transfer"
          checked={useStyleTransfer}
          onCheckedChange={setUseStyleTransfer}
        />
        <Label htmlFor="style-transfer" className="text-sm text-purple-300">
          <Sparkles className="inline h-4 w-4 mr-1" />
          Применить стилизацию (экспериментально)
        </Label>
      </div>
      
      <div className="relative h-[800px] bg-black/10 rounded-lg">
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-10" />
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isGenerating}
        onClick={handleGenerateMask}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? 'Создание ИИ маски...' : 'Создать ИИ маску'}
      </Button>
      
      {isGenerating && (
        <div className="text-xs text-white/60 text-center">
          ⏳ ИИ анализирует ваш рисунок и создает точную прозрачную маску...
        </div>
      )}
    </div>
  );
};

export default DrawToMaskCanvas;
