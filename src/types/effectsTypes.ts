
export interface EffectsConfig {
  splashCursor: {
    enabled: boolean;
    intensity: number;
    colorMode: 'theme' | 'rainbow' | 'monochrome';
  };
}

export interface SplashCursorSettings {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  COLOR_UPDATE_SPEED: number;
}
