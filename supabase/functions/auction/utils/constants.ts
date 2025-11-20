/**
 * Auction Configuration Constants
 */

// Pricing
export const MIN_START_PRICE_LAMPORTS = 100_000_000; // 0.1 SOL
export const MIN_BID_INCREMENT_LAMPORTS = 10_000_000; // 0.01 SOL

// Duration (user can choose from 1 day to 1 year)
export const MIN_DURATION_HOURS = 24; // 1 day
export const MAX_DURATION_HOURS = 8760; // 365 days (1 year)

// Suggested durations for UI
export const SUGGESTED_DURATIONS = [
  { label: '1 Day', hours: 24 },
  { label: '3 Days', hours: 72 },
  { label: '7 Days', hours: 168 },
  { label: '14 Days', hours: 336 },
  { label: '30 Days', hours: 720 },
  { label: '90 Days', hours: 2160 },
  { label: '6 Months', hours: 4320 },
  { label: '1 Year', hours: 8760 }
] as const;

// CORS
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// Stub mode (set to false to enable real Solana transactions)
export const STUB_MODE = Deno.env.get('AUCTION_STUB_MODE') !== 'false';
