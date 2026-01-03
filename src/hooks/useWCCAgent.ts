import { useState, useEffect, useCallback, useRef } from 'react';
import { WCCAgent, WCCAgentConfig, AgentSnapshot, MaskConfig, SafeZoneConfig, createWCCAgent } from '@/lib/wcc-agent';

export function useWCCAgent(initialConfig: WCCAgentConfig) {
  const agentRef = useRef<WCCAgent | null>(null);
  const [snapshot, setSnapshot] = useState<AgentSnapshot | null>(null);
  const [config, setConfig] = useState<WCCAgentConfig>(initialConfig);

  // Initialize agent once
  useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = createWCCAgent(initialConfig);
      setSnapshot(agentRef.current.getSnapshot());
      setConfig(agentRef.current.getConfig());
    }
  }, []);

  // Subscribe to agent updates
  useEffect(() => {
    const agent = agentRef.current;
    if (!agent) return;

    const unsubscribe = agent.subscribe(() => {
      setSnapshot(agent.getSnapshot());
      setConfig(agent.getConfig());
    });

    return unsubscribe;
  }, []);

  const setContainer = useCallback((width: number, height: number) => {
    agentRef.current?.setContainer(width, height);
  }, []);

  const setSafeZone = useCallback((safeZone: SafeZoneConfig) => {
    agentRef.current?.setSafeZone(safeZone);
  }, []);

  const applyMask = useCallback((maskConfig: MaskConfig | null) => {
    agentRef.current?.applyMask(maskConfig);
  }, []);

  const setHighlight = useCallback((enabled: boolean) => {
    agentRef.current?.setHighlight(enabled);
  }, []);

  const setGrid = useCallback((enabled: boolean, step?: number) => {
    agentRef.current?.setGrid(enabled, step);
  }, []);

  const exportJSON = useCallback(() => {
    return agentRef.current?.exportJSON() ?? null;
  }, []);

  const copyJSON = useCallback(async () => {
    const json = exportJSON();
    if (json) {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      return true;
    }
    return false;
  }, [exportJSON]);

  const downloadJSON = useCallback(() => {
    const json = exportJSON();
    if (json) {
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wcc-mask-config.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [exportJSON]);

  return {
    agent: agentRef.current,
    snapshot,
    config,
    setContainer,
    setSafeZone,
    applyMask,
    setHighlight,
    setGrid,
    exportJSON,
    copyJSON,
    downloadJSON,
  };
}
