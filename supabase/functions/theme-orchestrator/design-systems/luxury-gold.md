# DESIGN.md — Luxury Gold (Premium Black & Gold)

## 1. Visual theme
Premium private-banking aesthetic. Deep blacks, polished gold accents, fine serif headings. Restraint is the entire aesthetic — gold is precious because there's so little of it.

## 2. Color roles
- **Surface base**: `#0A0A0A` (true near-black)
- **Surface raised**: `#141414`
- **Surface input**: `#1C1C1C`
- **Border subtle**: `rgba(212,175,55,0.12)` (faint gold hairline)
- **Border accent**: `#D4AF37` (refined gold)
- **Text primary**: `#F2F2F2`
- **Text secondary**: `#8A8A8A`
- **Accent gold**: `#D4AF37`
- **Accent gold light**: `#F0D78C` (hover, highlights)
- **Accent gold deep**: `#A48628` (pressed, shadows)
- **Glow gold**: `rgba(212,175,55,0.35)`

## 3. Typography
- **Headings**: Cormorant Garamond, Playfair Display, or Lora — 500-600 weight, italic optional
- **Body**: Inter or Manrope — 500 weight
- **Mono**: SF Mono for amounts
- **Sizes**: title 19px • body 14px • caption 12px
- Letter-spacing: `0.01em` body, normal headings.

## 4. Component styles

### Buttons
- Primary CTA: solid `#D4AF37` fill, `#0A0A0A` text, 4px radius, 44px height, 14px/600 text, slight letter-spacing `0.02em`. Hover: `#F0D78C`. No glow, no shadow — just clean color.
- Secondary: transparent fill, `1px solid #D4AF37`, gold text.

### Inputs
- Fill: `#1C1C1C`
- Border: `1px solid rgba(212,175,55,0.12)`. Focus: `1px solid #D4AF37`.
- Radius: 4px (sharp, formal). Padding: 14px 16px. Font: 14px Inter.

### Cards
- `1px solid rgba(212,175,55,0.12)` border, dark fill, no shadow, no glassmorphism.

## 5. Layout
8px grid. Sharp 4-6px radii (luxury is squared, not rounded). Generous internal padding. Wide whitespace.

## 6. Hierarchy
Gold marks one thing per screen — the primary CTA, or the logo, never both at full saturation. Everything else is grayscale.

## 7. Motion
- 250ms ease-out — slow and deliberate
- Hover: gold border brightens to `#F0D78C`
- No animations on text, no shimmer, no pulse
- Background may have a very subtle 14s aurora filter shift if image-based

## 8. Wallet-specific guidance (password screen)
- Background: solid `#0A0A0A` or AI-generated image with deep blacks and warm gold tones. Avoid bright gold floods.
- "phantom" header: 14px/600 Inter, color `#F2F2F2`, slight tracking `0.02em`.
- Logo (👻): tinted `#D4AF37` with subtle warm glow `text-shadow: 0 0 32px rgba(212,175,55,0.35)`. 88px.
- Title (use serif): 19px/500 Cormorant Garamond italic, color `#F2F2F2`, no shadow. The serif italic is the luxury signal.
- Password input: `#1C1C1C` fill, faint gold hairline, gold border on focus.
- Unlock button: solid `#D4AF37`, `#0A0A0A` text, 14px/600 letter-spacing `0.02em`.
- Forgot link: 12px/500, `#8A8A8A`. Hover: `#D4AF37`.

## 9. Don'ts
- No multiple gold tones at once (one gold per screen)
- No yellow (#FFD700 is gaudy — stick to refined `#D4AF37`)
- No glow on body text or input
- No animations on text content
- No emoji decoration
- No gradients on the gold (it's a solid color)
