# RUG: Rules, Guidelines & Restrictions for Wallet Design

## CRITICAL RESTRICTIONS - NEVER VIOLATE

### Safe Zone Protection
- **NEVER** place logos, text, or decorative elements in defined safe zones
- **ALWAYS** keep the bottom 40% of login screens clear for input fields
- **NEVER** obscure wallet balance displays, transaction buttons, or navigation
- **ALWAYS** maintain minimum 20px padding around interactive elements

### Brand and Logo Rules
- **NEVER** include real cryptocurrency logos without explicit permission
- **NEVER** add fake branding or made-up company logos
- **NEVER** place any logo in the center area of wallet interfaces
- **ONLY** use generic, abstract symbols if brand elements are needed

### Color and Contrast Requirements
- **ALWAYS** maintain minimum 4.5:1 contrast ratio for text
- **NEVER** use colors that make text unreadable
- **ALWAYS** provide sufficient contrast between interactive elements and backgrounds
- **NEVER** use pure white text on light backgrounds or pure black on dark backgrounds

### Functionality Preservation
- **NEVER** style changes that break wallet core functionality
- **ALWAYS** ensure buttons remain clearly identifiable as interactive
- **NEVER** hide critical information with decorative elements
- **ALWAYS** maintain clear visual hierarchy

## DESIGN GUIDELINES

### Background Elements
- Keep backgrounds subtle and non-distracting
- Use opacity/blur to reduce visual noise
- Ensure patterns don't interfere with text readability
- Avoid high-contrast or busy background patterns

### Color Palette Standards
- Limit primary palette to 5-6 colors maximum
- Ensure colors work well together in various combinations
- Test color blindness accessibility with tools
- Maintain consistent color meaning (red for errors, green for success)

### Typography and Readability
- Never change font families without explicit user request
- Ensure sufficient line height and letter spacing
- Test readability across different screen sizes
- Maintain consistent typography hierarchy

### Interactive Elements
- Buttons must have clear hover/active states
- Maintain consistent button sizing and spacing
- Ensure focus indicators for keyboard navigation
- Never remove or obscure loading states

## WALLET-SPECIFIC RULES

### Phantom Wallet
- Respect the distinctive purple brand association
- Maintain the modern, sleek interface aesthetic
- Preserve gradient usage patterns in buttons
- Keep the interface clean and minimal

### MetaMask
- Honor the fox mascot brand recognition
- Maintain orange accent color associations
- Preserve the professional, trustworthy appearance
- Keep interfaces information-dense but organized

### Solflare
- Respect the solar/orange brand theming
- Maintain the clean, modern interface style
- Preserve the focus on Solana ecosystem integration
- Keep the interface straightforward and functional

## TECHNICAL RESTRICTIONS

### Performance Constraints
- Never add animations that cause jank or poor performance
- Avoid complex CSS that slows down rendering
- Limit image sizes to reasonable dimensions
- Ensure styles work on mobile devices

### CSS Implementation
- Use CSS custom properties for theming
- Avoid inline styles in favor of classes
- Ensure styles are scoped appropriately
- Maintain existing responsive breakpoints

### Browser Compatibility
- Ensure styles work in modern browsers (Chrome, Firefox, Safari, Edge)
- Avoid experimental CSS features without fallbacks
- Test across different screen sizes and orientations
- Maintain accessibility across different input methods

## QUALITY STANDARDS

### Visual Consistency
- All interface elements should feel cohesive
- Color usage should be consistent throughout
- Spacing and sizing should follow established patterns
- Visual weight should properly establish hierarchy

### User Experience
- Changes should enhance, not hinder usability
- Navigation should remain intuitive
- Critical actions should be easily discoverable
- Error states should be clearly communicated

### Accessibility Requirements
- Support keyboard navigation
- Provide sufficient color contrast
- Include proper ARIA labels where needed
- Work with screen readers

## ERROR PREVENTION

### Common Mistakes to Avoid
- Don't copy styles from one wallet type to another without adaptation
- Don't ignore the mood/style of the source image
- Don't create designs that only work in light or dark mode
- Don't forget to test with actual wallet data/content

### Validation Checklist
Before finalizing any design:
- [ ] Safe zones are properly respected
- [ ] Contrast ratios meet accessibility standards
- [ ] All interactive elements are clearly identifiable
- [ ] Design works across different screen sizes
- [ ] Color palette is consistent and purposeful
- [ ] No real brand logos are inappropriately used
- [ ] Functionality is preserved and enhanced
- [ ] Visual hierarchy supports user goals

## EMERGENCY FALLBACKS

If AI-generated design fails validation:
- Fall back to minimal theme with safe color palette
- Use simple gradients instead of complex patterns
- Prioritize functionality over visual complexity
- Provide clear error messaging about what went wrong