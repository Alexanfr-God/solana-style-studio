# DESIGN.md — Apple (System-Native Glassmorphism)

## 1. Visual theme
iOS / macOS Sonoma / visionOS aesthetic. Translucent surfaces, vibrancy effects, soft depth. Restrained system colors. The interface feels like glass layered over rich content. Polished, calm, premium.

## 2. Color roles
- **Surface base**: `#000000` to `#1C1C1E` (true dark) — surface IS the wallpaper showing through
- **Surface glass**: `rgba(28,28,30,0.72)` with backdrop-blur 30px
- **Surface input**: `rgba(118,118,128,0.24)` with backdrop-blur 14px
- **Border subtle**: `rgba(255,255,255,0.06)`
- **Border focused**: `rgba(255,255,255,0.18)`
- **Text primary**: `#FFFFFF`
- **Text secondary**: `rgba(235,235,245,0.6)`
- **Text tertiary**: `rgba(235,235,245,0.3)`
- **System blue**: `#0A84FF` (default accent)
- **System purple**: `#BF5AF2`
- **System pink**: `#FF375F`

## 3. Typography
- **Headings**: SF Pro Display, 600 weight, `-0.02em` tracking
- **Body**: SF Pro Text / system, 500 weight
- **Sizes**: title 17px • body 15px • caption 13px • footnote 11px
- Line-height: 1.4 body, 1.2 headings.
- Use SF Pro's optical sizes — display for >20px, text for <20px.

## 4. Component styles

### Buttons
- Primary CTA: solid `#0A84FF` fill, white text, 12px radius, height 44px, 17px/600 text. Hover: brightness 1.1.
- Secondary (glass): `rgba(118,118,128,0.24)` fill, `backdrop-filter: blur(14px)`, white text.

### Inputs
- Fill: `rgba(118,118,128,0.24)`
- BackdropFilter: `blur(14px) saturate(180%)`
- Border: `1px solid rgba(255,255,255,0.06)`. Focus: `1px solid rgba(255,255,255,0.18)`.
- Radius: 12px. Padding: 14px 16px. Font: 17px SF Pro.

### Cards (glass)
- Fill: `rgba(28,28,30,0.72)`
- BackdropFilter: `blur(30px) saturate(180%)`
- Border: `1px solid rgba(255,255,255,0.06)`
- Shadow: `0 16px 40px rgba(0,0,0,0.4)`
- Radius: 16-20px

## 5. Layout
8-point grid. Generous corner radii (12-20px). Cards float over content. Content underneath the glass should always be visible (never opaque fills).

## 6. Hierarchy
System blue marks primary actions. Glass surfaces create the depth hierarchy — foreground glass over background image / gradient. Text uses transparency-based opacity for hierarchy (1.0 / 0.6 / 0.3).

## 7. Motion
- Spring physics — `cubic-bezier(0.16, 1, 0.3, 1)` over 350ms
- Subtle parallax on hover
- Backdrop refraction shifts subtly with motion
- No pulse, no shimmer

## 8. Wallet-specific guidance (password screen)
- Background: rich gradient or AI-generated atmospheric image. The background CARRIES the visual weight; everything else is glass over it.
- "phantom" header: 15px/600 SF Pro, white. No fill — just text on the background.
- Logo (👻): white, subtle 0.6 opacity, soft halo. Size 96px. Lets the background show through.
- Title "Enter your Password": 22px/600 SF Pro, white, `-0.02em` tracking.
- Password input: glass fill `rgba(118,118,128,0.24)` + `backdrop-filter: blur(14px) saturate(180%)`, hairline border, 12px radius.
- Unlock button: solid `#0A84FF`, 17px/600 white text, 12px radius, soft shadow `0 4px 12px rgba(10,132,255,0.3)`.
- Forgot link: 15px/500, color `#0A84FF`. No underline (Apple style).

## 9. Don'ts
- No solid opaque fills on cards/inputs (always use glass)
- No gradient buttons (solid system colors only)
- No neon, no glow beyond soft accent shadow
- No textShadow on body/labels
- Animations only via spring curves (never linear / ease-in-out)
- No more than 2 accent colors per screen
