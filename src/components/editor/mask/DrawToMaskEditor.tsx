
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw, Info, Sparkles } from 'lucide-react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { generateMaskFromDrawing } from '@/services/drawToMaskService';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { loginStyle } = useCustomizationStore();
  const { setExternalMask, setSafeZoneVisible } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useStyleTransfer, setUseStyleTransfer] = useState(false);

  // Canvas dimensions optimized for cat drawing
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 800;
  
  // Safe zone for wallet (centered)
  const SAFE_ZONE = {
    width: 320,
    height: 569,
    x: (CANVAS_WIDTH - 320) / 2,
    y: (CANVAS_HEIGHT - 569) / 2
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 'rgba(0, 0, 0, 0.02)'
    });
    fabricCanvasRef.current = canvas;

    // Configure brush
    const brush = canvas.freeDrawingBrush;
    brush.color = '#ff3333';
    brush.width = brushSize;

    // Add safe zone indicator
    const safeZoneRect = new fabric.Rect({
      left: SAFE_ZONE.x,
      top: SAFE_ZONE.y,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'rgba(255, 255, 255, 0.6)',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);

    // Add instruction text
    const instructionText = new fabric.Text('WALLET AREA\n(Keep Clear)', {
      left: SAFE_ZONE.x + SAFE_ZONE.width / 2,
      top: SAFE_ZONE.y + SAFE_ZONE.height / 2,
      fontSize: 16,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: 'rgba(255, 255, 255, 0.5)',
      selectable: false,
      evented: false,
    });
    canvas.add(instructionText);

    setSafeZoneVisible(true);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update brush size
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
    }
  }, [brushSize]);

  // Handle tool change
  const handleToolChange = (tool: DrawToolType) => {
    if (!fabricCanvasRef.current) return;
    
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    
    if (tool === 'brush') {
      canvas.freeDrawingBrush.color = '#ff3333';
    } else {
      canvas.freeDrawingBrush.color = 'rgba(255, 255, 255, 0.1)';
    }
  };

  // Clear canvas
  const handleClearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.clear();
    
    // Re-add safe zone
    const safeZoneRect = new fabric.Rect({
      left: SAFE_ZONE.x,
      top: SAFE_ZONE.y,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'rgba(255, 255, 255, 0.6)',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);
    
    const instructionText = new fabric.Text('WALLET AREA\n(Keep Clear)', {
      left: SAFE_ZONE.x + SAFE_ZONE.width / 2,
      top: SAFE_ZONE.y + SAFE_ZONE.height / 2,
      fontSize: 16,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      fill: 'rgba(255, 255, 255, 0.5)',
      selectable: false,
      evented: false,
    });
    canvas.add(instructionText);
    
    toast.success("Canvas cleared - ready for new cat drawing!");
  };

  // Generate AI cat mask
  const handleGenerateMask = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = fabricCanvasRef.current;
      
      // Convert canvas to high-quality image
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      
      console.log('🎨 Starting AI cat mask generation...');
      console.log('Using style transfer:', useStyleTransfer);
      
      // Generate the AI cat mask
      const result = await generateMaskFromDrawing(dataUrl, useStyleTransfer);
      
      if (!result) {
        throw new Error('No result returned from cat mask generation');
      }
      
      // Apply the generated mask
      setExternalMask(result.imageUrl);
      
      console.log('✅ Cat mask generation completed successfully');
      console.log('Cat type generated:', result.layoutJson.cat_type);
      
    } catch (err) {
      console.error("❌ Error generating cat mask:", err);
      toast.error("Failed to generate cat mask. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Instructions */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-purple-300 mb-2">Draw Your Cat Design:</h3>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• Draw cat elements around the gray wallet area</li>
              <li>• Top area: cat head, ears, eyes</li>
              <li>• Bottom area: cat paws, body, tail</li>
              <li>• AI will create a professional minimalist design</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Tools */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Button 
            size="sm" 
            variant={activeTool === 'brush' ? "default" : "outline"} 
            onClick={() => handleToolChange('brush')}
            className={activeTool === 'brush' ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Brush className="h-4 w-4 mr-2" />
            Draw
          </Button>
          
          <Button 
            size="sm" 
            variant={activeTool === 'eraser' ? "default" : "outline"} 
            onClick={() => handleToolChange('eraser')}
            className={activeTool === 'eraser' ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Erase
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/70">Size:</span>
            <Slider
              value={[brushSize]}
              min={5}
              max={40}
              step={1}
              onValueChange={(values) => setBrushSize(values[0])}
              className="w-20"
            />
            <span className="text-xs text-white/70 w-8">{brushSize}</span>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleClearCanvas}
          className="border-white/20"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
      
      {/* Canvas */}
      <div className="relative bg-black/20 rounded-lg p-4 border border-white/10">
        <canvas ref={canvasRef} className="mx-auto border border-white/20 rounded" />
        
        {/* Wallet preview overlay */}
        <div 
          className="absolute pointer-events-none"
          style={{
            left: `${16 + SAFE_ZONE.x}px`,
            top: `${16 + SAFE_ZONE.y}px`,
            width: `${SAFE_ZONE.width}px`,
            height: `${SAFE_ZONE.height}px`,
            opacity: 0.3
          }}
        >
          <LoginScreen style={loginStyle} />
        </div>
      </div>
      
      {/* Style options */}
      <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
        <span className="text-sm text-white/70">Style Enhancement:</span>
        <Button
          size="sm"
          variant={useStyleTransfer ? "default" : "outline"}
          onClick={() => setUseStyleTransfer(!useStyleTransfer)}
          className={useStyleTransfer ? "bg-gradient-to-r from-yellow-500 to-orange-500" : ""}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {useStyleTransfer ? "Artistic Style" : "Minimalist Style"}
        </Button>
      </div>
      
      {/* Generate button */}
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        disabled={isGenerating}
        onClick={handleGenerateMask}
      >
        {isGenerating ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            Generating AI Cat Mask...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Cat Mask
          </>
        )}
      </Button>
      
      {isGenerating && (
        <div className="text-center space-y-2">
          <div className="text-xs text-white/60">
            🤖 AI is analyzing your drawing and creating a professional cat design...
          </div>
          <div className="text-xs text-purple-300">
            Style: {useStyleTransfer ? "Artistic Enhancement" : "Clean Minimalist"}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawToMaskEditor;
