
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isGenerated?: boolean;
  autoApplied?: boolean;
  isPatchPreview?: boolean;
  walletElement?: string;
}
