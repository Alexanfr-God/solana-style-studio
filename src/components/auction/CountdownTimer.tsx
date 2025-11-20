/**
 * Countdown Timer Component
 * Displays time remaining until auction ends
 */

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getTimeLeft, formatTimeLeft, isAuctionEndingSoon } from '@/utils/auctionUtils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endAt: string;
  className?: string;
  showIcon?: boolean;
}

export function CountdownTimer({ endAt, className, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = getTimeLeft(endAt);
      setTimeLeft(newTimeLeft);

      // Clear interval if auction ended
      if (!newTimeLeft) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  const isEndingSoon = timeLeft && isAuctionEndingSoon(endAt);
  const hasEnded = !timeLeft;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        hasEnded && 'text-muted-foreground',
        isEndingSoon && 'text-destructive',
        !hasEnded && !isEndingSoon && 'text-foreground',
        className
      )}
    >
      {showIcon && (
        <Clock className={cn(
          'h-4 w-4',
          isEndingSoon && 'animate-pulse'
        )} />
      )}
      <span>
        {hasEnded ? 'Auction Ended' : `Ends in: ${formatTimeLeft(timeLeft)}`}
      </span>
    </div>
  );
}
