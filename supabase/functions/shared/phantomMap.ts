export const PHANTOM_ELEMENT_MAP = {
  "background-layer": { x: 0,   y: 0,   width: 380, height: 600 },
  "header":           { x: 0,   y: 0,   width: 380, height: 60  },
  "network-badge":    { x: 16,  y: 18,  width: 80,  height: 24  },
  "account-address":  { x: 16,  y: 72,  width: 280, height: 32  },
  "balance-sol":      { x: 0,   y: 120, width: 380, height: 48  },
  "balance-usd":      { x: 0,   y: 168, width: 380, height: 24  },
  "btn-send":         { x: 20,  y: 210, width: 80,  height: 72  },
  "btn-receive":      { x: 110, y: 210, width: 80,  height: 72  },
  "btn-swap":         { x: 200, y: 210, width: 80,  height: 72  },
  "btn-buy":          { x: 290, y: 210, width: 80,  height: 72  },
  "token-list-item":  { x: 0,   y: 300, width: 380, height: 56  },
} as const;

export type PhantomElementId = keyof typeof PHANTOM_ELEMENT_MAP;
