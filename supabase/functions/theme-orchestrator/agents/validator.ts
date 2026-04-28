import type { BackgroundResult, ColorAnalysis, ElementStyle, WCCOverlayV3, ValidationResult } from "../shared/types.ts";
import { contrastRatio, colorDistance, isValidColor, extractAllColors } from "../shared/contrastUtils.ts";

function themeName(mood?: string, prompt?: string): string {
  if (mood) return mood.split(" ").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
  if (prompt) {
    const words = prompt.trim().split(/\s+/).slice(0, 3);
    return words.map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
  }
  return "Custom Theme";
}

export async function runValidator(input: {
  background: BackgroundResult;
  colors: ColorAnalysis;
  elements: Record<string, ElementStyle>;
  userPrompt: string;
}): Promise<ValidationResult> {
  const warnings: string[] = [];
  let fixes = 0;

  // Deep clone elements to avoid mutating input
  const elements: Record<string, ElementStyle> = JSON.parse(JSON.stringify(input.elements));

  for (const [id, element] of Object.entries(elements)) {
    // 1. Validate all colors
    const allColors = extractAllColors(element);
    for (const color of allColors) {
      if (!isValidColor(color)) {
        warnings.push(`${id}: invalid color "${color}" → replaced with neutral`);
        if (element.style?.fill === color) element.style.fill = input.colors.palette.neutral;
        if (element.style?.border_color === color) element.style.border_color = input.colors.safe_accent;
        if (element.text?.color === color) element.text.color = input.colors.safe_text;
        fixes++;
      }
    }

    // 2. Check forbidden color proximity
    for (const color of allColors) {
      for (const forbidden of input.colors.forbidden) {
        if (isValidColor(color) && isValidColor(forbidden) && colorDistance(color, forbidden) < 30) {
          warnings.push(`${id}: color ${color} too close to forbidden ${forbidden} (distance: ${colorDistance(color, forbidden).toFixed(0)})`);
          if (element.style?.fill === color) {
            element.style.fill = input.colors.safe_accent;
            fixes++;
          }
        }
      }
    }

    // 3. Text contrast check
    if (element.text?.color && element.style?.fill && element.style.type !== "transparent") {
      const ratio = contrastRatio(element.text.color, element.style.fill);
      if (ratio < 3.0) {
        warnings.push(`${id}: text contrast ${ratio.toFixed(2)}:1 < 3:1 → forcing safe_text`);
        element.text.color = input.colors.safe_text;
        fixes++;
      }
    }

    // 4. Ensure background-layer is always transparent
    if (id === "background-layer") {
      element.style.type = "transparent";
      element.style.fill = "transparent";
      element.style.fill_opacity = 0;
    }

    // 5. Ensure required fields
    if (!element.style?.border_radius && element.style?.border_radius !== 0) {
      element.style.border_radius = 8;
    }
  }

  const theme: WCCOverlayV3 = {
    version: 3,
    wallet: "phantom",
    theme_name: themeName(input.colors.mood, input.userPrompt),
    generated_at: new Date().toISOString(),
    global: {
      background: input.background,
      color_analysis: input.colors,
    },
    elements,
  };

  console.log(`[validator] Done. Warnings: ${warnings.length}, Fixes: ${fixes}`);
  return { theme, warnings, fixes };
}
