/**
 * Auction Countdown Timer Component
 * Displays remaining time for active auctions
 */

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { TimeLeft } from '@/types/auction';

interface AuctionCountdownProps {
  endAt: string;
  compact?: boolean;
}

function calculateTimeLeft(endAt: string): TimeLeft {
  const now = new Date().getTime();
  const end = new Date(endAt).getTime();
  const total = end - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
}

export function AuctionCountdown({ endAt, compact = false }: AuctionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  if (timeLeft.total <= 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />
        <span>Ended</span>
      </div>
    );
  }

  if (compact) {
    // Compact format for gallery cards
    return (
      <div className="flex items-center gap-1 text-xs font-semibold text-white">
        <Clock className="w-3 h-3" />
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}</span>
      </div>
    );
  }

  // Full format
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-primary" />
      <div className="flex gap-2 text-sm font-mono">
        {timeLeft.days > 0 && (
          <span className="flex flex-col items-center">
            <span className="font-bold text-foreground">{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </span>
        )}
        <span className="flex flex-col items-center">
          <span className="font-bold text-foreground">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">hrs</span>
        </span>
        <span className="flex flex-col items-center">
          <span className="font-bold text-foreground">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </span>
        <span className="flex flex-col items-center">
          <span className="font-bold text-foreground">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">sec</span>
        </span>
      </div>
    </div>
  );
}
