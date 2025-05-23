import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw, Loader2, Wand } from 'lucide-react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';
import { generateMaskFromDrawing } from '@/services/drawToMaskService';

type DrawToolType = 'brush' | 'eraser';

const DrawToMaskCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { loginStyle } = useCustomizationStore();
  const { setMaskImageUrl, setSafeZoneVisible, safeZoneVisible } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Canvas dimensions
  const CANVAS_SIZE = 1024;
  
  // Safe zone dimensions - must match the wallet UI area
  const SAFE_ZONE = {
    width: 320,
    height: 569,
  };

  // Initialize the canvas when the component mounts
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    // Create a new Fabric.js canvas with square dimensions
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    });
    fabricCanvasRef.current = canvas;

    // Set up the brush
    const freeDrawingBrush = canvas.freeDrawingBrush;
    freeDrawingBrush.color = '#ff3333'; // Red brush by default
    freeDrawingBrush.width = brushSize;

    // Calculate center positions
    const centerX = (CANVAS_SIZE - SAFE_ZONE.width) / 2;
    const centerY = (CANVAS_SIZE - SAFE_ZONE.height) / 2;
    
    updateSafeZone(canvas, centerX, centerY);

    // Position the wallet UI in the center of the canvas
    positionWalletPreview();

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
  
  // Update safe zone visibility when the toggle changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const safeZoneRect = objects.find(obj => obj.data?.isSafeZone === true);
    
    if (safeZoneRect) {
      safeZoneRect.set({ visible: safeZoneVisible });
      canvas.renderAll();
    }
  }, [safeZoneVisible]);

  const updateSafeZone = (canvas: fabric.Canvas, centerX: number, centerY: number) => {
    // Remove any existing safe zone rectangles
    const objects = canvas.getObjects();
    const existingSafeZone = objects.find(obj => obj.data?.isSafeZone === true);
    if (existingSafeZone) {
      canvas.remove(existingSafeZone);
    }
    
    // Create new safe zone rectangle
    const safeZoneRect = new fabric.Rect({
      left: centerX,
      top: centerY,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      fill: 'rgba(0, 0, 0, 0)',
      stroke: 'rgba(255, 0, 0, 0.5)',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      visible: safeZoneVisible,
      data: { isSafeZone: true } // Custom property to identify this object
    });
    
    canvas.add(safeZoneRect);
    canvas.renderAll();
  };
  
  const positionWalletPreview = () => {
    const walletContainer = document.querySelector('.wallet-preview-container');
    if (!walletContainer) return;
    
    // Get the wallet preview element
    const walletPreview = walletContainer.querySelector('.wallet-preview') as HTMLElement;
    if (!walletPreview) return;
    
    // Position wallet preview in the center of the canvas using transform
    walletPreview.style.position = 'absolute';
    walletPreview.style.top = '50%';
    walletPreview.style.left = '50%';
    walletPreview.style.transform = 'translate(-50%, -50%)';
    walletPreview.style.zIndex = '5'; // Below the drawing canvas but above the background
  };

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
    canvas.clear();
    
    // Re-add safe zone rectangle
    const centerX = (CANVAS_SIZE - SAFE_ZONE.width) / 2;
    const centerY = (CANVAS_SIZE - SAFE_ZONE.height) / 2;
    
    updateSafeZone(canvas, centerX, centerY);
    
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
      const result = await generateMaskFromDrawing(dataUrl);
      
      if (!result || !result.imageUrl) {
        throw new Error("Failed to generate mask");
      }
      
      // Set the generated mask in the store
      setMaskImageUrl(result.imageUrl);
      
      toast.success("Mask generated successfully!");
    } catch (err) {
      console.error("Error generating mask:", err);
      toast.error("Failed to generate mask. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drawing Tools */}
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
      
      {/* Canvas Container with Wallet Preview */}
      <div 
        className="relative bg-black/10 rounded-lg overflow-hidden mx-auto" 
        ref={containerRef}
        style={{
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          maxWidth: '100%',
          aspectRatio: '1/1'
        }}
      >
        {/* This is the drawing canvas that overlays the wallet preview */}
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 z-10"
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
          }}
        />
        
        {/* Wallet preview positioned underneath the canvas */}
        <div className="wallet-preview-container absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
          <LoginScreen style={loginStyle} />
        </div>
      </div>
      
      {/* Generate Button */}
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isGenerating}
        onClick={handleGenerateMask}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Costume from Drawing
          </>
        )}
      </Button>
    </div>
  );
};

export default DrawToMaskCanvas;
