
/**
 * API Configuration for LLM functions
 * Centralizes function names and endpoints
 */

export const LLM_FUNCTION_NAME = 
  import.meta.env.VITE_LLM_FUNCTION_NAME || 'llm-patch';

export const API_ENDPOINTS = {
  llmPatch: LLM_FUNCTION_NAME,
  walletAuth: 'wallet-auth',
  exportTheme: 'export_theme'
} as const;

// Helper to get the current LLM function name
export const getLLMFunctionName = () => LLM_FUNCTION_NAME;

// Type for supported chat modes
export type ChatMode = 'analysis' | 'leonardo' | 'replicate' | 'theme-patch' | 'upload';

console.log('🔧 API Config loaded - LLM Function:', LLM_FUNCTION_NAME);
