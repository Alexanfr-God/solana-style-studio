/**
 * Database Operations
 */

import type { Auction, Bid, NFT } from '../types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase configuration');
}

const headers = {
  'apikey': serviceKey,
  'Authorization': `Bearer ${serviceKey}`,
  'Content-Type': 'application/json'
};

/**
 * Fetch NFT by mint address
 */
export async function fetchNFT(mintAddress: string): Promise<NFT | null> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/minted_themes?mint_address=eq.${mintAddress}&select=*`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch NFT');
  }

  const nfts = await response.json();
  return nfts.length > 0 ? nfts[0] : null;
}

/**
 * Check if NFT has active auction
 */
export async function hasActiveAuction(nftMint: string): Promise<boolean> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_auctions?nft_mint=eq.${nftMint}&status=eq.active&select=id`,
    { headers }
  );

  if (!response.ok) {
    return false;
  }

  const auctions = await response.json();
  return auctions.length > 0;
}

/**
 * Create auction
 */
export async function createAuction(data: {
  nft_mint: string;
  seller_wallet: string;
  start_price_lamports: number;
  end_at: string;
}): Promise<Auction> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_auctions`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...data,
        current_price_lamports: data.start_price_lamports,
        status: 'active'
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create auction: ${error}`);
  }

  const auctions = await response.json();
  return auctions[0];
}

/**
 * Fetch auction by ID
 */
export async function fetchAuction(auctionId: string, status?: string): Promise<Auction | null> {
  let url = `${supabaseUrl}/rest/v1/nft_auctions?id=eq.${auctionId}&select=*`;
  if (status) {
    url += `&status=eq.${status}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch auction');
  }

  const auctions = await response.json();
  return auctions.length > 0 ? auctions[0] : null;
}

/**
 * Fetch all auctions (for auto-finalize)
 */
export async function fetchExpiredAuctions(): Promise<Auction[]> {
  const now = new Date().toISOString();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_auctions?status=eq.active&end_at=lt.${now}&select=*`,
    { headers }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch expired auctions');
  }

  return await response.json();
}

/**
 * Check if auction has bids
 */
export async function hasBids(auctionId: string): Promise<boolean> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_bids?auction_id=eq.${auctionId}&select=id`,
    { headers }
  );

  if (!response.ok) {
    return false;
  }

  const bids = await response.json();
  return bids.length > 0;
}

/**
 * Create bid
 */
export async function createBid(data: {
  auction_id: string;
  bidder_wallet: string;
  bid_price_lamports: number;
  tx_signature?: string;
}): Promise<Bid> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_bids`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create bid: ${error}`);
  }

  const bids = await response.json();
  return bids[0];
}

/**
 * Update auction
 */
export async function updateAuction(
  auctionId: string,
  data: Partial<Auction>
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/nft_auctions?id=eq.${auctionId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        ...data,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update auction: ${error}`);
  }
}

/**
 * Update NFT
 */
export async function updateNFT(
  mintAddress: string,
  data: Partial<NFT>
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/minted_themes?mint_address=eq.${mintAddress}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update NFT: ${error}`);
  }
}
