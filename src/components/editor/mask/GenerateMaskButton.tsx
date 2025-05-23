
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const GenerateMaskButton = () => {
  return (
    <Card className="bg-yellow-500/10 border-yellow-500/20">
      <CardContent className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
        <h4 className="text-sm font-medium text-yellow-300 mb-1">
          Generation Disabled
        </h4>
        <p className="text-xs text-yellow-200">
          Mask generation is temporarily unavailable.
        </p>
      </CardContent>
    </Card>
  );
};

export default GenerateMaskButton;
