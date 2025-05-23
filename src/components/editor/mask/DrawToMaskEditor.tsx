import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw, Info } from 'lucide-react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { generateMaskFromDrawing } from '@/services/drawToMaskService';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { loginStyle } = useCustomizationStore();
  const { setMaskImageUrl, setSafeZoneVisible } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);

  // Safe zone dimensions - must match the wallet UI area
  const SAFE_ZONE = {
    x: 0,
    y: 0,
    width: 320,
    height: 569,
  };

  // Initialize the canvas when the component mounts
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    // Create a new Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 480,
      height: 800,
      backgroundColor: 'rgba(0, 0, 0, 0.02)'
    });
    fabricCanvasRef.current = canvas;

    // Set up the brush with better visibility
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = '#ff3333';
    freeDrawingBrush.width = brushSize;

    // Add enhanced safe zone rectangle with better visibility
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

    // Add "WALLET AREA" text overlay
    const warningText = new fabric.Text('WALLET AREA\n(DO NOT DRAW HERE)', {
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

    // Set safe zone visible by default
    setSafeZoneVisible(true);

    // Cleanup when component unmounts
    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update brush size when it changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    canvas.freeDrawingBrush.width = brushSize;
  }, [brushSize]);

  // Switch between brush and eraser
  const handleToolChange = (tool: DrawToolType) => {
    if (!fabricCanvasRef.current) return;
    
    setActiveTool(tool);
    const canvas = fabricCanvasRef.current;
    
    if (tool === 'brush') {
      canvas.freeDrawingBrush.color = '#ff3333';  // Red for drawing
    } else {
      canvas.freeDrawingBrush.color = '#000000';  // Black for erasing (will be treated as transparent)
    }
  };

  // Clear the canvas
  const handleClearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Keep only the safe zone rectangle
    const objects = canvas.getObjects();
    canvas.clear();
    
    // Re-add safe zone rectangle
    const centerX = canvas.width! / 2 - SAFE_ZONE.width / 2;
    const centerY = canvas.height! / 2 - SAFE_ZONE.height / 2;
    
    const safeZoneRect = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(255, 255, 255, 0.5)',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    canvas.add(safeZoneRect);
    
    toast.success("Canvas cleared");
  };

  // Generate the mask from the drawing
  const handleGenerateMask = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = fabricCanvasRef.current;
      
      // Convert canvas to image with high quality
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      
      console.log('🎨 Starting mask generation from drawing...');
      
      // Send the drawing to the enhanced server processing
      const result = await generateMaskFromDrawing(dataUrl);
      
      if (!result) {
        throw new Error('No result returned from mask generation');
      }
      
      // Set the generated mask in the store
      setMaskImageUrl(result.imageUrl);
      
      console.log('✅ Mask generation completed successfully');
      toast.success("Enhanced mask generated!", {
        description: "Your drawing has been transformed into a professional wallet decoration"
      });
    } catch (err) {
      console.error("❌ Error generating mask:", err);
      toast.error("Failed to generate mask. Please try again.");
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
          <strong>Drawing Instructions:</strong> Draw decorative elements around the wallet area. 
          The gray dashed rectangle shows where the wallet will be - avoid drawing there. 
          AI will enhance your drawings and create a transparent center.
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
      
      <div className="relative h-[800px] bg-black/10 rounded-lg" ref={containerRef}>
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-10" />
        
        <div className="wallet-preview-container absolute inset-0 z-5 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <LoginScreen style={loginStyle} />
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isGenerating}
        onClick={handleGenerateMask}
      >
        {isGenerating ? 'Generating Enhanced Mask...' : 'Generate AI Enhanced Costume'}
      </Button>
      
      {isGenerating && (
        <div className="text-xs text-white/60 text-center">
          ⏳ Analyzing your drawing and creating professional enhancements...
        </div>
      )}
    </div>
  );
};

export default DrawToMaskEditor;
