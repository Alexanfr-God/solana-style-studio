/**
 * Auction Utilities
 */

import type { Auction, TimeLeft } from '@/types/auction';

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const MIN_BID_INCREMENT_PERCENT = 10; // 10% increase required

/**
 * Convert lamports to SOL
 */
export function lamportsToSOL(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Format lamports as SOL with specified decimal places
 */
export function formatSOL(lamports: number, decimals: number = 4): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(decimals);
}

/**
 * Format SOL amount with currency symbol
 */
export function formatSOLWithSymbol(lamports: number, decimals: number = 4): string {
  return `${formatSOL(lamports, decimals)} SOL`;
}

/**
 * Calculate minimum bid based on current price (current + 10%)
 */
export function calculateMinBid(currentPriceLamports: number): number {
  return Math.floor(currentPriceLamports * (1 + MIN_BID_INCREMENT_PERCENT / 100));
}

/**
 * Check if auction is currently active
 */
export function isAuctionActive(auction: Auction): boolean {
  return auction.status === 'active' && new Date(auction.end_at) > new Date();
}

/**
 * Check if auction has ended (time-wise)
 */
export function isAuctionEnded(auction: Auction): boolean {
  return new Date(auction.end_at) <= new Date();
}

/**
 * Get time left until auction ends
 * Returns null if auction has already ended
 */
export function getTimeLeft(endAt: string): TimeLeft | null {
  const now = new Date().getTime();
  const end = new Date(endAt).getTime();
  const distance = end - now;

  if (distance < 0) return null;

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    total: distance
  };
}

/**
 * Format time left as human-readable string
 */
export function formatTimeLeft(timeLeft: TimeLeft | null): string {
  if (!timeLeft) return 'Ended';

  const parts: string[] = [];
  
  if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
  if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
  if (timeLeft.minutes > 0 || timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.minutes}m`);
  if (timeLeft.days === 0) parts.push(`${timeLeft.seconds}s`);

  return parts.join(' ');
}

/**
 * Check if auction is ending soon (less than 1 hour left)
 */
export function isAuctionEndingSoon(endAt: string): boolean {
  const timeLeft = getTimeLeft(endAt);
  if (!timeLeft) return false;
  
  const oneHourInMs = 60 * 60 * 1000;
  return timeLeft.total < oneHourInMs;
}

/**
 * Format wallet address for display (truncate middle)
 */
export function formatWalletAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Calculate end time from duration hours
 */
export function calculateEndTime(durationHours: number): Date {
  const now = new Date();
  return new Date(now.getTime() + durationHours * 60 * 60 * 1000);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
