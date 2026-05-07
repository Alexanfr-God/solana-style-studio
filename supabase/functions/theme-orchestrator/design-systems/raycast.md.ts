export default `# DESIGN.md — Raycast (Sleek Productivity Launcher)

## 1. Visual theme
Productivity launcher aesthetic. Sleek dark chrome, sharp focus on keyboard-first interactions. Vibrant gradient accents reserved for hover/active states. Feels precision-tuned.

## 2. Color roles
- **Surface base**: \`#0F0F0F\`
- **Surface raised**: \`#1A1A1A\`
- **Surface input**: \`#222222\`
- **Border subtle**: \`rgba(255,255,255,0.08)\`
- **Border accent**: \`#FF6363\` (Raycast red-pink)
- **Text primary**: \`#FFFFFF\`
- **Text secondary**: \`#999999\`
- **Accent gradient**: \`linear-gradient(135deg, #FF6363 0%, #FF8E63 50%, #FFB163 100%)\` (red→orange)
- **Accent solid**: \`#FF6363\`

## 3. Typography
- **Headings**: Inter, 600 weight
- **Body**: Inter, 500 weight
- **Mono**: JetBrains Mono for keyboard shortcuts
- **Sizes**: title 16px • body 14px • caption 12px • mono shortcut 12px
- Line-height: 1.4. Tight spacing because it's a dense launcher.

## 4. Component styles

### Buttons
- Primary: gradient \`135deg, #FF6363, #FF8E63\`, white text, 8px radius, 14px/600, height 40px. Hover: shadow \`0 4px 16px rgba(255,99,99,0.3)\`.
- Keyboard hint chip: \`rgba(255,255,255,0.08)\` fill, mono font, small.

### Inputs
- Fill: \`#222222\`
- Border: \`1px solid rgba(255,255,255,0.08)\`. Focus: \`1px solid #FF6363\`.
- Radius: 8px. Padding: 12px 14px.

### Cards
- 8-12px radius, 1px border, subtle.

## 5. Layout
4-8px grid. Tight, dense. Sharp 6-8px radii. Keyboard-first means strong focus states matter.

## 6. Hierarchy
Red-orange gradient marks primary CTA only. Everything else lives in grayscale with the occasional small red-pink glow on hover.

## 7. Motion
- 150ms ease-out
- Hover: subtle scale 1.01, shadow expand
- Keyboard navigation: focus moves with subtle ring \`0 0 0 2px rgba(255,99,99,0.4)\`

## 8. Wallet-specific guidance (password screen)
- Background: solid \`#0F0F0F\` with subtle radial gradient toward \`#1A1A1A\`.
- "phantom" header: 14px/600 Inter, white.
- Logo (👻): white with subtle red-orange glow \`text-shadow: 0 0 24px rgba(255,99,99,0.3)\`. 88px.
- Title: 16-18px/600 Inter, white.
- Password input: \`#222222\` fill, hairline border, red-pink border on focus.
- Unlock button: gradient \`#FF6363 → #FF8E63\`, white text, 14px/600, soft red shadow.
- Forgot link: 13px/500, \`#FF6363\`. Hover: brighter.

## 9. Don'ts
- No multiple competing colors
- No glassmorphism (Raycast is opaque chrome)
- No pulse on text
- No animations beyond 150ms hover`;
