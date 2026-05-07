export default `# DESIGN.md — Cyberpunk Neon (Synthwave-Inspired)

## 1. Visual theme
Night city after rain. Neon signs reflecting on wet glass. Synthwave dashboards. Magenta-cyan-purple palette with deep purples and dark navy. Dramatic but disciplined — neon used as accent on dark surfaces, never as full-screen flooding.

## 2. Color roles
- **Surface base**: \`#0D0221\` (deep purple-black)
- **Surface raised**: \`#1A0B3A\`
- **Surface input**: \`#241046\`
- **Border subtle**: \`rgba(255,0,228,0.15)\`
- **Border accent**: \`#FF00E4\` (hot magenta)
- **Text primary**: \`#F4E8FF\`
- **Text secondary**: \`#9D8DBF\`
- **Accent magenta**: \`#FF00E4\` (primary)
- **Accent cyan**: \`#00F0FF\` (secondary, for hover/active glow)
- **Accent purple**: \`#7928CA\` (gradient stop)
- **Glow magenta**: \`rgba(255,0,228,0.6)\`
- **Glow cyan**: \`rgba(0,240,255,0.5)\`

## 3. Typography
- **Headings**: Orbitron, Rajdhani, or Audiowide — 700 weight, uppercase, \`0.05em\` tracking
- **Body**: Inter / Rajdhani 500 weight
- **Mono**: JetBrains Mono for amounts, addresses
- **Sizes**: title 18px (uppercase) • body 14px • caption 11px (uppercase, tracked)
- Optional textShadow on titles only: \`0 0 10px rgba(255,0,228,0.6)\`.

## 4. Component styles

### Buttons
- Primary CTA: gradient \`135deg, #FF00E4, #7928CA\`. 8px radius, 44px height, 14px/700 uppercase text. Box-shadow \`0 0 16px rgba(255,0,228,0.4)\`. Hover: shadow \`0 0 28px rgba(255,0,228,0.6)\`.
- Secondary: transparent fill, \`1px solid #FF00E4\`, magenta text. Hover: fill 10% magenta tint.

### Inputs
- Fill: \`#241046\`
- Border: \`1px solid rgba(255,0,228,0.15)\`. Focus: \`1px solid #FF00E4\` + halo \`0 0 12px rgba(255,0,228,0.4)\`.
- Radius: 6px. Padding: 12px 14px. Font: 14px Inter.

### Cards
- 1px magenta hairline border, dark fill, optional inner glow \`inset 0 0 20px rgba(255,0,228,0.05)\`.

## 5. Layout
8px grid. Sharp 6-8px radii (cyberpunk likes harder edges). Generous spacing — neon needs room to breathe.

## 6. Hierarchy
Magenta is the hero color (primary CTA, focused inputs, key labels). Cyan is the secondary accent (links, success states, secondary glow). Use both together only on the CTA gradient. Body text stays calm (\`#F4E8FF\`, no glow).

## 7. Motion
- Allowed: subtle 6s \`wcc-aurora\` filter shift on background only
- Allowed: 300ms ease-out hover lift on CTA shadow
- FORBIDDEN: pulse animation on text, body text, or labels
- Max ONE animated element on the screen.

## 8. Wallet-specific guidance (password screen)
- Background: \`linear-gradient(135deg, #0D0221, #1A0B3A, #2A0853)\` with optional aurora animation. Or AI-generated cyberpunk image at full cover.
- "phantom" header: 14px/700 Orbitron uppercase, color \`#F4E8FF\`, optional small magenta glow.
- Logo (👻): tinted \`#F4E8FF\` with strong magenta+cyan glow \`text-shadow: 0 0 24px #FF00E4, 0 0 48px rgba(0,240,255,0.4)\`. Size 96px.
- Title "Enter your Password": 18px/700 uppercase Orbitron, \`0.05em\` tracking, \`#F4E8FF\`, subtle textShadow \`0 0 10px rgba(255,0,228,0.6)\`.
- Password input: \`#241046\` fill, magenta hairline, magenta halo on focus.
- Unlock button: gradient \`#FF00E4 → #7928CA\`, 14px/700 uppercase white text, magenta drop-shadow.
- Forgot link: 13px/500, color \`#00F0FF\` (cyan). Hover: glow.

## 9. Don'ts
- No pulsing or shimmering text (kills readability)
- No neon on every element — keep it concentrated on CTAs and the logo
- No more than 2 accent colors (magenta + cyan)
- No fully-saturated background flood (#FF00E4 background is unusable)
- No animations on the password input or title`;
