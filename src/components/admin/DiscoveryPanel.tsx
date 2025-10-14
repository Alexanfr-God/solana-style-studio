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
import { ThemeProbe, ProbeResult } from '@/agents/mcp/ThemeProbe';
import { ZustandThemeAdapter } from '@/agents/mcp/ZustandThemeAdapter';
import { useThemeStore } from '@/state/themeStore';
import { toast } from 'sonner';
import { Scan, CheckCircle2, AlertTriangle, Info, Microscope } from 'lucide-react';

export const DiscoveryPanel: React.FC = () => {
  const [screen, setScreen] = useState<'lock' | 'home'>('lock');
  const [dryRun, setDryRun] = useState(true);
  const [overrideExisting, setOverrideExisting] = useState(false);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [probeProgress, setProbeProgress] = useState<{ current: number; total: number; path: string } | null>(null);

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

  const handleAutoMap = async () => {
    try {
      setIsLoading(true);
      setProbeProgress({ current: 0, total: 0, path: 'Opening Preview window for DOM scanning...' });
      setProbeResult(null);
      console.log('[DiscoveryPanel] 🔬 Starting ThemeProbe auto-mapping');

      // Import bridge
      const { runThemeProbeInPreview } = await import('@/agents/mcp/ThemeProbeBridge');
      
      // Run ThemeProbe in Preview page via PostMessage
      const result = await runThemeProbeInPreview(screen);

      setProbeResult(result);

      // Import and export results
      const { ThemeProbe } = await import('@/agents/mcp/ThemeProbe');
      const { ZustandThemeAdapter } = await import('@/agents/mcp/ZustandThemeAdapter');
      const adapter = new ZustandThemeAdapter();
      const probe = new ThemeProbe(adapter);
      await probe.exportResults(result, screen);

      toast.success(`✅ Auto-mapping complete: ${result.totals.OK} OK (${(result.coverage * 100).toFixed(1)}% coverage)`);
      toast.info('📄 Results exported to downloads');
    } catch (error) {
      console.error('[DiscoveryPanel] ThemeProbe error:', error);
      toast.error('Auto-mapping failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
      setProbeProgress(null);
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

          <Button 
            onClick={handleAutoMap} 
            disabled={isLoading} 
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Microscope className="h-4 w-4 mr-1" />
            Auto-Map (ThemeProbe)
          </Button>
        </div>

        {/* Progress indicator */}
        {probeProgress && (
          <Alert className="bg-purple-500/10 border-purple-500/30">
            <Microscope className="h-4 w-4 text-purple-400 animate-pulse" />
            <AlertDescription className="text-purple-200 text-sm">
              Probing: {probeProgress.current}/{probeProgress.total} scalars
              <div className="text-xs text-purple-300/70 mt-1 font-mono truncate">
                {probeProgress.path}
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        {/* ThemeProbe Results */}
        {probeResult && (
          <div className="mt-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Microscope className="h-4 w-4 text-purple-400" />
              ThemeProbe Results: {(probeResult.coverage * 100).toFixed(1)}% coverage
            </h4>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
                <div className="text-xs text-green-300">OK</div>
                <div className="text-lg font-bold text-green-400">{probeResult.totals.OK}</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2 text-center">
                <div className="text-xs text-orange-300">AMBIGUOUS</div>
                <div className="text-lg font-bold text-orange-400">{probeResult.totals.AMBIGUOUS}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
                <div className="text-xs text-red-300">UNMAPPED</div>
                <div className="text-lg font-bold text-red-400">{probeResult.totals.UNMAPPED}</div>
              </div>
              <div className="bg-gray-500/10 border border-gray-500/30 rounded p-2 text-center">
                <div className="text-xs text-gray-300">NON_SCALAR</div>
                <div className="text-lg font-bold text-gray-400">{probeResult.totals.NON_SCALAR}</div>
              </div>
            </div>

            {/* Results table */}
            <div className="max-h-96 overflow-auto border border-white/10 rounded-lg">
              <table className="w-full text-xs text-white">
                <thead className="bg-black/50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Best Path</th>
                    <th className="p-2 text-center">Confidence</th>
                    <th className="p-2 text-left">Changed Props</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {probeResult.items.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-mono text-purple-300">{item.id}</td>
                      <td className="p-2 font-mono text-blue-300 truncate max-w-xs">
                        {item.bestPath || '—'}
                      </td>
                      <td className="p-2 text-center">
                        {item.confidence > 0 ? (
                          <span className={
                            item.confidence >= 0.8 ? 'text-green-400' :
                            item.confidence >= 0.6 ? 'text-orange-400' :
                            'text-red-400'
                          }>
                            {(item.confidence * 100).toFixed(0)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-2 text-xs text-gray-400">
                        {item.changedProps?.join(', ') || '—'}
                      </td>
                      <td className="p-2 text-center">
                        {item.status === 'OK' && (
                          <Badge className="bg-green-600">OK</Badge>
                        )}
                        {item.status === 'AMBIGUOUS' && (
                          <Badge className="bg-orange-500">AMBIGUOUS</Badge>
                        )}
                        {item.status === 'UNMAPPED' && (
                          <Badge variant="destructive">UNMAPPED</Badge>
                        )}
                        {item.status === 'NON_SCALAR' && (
                          <Badge variant="outline" className="text-gray-400">NON_SCALAR</Badge>
                        )}
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
