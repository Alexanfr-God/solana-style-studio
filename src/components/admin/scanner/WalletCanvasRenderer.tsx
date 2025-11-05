import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ElementItem } from '@/stores/aiScannerStore';
import { useAiScannerStore } from '@/stores/aiScannerStore';

interface Props {
  elements: ElementItem[];
  walletType: string;
  screenshotUrl?: string | null;
}

/**
 * Canvas Renderer - Visualizes found elements on canvas
 * - Displays screenshot as background
 * - Elements appear with fade-in animations
 * - Click to select and view in DevTools
 */
export const WalletCanvasRenderer: React.FC<Props> = ({ 
  elements, 
  walletType,
  screenshotUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const { setCurrentElement } = useAiScannerStore();
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    if (screenshotUrl) {
      // Draw screenshot background if available
      const img = new Image();
      img.onload = () => {
        // Draw screenshot with slight opacity
        ctx.globalAlpha = 0.4;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.globalAlpha = 1.0;
        
        setScreenshotLoaded(true);
        drawElements();
      };
      img.onerror = () => {
        console.warn('[Canvas] Screenshot load failed, using gradient');
        drawGradientBackground();
        drawElements();
      };
      img.src = screenshotUrl;
    } else {
      drawGradientBackground();
      drawElements();
    }
    
    function drawGradientBackground() {
      if (!ctx) return;
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1e1e2e');
      gradient.addColorStop(1, '#0f0f1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }
    
    function drawElements() {
      if (!ctx) return;
      
      // Draw elements in a grid layout
      const cols = 3;
      const padding = 20;
      const elementWidth = 100;
      const elementHeight = 60;
      const gap = 20;
      
      elements.forEach((el, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = padding + col * (elementWidth + gap);
        const y = padding + row * (elementHeight + gap);
        
        // Skip if out of bounds
        if (y + elementHeight > height) return;
        
        // Status colors
        const colors = {
          found: '#22c55e',   // green
          copied: '#3b82f6',  // blue
          verified: '#10b981' // emerald
        };
        
        const color = colors[el.status];
        
        // Draw element background with glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, elementWidth, elementHeight);
        ctx.shadowBlur = 0;
        
        // Draw border with pulse effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, elementWidth, elementHeight);
        
        // Draw status indicator (corner dot)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + elementWidth - 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        const label = el.id.substring(0, 12);
        ctx.fillText(label, x + 5, y - 8);
        
        // Draw type badge
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.fillRect(x + 5, y + 5, 40, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px sans-serif';
        ctx.fillText(el.type, x + 8, y + 16);
        
        // Draw AI indicator if enriched
        if (el.aiComment) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
          ctx.beginPath();
          ctx.arc(x + elementWidth - 8, y + elementHeight - 8, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText('AI', x + elementWidth - 12, y + elementHeight - 5);
        }
        
        // Draw metrics if available
        if (el.metrics) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '8px monospace';
          ctx.fillText(
            `${el.metrics.width}×${el.metrics.height}`, 
            x + 5, 
            y + elementHeight - 8
          );
        }
      });
      
      // Draw info text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px sans-serif';
      const infoText = screenshotLoaded 
        ? `${walletType} • ${elements.length} elements • Screenshot mode`
        : `${walletType} • ${elements.length} elements`;
      ctx.fillText(infoText, padding, height - padding);
    }
    
  }, [elements, screenshotUrl, walletType]);
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate which element was clicked (grid layout)
    const cols = 3;
    const padding = 20;
    const elementWidth = 100;
    const elementHeight = 60;
    const gap = 20;
    
    elements.forEach((el, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const elX = padding + col * (elementWidth + gap);
      const elY = padding + row * (elementHeight + gap);
      
      if (x >= elX && x <= elX + elementWidth &&
          y >= elY && y <= elY + elementHeight) {
        console.log('[Canvas] Selected element:', el.id);
        setCurrentElement(el);
      }
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center bg-black/10 rounded-lg p-4"
    >
      <div className="relative">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onClick={handleCanvasClick}
          className="border border-border/50 rounded-lg shadow-lg cursor-pointer hover:border-primary/50 transition-colors"
        />
        
        {/* Screenshot indicator */}
        {screenshotLoaded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 left-2 bg-green-500/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-white"
          >
            📸 Screenshot Loaded
          </motion.div>
        )}
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur p-3 rounded-lg border border-border/50 space-y-1 shadow-lg">
          <div className="text-xs font-semibold text-foreground/80 mb-2">Status</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
            <span className="text-foreground/70">Found</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
            <span className="text-foreground/70">Copied</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
            <span className="text-foreground/70">Verified</span>
          </div>
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-border/50">
            <div className="w-3 h-3 rounded-full bg-[#a855f7]"></div>
            <span className="text-foreground/70">AI Enriched</span>
          </div>
        </div>
        
        {/* Element counter with fade-in animation */}
        <AnimatePresence>
          {elements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold text-white shadow-lg"
            >
              {elements.length} elements
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
