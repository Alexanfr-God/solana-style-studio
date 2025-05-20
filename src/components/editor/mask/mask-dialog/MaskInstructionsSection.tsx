
import React from 'react';
import { ExternalLink } from 'lucide-react';

export const MaskInstructionsSection = () => {
  return (
    <div className="bg-black/40 rounded-lg border border-white/10 p-4">
      <h3 className="text-white font-medium mb-3">How it works</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
          <span className="text-2xl mb-2">🎨</span>
          <p className="text-sm font-medium">1. Generate your custom mask with AI</p>
          <a 
            href="https://chatgpt.com/g/g-682a38c975b881918621ac1517cf68db-wallet-coast-customs-v3" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 text-xs flex items-center justify-center gap-1 text-purple-400 hover:text-purple-300"
          >
            Open Mask Generator <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
          <span className="text-2xl mb-2">⬆️</span>
          <p className="text-sm font-medium">2. Upload the PNG file you created</p>
          <span className="mt-2 text-xs text-white/40">Use PNG with transparency</span>
        </div>
        
        <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
          <span className="text-2xl mb-2">✨</span>
          <p className="text-sm font-medium">3. Apply it to the wallet interface</p>
          <span className="mt-2 text-xs text-white/40">See your design come to life</span>
        </div>
      </div>
    </div>
  );
};
