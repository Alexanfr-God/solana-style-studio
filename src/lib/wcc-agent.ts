/**
 * WCC-Agent Core
 * Unified API for both Lovable simulator and Chrome extension
 */

export interface ContainerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SafeZoneConfig {
  padding?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface MaskConfig {
  src: string;
  fit: 'cover' | 'contain' | 'stretch';
  anchor: { x: number; y: number };
  offset: { dx: number; dy: number };
  scale: number;
  opacity: number;
}

export interface AgentSnapshot {
  containerRect: ContainerRect;
  maskRect: ContainerRect | null;
  safeRect: ContainerRect;
}

export interface WCCAgentConfig {
  containerWidth: number;
  containerHeight: number;
  canvasWidth?: number;
  canvasHeight?: number;
  safeZone?: SafeZoneConfig;
  mask?: MaskConfig | null;
  highlightEnabled?: boolean;
  gridEnabled?: boolean;
  gridStep?: number;
}

export class WCCAgent {
  private config: WCCAgentConfig;
  private containerRect: ContainerRect;
  private listeners: Set<() => void> = new Set();

  constructor(config: WCCAgentConfig) {
    this.config = {
      canvasWidth: 1400,
      canvasHeight: 1400,
      highlightEnabled: true,
      gridEnabled: false,
      gridStep: 20,
      ...config,
    };
    this.containerRect = this.computeContainerRect();
  }

  private computeContainerRect(): ContainerRect {
    const { containerWidth, containerHeight, canvasWidth = 1400, canvasHeight = 1400 } = this.config;
    return {
      x: (canvasWidth - containerWidth) / 2,
      y: (canvasHeight - containerHeight) / 2,
      width: containerWidth,
      height: containerHeight,
    };
  }

  private computeSafeRect(): ContainerRect {
    const { safeZone } = this.config;
    const container = this.containerRect;
    
    if (!safeZone) {
      return { ...container };
    }

    const padding = safeZone.padding ?? 0;
    const top = safeZone.top ?? padding;
    const right = safeZone.right ?? padding;
    const bottom = safeZone.bottom ?? padding;
    const left = safeZone.left ?? padding;

    return {
      x: container.x + left,
      y: container.y + top,
      width: container.width - left - right,
      height: container.height - top - bottom,
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn());
  }

  // Public API - same interface for extension and simulator

  setContainer(width: number, height: number): void {
    this.config.containerWidth = width;
    this.config.containerHeight = height;
    this.containerRect = this.computeContainerRect();
    this.notifyListeners();
    console.log('[WCC-Agent] Container updated:', this.containerRect);
  }

  setSafeZone(safeZone: SafeZoneConfig): void {
    this.config.safeZone = safeZone;
    this.notifyListeners();
    console.log('[WCC-Agent] SafeZone updated:', this.computeSafeRect());
  }

  applyMask(maskConfig: MaskConfig | null): void {
    this.config.mask = maskConfig;
    this.notifyListeners();
    console.log('[WCC-Agent] Mask applied:', maskConfig);
  }

  setHighlight(enabled: boolean): void {
    this.config.highlightEnabled = enabled;
    this.notifyListeners();
  }

  setGrid(enabled: boolean, step?: number): void {
    this.config.gridEnabled = enabled;
    if (step !== undefined) {
      this.config.gridStep = step;
    }
    this.notifyListeners();
  }

  getSnapshot(): AgentSnapshot {
    return {
      containerRect: { ...this.containerRect },
      maskRect: this.config.mask ? this.computeMaskRect() : null,
      safeRect: this.computeSafeRect(),
    };
  }

  getConfig(): WCCAgentConfig {
    return { ...this.config };
  }

  private computeMaskRect(): ContainerRect | null {
    const { mask } = this.config;
    if (!mask) return null;

    // For now, return container rect scaled
    // Full mask positioning will be in Step C
    const container = this.containerRect;
    return {
      x: container.x + mask.offset.dx,
      y: container.y + mask.offset.dy,
      width: container.width * mask.scale,
      height: container.height * mask.scale,
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  exportJSON(): object {
    const { containerWidth, containerHeight, safeZone, mask } = this.config;
    return {
      container: { w: containerWidth, h: containerHeight },
      safe: safeZone ? { 
        padding: safeZone.padding,
        ...(safeZone.top !== undefined && { top: safeZone.top }),
        ...(safeZone.right !== undefined && { right: safeZone.right }),
        ...(safeZone.bottom !== undefined && { bottom: safeZone.bottom }),
        ...(safeZone.left !== undefined && { left: safeZone.left }),
      } : { padding: 0 },
      mask: mask ? {
        src: mask.src,
        fit: mask.fit,
        anchor: mask.anchor,
        offset: mask.offset,
        scale: mask.scale,
        opacity: mask.opacity,
      } : null,
    };
  }
}

// Factory function for creating agent
export function createWCCAgent(config: WCCAgentConfig): WCCAgent {
  return new WCCAgent(config);
}
