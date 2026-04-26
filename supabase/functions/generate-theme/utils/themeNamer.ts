const STYLE_KEYWORDS: Record<string, string> = {
  cyberpunk: "Cyberpunk",
  neon: "Neon",
  glass: "Glass",
  glassmorphism: "Glass",
  minimal: "Minimal",
  minimalist: "Minimal",
  dark: "Dark",
  light: "Light",
  gold: "Gold",
  golden: "Gold",
  luxury: "Luxury",
  space: "Space",
  cosmic: "Cosmic",
  galaxy: "Galaxy",
  ocean: "Ocean",
  fire: "Fire",
  lava: "Lava",
  forest: "Forest",
  nature: "Nature",
  retro: "Retro",
  vintage: "Vintage",
  anime: "Anime",
  synthwave: "Synthwave",
  vaporwave: "Vaporwave",
  bitcoin: "Bitcoin",
  solana: "Solana",
  crypto: "Crypto",
  web3: "Web3",
  rave: "Rave",
  acid: "Acid",
  matrix: "Matrix",
  ice: "Ice",
  frost: "Frost",
  sunset: "Sunset",
  aurora: "Aurora",
  noir: "Noir",
  pastel: "Pastel",
  rainbow: "Rainbow",
  holographic: "Holo",
};

export function extractThemeName(prompt: string): string {
  const lower = prompt.toLowerCase();
  const found: string[] = [];

  for (const [kw, label] of Object.entries(STYLE_KEYWORDS)) {
    if (lower.includes(kw)) found.push(label);
  }

  if (found.length > 0) {
    return found.slice(0, 2).join(" ") + " Theme";
  }

  // Fallback: capitalise first 3 meaningful words
  const words = prompt
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  return words.length > 0 ? words.join(" ") + " Theme" : "Custom Theme";
}
