import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DiscoverService, DiscoveryResult } from '@/agents/discovery/DiscoverService';
import { ValidationService, ValidationResult } from '@/agents/discovery/ValidationService';
import { LocalDomInspector } from '@/agents/mcp/LocalDomInspector';
import { SupabaseDbAdapter } from '@/agents/mcp/SupabaseDbAdapter';
import { useThemeStore } from '@/state/themeStore';
import { toast } from 'sonner';
import { Scan, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const DiscoveryPanel: React.FC = () => {
  const [screen, setScreen] = useState<'lock' | 'home'>('lock');
  const [dryRun, setDryRun] = useState(true);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscover = async () => {
    try {
      setIsLoading(true);
      console.log('[DiscoveryPanel] 🚀 Starting discovery');

      const service = new DiscoverService(
        new LocalDomInspector(),
        new SupabaseDbAdapter(),
        () => useThemeStore.getState().theme
      );

      const result = await service.discover(screen, dryRun);
      setResult(result);

      // Check for path changes
      const pathChanges = result.planned.filter(p => p.hasExistingPath && p.existingPath !== p.json_path);
      
      if (dryRun) {
        if (pathChanges.length > 0) {
          toast.warning(`⚠️ ${pathChanges.length} elements would have their paths changed. Enable "Override existing" to apply.`);
        } else {
          toast.info(`Dry-run complete: ${result.planned.length} elements found`);
        }
      } else {
        if (pathChanges.length > 0 && !overrideExisting) {
          toast.error('❌ Cannot apply: some paths would be overwritten. Enable "Override existing" to proceed.');
        } else {
          toast.success(`✅ Applied: ${result.updated} elements updated`);
        }
      }
    } catch (error) {
      console.error('[DiscoveryPanel] Error:', error);
      toast.error('Discovery failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setIsLoading(true);
      console.log('[DiscoveryPanel] 🔍 Starting validation');

      const service = new ValidationService(
        new SupabaseDbAdapter(),
        () => useThemeStore.getState().theme
      );

      const result = await service.validate(screen);
      setValidationResult(result);

      const okCount = result.filter(r => r.exists).length;
      const missingCount = result.filter(r => !r.exists).length;
      
      if (missingCount > 0) {
        toast.warning(`⚠️ Validation: ${okCount} OK, ${missingCount} missing paths`);
      } else {
        toast.success(`✅ Validation: all ${okCount} paths exist in theme`);
      }
    } catch (error) {
      console.error('[DiscoveryPanel] Validation error:', error);
      toast.error('Validation failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const pathChanges = result?.planned.filter(p => p.hasExistingPath && p.existingPath !== p.json_path) || [];

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Scan className="h-5 w-5 text-purple-400" />
          🔍 Discovery System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200 text-sm">
            Discovery scans DOM elements with [data-element-id] and maps them to Theme JSON paths.
            Use <strong>Dry-run</strong> (default) to preview changes before applying.
          </AlertDescription>
        </Alert>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-white/70">Screen:</label>
            <Select value={screen} onValueChange={(v) => setScreen(v as 'lock' | 'home')}>
              <SelectTrigger className="w-32 bg-black/30 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lock">Lock</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="dryRun" 
              checked={dryRun} 
              onCheckedChange={(v) => setDryRun(!!v)} 
            />
            <label htmlFor="dryRun" className="text-sm text-white font-bold">
              Dry-run (preview only)
            </label>
          </div>

          {!dryRun && (
            <div className="flex items-center gap-2">
              <Checkbox 
                id="override" 
                checked={overrideExisting} 
                onCheckedChange={(v) => setOverrideExisting(!!v)} 
              />
              <label htmlFor="override" className="text-sm text-orange-300">
                Override existing paths
              </label>
            </div>
          )}

          <Button 
            onClick={handleDiscover} 
            disabled={isLoading || (!dryRun && pathChanges.length > 0 && !overrideExisting)} 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Processing...' : 'Discover'}
          </Button>

          <Button 
            onClick={handleValidate} 
            disabled={isLoading} 
            size="sm" 
            variant="outline"
            className="border-white/20"
          >
            Validate
          </Button>
        </div>

        {/* Path Changes Warning */}
        {pathChanges.length > 0 && (
          <Alert className="bg-orange-500/10 border-orange-500/30">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200 text-sm">
              <strong>{pathChanges.length} elements</strong> would have their json_path changed.
              {!overrideExisting && !dryRun && ' Enable "Override existing paths" to proceed.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Table */}
        {result && result.planned.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              Discovery Results: {result.planned.length} elements
            </h4>
            <div className="max-h-96 overflow-auto border border-white/10 rounded-lg">
              <table className="w-full text-xs text-white">
                <thead className="bg-black/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">JSON Path</th>
                    <th className="p-2 text-center">In Theme</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.planned.map((item) => {
                    const pathChanged = item.hasExistingPath && item.existingPath !== item.json_path;
                    
                    return (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-2 font-mono text-purple-300">{item.id}</td>
                        <td className="p-2 font-mono text-blue-300">
                          {pathChanged && (
                            <div className="text-orange-300 text-xs mb-1">
                              Was: {item.existingPath}
                            </div>
                          )}
                          {item.json_path}
                        </td>
                        <td className="p-2 text-center">
                          {item.existsInTheme ? '✅' : '❌'}
                        </td>
                        <td className="p-2 text-center">
                          {pathChanged ? (
                            <Badge variant="outline" className="text-orange-400 border-orange-400">
                              Path Changed
                            </Badge>
                          ) : dryRun ? (
                            <Badge variant="outline" className="text-gray-400">Dry-run</Badge>
                          ) : (
                            <Badge className="bg-green-600">Applied</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!dryRun && (
              <div className="mt-2 text-sm text-green-300">
                ✅ {result.updated} elements upserted
              </div>
            )}
          </div>
        )}

        {/* Validation Results */}
        {validationResult && validationResult.length > 0 && (
          <div className="mt-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              Validation Results
            </h4>
            <div className="max-h-64 overflow-auto border border-white/10 rounded-lg">
              <table className="w-full text-xs text-white">
                <thead className="bg-black/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">JSON Path</th>
                    <th className="p-2 text-center">Status</th>
                    <th className="p-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-mono text-purple-300">{item.id}</td>
                      <td className="p-2 font-mono text-blue-300">{item.json_path}</td>
                      <td className="p-2 text-center">
                        {item.exists ? (
                          <Badge className="bg-green-600">OK</Badge>
                        ) : (
                          <Badge variant="destructive">Missing</Badge>
                        )}
                      </td>
                      <td className="p-2 font-mono text-gray-400 truncate max-w-xs">
                        {item.exists ? JSON.stringify(item.value) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
