# DESIGN.md — Dark Minimal (Conservative Default)

## 1. Visual theme
Conservative dark interface. Neutral, professional, doesn't try to make a statement. The safe fallback when the user prompt is vague. Reads as competent and trustworthy without committing to a specific brand voice.

## 2. Color roles
- **Surface base**: `#131217`
- **Surface raised**: `#1E1B2E`
- **Surface input**: `#252338`
- **Border subtle**: `rgba(255,255,255,0.07)`
- **Border accent**: `rgba(171,159,242,0.5)` (Phantom default purple, dimmed)
- **Text primary**: `#FFFFFF`
- **Text secondary**: `#9D9CB0`
- **Accent (Phantom default)**: `#AB9FF2` (muted purple)
- **Accent hover**: `#BFB3FF`

## 3. Typography
- **Headings**: Inter, 600 weight
- **Body**: Inter, 500 weight
- **Mono**: SF Mono / JetBrains Mono for addresses
- **Sizes**: title 17px • body 14px • caption 12px
- Line-height: 1.4 body, 1.2 headings.

## 4. Component styles

### Buttons
- Primary CTA: solid `#AB9FF2` fill, `#131217` text, 12px radius, height 44px, 15px/600.
- Secondary: transparent fill, `1px solid rgba(255,255,255,0.10)`, white text.

### Inputs
- Fill: `#252338`
- Border: `1px solid rgba(255,255,255,0.07)`. Focus: `1px solid #AB9FF2`.
- Radius: 12px. Padding: 14px 16px. Font: 15px Inter.

### Cards
- 1px hairline, 12px radius, no shadow.

## 5. Layout
8px grid. Standard 12px radii. Comfortable spacing.

## 6. Hierarchy
Purple `#AB9FF2` marks primary actions. Everything else is grayscale. Deliberately understated.

## 7. Motion
- 200ms ease
- No glow, no pulse, no shimmer
- Hover: subtle background tint shift

## 8. Wallet-specific guidance (password screen)
- Background: solid `#131217` or radial gradient toward `#1E1B2E` at center.
- "phantom" header: 14px/600 Inter, white.
- Logo (👻): white with subtle purple glow `text-shadow: 0 0 24px rgba(171,159,242,0.3)`. 88px.
- Title: 17px/600 Inter, white.
- Password input: `#252338` fill, hairline border, purple border on focus.
- Unlock button: solid `#AB9FF2`, dark text, 12px radius.
- Forgot link: 13px/500, `#AB9FF2`. Hover: `#BFB3FF`.

## 9. Don'ts
- No bold colors
- No gradients
- No glow beyond a subtle 24px halo on logo
- No animations
- This is the minimum-statement default — when in doubt, default here
