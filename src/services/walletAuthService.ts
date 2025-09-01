
import { supabase } from "@/integrations/supabase/client";

export type ChainType = 'evm' | 'solana';

export async function requestNonce(address: string, chain: ChainType) {
  console.log('🔐 Requesting nonce for:', { address: address.slice(0, 10) + '...', chain });
  
  const { data, error } = await supabase.functions.invoke('wallet-auth', {
    body: { action: 'nonce', address, chain }
  });
  
  if (error) {
    console.error('❌ Nonce request error:', error);
    throw error;
  }
  
  if (!data?.success) {
    console.error('❌ Nonce request failed:', data?.error);
    throw new Error(data?.error || 'Failed to request nonce');
  }
  
  console.log('✅ Nonce received successfully');
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
  console.log('🔍 Verifying signature for:', { 
    address: params.address.slice(0, 10) + '...', 
    chain: params.chain,
    hasSignature: !!params.signature,
    messageLength: params.message.length
  });
  
  const { data, error } = await supabase.functions.invoke('wallet-auth', {
    body: { action: 'verify', ...params }
  });
  
  if (error) {
    console.error('❌ Signature verification error:', error);
    throw error;
  }
  
  if (!data?.success) {
    console.error('❌ Signature verification failed:', data?.error);
    throw new Error(data?.error || 'Verification failed');
  }
  
  console.log('✅ Signature verified successfully');
  return data as { success: true; token: string | null; profile: any; auth_url?: string };
}
