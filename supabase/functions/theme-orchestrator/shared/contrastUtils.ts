// WCAG contrast ratio and color distance utilities

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  if (clean.length === 6) {
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  }
  return null;
}

function parseRgba(color: string): [number, number, number] | null {
  const m = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return null;
}

export function parseColor(color: string): [number, number, number] | null {
  if (!color) return null;
  if (color.startsWith("#")) return parseHex(color);
  if (color.startsWith("rgb")) return parseRgba(color);
  return null;
}

function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(colorA: string, colorB: string): number {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) return 1;
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

// Simplified color distance (Euclidean in RGB space)
export function colorDistance(colorA: string, colorB: string): number {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a || !b) return 999;
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
}

export function isValidColor(color: string): boolean {
  if (!color) return false;
  if (color === "transparent" || color === "none") return true;
  if (color.startsWith("#")) return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(color);
  if (color.startsWith("rgb") || color.startsWith("hsl")) return /\(/.test(color);
  return false;
}

export function extractAllColors(element: any): string[] {
  const colors: string[] = [];
  if (element?.style?.fill) colors.push(element.style.fill);
  if (element?.style?.border_color) colors.push(element.style.border_color);
  if (element?.text?.color) colors.push(element.text.color);
  if (element?.style?.gradient?.from) colors.push(element.style.gradient.from);
  if (element?.style?.gradient?.to) colors.push(element.style.gradient.to);
  if (element?.icon?.tint) colors.push(element.icon.tint);
  return colors.filter(Boolean);
}
