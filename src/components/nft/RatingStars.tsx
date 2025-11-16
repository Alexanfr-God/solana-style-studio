import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number; // 0-5
  count?: number; // количество голосов
  onChange?: (rating: number) => void; // для интерактивного режима
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  count,
  onChange,
  readonly = false,
  size = 'md',
  showCount = true
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const displayRating = hoverRating || value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly && onChange) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && onChange) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={cn(
              'transition-all',
              !readonly && onChange && 'cursor-pointer hover:scale-110',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                rating <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-gray-400'
              )}
            />
          </button>
        ))}
      </div>

      {/* Count */}
      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs text-gray-400 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
};
