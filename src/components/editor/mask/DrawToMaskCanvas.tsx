
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const DrawToMaskCanvas = () => {
  return (
    <Card className="bg-red-500/10 border-red-500/20">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-300 mb-2">
          Draw to Mask Editor Temporarily Disabled
        </h3>
        <p className="text-sm text-red-200">
          This feature is currently under maintenance. Please use other customization options.
        </p>
      </CardContent>
    </Card>
  );
};

export default DrawToMaskCanvas;
