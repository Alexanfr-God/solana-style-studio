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

  // Calculate urgency level for color indication
  const totalHours = timeLeft.total / (1000 * 60 * 60);
  const getUrgencyColor = () => {
    if (totalHours > 24) {
      return 'text-green-400'; // > 24h = green
    } else if (totalHours > 1) {
      return 'text-yellow-400'; // < 24h but > 1h = yellow
    } else {
      return 'text-red-400 animate-pulse'; // < 1h = red with pulse
    }
  };

  const urgencyColor = getUrgencyColor();

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
      <div className={`flex items-center gap-1 text-xs font-semibold ${urgencyColor}`}>
        <Clock className="w-3 h-3" />
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}</span>
      </div>
    );
  }

  // Full format
  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-4 h-4 ${urgencyColor}`} />
      <div className="flex gap-2 text-sm font-mono">
        {timeLeft.days > 0 && (
          <span className="flex flex-col items-center">
            <span className={`font-bold ${urgencyColor}`}>{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </span>
        )}
        <span className="flex flex-col items-center">
          <span className={`font-bold ${urgencyColor}`}>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">hrs</span>
        </span>
        <span className="flex flex-col items-center">
          <span className={`font-bold ${urgencyColor}`}>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </span>
        <span className="flex flex-col items-center">
          <span className={`font-bold ${urgencyColor}`}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-muted-foreground">sec</span>
        </span>
      </div>
    </div>
  );
}
