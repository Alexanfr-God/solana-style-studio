
import { supabase } from "@/integrations/supabase/client";

export type ChainType = 'evm' | 'solana';

export async function requestNonce(address: string, chain: ChainType) {
  const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
    body: { action: 'nonce', address, chain }
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Failed to request nonce');
  return data as { success: true; nonce: string; message: string };
}

export async function verifySignature(params: {
  address: string;
  chain: ChainType;
  signature: string;
  nonce: string;
  message: string;
  publicKey?: string; // required for Solana
}) {
  const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
    body: { action: 'verify', ...params }
  });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error || 'Verification failed');
  return data as { success: true; token: string | null; profile: any };
}
