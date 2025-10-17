import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ProbeResult } from '@/stores/themeProbeStore';

interface CoverageLegendProps {
  result: ProbeResult | null;
}

export const CoverageLegend: React.FC<CoverageLegendProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Run "Probe & Paint" to see coverage
        </div>
      </div>
    );
  }

  const coverage = result.coverage || 0;
  const statusCounts = {
    OK: result.items.filter(i => i.status === 'OK').length,
    AMBIGUOUS: result.items.filter(i => i.status === 'AMBIGUOUS').length,
    UNMAPPED: result.items.filter(i => i.status === 'UNMAPPED').length,
    NON_SCALAR: result.items.filter(i => i.status === 'NON_SCALAR').length,
  };

  return (
    <div className="space-y-4">
      {/* Coverage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Coverage</span>
          <span className="text-muted-foreground">{coverage}%</span>
        </div>
        <Progress value={coverage} className="h-2" />
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2">Status Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded border-2 border-green-600 bg-green-600/35" />
            <span className="text-green-600 font-medium">OK</span>
            <span className="text-muted-foreground ml-auto">{statusCounts.OK}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded border-2 border-yellow-600 bg-yellow-600/35" />
            <span className="text-yellow-600 font-medium">Ambiguous</span>
            <span className="text-muted-foreground ml-auto">{statusCounts.AMBIGUOUS}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded border-2 border-red-600 bg-red-600/35" />
            <span className="text-red-600 font-medium">Unmapped</span>
            <span className="text-muted-foreground ml-auto">{statusCounts.UNMAPPED}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded border-2 border-gray-600 bg-gray-600/35" />
            <span className="text-gray-600 font-medium">Non-Scalar</span>
            <span className="text-muted-foreground ml-auto">{statusCounts.NON_SCALAR}</span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="pt-2 border-t text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Total Elements</span>
          <span className="text-muted-foreground">{result.totalElements || 0}</span>
        </div>
      </div>
    </div>
  );
};
