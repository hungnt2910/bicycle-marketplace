import React from 'react';

export default function Card({ children, className = '', hoverable = false, bordered = true }) {
  return (
    <div
      className={`bg-white rounded-lg transition ${bordered ? 'border border-gray-200' : ''} ${hoverable ? 'hover:shadow-lg cursor-pointer' : 'shadow-sm'} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}
