
// Enhanced API response types for new JSON structure
export interface GPTResponse {
  success: boolean;
  response: string;
  styleChanges?: EnhancedStyleChanges;
  imageUrl?: string;
  mode: string;
  error?: string;
}

export interface EnhancedStyleChanges {
  analysis: string;
  actions: string[];
  elements: {
    backgrounds?: {
      login?: string;
      dashboard?: string;
    };
    colors?: {
      primary?: string;
      accent?: string;
      text?: string;
      background?: string;
    };
    typography?: {
      header?: string;
      body?: string;
      button?: string;
    };
    components?: {
      buttons?: any;
      cards?: any;
      navigation?: any;
    };
  };
  metadata: {
    generated_assets?: string[];
    style_reasoning: string;
    nft_ready: boolean;
  };
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
