export default `# DESIGN.md — Robinhood (Bold Retail Fintech)

## 1. Visual theme
Confident retail trading. Bold green as the brand signal. Black surfaces, generous spacing, large readable numbers. Approachable for everyday users, not Wall Street.

## 2. Color roles
- **Surface base**: \`#000000\` (true black)
- **Surface raised**: \`#0E0E0E\`
- **Surface input**: \`#1A1A1A\`
- **Border**: \`rgba(255,255,255,0.08)\`
- **Text primary**: \`#FFFFFF\`
- **Text secondary**: \`#A1A1A1\`
- **Brand green**: \`#00C805\` (Robinhood vivid green)
- **Brand green hover**: \`#00E806\`
- **Brand green deep**: \`#00A004\`
- **Up (gain)**: \`#00C805\`
- **Down (loss)**: \`#FF5000\`

## 3. Typography
- **Headings**: Capsule Sans Text or Inter, 700 weight
- **Body**: Inter, 500 weight
- **Numbers**: Inter Tight or Capsule Mono, 700 weight, tabular-nums
- **Sizes**: amount 32-40px • title 18px • body 15px • caption 12px

## 4. Component styles

### Buttons
- Primary CTA: solid \`#00C805\` fill, black text, 100px radius (full pill), 16px/700 text, height 52px. Hover: \`#00E806\`.
- Secondary: transparent fill, \`1px solid rgba(255,255,255,0.16)\`, white text, pill shape.

### Inputs
- Fill: \`#1A1A1A\`
- Border: \`1px solid rgba(255,255,255,0.08)\`. Focus: \`1px solid #00C805\`.
- Radius: 12px. Padding: 14px 16px. Font: 15px Inter.

### Cards
- 1px border, 12-16px radius, generous internal padding (24px+).

## 5. Layout
8px grid. Generous spacing. Pills (full-rounded buttons) are signature. Numbers are LARGE.

## 6. Hierarchy
Vivid green is reserved exclusively for primary CTA and gains. Losses use red \`#FF5000\`. Everything else is grayscale.

## 7. Motion
- 200ms ease-out
- Buttons: subtle scale 0.97 on press
- No glow, no pulse on text
- Numbers may animate up/down on value change

## 8. Wallet-specific guidance (password screen)
- Background: solid \`#000000\`. No image, no gradient — Robinhood is uncompromising black.
- "phantom" header: 15px/700 Inter, white.
- Logo (👻): white with subtle green glow \`text-shadow: 0 0 24px rgba(0,200,5,0.25)\`. 88px.
- Title: 22px/700, white, \`-0.01em\` tracking.
- Password input: \`#1A1A1A\` fill, hairline border, green border on focus.
- Unlock button: solid \`#00C805\`, BLACK text (high contrast), 16px/700, fully pill-shaped (border-radius: 100px), height 52px.
- Forgot link: 14px/500, \`#A1A1A1\`. Hover: \`#00C805\`.

## 9. Don'ts
- No purple, no blue, no other colored accents (green is the only color)
- No gradient buttons (solid green only)
- No glassmorphism
- No square buttons (use pills)
- No neon glow beyond a subtle 24px halo on logo`;
