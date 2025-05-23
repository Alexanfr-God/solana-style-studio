
import React, { useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Brush, Eraser, RotateCcw, Sparkles, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoginScreen } from '@/components/wallet/WalletScreens';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { setMaskImageUrl, setSafeZoneVisible } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useStyleTransfer, setUseStyleTransfer] = useState(false);

  // Canvas dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 800;
  
  // Fixed wallet dimensions - exactly 320x569
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  
  // Calculate exact center coordinates
  const walletX = (CANVAS_WIDTH - WALLET_WIDTH) / 2; // 240
  const walletY = (CANVAS_HEIGHT - WALLET_HEIGHT) / 2; // 115.5
  
  const safeZone = {
    x: walletX,
    y: walletY,
    width: WALLET_WIDTH,
    height: WALLET_HEIGHT,
  };

  console.log('🎯 EXACT POSITIONING:', {
    canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    wallet: { width: WALLET_WIDTH, height: WALLET_HEIGHT },
    position: { x: walletX, y: walletY },
    safeZone
  });

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

    // Set up brush
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = '#ff3333';
    freeDrawingBrush.width = brushSize;

    setSafeZoneVisible(true);
    
    // Add safe zone immediately
    addSafeZoneToCanvas(canvas);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Function to add safe zone to canvas
  const addSafeZoneToCanvas = (canvas: fabric.Canvas) => {
    // Remove existing safe zone elements
    const objects = canvas.getObjects();
    const safeZoneObjects = objects.filter(obj => 
      obj.name === 'safeZoneRect' || obj.name === 'safeZoneText'
    );
    safeZoneObjects.forEach(obj => canvas.remove(obj));
    
    // Add safe zone rectangle with exact positioning
    const safeZoneRect = new fabric.Rect({
      name: 'safeZoneRect',
      left: safeZone.x,
      top: safeZone.y,
      width: safeZone.width,
      height: safeZone.height,
      fill: 'rgba(128, 128, 128, 0.1)',
      stroke: 'rgba(255, 255, 255, 0.8)',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);

    const warningText = new fabric.Text('WALLET AREA\n(WILL BE TRANSPARENT)', {
      name: 'safeZoneText',
      left: safeZone.x + safeZone.width / 2,
      top: safeZone.y + safeZone.height / 2,
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
    
    canvas.renderAll();
    
    console.log('✅ Safe zone added with exact coordinates:', safeZone);
  };

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
    addSafeZoneToCanvas(canvas);
    
    toast.success("Canvas cleared");
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
      console.log('📐 Using safe zone:', safeZone);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
        body: {
          compositeImage: dataUrl,
          safeZone: safeZone,
          useStyleTransfer: useStyleTransfer
        }
      });
      
      if (error) {
        console.error('❌ Error from edge function:', error);
        throw new Error(error.message || 'Failed to generate mask');
      }
      
      if (!data || !data.mask_image_url) {
        throw new Error('No mask image returned from AI generation');
      }
      
      // Set the generated mask
      setMaskImageUrl(data.mask_image_url);
      
      console.log('✅ AI mask generation completed successfully');
      toast.success("AI mask created!", {
        description: useStyleTransfer 
          ? "Your drawing has been transformed with stylization"
          : "Precise mask created from your drawing"
      });
    } catch (err) {
      console.error("❌ Error generating AI mask:", err);
      toast.error("Error creating mask. Please try again.");
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
          <strong>AI Drawing Approach:</strong> Draw decorative elements around the wallet area. 
          AI will precisely detect your drawings and create a transparent mask only where needed.
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
            Brush
          </Button>
          
          <Button 
            size="sm" 
            variant={activeTool === 'eraser' ? "default" : "outline"} 
            onClick={() => handleToolChange('eraser')}
            className={activeTool === 'eraser' ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Eraser
          </Button>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-xs text-white/70">Size:</span>
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
          Clear
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
          Apply stylization (experimental)
        </Label>
      </div>
      
      <div className="relative bg-black/10 rounded-lg overflow-hidden" style={{ height: `${CANVAS_HEIGHT}px` }}>
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-20" />
        
        {/* Wallet positioned EXACTLY in center using calculated coordinates */}
        <div 
          className="absolute z-10 pointer-events-none bg-black/5 border border-red-500/50"
          style={{
            left: `${walletX}px`,
            top: `${walletY}px`,
            width: `${WALLET_WIDTH}px`,
            height: `${WALLET_HEIGHT}px`,
          }}
        >
          <div className="w-full h-full">
            <LoginScreen style={loginStyle} />
          </div>
        </div>
        
        {/* Debug positioning indicator */}
        <div className="absolute top-2 left-2 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
          Center: ({walletX}, {walletY}) | Size: {WALLET_WIDTH}x{WALLET_HEIGHT}
        </div>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isGenerating}
        onClick={handleGenerateMask}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? 'Creating AI Mask...' : 'Create AI Mask'}
      </Button>
      
      {isGenerating && (
        <div className="text-xs text-white/60 text-center">
          ⏳ AI is analyzing your drawing and creating a precise transparent mask...
        </div>
      )}
      
      {/* Debug info */}
      <div className="text-xs text-white/50 text-center">
        Canvas: {CANVAS_WIDTH}×{CANVAS_HEIGHT} | 
        Wallet: {WALLET_WIDTH}×{WALLET_HEIGHT} at ({walletX},{walletY}) |
        Safe Zone: {safeZone.x},{safeZone.y} ({safeZone.width}×{safeZone.height})
      </div>
    </div>
  );
};

export default DrawToMaskCanvas;
