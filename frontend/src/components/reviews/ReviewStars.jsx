import React from 'react';

/**
 * ReviewStars – interactive star rating OR read-only display.
 * @param {number} rating  - current rating value (1-5)
 * @param {function} onChange - when supplied the stars become interactive
 * @param {'sm'|'md'|'lg'} size - visual size variant
 */
const SIZE_MAP = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

const ReviewStars = ({ rating = 0, onChange, size = 'md' }) => {
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;
  const interactive = typeof onChange === 'function';

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Đánh giá: ${rating} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = rating >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!interactive}
            aria-label={`Chọn ${star} sao`}
            aria-pressed={active}
            className={[
              sizeClass,
              'transition-transform duration-150',
              interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default',
              active ? 'text-amber-400' : 'text-warmgray-300',
            ].join(' ')}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default ReviewStars;
