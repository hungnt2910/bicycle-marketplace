import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, setOpen, title, children, className = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-4xl',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-primary-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-[20px] shadow-elevated ${sizeClasses[size] || sizeClasses.md} w-full max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-warmgray-200">
          <h2 className="text-lg font-semibold text-primary-900 font-display">{title}</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-warmgray-400 hover:text-warmgray-700 transition-colors p-1 rounded-lg hover:bg-warmgray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>

      {/* Overlay click handler */}
      <div className="absolute inset-0 z-40" onClick={() => setOpen(false)} />
    </div>
  );
}
