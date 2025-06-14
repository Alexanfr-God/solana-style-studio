# Chain-of-Thought (COT) Reasoning Steps for Wallet Customization

## Step 1: Image Analysis and Style Detection
- Analyze the uploaded image for dominant colors, mood, and visual style
- Identify key elements: objects, composition, lighting, artistic style
- Determine mood profile: energetic, calm, mysterious, playful, professional
- Extract color palette with 3-5 dominant colors
- Classify style type: minimal, cyberpunk, nature, luxury, abstract, cosmic, etc.

## Step 2: Wallet Context Understanding  
- Consider the target wallet type (phantom, metamask, solflare)
- Understand the screen type (login, home, send, receive)
- Review safe zones and UI interaction areas that must remain clear
- Account for accessibility requirements and contrast needs
- Consider the functional context of the wallet interface

## Step 3: Style Mapping and Theme Selection
- Map detected style to supported themes in our library
- If no exact match, find the closest theme or create a hybrid approach
- Consider how the style translates to UI elements (buttons, cards, text)
- Ensure the theme supports the identified mood profile
- Validate that the theme works with the target wallet's interface

## Step 4: Color Palette Generation
- Extract 3-5 dominant colors from the analysis
- Generate complementary colors for UI elements
- Ensure sufficient contrast ratios for accessibility (4.5:1 minimum)
- Define primary, secondary, background, surface, text, and accent colors
- Test color combinations against different interface states

## Step 5: Safe Zone and Layout Compliance
- Identify areas that must remain clear for wallet functionality
- Ensure backgrounds don't interfere with text readability
- Respect interaction zones for buttons and input fields
- Maintain visual hierarchy and UI element prominence
- Consider responsive behavior across different screen sizes

## Step 6: Prompt Construction
- Build a detailed prompt for background/element generation
- Include style descriptors, mood, and color specifications
- Add technical requirements: resolution, format, safe zones
- Specify what should NOT be included (logos, text, distracting elements)
- Include atmospheric and aesthetic direction

## Step 7: CSS Variable Mapping
- Map generated colors to CSS custom properties
- Define element-specific styles (buttons, cards, inputs)
- Ensure consistency across all interface elements
- Consider hover states, active states, and disabled states
- Validate against the wallet's existing component structure

## Step 8: Quality Validation
- Check that all generated elements maintain visual consistency
- Verify accessibility standards are met
- Ensure the design enhances rather than hinders functionality
- Validate that the style matches the original image's intent
- Confirm that safe zones are properly respected

## Step 9: Iteration and Refinement
- If results don't meet quality standards, identify specific issues
- Adjust color palette, style direction, or prompt construction
- Refine based on technical constraints or user feedback
- Document successful patterns for future few-shot examples
- Learn from failures to improve the reasoning process

## Decision Making Framework
When making decisions at each step, consider:
1. **Functionality First**: Never compromise wallet usability for aesthetics
2. **Accessibility**: Ensure the design is inclusive and readable
3. **Brand Consistency**: Maintain the wallet's core visual identity
4. **User Intent**: Honor the style and mood of the uploaded image
5. **Technical Feasibility**: Work within the constraints of web technologies