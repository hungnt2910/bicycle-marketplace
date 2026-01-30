import React from 'react';

export default function Badge({ variant = 'primary', size = 'md', children, className = '' }) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    gray: 'bg-gray-100 text-gray-800',
    verified: 'bg-green-500 text-white',
    pending: 'bg-yellow-500 text-white',
    sold: 'bg-gray-600 text-white',
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
