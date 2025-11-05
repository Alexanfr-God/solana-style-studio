import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ElementItem } from '@/stores/aiScannerStore';

interface Props {
  elements: ElementItem[];
  walletType: string;
  screenshotUrl?: string | null;
}

/**
 * Canvas Renderer - Visualizes found elements on canvas
 * Displays elements with fade-in animations and status colors
 */
export const WalletCanvasRenderer: React.FC<Props> = ({ 
  elements, 
  walletType,
  screenshotUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
        ctx.drawImage(img, 0, 0, width, height);
        drawElements();
      };
      img.src = screenshotUrl;
    } else {
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
      
      drawElements();
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
        
        // Draw element background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, elementWidth, elementHeight);
        
        // Draw border
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
        ctx.font = '10px monospace';
        const label = el.id.substring(0, 12);
        ctx.fillText(label, x + 5, y - 8);
        
        // Draw type badge
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fillRect(x + 5, y + 5, 40, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px sans-serif';
        ctx.fillText(el.type, x + 8, y + 16);
        
        // Draw metrics if available
        if (el.metrics) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '8px monospace';
          ctx.fillText(
            `${el.metrics.width}×${el.metrics.height}`, 
            x + 5, 
            y + elementHeight - 8
          );
        }
      });
      
      // Draw info text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `${walletType} • ${elements.length} elements found`, 
        padding, 
        height - padding
      );
    }
    
  }, [elements, screenshotUrl, walletType]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center bg-black/10 rounded-lg p-4"
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-border/50 rounded-lg shadow-lg"
        />
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg border border-border/50 space-y-1">
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
        </div>
      </div>
    </motion.div>
  );
};
