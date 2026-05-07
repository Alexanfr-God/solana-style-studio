export default `# DESIGN.md — Stripe (Fintech Trust)

## 1. Visual theme
Trustworthy fintech. Clean white surfaces (or rich dark mode), confident typography, subtle indigo→purple gradients on hero elements. Premium polish without flash. Thoughtful whitespace.

## 2. Color roles
- **Surface base** (dark mode): \`#0A2540\` (Stripe deep navy) or \`#FFFFFF\` for light
- **Surface raised**: \`#1A2F4F\` / \`#F6F9FC\`
- **Surface card**: \`rgba(255,255,255,0.04)\` overlay on dark; \`#FFFFFF\` on light
- **Border**: \`rgba(255,255,255,0.08)\` dark / \`#E3E8EE\` light
- **Text primary**: \`#FFFFFF\` dark / \`#0A2540\` light
- **Text secondary**: \`#ADBDCC\` / \`#425466\`
- **Accent gradient**: linear \`135deg, #635BFF 0%, #00D4FF 100%\` (Stripe indigo→cyan)
- **Accent solid**: \`#635BFF\` (indigo, primary CTA)
- **Success**: \`#00D924\`

## 3. Typography
- **Headings**: Sohne, Inter or system, 600 weight, \`-0.02em\` tracking
- **Body**: Sohne / Inter, 500 weight
- **Mono**: SF Mono for amounts and codes
- **Sizes**: title 18px • body 15px • caption 12px
- Line-height: 1.5 body, 1.25 headings.

## 4. Component styles

### Buttons
- Primary CTA: gradient \`135deg, #635BFF, #00D4FF\`. 8px radius. 15px/600 text. Height 44px. Soft shadow \`0 4px 12px rgba(99,91,255,0.25)\`. Hover: shadow lifts to \`0 6px 16px rgba(99,91,255,0.35)\`.
- Secondary: white text, \`1px solid rgba(255,255,255,0.16)\` border, transparent fill.

### Inputs
- Fill: \`rgba(255,255,255,0.04)\` on dark surfaces
- Border: \`1px solid rgba(255,255,255,0.08)\`. Focused: \`1px solid #635BFF\` + soft halo \`0 0 0 3px rgba(99,91,255,0.15)\`.
- Radius: 8px. Padding: 14px 16px. Font: 15px Sohne.

### Cards
- Subtle border + soft shadow \`0 1px 3px rgba(0,0,0,0.06)\`. No glassmorphism.

## 5. Layout
8-point grid. Generous outer padding (24-32px). Cards float gently above the surface, never feel boxed.

## 6. Hierarchy
Use the indigo→cyan gradient as the single point of visual punch (primary CTA, key icon). Everything else is restrained typography and subtle borders.

## 7. Motion
- 200ms ease-out on hover/focus
- Buttons lift 1-2px on hover with shadow expansion
- No pulse, no shimmer. Loading states use a thin progress bar in the gradient color.

## 8. Wallet-specific guidance (password screen)
- Background: solid \`#0A2540\` or radial gradient \`radial-gradient(ellipse at top, #1A2F4F, #0A2540)\`. Optionally subtle indigo glow at top.
- "phantom" header: 15px/600, color \`#FFFFFF\`, no decoration.
- Logo (👻): white with subtle \`text-shadow: 0 0 32px rgba(99,91,255,0.4)\`. Size 88px.
- Title "Enter your Password": 18px/600, white, \`-0.02em\` tracking, no shadow.
- Password input: \`rgba(255,255,255,0.04)\` fill, hairline border, indigo glow on focus.
- Unlock button: gradient \`#635BFF → #00D4FF\`, 15px/600 white text. Box-shadow \`0 4px 12px rgba(99,91,255,0.25)\`.
- Forgot link: 13px/500, color \`#ADBDCC\`. Hover: \`#FFFFFF\`.

## 9. Don'ts
- No multi-color rainbow (only the indigo→cyan gradient)
- No heavy backdrop-filter / glassmorphism on inputs (clean fills only)
- No 3D effects, no neon
- No textShadow on body text (only on logo)
- No animations beyond 200ms hover`;
