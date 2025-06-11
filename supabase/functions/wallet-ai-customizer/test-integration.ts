
// Test file for API Schema Integration
import { APISchemaConverter } from './index.ts';

// Test data matching API schema
const testCustomizationData = {
  loginScreen: {
    background: {
      color: "#1a1a2e"
    },
    unlockButton: {
      background: { color: "#e94560" },
      text: { color: "#ffffff", fontSize: "16px", fontWeight: "bold" },
      border: { radius: { all: "12px" }, width: "2px", style: "solid", color: "#e94560" },
      shadow: { offsetX: "0px", offsetY: "4px", blurRadius: "12px", color: "rgba(233,69,96,0.3)" },
      states: {
        default: {},
        hover: {},
        active: {},
        disabled: {},
        focus: {}
      },
      size: {}
    },
    passwordInput: {
      background: { color: "#16213e" },
      text: { fontSize: "16px", fontWeight: "normal", color: "#ffffff" },
      placeholder: { fontSize: "16px", fontWeight: "normal", color: "#888888" },
      border: { width: "1px", style: "solid", color: "#e94560" },
      shadow: { offsetX: "0px", offsetY: "0px", blurRadius: "0px", color: "transparent" },
      states: {
        default: {},
        focus: {},
        error: {},
        disabled: {},
        valid: {}
      },
      size: {}
    },
    phantomText: {
      fontFamily: "Roboto, sans-serif",
      fontSize: "28px",
      fontWeight: "bold",
      color: "#ffffff"
    }
  },
  walletScreen: {
    header: {
      container: {
        background: { color: "#1a1a2e" },
        border: { width: "0px", style: "solid", color: "transparent" },
        shadow: { offsetX: "0px", offsetY: "2px", blurRadius: "8px", color: "rgba(0,0,0,0.1)" },
        size: {},
        padding: { all: "20px" },
        layout: { display: "flex", justifyContent: "space-between", alignItems: "center" }
      },
      accountInfo: {
        fontFamily: "Roboto, sans-serif",
        fontSize: "18px",
        fontWeight: "normal",
        color: "#ffffff"
      }
    },
    actionButtons: {
      receiveButton: {
        background: { color: "#e94560" },
        text: { fontSize: "14px", fontWeight: "bold", color: "#ffffff" },
        border: { radius: { all: "12px" }, width: "1px", style: "solid", color: "transparent" },
        shadow: { offsetX: "0px", offsetY: "4px", blurRadius: "12px", color: "rgba(233,69,96,0.3)" },
        states: {
          default: {},
          hover: {},
          active: {},
          disabled: {},
          focus: {}
        },
        size: {}
      },
      buttonLabels: {
        fontSize: "12px",
        fontWeight: "normal",
        color: "#ffffff"
      }
    }
  },
  global: {
    fonts: {
      primary: {
        family: "Roboto, sans-serif",
        weights: [400, 700],
        fallbacks: ["system-ui", "sans-serif"]
      },
      fallbacks: ["system-ui", "sans-serif"]
    },
    colors: {
      primary: {
        "500": "#e94560",
        "50": "#fef2f2",
        "100": "#fee2e2",
        "200": "#fecaca",
        "300": "#fca5a5",
        "400": "#f87171",
        "600": "#dc2626",
        "700": "#b91c1c",
        "800": "#991b1b",
        "900": "#7f1d1d"
      }
    },
    borders: {
      radiusScale: {
        none: "0px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px"
      }
    }
  }
};

// Test validation
console.log('🧪 Testing API Schema Validation:');
const validation = APISchemaConverter.validateCustomizationData(testCustomizationData);
console.log('Validation Result:', {
  isValid: validation.isValid,
  errors: validation.errors,
  warnings: validation.warnings
});

// Test conversion to store format
console.log('\n🧪 Testing Conversion to Store Format:');
const storeFormat = APISchemaConverter.convertToStoreFormat(testCustomizationData);
console.log('Store Format Result:', storeFormat);

// Test mock N8N result conversion
console.log('\n🧪 Testing N8N Result Conversion:');
const mockN8NResult = {
  success: true,
  result: storeFormat,
  sessionId: 'test-session-123',
  processingTime: 2.5,
  warnings: [],
  timestamp: new Date().toISOString()
};

const apiResponse = APISchemaConverter.convertFromN8NResult(mockN8NResult);
console.log('API Response Result:', {
  success: apiResponse.success,
  hasCustomizationData: !!apiResponse.result?.appliedCustomization,
  elementsProcessed: apiResponse.result?.performance?.elementsProcessed || 0,
  excludedElements: apiResponse.result?.excludedElements || []
});

// Test with excluded elements
console.log('\n🧪 Testing Excluded Elements Validation:');
const dataWithExcluded = {
  ...testCustomizationData,
  loginScreen: {
    ...testCustomizationData.loginScreen,
    logo: { color: "#ffffff" }, // This should trigger warning
    aiPet: { emotion: "happy" } // This should trigger warning
  }
};

const excludedValidation = APISchemaConverter.validateCustomizationData(dataWithExcluded);
console.log('Excluded Elements Validation:', {
  isValid: excludedValidation.isValid,
  warnings: excludedValidation.warnings
});

export { testCustomizationData, APISchemaConverter };
