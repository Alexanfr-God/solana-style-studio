
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Beaker, Sparkles } from 'lucide-react';
import V3MaskEditor from './V3MaskEditor';
import V4MaskEditor from './V4MaskEditor';

const MaskEditor = () => {
  const [activeVersion, setActiveVersion] = useState<'v3' | 'v4'>('v4');

  return (
    <div className="w-full">
      <Tabs value={activeVersion} onValueChange={(value) => setActiveVersion(value as 'v3' | 'v4')} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-black/30 backdrop-blur-md">
            <TabsTrigger value="v3" className="flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              V3 Enhanced
              <Badge variant="outline" className="text-xs">Current</Badge>
            </TabsTrigger>
            <TabsTrigger value="v4" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              V4 Simple
              <Badge className="bg-gradient-to-r from-green-500 to-purple-600 text-white text-xs">NEW</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="v3" className="mt-6">
          <V3MaskEditor />
        </TabsContent>

        <TabsContent value="v4" className="mt-6">
          <V4MaskEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaskEditor;
