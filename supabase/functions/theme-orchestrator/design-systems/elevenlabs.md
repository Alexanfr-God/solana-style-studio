# DESIGN.md — ElevenLabs (Cinematic AI Audio)

## 1. Visual theme
Cinematic dark UI. Audio-waveform aesthetic. Deep blacks with electric blue/cyan highlights echoing audio visualizations. Premium, technical, slightly futuristic.

## 2. Color roles
- **Surface base**: `#000000`
- **Surface raised**: `#0D0D0D`
- **Surface input**: `#161616`
- **Border subtle**: `rgba(255,255,255,0.06)`
- **Border accent**: `#3B82F6` (electric blue)
- **Text primary**: `#FFFFFF`
- **Text secondary**: `#9CA3AF`
- **Accent blue**: `#3B82F6`
- **Accent cyan**: `#06B6D4`
- **Accent gradient**: `linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)` (waveform energy)

## 3. Typography
- **Headings**: Inter, 700 weight, `-0.02em` tracking
- **Body**: Inter, 500 weight
- **Mono**: JetBrains Mono for technical data
- **Sizes**: title 18px • body 14px • caption 11px (uppercase tracked)

## 4. Component styles

### Buttons
- Primary CTA: gradient `135deg, #3B82F6, #06B6D4`, white text, 8px radius, 14px/700 text, soft blue shadow `0 4px 20px rgba(59,130,246,0.3)`.
- Secondary: transparent, `1px solid rgba(255,255,255,0.10)`, white text.

### Inputs
- Fill: `#161616`
- Border: `1px solid rgba(255,255,255,0.06)`. Focus: `1px solid #3B82F6` + halo `0 0 0 3px rgba(59,130,246,0.15)`.
- Radius: 8px. Padding: 12px 14px.

### Cards
- 1px hairline, 8-12px radius. Optional inner subtle blue glow.

## 5. Layout
8px grid. Sharp 6-8px radii. Cinematic widescreen feel — generous horizontal whitespace.

## 6. Hierarchy
Electric blue marks primary action. Cyan marks secondary/links. Together they evoke audio waveforms.

## 7. Motion
- 200ms ease-out
- Subtle wave-like background animation acceptable (very slow, ~12s)
- No pulse on text, no shimmer on labels

## 8. Wallet-specific guidance (password screen)
- Background: solid `#000000` with optional very subtle blue glow at top (radial gradient).
- "phantom" header: 14px/700 Inter, white.
- Logo (👻): white with electric blue glow `text-shadow: 0 0 24px #3B82F6, 0 0 48px rgba(6,182,212,0.4)`. 88px.
- Title: 18px/700 Inter, white, `-0.02em` tracking.
- Password input: `#161616` fill, hairline, blue halo on focus.
- Unlock button: gradient `#3B82F6 → #06B6D4`, white text, soft blue shadow.
- Forgot link: 13px/500, `#3B82F6`. Hover: cyan.

## 9. Don'ts
- No purple, no pink (this aesthetic is blue/cyan only)
- No glassmorphism
- No shimmer on text
- No more than 2 accent colors
