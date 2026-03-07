import React from 'react';

export default function Card({ children, className = '', hoverable = false, bordered = true }) {
  return (
    <div
      className={`bg-white rounded-[16px] transition-all duration-300 ${bordered ? 'border border-warmgray-200' : ''} ${hoverable ? 'hover:shadow-elevated hover:-translate-y-1 cursor-pointer' : 'shadow-soft'} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-5 border-b border-warmgray-200 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 border-t border-warmgray-200 bg-warmgray-50 rounded-b-[16px] ${className}`}
    >
      {children}
    </div>
  );
}
