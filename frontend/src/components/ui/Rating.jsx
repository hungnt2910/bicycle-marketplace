import React from 'react';

const Rating = ({
  value = 0,
  max = 5,
  size = 'md',
  showValue = false,
  className = '',
  onChange,
  readonly = false,
}) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={`rating flex items-center ${className}`}>
      {[...Array(max)].map((_, index) => {
        const rating = index + 1;
        const isFilled = rating <= value;

        return (
          <span
            key={index}
            className={`${sizes[size]} ${isFilled ? 'text-gold' : 'text-warmgray-300'} ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => handleClick(rating)}
          >
            {isFilled ? '★' : '☆'}
          </span>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-warmgray-700">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Rating;
