export default `# DESIGN.md — Coinbase (Institutional Crypto)

## 1. Visual theme
Confident institutional fintech. Trusted blue as the brand anchor. Clean, accessible, regulated-feeling. Approachable but serious — this is where retirement money lives.

## 2. Color roles
- **Surface base**: \`#0A0B0D\` (near-black) or \`#FFFFFF\` for light
- **Surface raised**: \`#1A1D21\` / \`#F5F8FA\`
- **Surface input**: \`#22262C\` / \`#FAFBFC\`
- **Border**: \`rgba(255,255,255,0.06)\` dark / \`#E5E8EB\` light
- **Text primary**: \`#FFFFFF\` / \`#0A0B0D\`
- **Text secondary**: \`#8A919E\` / \`#5B616E\`
- **Brand**: \`#0052FF\` (Coinbase signature blue)
- **Brand hover**: \`#1A66FF\`
- **Brand glow**: \`rgba(0,82,255,0.25)\`
- **Success**: \`#00D395\`
- **Danger**: \`#FF5C5C\`

## 3. Typography
- **Headings**: Inter, 700 weight, \`-0.02em\` tracking
- **Body**: Inter, 500 weight
- **Numbers/amounts**: Inter Tight or Inter, 600 weight, tabular-nums
- **Sizes**: title 18px • body 15px • caption 12px • amount 24-32px (mono-aligned)

## 4. Component styles

### Buttons
- Primary CTA: solid \`#0052FF\` fill, white text, 12px radius, height 48px, 16px/600 text. Hover: \`#1A66FF\`. Pressed: \`#003BCC\`.
- Secondary: transparent fill, \`1px solid #0052FF\`, blue text.
- Tertiary: ghost button, no border, blue text only.

### Inputs
- Fill: \`#22262C\`
- Border: \`1px solid rgba(255,255,255,0.06)\`. Focus: \`1px solid #0052FF\` + halo \`0 0 0 3px rgba(0,82,255,0.15)\`.
- Radius: 12px. Padding: 14px 16px. Font: 15px Inter.

### Cards
- Subtle hairline border, generous internal padding (20-24px), 12-16px radius.

## 5. Layout
8px grid. Cards are the dominant surface. Always padded generously. Numbers right-aligned with tabular-nums.

## 6. Hierarchy
Blue (\`#0052FF\`) marks every interactive primary action — CTA, link, focused field. Never use blue for decoration.

## 7. Motion
- 200ms ease-out
- Buttons: subtle background brightening on hover, slight scale 0.98 on press
- No pulse, no shimmer. Charts use 400ms ease-in-out fade.

## 8. Wallet-specific guidance (password screen)
- Background: solid \`#0A0B0D\` with optional subtle radial gradient toward \`#0F1419\` at center. Ultra-clean, no decoration.
- "phantom" header: 15px/700 Inter, white, slight letter-spacing.
- Logo (👻): white with subtle blue glow \`text-shadow: 0 0 24px rgba(0,82,255,0.3)\`. 88px.
- Title "Enter your Password": 18px/700 Inter, white, \`-0.02em\` tracking.
- Password input: \`#22262C\` fill, hairline border, blue halo on focus.
- Unlock button: solid \`#0052FF\`, 16px/600 white text, 12px radius. Press state darkens.
- Forgot link: 14px/500, color \`#0052FF\`. Hover: underline.

## 9. Don'ts
- No purple, no gradient on buttons (Coinbase blue is solid)
- No glassmorphism (Coinbase is opaque, not blurred)
- No neon glow beyond a subtle 24px text-shadow on logo
- No multiple accent colors per screen
- No animations on text content`;
