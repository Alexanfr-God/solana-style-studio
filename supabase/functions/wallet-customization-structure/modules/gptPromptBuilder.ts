
// Enhanced GPT prompt builder with detailed wallet understanding
import { DetailedWalletAnalysis } from './structureAnalyzer.ts';
import { WalletElement, validateCustomization } from './elementRegistry.ts';

export function buildEnhancedWalletPrompt(
  userPrompt: string, 
  analysis: DetailedWalletAnalysis,
  imageUrl?: string
): string {
  
  const customizableElements = analysis.uiStructure.elements.filter(el => el.safeZone.canCustomize);
  const criticalElements = analysis.uiStructure.elements.filter(el => el.safeZone.criticalForFunctionality);
  
  return `
# WALLET CUSTOMIZATION AI SYSTEM

You are an expert wallet UI designer with complete understanding of ${analysis.walletType} wallet structure.

## CURRENT WALLET ANALYSIS
**Wallet Type**: ${analysis.walletType}
**Screen Type**: ${analysis.screenType}
**Dimensions**: ${analysis.uiStructure.dimensions.width}x${analysis.uiStructure.dimensions.height}
**Total Elements**: ${analysis.uiStructure.elements.length}
**Customizable Elements**: ${customizableElements.length}
**Critical Elements**: ${criticalElements.length}

## DETAILED UI STRUCTURE
${buildElementStructurePrompt(analysis)}

## COLOR SYSTEM
${buildColorSystemPrompt(analysis.colorSystem)}

## TYPOGRAPHY SYSTEM
${buildTypographyPrompt(analysis.typography)}

## INTERACTIVE ELEMENTS
${buildInteractiveElementsPrompt(analysis.interactivity)}

## CUSTOMIZATION RULES & SAFE ZONES
${buildCustomizationRulesPrompt(analysis.customizationRules)}

## LAYOUT SYSTEM
${buildLayoutSystemPrompt(analysis.layoutSystem)}

## USER REQUEST
"${userPrompt}"
${imageUrl ? `\n**Reference Image**: ${imageUrl}` : ''}

## RESPONSE FORMAT
You MUST respond with this EXACT JSON structure:

\`\`\`json
{
  "analysis": "Brief analysis of the user request and how it applies to the wallet",
  "actions": [
    {
      "type": "style_change",
      "elementId": "element-id",
      "property": "backgroundColor",
      "value": "#hexcolor",
      "reasoning": "Why this change is made"
    }
  ],
  "elements": {
    "colors": {
      "primary": "#hexcolor",
      "secondary": "#hexcolor",
      "accent": "#hexcolor",
      "background": "#hexcolor",
      "text": "#hexcolor"
    },
    "typography": {
      "fontFamily": "font-name",
      "sizes": {
        "header": "24px",
        "body": "14px"
      }
    },
    "spacing": {
      "borderRadius": "12px",
      "padding": "16px"
    },
    "effects": {
      "boxShadow": "shadow-definition",
      "gradient": "gradient-definition"
    }
  },
  "metadata": {
    "theme_name": "generated-theme-name",
    "style_reasoning": "Detailed explanation of the design choices",
    "preserved_elements": ["list-of-preserved-critical-elements"],
    "customized_elements": ["list-of-modified-elements"],
    "warnings": ["any-warnings-about-the-changes"],
    "accessibility_notes": "accessibility considerations",
    "nft_ready": true
  }
}
\`\`\`

## CRITICAL RULES
1. **NEVER modify elements in the excluded list**: ${analysis.customizationRules.excludedElements.join(', ')}
2. **PRESERVE functionality** of critical elements: ${criticalElements.map(el => el.name).join(', ')}
3. **MAINTAIN accessibility** - ensure proper contrast ratios
4. **RESPECT safe zones** - only customize elements marked as customizable
5. **KEEP brand identity** - never hide or modify the Phantom logo
6. **ENSURE usability** - maintain touch target sizes and navigation clarity

## STYLE ADAPTATION GUIDELINES
${analysis.generationContext.styleAdaptationGuidelines.map(guideline => `- ${guideline}`).join('\n')}

## THEME INSPIRATION
Available theme variations for reference:
${analysis.generationContext.themeVariations.map(theme => 
  `- **${theme.name}**: ${theme.description}`
).join('\n')}

Now analyze the user request and provide the JSON response with appropriate wallet customizations.
`;
}

function buildElementStructurePrompt(analysis: DetailedWalletAnalysis): string {
  const sections = analysis.uiStructure.layout.sections;
  
  return sections.map(section => `
### ${section.name.toUpperCase()} SECTION
**Position**: ${section.position.x}, ${section.position.y} (${section.position.width}x${section.position.height})
**Elements**: ${section.elements.length} elements
${section.elements.map(elementId => {
  const element = analysis.uiStructure.elements.find(el => el.id === elementId);
  if (!element) return '';
  
  return `  - **${element.name}** (${element.type}): ${element.position.width}x${element.position.height} - ${element.safeZone.canCustomize ? '✅ Customizable' : '❌ Protected'}`;
}).join('\n')}
  `).join('\n');
}

function buildColorSystemPrompt(colorSystem: any): string {
  return `
**Primary Colors**:
- Primary: ${colorSystem.primary}
- Secondary: ${colorSystem.secondary}  
- Accent: ${colorSystem.accent}
- Background: ${colorSystem.background}
- Surface: ${colorSystem.surface}

**Text Colors**:
- Primary Text: ${colorSystem.text.primary}
- Secondary Text: ${colorSystem.text.secondary}
- Accent Text: ${colorSystem.text.accent}

**Status Colors**:
- Success: ${colorSystem.status.success}
- Error: ${colorSystem.status.error}
- Warning: ${colorSystem.status.warning}
- Info: ${colorSystem.status.info}

**Interactive States**:
- Normal: ${colorSystem.interactive.normal}
- Hover: ${colorSystem.interactive.hover}
- Active: ${colorSystem.interactive.active}
- Disabled: ${colorSystem.interactive.disabled}
`;
}

function buildTypographyPrompt(typography: any): string {
  return `
**Font Family**: ${typography.fontFamily}
**Font Sizes**: H1(${typography.sizes.h1}), H2(${typography.sizes.h2}), Body(${typography.sizes.body}), Caption(${typography.sizes.caption})
**Font Weights**: Light(${typography.weights.light}), Normal(${typography.weights.normal}), Medium(${typography.weights.medium}), Bold(${typography.weights.bold})
**Line Heights**: Tight(${typography.lineHeights.tight}), Normal(${typography.lineHeights.normal}), Relaxed(${typography.lineHeights.relaxed})
`;
}

function buildInteractiveElementsPrompt(interactivity: any): string {
  return `
**Buttons** (${interactivity.buttons.length} total):
${interactivity.buttons.map((btn: any) => 
  `- ${btn.id}: ${btn.customizable ? '✅' : '❌'} ${btn.functionality}`
).join('\n')}

**Animations** (${interactivity.animations.length} total):
${interactivity.animations.map((anim: any) => 
  `- ${anim.elementId}: ${anim.type} (${anim.duration}ms on ${anim.trigger})`
).join('\n')}
`;
}

function buildCustomizationRulesPrompt(rules: any): string {
  return `
**Safe Zones**:
${rules.safeZones.map((zone: any) => 
  `- ${zone.elementId}: ${zone.canCustomize ? '✅ Customizable' : '❌ Protected'} - ${zone.restrictions.join(', ')}`
).join('\n')}

**Excluded Elements**: ${rules.excludedElements.join(', ')}

**Recommended Customizations**:
${rules.recommendedCustomizations.map((rec: any) => 
  `- **${rec.category}**: ${rec.elements.join(', ')} - ${rec.suggestions.join(', ')}`
).join('\n')}
`;
}

function buildLayoutSystemPrompt(layout: any): string {
  return `
**Containers** (${layout.containers.length} total):
${layout.containers.map((container: any) => 
  `- ${container.id}: ${container.position.width}x${container.position.height} - ${container.customizable ? '✅' : '❌'}`
).join('\n')}

**Spacing Scale**: ${layout.spacing.scale.join('px, ')}px
**Base Spacing**: ${layout.spacing.base}px
`;
}

export function validateGptResponse(response: any, analysis: DetailedWalletAnalysis): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required structure
  if (!response.analysis || !response.actions || !response.elements || !response.metadata) {
    errors.push('Missing required response structure');
  }
  
  // Validate actions
  if (response.actions) {
    response.actions.forEach((action: any, index: number) => {
      if (!action.elementId || !action.property || !action.value) {
        errors.push(`Action ${index}: Missing required fields`);
      }
      
      // Check if element exists and is customizable
      const element = analysis.uiStructure.elements.find(el => el.id === action.elementId);
      if (!element) {
        errors.push(`Action ${index}: Element ${action.elementId} not found`);
      } else if (!element.safeZone.canCustomize) {
        errors.push(`Action ${index}: Element ${action.elementId} is not customizable`);
      }
      
      // Validate specific customizations
      const validation = validateCustomization(action.elementId, { [action.property]: action.value });
      if (!validation.valid) {
        errors.push(`Action ${index}: ${validation.warnings.join(', ')}`);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}
