/**
 * Auction Edge Function - Main Router
 * 
 * Modular auction system for NFT marketplace
 * Handles: create, bid, cancel, finalize, auto-finalize
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { CORS_HEADERS } from './utils/constants.ts';
import { handleCreateAuction } from './handlers/create.ts';
import { handlePlaceBid } from './handlers/bid.ts';
import { handleCancelAuction } from './handlers/cancel.ts';
import { handleFinalizeAuction, autoFinalizeExpiredAuctions } from './handlers/finalize.ts';
import type { ApiResponse } from './types.ts';

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // Parse request
    const { action, ...params } = await req.json();

    console.log(`[auction] 📨 Action: ${action}`);

    let result: ApiResponse;

    // Route to appropriate handler
    switch (action) {
      case 'create':
        result = await handleCreateAuction(params);
        break;

      case 'bid':
        result = await handlePlaceBid(params);
        break;

      case 'cancel':
        result = await handleCancelAuction(params);
        break;

      case 'finalize':
        result = await handleFinalizeAuction(params);
        break;

      case 'auto_finalize':
        // This action is called by cron job
        result = await autoFinalizeExpiredAuctions();
        break;

      default:
        result = {
          success: false,
          error: `Unknown action: ${action}. Valid actions: create, bid, cancel, finalize, auto_finalize`
        };
    }

    // Return response
    const status = result.success ? 200 : 400;
    return new Response(
      JSON.stringify(result),
      {
        status,
        headers: CORS_HEADERS
      }
    );

  } catch (error) {
    console.error('[auction] ❌ Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
});

/* 
 * Usage Examples:
 * 
 * 1. Create Auction:
 * POST /auction
 * {
 *   "action": "create",
 *   "nft_mint": "ABC123...",
 *   "seller_wallet": "SELLER_ADDRESS",
 *   "start_price_lamports": 100000000,
 *   "duration_hours": 72
 * }
 * 
 * 2. Place Bid:
 * POST /auction
 * {
 *   "action": "bid",
 *   "auction_id": "uuid",
 *   "bidder_wallet": "BIDDER_ADDRESS",
 *   "bid_price_lamports": 150000000
 * }
 * 
 * 3. Cancel Auction:
 * POST /auction
 * {
 *   "action": "cancel",
 *   "auction_id": "uuid",
 *   "seller_wallet": "SELLER_ADDRESS"
 * }
 * 
 * 4. Finalize Auction:
 * POST /auction
 * {
 *   "action": "finalize",
 *   "auction_id": "uuid"
 * }
 * 
 * 5. Auto-finalize (cron job):
 * POST /auction
 * {
 *   "action": "auto_finalize"
 * }
 */
