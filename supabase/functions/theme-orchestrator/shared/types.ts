export interface ThemeRequest {
  prompt: string;
  background?: { type: "generate" | "url" | "gif" | "video"; value?: string };
  layer?: string;
  userId: string;
  walletAddress?: string;
  wallet?: string;
}

export interface BackgroundResult {
  url?: string;
  type: "image" | "gif" | "video" | "gradient";
  opacity: number;
  blur?: number;
  gradient?: { from: string; to: string; angle: number };
  color?: string;
  /** When true the background plays a CSS keyframe animation in the overlay */
  animated?: boolean;
  /** Which CSS animation preset to apply (defined in AgentOverlay keyframes) */
  animation_preset?: "gradient-shift" | "aurora" | "cosmic-pulse";
  /** Extra gradient stops used when animation_preset = "gradient-shift" */
  animation_colors?: string[];
}

export interface ColorAnalysis {
  dominant: string[];
  luminance: "dark" | "light" | "mixed";
  luminance_value?: number;
  forbidden: string[];
  forbidden_reason?: string;
  safe_text: string;
  safe_text_secondary?: string;
  safe_accent: string;
  safe_button_bg: string;
  safe_button_text?: string;
  complementary?: string;
  palette: { primary: string; secondary: string; neutral: string; highlight: string; warning?: string };
  regions?: { top: string; center: string; bottom: string };
  mood?: string;
}

export interface ElementStyle {
  style: {
    type: string;
    fill: string;
    fill_opacity: number;
    blur?: number;
    border_color?: string;
    border_width?: number;
    border_radius: number;
    shadow?: { color: string; radius: number; spread: number; x: number; y: number };
    gradient?: { from: string; to: string; angle: number };
    /** CSS filter string e.g. "brightness(1.2) saturate(1.5)" */
    filter?: string;
    /** CSS transform string e.g. "skewX(-2deg) scale(1.02)" */
    transform?: string;
  };
  text?: {
    color: string;
    size: number;
    weight: number;
    letter_spacing?: number;
    opacity: number;
    /** Google Font name e.g. "Orbitron", "Space Grotesk", "Rajdhani" */
    fontFamily?: string;
    /** CSS text-transform: uppercase | capitalize | none */
    textTransform?: string;
    /** CSS text-shadow e.g. "0 0 10px #ff00ff, 0 0 20px #ff00ff80" */
    textShadow?: string;
    /** Line height multiplier e.g. 1.2 */
    lineHeight?: number;
  };
  animation?: {
    type: string;
    duration_ms: number;
    loop: boolean;
    color?: string;
    /** Delay before animation starts (ms) — use for stagger effects */
    delay_ms?: number;
    /** CSS easing e.g. "ease-in-out" | "cubic-bezier(0.4,0,0.2,1)" */
    easing?: string;
    /** Effect intensity 0–1 (scales glow/shimmer magnitude) */
    intensity?: number;
  };
  icon?: { tint: string; opacity: number };
}

export interface WCCOverlayV3 {
  version: 3;
  wallet: "phantom";
  theme_name: string;
  generated_at: string;
  global: { background: BackgroundResult; color_analysis: ColorAnalysis };
  elements: Record<string, ElementStyle>;
}

export interface ValidationResult {
  theme: WCCOverlayV3;
  warnings: string[];
  fixes: number;
}

// ── Designer agent output ─────────────────────────────────────────────────────
export interface DesignBrief {
  visual_concept: string;
  background: {
    description: string;
    mood: string;
    key_colors: string[];
  };
  typography: {
    style: string;
    suggested_font: string;
  };
  elements: {
    header: string;
    buttons: string;
    balance: string;
    token_list: string;
    overall_feel: string;
  };
  animation_style: string;
  design_rationale: string;
}

// ── Director agent output ─────────────────────────────────────────────────────
export interface DirectorVerdict {
  similarity_score: number;        // 0–100
  matched_aspects: string[];       // what was executed well
  missed_aspects: string[];        // what diverged from brief
  highlights: string;              // best element of the result
  verdict: string;                 // one-sentence final judgment
  recommendation: string;          // what to improve on next iteration
}
