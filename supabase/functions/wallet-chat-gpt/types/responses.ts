
// API response types
export interface GPTResponse {
  success: boolean;
  response: string;
  styleChanges?: any;
  imageUrl?: string;
  mode: string;
  error?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
