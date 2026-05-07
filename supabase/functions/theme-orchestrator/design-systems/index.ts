/**
 * Design system catalog for theme-orchestrator.
 *
 * Each entry is a curated DESIGN.md file describing one professional
 * aesthetic (Linear, Stripe, Vercel, …). The `design-system-selector`
 * agent picks one entry per generation and feeds the file content to
 * `designer` and `element-designer` as system prompt context.
 *
 * Markdown content lives in <id>.md.ts files (the Supabase CLI bundler
 * only ships .ts files, so the markdown is wrapped as a default-export
 * template literal). To add a new system:
 *   1. Drop a `<id>.md` file alongside the others
 *   2. Run `for f in *.md; do … >${f}.ts; done` in this directory
 *      to generate `<id>.md.ts`
 *   3. Add an entry below with id + ≤160-char description + the import
 */

import linear      from "./linear.md.ts";
import stripe      from "./stripe.md.ts";
import vercel      from "./vercel.md.ts";
import coinbase    from "./coinbase.md.ts";
import robinhood   from "./robinhood.md.ts";
import cashApp     from "./cash-app.md.ts";
import apple       from "./apple.md.ts";
import notion      from "./notion.md.ts";
import raycast     from "./raycast.md.ts";
import elevenlabs  from "./elevenlabs.md.ts";
import cyberpunk   from "./cyberpunk.md.ts";
import vaporwave   from "./vaporwave.md.ts";
import luxuryGold  from "./luxury-gold.md.ts";
import darkMinimal from "./dark-minimal.md.ts";

export interface DesignSystem {
  id: string;
  name: string;
  /** ≤ 160 chars — used by the selector to pick the right system */
  description: string;
  /** Full DESIGN.md content (loaded eagerly at module init) */
  content: string;
}

export const DESIGN_SYSTEMS: DesignSystem[] = [
  {
    id: "linear",
    name: "Linear",
    description: "Clean dev-tool minimalism. Sharp 2px borders, Inter, restrained #5E6AD2 accent. Dark by default. Zero glow.",
    content: linear,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Fintech trust. Deep navy + indigo→cyan gradient CTA. Sohne typography. Soft shadows, no neon.",
    content: stripe,
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Stark black & white. Geist Sans, sharp 6px radii, white-on-black hierarchy. No gradients ever.",
    content: vercel,
  },
  {
    id: "coinbase",
    name: "Coinbase",
    description: "Institutional crypto. #0052FF blue solid CTA, Inter 700, generous spacing. Trustworthy and serious.",
    content: coinbase,
  },
  {
    id: "robinhood",
    name: "Robinhood",
    description: "Bold retail trading. Vivid #00C805 green pill buttons, true black surfaces, large numbers. Inter 700.",
    content: robinhood,
  },
  {
    id: "cash-app",
    name: "Cash App",
    description: "Friendly fintech. Vibrant #00D632 green dominance, fully pill-shaped buttons, playful soft 16px radii.",
    content: cashApp,
  },
  {
    id: "apple",
    name: "Apple",
    description: "iOS/visionOS glassmorphism. Translucent surfaces, backdrop-blur 30px, system blue #0A84FF, SF Pro.",
    content: apple,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Document-soft. Calm grays, #2EAADC blue, small 4-6px radii, no glow. Reads like a page, not an app.",
    content: notion,
  },
  {
    id: "raycast",
    name: "Raycast",
    description: "Sleek productivity launcher. Dark chrome, red→orange gradient #FF6363→#FF8E63 CTA, keyboard-first focus rings.",
    content: raycast,
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Cinematic AI audio. True black + electric blue→cyan gradient #3B82F6→#06B6D4. Waveform energy.",
    content: elevenlabs,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Synthwave night-city. Deep purple-black, magenta+cyan accents, Orbitron uppercase. Neon disciplined to CTAs.",
    content: cyberpunk,
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    description: "Pastel retro-future. Pink #FF71CE + cyan #01CDFE on deep purple, dreamy slow aurora animation.",
    content: vaporwave,
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Premium private banking. Deep #0A0A0A blacks + refined gold #D4AF37, Cormorant Garamond serif italic title.",
    content: luxuryGold,
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Conservative default. Phantom-style #131217 + #AB9FF2 muted purple accent. Safe fallback for vague prompts.",
    content: darkMinimal,
  },
];

/**
 * Return all systems. Synchronous now since markdown is bundled at import time.
 */
export function loadDesignSystems(): DesignSystem[] {
  return DESIGN_SYSTEMS;
}

/**
 * Lookup a single design system by id. Returns null if not found.
 */
export function getDesignSystem(id: string): DesignSystem | null {
  return DESIGN_SYSTEMS.find((d) => d.id === id) ?? null;
}

/**
 * The default fallback when the selector cannot decide.
 */
export const DEFAULT_DESIGN_SYSTEM_ID = "dark-minimal";
