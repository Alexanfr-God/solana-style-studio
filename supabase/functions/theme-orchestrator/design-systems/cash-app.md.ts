export default `# DESIGN.md — Cash App (Playful Vibrant Green)

## 1. Visual theme
Friendly fintech for younger users. Vibrant green dominance, rounded soft shapes, playful typography. Less formal than Robinhood, more energetic than Coinbase.

## 2. Color roles
- **Surface base**: \`#00D632\` (Cash green) for headers / \`#000000\` for body
- **Surface raised**: \`#1A1A1A\`
- **Surface input**: \`#262626\`
- **Surface accent (full green)**: \`#00D632\`
- **Border**: \`rgba(255,255,255,0.10)\`
- **Text primary**: \`#FFFFFF\`
- **Text secondary**: \`#A0A0A0\`
- **Text on green**: \`#000000\`
- **Brand green**: \`#00D632\`
- **Brand green deep**: \`#00A025\`

## 3. Typography
- **Headings**: Cash Sans / Inter, 700 weight
- **Body**: Inter, 500 weight
- **Sizes**: amount 36-48px (huge) • title 20px • body 15px • caption 12px

## 4. Component styles

### Buttons
- Primary CTA: solid \`#00D632\` fill, black text, 100px radius (pill), 16px/700, height 52px.
- Secondary: transparent fill, \`1px solid #00D632\`, green text, pill.
- Tertiary on green surface: black fill, white text, pill.

### Inputs
- Fill: \`#262626\`
- Border: \`1px solid rgba(255,255,255,0.10)\`. Focus: \`1px solid #00D632\`.
- Radius: 16px. Padding: 14px 16px.

### Cards
- 16-20px radius, soft and friendly.

## 5. Layout
8px grid. Pills everywhere. Friendly soft corners (16-20px) on cards.

## 6. Hierarchy
Green dominates — header bars, primary CTAs. Black/white text adapts based on the green background. Bold typography carries hierarchy more than spacing.

## 7. Motion
- 200ms spring \`cubic-bezier(0.16, 1, 0.3, 1)\`
- Buttons scale 0.96 on press
- Friendly bouncy feel

## 8. Wallet-specific guidance (password screen)
- Background: solid \`#00D632\` — the entire surface is Cash green. OR alternatively \`#000000\` with green logo accent.
- "phantom" header: 15px/700 white (on green) or white (on black).
- Logo (👻): white with no glow on green surface (high contrast). 96px.
- Title: 20-22px/700 white (on green) or \`#00D632\` (on black).
- Password input: white fill \`rgba(255,255,255,0.15)\` with \`backdrop-filter: blur(10px)\` (on green), black \`#262626\` (on black surface), pill 16px radius.
- Unlock button (on green surface): black fill, white text, pill. (On black surface): green fill, black text, pill.
- Forgot link: 14px/500, white with 0.7 opacity. Hover: full opacity.

## 9. Don'ts
- No multiple accent colors (only green + adaptive black/white)
- No square buttons (everything is pill-shaped)
- No subtle / muted greens — Cash green is vivid \`#00D632\`
- No gradients
- No animations on text content beyond press scale`;
