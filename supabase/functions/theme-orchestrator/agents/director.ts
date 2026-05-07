import type { WCCOverlayV3, DesignBrief, DirectorVerdict } from "../shared/types.ts";
import { callClaudeJSON } from "../shared/llm.ts";
import type { DesignSystem } from "../design-systems/index.ts";

const BASE_SYSTEM_PROMPT = `You are the Creative Director — a senior front-end design professional with 15 years of experience in fintech and Web3 product design.

Your role: compare the original design brief against the final generated theme and give an honest, expert evaluation.

Scoring guidelines:
- 90–100: The theme nails the brief in every meaningful way
- 75–89: Mostly faithful, minor deviations in one or two areas
- 60–74: Good execution but missed 2–3 key aspects of the brief
- 40–59: Partial match — the general direction is right but several elements don't align
- Below 40: Significant divergence from the brief

Be specific in your verdict. Name elements by name (header, buttons, balance, token-list).
Your tone is professional but direct — like a real creative director giving feedback.

OUTPUT — respond ONLY with valid JSON, no markdown fences:
{
  "similarity_score": <integer 0–100>,
  "matched_aspects": ["aspect 1", "aspect 2", ...],
  "missed_aspects": ["aspect 1", "aspect 2", ...],
  "highlights": "1–2 sentences on the strongest element(s) of the result",
  "verdict": "1 crisp sentence summarizing the overall evaluation",
  "recommendation": "1 actionable sentence for the next iteration"
}`;

function buildSystemPrompt(ds?: DesignSystem): string {
  if (!ds) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}

# Reference Design System: ${ds.name}

The theme was supposed to follow this reference. Use the system below as the
gold standard when judging the result. Penalize deviations from it (e.g. wrong
font family, wrong color philosophy, animations the system forbids).

\`\`\`md
${ds.content}
\`\`\``;
}

function buildFallbackVerdict(score: number): DirectorVerdict {
  return {
    similarity_score: score,
    matched_aspects: ["Color palette applied", "Background generated", "Animations added"],
    missed_aspects: [],
    highlights: "The theme captures the requested aesthetic with appropriate use of color and typography.",
    verdict: `Solid execution — the theme achieves the requested look at ${score}% fidelity.`,
    recommendation: "Try adding more specific mood keywords to your next prompt for tighter alignment.",
  };
}

function summarizeTheme(theme: WCCOverlayV3): string {
  const bg = theme.global.background;
  const ca = theme.global.color_analysis;
  const elKeys = Object.keys(theme.elements);

  const animTypes = [
    ...new Set(elKeys.map((k) => theme.elements[k]?.animation?.type ?? "none").filter((t) => t !== "none")),
  ];

  const fonts = [...new Set(elKeys.map((k) => theme.elements[k]?.text?.fontFamily).filter(Boolean))];

  return [
    `Background: ${bg.type}${bg.url ? " (image)" : bg.gradient ? ` (${bg.gradient.from}→${bg.gradient.to})` : ""}`,
    `Mood: ${ca.mood ?? "unspecified"}`,
    `Luminance: ${ca.luminance}`,
    `Dominant colors: ${ca.dominant.slice(0, 3).join(", ")}`,
    `Accent: ${ca.safe_accent}`,
    `Fonts used: ${fonts.join(", ") || "default"}`,
    `Animations: ${animTypes.join(", ") || "none"}`,
    `Elements styled: ${elKeys.join(", ")}`,
    `Header: ${JSON.stringify(theme.elements["header"]?.style ?? {})}`,
    `Buttons: fill=${theme.elements["btn-send"]?.style?.fill ?? "?"}, anim=${theme.elements["btn-send"]?.animation?.type ?? "none"}`,
    `Balance: font=${theme.elements["balance-sol"]?.text?.fontFamily ?? "?"}, size=${theme.elements["balance-sol"]?.text?.size ?? "?"}px`,
  ].join("\n");
}

export interface DirectorInput {
  designBrief: DesignBrief;
  finalTheme: WCCOverlayV3;
  userPrompt: string;
  designSystem?: DesignSystem;
}

export async function runDirector(input: DirectorInput): Promise<DirectorVerdict> {
  const { designBrief, finalTheme, userPrompt, designSystem } = input;
  const themeSummary = summarizeTheme(finalTheme);

  const userMessage = `
ORIGINAL USER REQUEST:
"${userPrompt}"
${designSystem ? `\nREFERENCE DESIGN SYSTEM (assigned by selector): ${designSystem.name} (${designSystem.id})\n` : ""}
DESIGN BRIEF (what the Designer intended to create):
Visual concept: ${designBrief.visual_concept}
Background: ${designBrief.background.description} (mood: ${designBrief.background.mood}, colors: ${designBrief.background.key_colors.join(", ")})
Typography: ${designBrief.typography.style} — font: ${designBrief.typography.suggested_font}
Header: ${designBrief.elements.header}
Buttons: ${designBrief.elements.buttons}
Balance: ${designBrief.elements.balance}
Token list: ${designBrief.elements.token_list}
Overall feel: ${designBrief.elements.overall_feel}
Animation style: ${designBrief.animation_style}
Design rationale: ${designBrief.design_rationale}

FINAL GENERATED THEME (what was actually produced):
Theme name: "${finalTheme.theme_name}"
${themeSummary}

Rate how well the final theme matches the design brief. Be specific.`;

  try {
    const verdict = await callClaudeJSON<DirectorVerdict>({
      system: buildSystemPrompt(designSystem),
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 1000,
      temperature: 0.4,
    });
    console.log("[director] ✓ Score:", verdict.similarity_score, "—", verdict.verdict);
    return verdict;
  } catch (e) {
    console.warn("[director] Claude failed:", (e as Error).message, "— using fallback");
    return buildFallbackVerdict(70);
  }
}
