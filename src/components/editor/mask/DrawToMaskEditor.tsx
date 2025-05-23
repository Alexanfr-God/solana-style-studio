import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw } from 'lucide-react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { loginStyle } = useCustomizationStore();
  const { setMaskImageUrl, setSafeZoneVisible } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
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
      width: 480,  // Wider than wallet to give room for the mask
      height: 800,  // Taller than wallet to give room for the mask
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    });
    fabricCanvasRef.current = canvas;

    // Set up the brush
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = '#ff3333'; // Red brush by default
    freeDrawingBrush.width = brushSize;

    // Add safe zone rectangle (centered)
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

    // Position the wallet UI
    const walletContainerEl = document.querySelector('.wallet-preview-container');
    if (walletContainerEl && containerRef.current) {
      const walletEl = walletContainerEl.querySelector('.wallet-preview') as HTMLElement;
      if (walletEl) {
        // Position wallet in the center of the canvas
        walletEl.style.position = 'absolute';
        walletEl.style.top = `${centerY}px`;
        walletEl.style.left = `${centerX}px`;
        walletEl.style.zIndex = '100';
      }
    }

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
      
      // Convert canvas to image
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      
      // Send the drawing to the server for AI processing
      const { data, error } = await generateMaskFromDrawing(dataUrl);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Set the generated mask in the store
      setMaskImageUrl(data.imageUrl);
      
      toast.success("Mask generated successfully!");
    } catch (err) {
      console.error("Error generating mask:", err);
      toast.error("Failed to generate mask. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate mask from drawing using our edge function
  const generateMaskFromDrawing = async (drawingDataUrl: string) => {
    try {
      const response = await fetch('/api/generate-mask-from-drawing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drawingImage: drawingDataUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mask');
      }
      
      return { data: await response.json(), error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  };

  return (
    <div className="flex flex-col space-y-4">
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
        {isGenerating ? 'Generating...' : 'Generate Costume from Drawing'}
      </Button>
    </div>
  );
};

export default DrawToMaskEditor;
