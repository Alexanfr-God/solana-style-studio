
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

const V3MaskEditor = () => {
  const { resetEditor } = useMaskEditorStore();

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 relative">
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Mask Editor Temporarily Unavailable
          </h2>
          <p className="text-white/70 mb-6">
            The Draw-to-Mask editor is currently disabled for maintenance. 
            Please use the other customization features available in the app.
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-full border-white/10 text-white/80 hover:text-white"
            >
              Reset Editor State
            </Button>
            
            <p className="text-xs text-white/50">
              We apologize for the inconvenience. This feature will be restored soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default V3MaskEditor;
