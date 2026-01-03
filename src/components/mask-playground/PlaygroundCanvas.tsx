import React from 'react';
import { AgentSnapshot, WCCAgentConfig } from '@/lib/wcc-agent';

interface PlaygroundCanvasProps {
  config: WCCAgentConfig;
  snapshot: AgentSnapshot | null;
}

export function PlaygroundCanvas({ config, snapshot }: PlaygroundCanvasProps) {
  const { canvasWidth = 1400, canvasHeight = 1400, gridEnabled, gridStep = 20, highlightEnabled } = config;
  
  if (!snapshot) return null;

  const { containerRect, safeRect } = snapshot;

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      className="bg-background border border-border rounded-lg"
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Grid */}
      {gridEnabled && (
        <defs>
          <pattern
            id="grid"
            width={gridStep}
            height={gridStep}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
      )}
      {gridEnabled && (
        <rect width={canvasWidth} height={canvasHeight} fill="url(#grid)" />
      )}

      {/* Container (extension home) */}
      <rect
        x={containerRect.x}
        y={containerRect.y}
        width={containerRect.width}
        height={containerRect.height}
        fill="hsl(var(--muted) / 0.3)"
        stroke={highlightEnabled ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
        strokeWidth={highlightEnabled ? 2 : 1}
        rx={4}
      />

      {/* Container label */}
      <text
        x={containerRect.x + containerRect.width / 2}
        y={containerRect.y - 10}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize="14"
        fontFamily="monospace"
      >
        {containerRect.width} × {containerRect.height}
      </text>

      {/* Safe Zone */}
      <defs>
        <pattern
          id="safe-hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="8"
            stroke="hsl(var(--destructive))"
            strokeWidth="1"
            opacity="0.4"
          />
        </pattern>
      </defs>
      
      <rect
        x={safeRect.x}
        y={safeRect.y}
        width={safeRect.width}
        height={safeRect.height}
        fill="url(#safe-hatch)"
        stroke="hsl(var(--destructive))"
        strokeWidth="1"
        strokeDasharray="4 2"
        rx={2}
      />

      {/* Safe Zone label */}
      <text
        x={safeRect.x + safeRect.width / 2}
        y={safeRect.y + safeRect.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="hsl(var(--destructive))"
        fontSize="12"
        fontWeight="bold"
        opacity="0.7"
      >
        SAFE ZONE
      </text>

      {/* Center crosshair */}
      <line
        x1={canvasWidth / 2 - 20}
        y1={canvasHeight / 2}
        x2={canvasWidth / 2 + 20}
        y2={canvasHeight / 2}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={canvasWidth / 2}
        y1={canvasHeight / 2 - 20}
        x2={canvasWidth / 2}
        y2={canvasHeight / 2 + 20}
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
