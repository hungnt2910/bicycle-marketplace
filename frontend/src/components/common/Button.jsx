import React from 'react';

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'bg-primary-800 text-white hover:bg-primary-900 focus:ring-primary-500',
    secondary: 'bg-gold text-primary-900 hover:bg-gold-light focus:ring-gold',
    success: 'bg-success text-white hover:opacity-90 focus:ring-green-500',
    danger: 'bg-danger text-white hover:opacity-90 focus:ring-red-500',
    outline:
      'border-[1.5px] border-warmgray-300 text-warmgray-700 hover:border-primary-600 hover:text-primary-800 hover:bg-warmgray-50 focus:ring-primary-500',
    ghost: 'text-warmgray-700 hover:bg-warmgray-100 hover:text-primary-800 focus:ring-warmgray-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-[12px]',
    md: 'px-5 py-2.5 text-base rounded-[16px]',
    lg: 'px-7 py-3.5 text-lg rounded-[20px]',
    xl: 'px-9 py-4 text-xl rounded-[20px]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
