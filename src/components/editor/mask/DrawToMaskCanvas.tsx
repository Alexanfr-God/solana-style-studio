import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Brush, Eraser, RotateCcw, Loader2, Wand, CheckCircle } from 'lucide-react';
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
  const { 
    setMaskImageUrl, 
    setSafeZoneVisible, 
    safeZoneVisible, 
    setExternalMask,
    resetEditor,
    maskImageUrl
  } = useMaskEditorStore();
  
  const [activeTool, setActiveTool] = useState<DrawToolType>('brush');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [maskGenerated, setMaskGenerated] = useState(false);

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

    // Set proper safe zone positioning matching the wallet preview
    updateSafeZone(canvas);

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

  // When mask is generated, hide the drawing and show success message
  useEffect(() => {
    if (maskImageUrl && fabricCanvasRef.current) {
      console.log("🎭 Mask generated successfully, hiding drawing canvas");
      setMaskGenerated(true);
      
      // Hide the drawing canvas to show only the generated mask
      const canvas = fabricCanvasRef.current;
      canvas.getElement().style.display = 'none';
    }
  }, [maskImageUrl]);

  const updateSafeZone = (canvas: fabric.Canvas) => {
    // Remove any existing safe zone rectangles
    const objects = canvas.getObjects();
    const existingSafeZone = objects.find(obj => obj.data?.isSafeZone === true);
    if (existingSafeZone) {
      canvas.remove(existingSafeZone);
    }
    
    // Create new safe zone rectangle perfectly aligned with the wallet preview
    // Position it in the exact center of the canvas
    const safeZoneRect = new fabric.Rect({
      left: CANVAS_SIZE / 2, // Center X position
      top: CANVAS_SIZE / 2, // Center Y position
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height,
      originX: 'center',
      originY: 'center',
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
    
    console.log("Safe zone updated - position:", {
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      width: SAFE_ZONE.width,
      height: SAFE_ZONE.height
    });
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

  // Clear the canvas and reset mask state
  const handleClearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    
    const canvas = fabricCanvasRef.current;
    
    // Reset all mask-related state
    resetEditor();
    setMaskGenerated(false);
    
    // Show the drawing canvas again
    canvas.getElement().style.display = 'block';
    
    // Keep only the safe zone rectangle
    canvas.clear();
    
    // Re-add safe zone rectangle
    updateSafeZone(canvas);
    
    toast.success("Canvas cleared");
  };

  // Generate the mask from the drawing using composite approach
  const handleGenerateMask = async () => {
    if (!fabricCanvasRef.current) return;
    
    try {
      setIsGenerating(true);
      const canvas = fabricCanvasRef.current;
      
      // Reset mask state completely first - important for proper rerender
      console.log("🔄 Resetting editor state before generation");
      resetEditor();
      setMaskGenerated(false);
      
      // Convert canvas drawing to image (without wallet preview)
      const drawingDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });
      
      console.log("🎨 Starting composite mask generation...");
      console.log("Drawing data size:", drawingDataUrl.length);
      
      // Send the drawing to the server for AI processing with composite approach
      const result = await generateMaskFromDrawing(drawingDataUrl);
      
      if (!result || !result.imageUrl) {
        throw new Error("Failed to generate mask");
      }
      
      console.log("✅ Composite mask generation successful:", result.imageUrl);
      
      // Set the generated mask in the store with a small delay to ensure state reset
      setTimeout(() => {
        console.log("🎭 Setting generated mask URL in store");
        
        // Ensure external mask is null and set our generated mask
        setExternalMask(null);
        setMaskImageUrl(result.imageUrl);
        
        // Mark as generated for UI updates
        setMaskGenerated(true);
        
        toast.success("AI-enhanced mask generated successfully!", {
          description: "Your drawing has been professionally enhanced and styled"
        });
      }, 200);
      
    } catch (err) {
      console.error("Error generating composite mask:", err);
      toast.error("Error generating enhanced mask. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {maskGenerated && maskImageUrl && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">AI-enhanced mask successfully generated!</span>
          </div>
          <p className="text-green-300/80 text-sm mt-1">
            Your drawing has been professionally enhanced and transformed into a polished decorative mask.
          </p>
        </div>
      )}

      {/* Drawing Tools */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant={activeTool === 'brush' ? "default" : "outline"} 
            onClick={() => handleToolChange('brush')}
            className={activeTool === 'brush' ? "bg-purple-600 hover:bg-purple-700" : ""}
            disabled={maskGenerated}
          >
            <Brush className="h-4 w-4 mr-2" />
            Draw
          </Button>
          
          <Button 
            size="sm" 
            variant={activeTool === 'eraser' ? "default" : "outline"} 
            onClick={() => handleToolChange('eraser')}
            className={activeTool === 'eraser' ? "bg-purple-600 hover:bg-purple-700" : ""}
            disabled={maskGenerated}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Erase
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
              disabled={maskGenerated}
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
          {maskGenerated ? 'New Drawing' : 'Clear'}
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
        
        {/* Generated mask overlay - shown when mask is generated */}
        {maskGenerated && maskImageUrl && (
          <div 
            className="absolute top-0 left-0 w-full h-full z-8 pointer-events-none"
            style={{
              backgroundImage: `url(${maskImageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
        
        {/* Wallet preview positioned underneath */}
        <div className="wallet-preview-container absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
          <div className="wallet-preview">
            <LoginScreen style={loginStyle} />
          </div>
        </div>
      </div>
      
      {/* Generate Button */}
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={isGenerating || maskGenerated}
        onClick={handleGenerateMask}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating enhanced mask...
          </>
        ) : maskGenerated ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Enhanced mask generated
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate AI-enhanced mask
          </>
        )}
      </Button>

      {/* Instructions */}
      <div className="text-xs text-white/60 bg-black/20 rounded p-3">
        <div className="font-medium mb-1">💡 How it works:</div>
        <div>Draw decorative elements around the wallet. Our AI will enhance your sketch into a professional mask while keeping the wallet interface perfectly visible and functional.</div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-black/30 rounded-lg text-xs">
          <div className="text-white/70">Debug Info:</div>
          <div className="text-white/50">Mask URL: {maskImageUrl || 'None'}</div>
          <div className="text-white/50">Generated: {maskGenerated ? 'Yes' : 'No'}</div>
          <div className="text-white/50">Is Generating: {isGenerating ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default DrawToMaskCanvas;
