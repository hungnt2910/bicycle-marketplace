import React from 'react';

export default function Badge({ variant = 'primary', size = 'md', children, className = '' }) {
  const variantClasses = {
    primary: 'bg-primary-800/10 text-primary-800',
    secondary: 'bg-gold/15 text-primary-900',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
    gray: 'bg-warmgray-100 text-warmgray-800',
    verified: 'bg-primary-600 text-white',
    pending: 'bg-gold text-primary-900',
    sold: 'bg-warmgray-600 text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {children}
    </span>
  );
}
