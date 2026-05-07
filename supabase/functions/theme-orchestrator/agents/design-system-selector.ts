/**
 * design-system-selector
 *
 * Mini-agent that picks ONE DESIGN.md from the registry based on the
 * user's theme prompt. Output is the chosen DesignSystem (id + content)
 * which is then passed to designer + element-designer as system context.
 *
 * Cheap call: tiny prompt, ~50 output tokens, low temperature.
 * Falls back to DEFAULT_DESIGN_SYSTEM_ID on any error / unmatched id.
 */

import { callClaude } from "../shared/llm.ts";
import {
  loadDesignSystems,
  getDesignSystem,
  DEFAULT_DESIGN_SYSTEM_ID,
  type DesignSystem,
} from "../design-systems/index.ts";

const SYSTEM_PROMPT = `You are a design-system matchmaker for a Phantom crypto-wallet theming tool.

Given a user's free-form theme prompt, pick the ONE design system from the
provided list whose visual language best matches the prompt's vibe.

Rules:
- Return ONLY the id of the chosen system. Lowercase. No prose, no markdown,
  no explanation, no trailing punctuation.
- If the prompt is vague, generic, or doesn't clearly point at any system,
  return "dark-minimal" (the conservative default).
- If the prompt mentions a specific brand/style not in the list, pick the
  closest equivalent (e.g. "Apple Pay" → apple, "Coinbase Pro" → coinbase).
- Crypto/wallet context: prefer fintech systems (coinbase, stripe, robinhood,
  cash-app) for trust-oriented prompts; cyberpunk/vaporwave for dramatic;
  luxury-gold for premium/wealth themes.`;

export async function selectDesignSystem(userPrompt: string): Promise<DesignSystem> {
  const systems = loadDesignSystems();
  const choices = systems.map((d) => `- ${d.id}: ${d.description}`).join("\n");

  const userMsg = `User theme prompt: "${userPrompt}"

Available design systems:
${choices}

Return only the id of the best match.`;

  let chosenId = DEFAULT_DESIGN_SYSTEM_ID;
  try {
    const text = await callClaude({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 30,
      temperature: 0.2,
    });
    chosenId = text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  } catch (e) {
    console.warn(`[design-system-selector] Claude call failed, using default: ${(e as Error).message}`);
  }

  const ds = getDesignSystem(chosenId);
  if (ds) {
    console.log(`[design-system-selector] picked: ${ds.id} (${ds.name})`);
    return ds;
  }

  console.warn(`[design-system-selector] id "${chosenId}" not in registry, falling back to ${DEFAULT_DESIGN_SYSTEM_ID}`);
  const fallback = getDesignSystem(DEFAULT_DESIGN_SYSTEM_ID);
  if (!fallback) throw new Error(`Default design system "${DEFAULT_DESIGN_SYSTEM_ID}" missing from registry`);
  return fallback;
}
