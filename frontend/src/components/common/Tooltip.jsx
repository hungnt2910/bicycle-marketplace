import React, { useState } from 'react';

export default function Tooltip({ content, children, position = 'top', className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>

      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-primary-900 rounded-[12px] whitespace-nowrap shadow-elevated ${positionClasses[position]} ${className}`}
        >
          {content}
          {position === 'top' && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-900 rotate-45" />
          )}
          {position === 'bottom' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-900 rotate-45" />
          )}
        </div>
      )}
    </div>
  );
}
