import React from 'react';

export default function Textarea({
  placeholder = '',
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 focus:ring-themePrimary focus:border-transparent resize-none ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
        {...props}
      />
      {error && errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
    </div>
  );
}
