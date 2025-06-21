
// Comprehensive customization validation system
import { WalletElement, validateCustomization } from './elementRegistry.ts';
import { DetailedWalletAnalysis } from './structureAnalyzer.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  elementId: string;
  property: string;
  value: any;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  elementId: string;
  property: string;
  value: any;
  message: string;
  impact: 'functionality' | 'accessibility' | 'usability' | 'aesthetics';
}

export function validateFullCustomization(
  customization: any,
  analysis: DetailedWalletAnalysis
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const suggestions: string[] = [];
  
  // Validate structure
  if (!customization || typeof customization !== 'object') {
    errors.push({
      elementId: 'root',
      property: 'structure',
      value: customization,
      message: 'Invalid customization structure',
      severity: 'critical'
    });
    return { isValid: false, errors, warnings, suggestions };
  }
  
  // Validate actions if present
  if (customization.actions && Array.isArray(customization.actions)) {
    customization.actions.forEach((action: any, index: number) => {
      validateAction(action, index, analysis, errors, warnings);
    });
  }
  
  // Validate elements if present
  if (customization.elements) {
    validateElements(customization.elements, analysis, errors, warnings, suggestions);
  }
  
  // Check for accessibility issues
  validateAccessibility(customization, analysis, warnings, suggestions);
  
  // Check for performance implications
  validatePerformance(customization, warnings, suggestions);
  
  return {
    isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
    errors,
    warnings,
    suggestions
  };
}

function validateAction(
  action: any,
  index: number,
  analysis: DetailedWalletAnalysis,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  if (!action.elementId || !action.property || action.value === undefined) {
    errors.push({
      elementId: action.elementId || `action-${index}`,
      property: action.property || 'unknown',
      value: action.value,
      message: `Action ${index}: Missing required fields (elementId, property, value)`,
      severity: 'critical'
    });
    return;
  }
  
  // Find the element
  const element = analysis.uiStructure.elements.find(el => el.id === action.elementId);
  if (!element) {
    errors.push({
      elementId: action.elementId,
      property: action.property,
      value: action.value,
      message: `Element '${action.elementId}' not found in wallet structure`,
      severity: 'high'
    });
    return;
  }
  
  // Check if element is customizable
  if (!element.safeZone.canCustomize) {
    errors.push({
      elementId: action.elementId,
      property: action.property,
      value: action.value,
      message: `Element '${element.name}' is protected and cannot be customized`,
      severity: 'high'
    });
    return;
  }
  
  // Check critical functionality
  if (element.safeZone.criticalForFunctionality) {
    const criticalValidation = validateCriticalElement(action, element);
    if (!criticalValidation.valid) {
      warnings.push({
        elementId: action.elementId,
        property: action.property,
        value: action.value,
        message: `Modifying critical element '${element.name}': ${criticalValidation.warnings.join(', ')}`,
        impact: 'functionality'
      });
    }
  }
  
  // Validate specific properties
  validateProperty(action, element, errors, warnings);
}

function validateElements(
  elements: any,
  analysis: DetailedWalletAnalysis,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  // Validate colors
  if (elements.colors) {
    validateColors(elements.colors, errors, warnings, suggestions);
  }
  
  // Validate typography
  if (elements.typography) {
    validateTypography(elements.typography, errors, warnings);
  }
  
  // Validate spacing
  if (elements.spacing) {
    validateSpacing(elements.spacing, warnings);
  }
  
  // Validate effects
  if (elements.effects) {
    validateEffects(elements.effects, warnings);
  }
}

function validateColors(
  colors: any,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  const colorProperties = ['primary', 'secondary', 'accent', 'background', 'text'];
  
  colorProperties.forEach(prop => {
    if (colors[prop]) {
      const colorValue = colors[prop];
      
      // Validate color format
      if (!isValidColor(colorValue)) {
        errors.push({
          elementId: 'colors',
          property: prop,
          value: colorValue,
          message: `Invalid color format for ${prop}: ${colorValue}`,
          severity: 'medium'
        });
      }
      
      // Check contrast for text colors
      if (prop === 'text' && colors.background) {
        const contrast = calculateContrast(colorValue, colors.background);
        if (contrast < 4.5) {
          warnings.push({
            elementId: 'colors',
            property: 'contrast',
            value: contrast,
            message: `Low contrast ratio (${contrast.toFixed(2)}) between text and background`,
            impact: 'accessibility'
          });
          suggestions.push('Consider using higher contrast colors for better accessibility');
        }
      }
    }
  });
  
  // Check for color harmony
  if (colors.primary && colors.accent) {
    const harmony = checkColorHarmony(colors.primary, colors.accent);
    if (!harmony.harmonious) {
      suggestions.push(`Consider adjusting color harmony: ${harmony.suggestion}`);
    }
  }
}

function validateTypography(
  typography: any,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  // Validate font family
  if (typography.fontFamily && !isValidFontFamily(typography.fontFamily)) {
    warnings.push({
      elementId: 'typography',
      property: 'fontFamily',
      value: typography.fontFamily,
      message: `Font family '${typography.fontFamily}' may not be available on all devices`,
      impact: 'usability'
    });
  }
  
  // Validate font sizes
  if (typography.sizes) {
    Object.entries(typography.sizes).forEach(([key, size]) => {
      if (!isValidFontSize(size as string)) {
        errors.push({
          elementId: 'typography',
          property: `sizes.${key}`,
          value: size,
          message: `Invalid font size format: ${size}`,
          severity: 'medium'
        });
      }
    });
  }
}

function validateSpacing(spacing: any, warnings: ValidationWarning[]) {
  if (spacing.borderRadius) {
    const radius = parseFloat(spacing.borderRadius);
    if (radius > 50) {
      warnings.push({
        elementId: 'spacing',
        property: 'borderRadius',
        value: spacing.borderRadius,
        message: 'Very large border radius may affect visual hierarchy',
        impact: 'aesthetics'
      });
    }
  }
}

function validateEffects(effects: any, warnings: ValidationWarning[]) {
  if (effects.boxShadow) {
    // Check for excessive shadow blur
    const shadowBlur = extractShadowBlur(effects.boxShadow);
    if (shadowBlur > 30) {
      warnings.push({
        elementId: 'effects',
        property: 'boxShadow',
        value: effects.boxShadow,
        message: 'Large shadow blur may impact performance',
        impact: 'usability'
      });
    }
  }
}

function validateAccessibility(
  customization: any,
  analysis: DetailedWalletAnalysis,
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  // Check for minimum touch target sizes
  const interactiveElements = analysis.interactivity.buttons;
  interactiveElements.forEach(button => {
    if (button.position.width < 44 || button.position.height < 44) {
      warnings.push({
        elementId: button.id,
        property: 'size',
        value: `${button.position.width}x${button.position.height}`,
        message: `Touch target too small (minimum 44x44px recommended)`,
        impact: 'accessibility'
      });
    }
  });
  
  // Add accessibility suggestions
  suggestions.push('Ensure all interactive elements meet minimum size requirements');
  suggestions.push('Test color combinations for sufficient contrast');
  suggestions.push('Verify that all text remains readable after customization');
}

function validatePerformance(
  customization: any,
  warnings: ValidationWarning[],
  suggestions: string[]
) {
  // Check for performance-heavy properties
  if (customization.elements?.effects?.boxShadow) {
    const shadowCount = (customization.elements.effects.boxShadow.match(/,/g) || []).length + 1;
    if (shadowCount > 3) {
      warnings.push({
        elementId: 'effects',
        property: 'boxShadow',
        value: shadowCount,
        message: `Multiple box shadows (${shadowCount}) may impact performance`,
        impact: 'usability'
      });
    }
  }
  
  suggestions.push('Consider using CSS transforms instead of changing layout properties for animations');
  suggestions.push('Limit the number of simultaneous animations to maintain smooth performance');
}

function validateCriticalElement(action: any, element: WalletElement) {
  return validateCustomization(element.id, { [action.property]: action.value });
}

function validateProperty(
  action: any,
  element: WalletElement,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  const { property, value } = action;
  
  switch (property) {
    case 'backgroundColor':
    case 'color':
      if (!isValidColor(value)) {
        errors.push({
          elementId: element.id,
          property,
          value,
          message: `Invalid color format: ${value}`,
          severity: 'medium'
        });
      }
      break;
      
    case 'fontSize':
      if (!isValidFontSize(value)) {
        errors.push({
          elementId: element.id,
          property,
          value,
          message: `Invalid font size format: ${value}`,
          severity: 'medium'
        });
      }
      break;
      
    case 'display':
      if (value === 'none' && element.safeZone.criticalForFunctionality) {
        errors.push({
          elementId: element.id,
          property,
          value,
          message: 'Cannot hide critical functional element',
          severity: 'high'
        });
      }
      break;
  }
}

// Helper functions
function isValidColor(color: string): boolean {
  return /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+)/.test(color);
}

function isValidFontFamily(fontFamily: string): boolean {
  return typeof fontFamily === 'string' && fontFamily.length > 0;
}

function isValidFontSize(fontSize: string): boolean {
  return /^\d+(\.\d+)?(px|em|rem|%)$/.test(fontSize);
}

function calculateContrast(color1: string, color2: string): number {
  // Simplified contrast calculation - in production, use a proper library
  return 4.5; // Placeholder
}

function checkColorHarmony(color1: string, color2: string): { harmonious: boolean; suggestion: string } {
  // Simplified harmony check - in production, use color theory algorithms
  return { harmonious: true, suggestion: 'Colors work well together' };
}

function extractShadowBlur(boxShadow: string): number {
  const match = boxShadow.match(/(\d+)px/g);
  if (match && match.length >= 3) {
    return parseFloat(match[2]);
  }
  return 0;
}
