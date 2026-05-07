# DESIGN.md — Notion (Soft Document)

## 1. Visual theme
Soft, document-like, friendly. Warm neutrals over cool whites. Reads like a well-formatted page rather than a chrome-heavy app. Subtle depth, friendly illustration, calm typography.

## 2. Color roles
- **Surface base**: `#191919` (Notion dark) or `#FFFFFF` (light)
- **Surface raised**: `#252525` / `#F7F6F3`
- **Surface input**: `#2F2F2F` / `#F1F1EF`
- **Border**: `rgba(255,255,255,0.07)` / `#E9E9E7`
- **Text primary**: `#FFFFFF` / `#37352F`
- **Text secondary**: `#9B9B9B` / `#787774`
- **Accent (default Notion blue)**: `#2EAADC`
- **Accent purple (alt)**: `#9065B0`
- **Warm tints**: `#F4A261` (orange), `#E76F51` (red) — sparingly

## 3. Typography
- **Headings**: System UI, Inter, 600 weight
- **Body**: System UI, Inter, 400 weight (note: lighter than typical apps)
- **Mono**: System Mono / Menlo for code, addresses
- **Sizes**: title 18px • body 14px • caption 12px
- Line-height: 1.5 body. Notion is comfortable to read.

## 4. Component styles

### Buttons
- Primary: solid `#2EAADC`, white text, 6px radius, 14px/600 text, height 36px. Subtle hover lift.
- Secondary: transparent fill, `1px solid rgba(255,255,255,0.07)` border, white text. Hover: `rgba(255,255,255,0.05)` fill.

### Inputs
- Fill: `#2F2F2F`
- Border: `1px solid rgba(255,255,255,0.07)`. Focus: `1px solid #2EAADC`.
- Radius: 4px (Notion uses small radii). Padding: 10px 12px. Font: 14px.

### Cards
- Subtle 1px border, 6px radius, no shadow. Calm.

## 5. Layout
8px grid but generous internal padding. Content reads like a document — left-aligned, clear hierarchy through size and weight.

## 6. Hierarchy
Hierarchy through type weight/size. Color used very sparingly — Notion blue marks the primary action, everything else is grayscale.

## 7. Motion
- 150ms ease
- No glow, no pulse
- Hover: very subtle background tint shift

## 8. Wallet-specific guidance (password screen)
- Background: solid `#191919` with optional very subtle warm gradient toward `#252525`.
- "phantom" header: 14px/600 Inter, white, no decoration.
- Logo (👻): white, no glow, modest 80px.
- Title: 18px/600 Inter, white, no shadow.
- Password input: `#2F2F2F` fill, hairline border, blue focus border (no halo).
- Unlock button: solid `#2EAADC`, white text, 14px/600. Small 6px radius. No shadow.
- Forgot link: 13px/500, `#9B9B9B`. Hover: white.

## 9. Don'ts
- No glassmorphism (Notion is opaque)
- No glow, no neon
- No multiple accent colors
- No emoji decoration beyond the ghost logo
- No animations beyond 150ms color shifts
