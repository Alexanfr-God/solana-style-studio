
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare } from 'lucide-react';
import { Operation } from 'fast-json-patch';

interface PatchCompareProps {
  patch: Operation[];
  originalTheme?: any;
  updatedTheme?: any;
}

const PatchCompare: React.FC<PatchCompareProps> = ({ 
  patch, 
  originalTheme, 
  updatedTheme 
}) => {
  const getValueAtPath = (obj: any, path: string): any => {
    const keys = path.replace(/^\//, '').split('/');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  };

  const formatValue = (value: any): string => {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getOperationColor = (op: string) => {
    switch (op) {
      case 'replace': return 'bg-yellow-500/20 text-yellow-300';
      case 'add': return 'bg-green-500/20 text-green-300';
      case 'remove': return 'bg-red-500/20 text-red-300';
      default: return 'bg-blue-500/20 text-blue-300';
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-purple-400" />
          Patch Comparison
        </CardTitle>
        <p className="text-sm text-white/70">
          Review changes that will be applied to your theme
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {patch.map((operation, index) => {
          const oldValue = originalTheme ? getValueAtPath(originalTheme, operation.path) : undefined;
          const newValue = operation.op === 'remove' ? undefined : operation.value;

          return (
            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getOperationColor(operation.op)}>
                  {operation.op.toUpperCase()}
                </Badge>
                <code className="text-sm text-white/80 bg-black/30 px-2 py-1 rounded">
                  {operation.path}
                </code>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-white/60 font-medium">Before:</p>
                  <pre className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-300 overflow-x-auto">
                    {formatValue(oldValue)}
                  </pre>
                </div>
                
                <div className="space-y-1">
                  <p className="text-white/60 font-medium">After:</p>
                  <pre className="bg-green-500/10 border border-green-500/20 p-2 rounded text-green-300 overflow-x-auto">
                    {formatValue(newValue)}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}

        {patch.length === 0 && (
          <div className="text-center py-8 text-white/60">
            <GitCompare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No changes to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatchCompare;
