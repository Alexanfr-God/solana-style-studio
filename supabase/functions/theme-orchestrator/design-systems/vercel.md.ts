export default `# DESIGN.md — Vercel (Black & White Precision)

## 1. Visual theme
Stark black-and-white precision. Geist typography. Sharp edges. Dramatic high contrast. The aesthetic of a deployed production system. No color except where absolutely necessary.

## 2. Color roles
- **Surface base**: \`#000000\` (pure black)
- **Surface raised**: \`#0A0A0A\`
- **Surface input**: \`#111111\`
- **Border**: \`#333333\` (1px hairline)
- **Border focus**: \`#FFFFFF\`
- **Text primary**: \`#FFFFFF\`
- **Text secondary**: \`#A1A1A1\`
- **Text tertiary**: \`#666666\`
- **Accent**: \`#FFFFFF\` itself (white-on-black is the brand). When tint is needed: \`#0070F3\` (Vercel blue) or \`#7928CA\` (highlight purple), but use only on a single element per screen.

## 3. Typography
- **Headings**: Geist Sans, 600 weight, \`-0.04em\` tracking
- **Body**: Geist Sans, 500 weight, \`-0.01em\` tracking
- **Mono**: Geist Mono for hashes, numbers, addresses
- **Sizes**: hero 24px • title 18px • body 14px • caption 12px
- Line-height: 1.5. Tight tracking on headlines.

## 4. Component styles

### Buttons
- Primary CTA: solid \`#FFFFFF\` fill, \`#000000\` text, 6px radius, height 40px, 14px/600 text. Hover: invert to \`#000000\` fill with \`1px solid #FFFFFF\`.
- Secondary: transparent fill, \`1px solid #333333\`, white text. Hover: border \`#FFFFFF\`.

### Inputs
- Fill: \`#111111\`
- Border: \`1px solid #333333\`. Focus: \`1px solid #FFFFFF\`, no glow.
- Radius: 6px. Padding: 10px 12px. Font: 14px Geist Sans.

### Cards / Header
- 1px hairline borders only, no shadows, no fills beyond base.

## 5. Layout
4px grid. Tight spacing on dense data, generous around hero CTAs. Sharp 6-8px radii everywhere — never pill-shaped.

## 6. Hierarchy
High contrast (white on black) does the heavy lifting. Secondary text is very dim (\`#666666\`). One element per screen can break the monochrome rule.

## 7. Motion
- 150ms cubic-bezier(0.4, 0, 0.2, 1)
- Subtle border color transitions on hover/focus
- Zero animation on text. Zero glow. Zero pulse.

## 8. Wallet-specific guidance (password screen)
- Background: pure \`#000000\`. Optionally a subtle radial vignette toward \`#0A0A0A\` at center. NO image.
- "phantom" header: 14px/600 Geist, white, no decoration.
- Logo (👻): white, no glow, size 88px. Optionally \`filter: invert(0)\` placeholder.
- Title: 18px/600 Geist, \`-0.04em\` tracking, white.
- Password input: \`#111111\` fill, \`1px solid #333333\` border, focus \`1px solid #FFFFFF\`.
- Unlock button: solid \`#FFFFFF\` fill, \`#000000\` text, 14px/600. Sharp 6px radius.
- Forgot link: 13px/500, \`#A1A1A1\`. Hover: \`#FFFFFF\`.

## 9. Don'ts
- No gradients (literally — Vercel is monochrome)
- No glow / textShadow / boxShadow beyond hairlines
- No pill shapes or aggressive rounding (max 8px radius)
- No emoji decoration beyond the ghost logo
- No animation on hover beyond 150ms color transition`;
