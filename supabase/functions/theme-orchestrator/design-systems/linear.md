# DESIGN.md — Linear (Dev-Tool Minimalism)

## 1. Visual theme
Restrained, dev-tool aesthetic. Dense information, low chrome, sharp edges. Dark by default. Monospaced UI accents. The system feels engineered, not decorated.

## 2. Color roles
- **Surface base**: `#0E0E10` (page background)
- **Surface raised**: `#191A1F` (cards, header)
- **Surface input**: `#1F2127` (inputs, password field)
- **Border subtle**: `rgba(255,255,255,0.06)` (hairlines, 1px)
- **Border strong**: `rgba(255,255,255,0.12)` (button outlines, focused inputs)
- **Text primary**: `#F5F5F7`
- **Text secondary**: `#9CA0AB`
- **Accent**: `#5E6AD2` (single brand accent — use sparingly, only for primary CTA and active state)
- **Accent hover**: `#7C84E0`

Forbidden: rainbow gradients, neon colors, multiple competing accents.

## 3. Typography
- **Headings**: Inter or SF Pro, 600 weight, `-0.01em` tracking
- **Body**: Inter, 500 weight, normal tracking
- **Mono accents**: JetBrains Mono / SF Mono for addresses, numbers, keyboard hints
- **Sizes**: title 17px • body 14px • caption 12px • mono 13px
- Line-height: 1.4 body, 1.2 headings. No textShadow ever.

## 4. Component styles

### Buttons
- Primary CTA: solid `#5E6AD2`, 8px radius, 14px/600 text, height 40px. Hover: brightness 1.08. No gradient, no glow.
- Secondary: transparent fill, `1px solid rgba(255,255,255,0.12)` border, same dimensions.

### Inputs (password field)
- Fill: `#1F2127`
- Border: `1px solid rgba(255,255,255,0.06)`. Focused: `1px solid #5E6AD2`.
- Radius: 8px. Padding: 12px 14px. Font: 14px Inter.

### Cards / Header
- Subtle 1px hairline borders, no shadows, no backdropFilter blur.

## 5. Layout
8px grid. Generous whitespace. Sharp 90° corners on outer surfaces, slightly rounded (8px) on interactive elements.

## 6. Hierarchy
One accent color, one bold weight, one shadow level. Hierarchy comes from spacing and typography, not from color or decoration.

## 7. Motion
Subtle. 150ms cubic-bezier(0.4, 0, 0.2, 1) on hover. No pulse, no shimmer, no float. The only acceptable animation is a slight brightness lift on CTA hover.

## 8. Wallet-specific guidance (password screen)
- Background: `#0E0E10` solid or very subtle radial gradient toward `#1A1A22` at center. NO image, NO heavy gradient.
- "phantom" header text: 14px/600 Inter, color `#F5F5F7`.
- Logo (👻): tinted `#5E6AD2`, no glow, modest 80–96px size.
- "Enter your Password" title: 17px/600 Inter, color `#F5F5F7`, no shadow.
- Password input: `#1F2127` fill, hairline border, focused state shows accent border.
- Unlock button: solid `#5E6AD2`, 14px/600 white text. No glow, no gradient.
- "Forgot Password?" link: 13px/500, color `#9CA0AB`, accent on hover.

## 9. Don'ts
- No glassmorphism / no backdrop-filter
- No neon glow (`text-shadow`, `box-shadow` larger than 4px)
- No animation on text or buttons (except 150ms hover transition)
- No multiple accent colors
- No emoji-based decoration
