export interface ThemeRequest {
  prompt: string;
  background?: {
    type: "generate" | "url" | "gif" | "video";
    value?: string;
  };
  wallet: "phantom";
  userId?: string;
}

export interface BackgroundResult {
  type: "image" | "gif" | "video" | "gradient" | "solid";
  url?: string;
  gradient?: { from: string; to: string; angle: number };
  color?: string;
  blur?: number;
  opacity: number;
}

export interface ColorAnalysis {
  dominant: string[];
  luminance: "dark" | "light" | "mixed";
  forbidden: string[];
  forbidden_reason?: string;
  safe_text: string;
  safe_accent: string;
  safe_button_bg: string;
  complementary: string;
  palette: {
    primary: string;
    secondary: string;
    neutral: string;
    highlight: string;
  };
}

export interface ElementStyle {
  style: {
    type: "glassmorphism" | "solid" | "gradient" | "neon" | "neumorphic" | "transparent";
    fill: string;
    fill_opacity: number;
    blur?: number;
    border_color?: string;
    border_width?: number;
    border_radius: number;
    shadow?: {
      color: string;
      radius: number;
      spread: number;
      x: number;
      y: number;
    };
    gradient?: {
      from: string;
      to: string;
      angle: number;
    };
  };
  text?: {
    color: string;
    size: number;
    weight: number;
    opacity: number;
  };
  animation?: {
    type: "none" | "pulse" | "shimmer" | "glow" | "ripple" | "bounce" | "float";
    duration_ms: number;
    loop: boolean;
    color?: string;
  };
  icon?: {
    tint: string;
    opacity: number;
  };
}

export interface WCCOverlayV3 {
  version: 3;
  wallet: "phantom";
  theme_name: string;
  generated_at: string;
  global: {
    background: BackgroundResult;
    color_analysis: ColorAnalysis;
  };
  elements: Record<string, ElementStyle>;
}
