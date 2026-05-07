# DESIGN.md — Vaporwave (Pastel Retro-Future)

## 1. Visual theme
Retro 80s/90s aesthetic. Pastel pink and cyan against dark purple skies. Roman busts, palm trees, sunset gradients. Dreamy, melancholic, faintly ironic.

## 2. Color roles
- **Surface base**: `#1A0033` (deep purple-night)
- **Surface raised**: `#2D0F4A`
- **Surface input**: `#3B1660`
- **Border**: `rgba(255,113,206,0.18)`
- **Text primary**: `#FFE5F1`
- **Text secondary**: `#B89DCC`
- **Accent pink**: `#FF71CE` (hot pastel pink)
- **Accent cyan**: `#01CDFE` (electric cyan)
- **Accent yellow**: `#FFFB96` (sun yellow)
- **Sunset gradient**: `linear-gradient(180deg, #FF71CE 0%, #01CDFE 100%)`
- **Glow pink**: `rgba(255,113,206,0.5)`

## 3. Typography
- **Headings**: Audiowide, Major Mono Display, or VT323 — retro/synth fonts; otherwise Inter 700 with extra letter-spacing
- **Body**: Inter 500
- **Sizes**: title 18px (uppercase ok) • body 14px • caption 11px (tracked uppercase)
- Optional textShadow on titles only: `0 0 12px #FF71CE, 2px 2px 0 #01CDFE` (chromatic aberration look).

## 4. Component styles

### Buttons
- Primary CTA: gradient `180deg, #FF71CE, #B967FF`. White text. 8px radius. 14px/700. Box-shadow `0 0 20px rgba(255,113,206,0.4)`.
- Secondary: transparent fill, `1px solid #FF71CE`, pink text.

### Inputs
- Fill: `#3B1660`
- Border: `1px solid rgba(255,113,206,0.18)`. Focus: `1px solid #01CDFE`.
- Radius: 8px. Padding: 12px 14px.

### Cards
- 1px pink hairline, dark fill, optional subtle pink glow.

## 5. Layout
8px grid. Mid radii (8-12px). Centered, slightly retro alignments — vaporwave loves symmetry.

## 6. Hierarchy
Pink and cyan together as a duo. Pink for primary, cyan for secondary/links. Yellow is reserved for highlight/sun-element only (one per screen).

## 7. Motion
- Allowed: 14s `wcc-aurora` background hue shift
- Allowed: 200ms hover transitions
- FORBIDDEN: pulsing text, shimmering text
- The aesthetic is dreamy/static, not jittery

## 8. Wallet-specific guidance (password screen)
- Background: deep purple-pink-cyan gradient OR AI image with sunset/cosmic vibes. Aurora animation (14s).
- "phantom" header: 14px/700 Audiowide uppercase, color `#FFE5F1`, optional pink glow.
- Logo (👻): white with strong pink glow `text-shadow: 0 0 24px #FF71CE, 0 0 48px rgba(1,205,254,0.3)`. 96px.
- Title: 18px/700 uppercase Audiowide, color `#FFE5F1`, optional `text-shadow: 2px 2px 0 #01CDFE` (chromatic aberration).
- Password input: `#3B1660` fill, pink hairline, cyan border on focus.
- Unlock button: gradient `#FF71CE → #B967FF` with pink shadow.
- Forgot link: 13px/500, `#01CDFE`. Hover: glow.

## 9. Don'ts
- No more than 3 accent colors (pink, cyan, yellow — pick 2)
- No solid bright backgrounds (always dark base with pastel accents)
- No animations on body text
- No serif fonts (vaporwave is sans / mono / synth)
