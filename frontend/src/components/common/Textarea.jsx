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
        <label className="block text-sm font-medium text-warmgray-700 mb-2">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 border-[1.5px] rounded-[16px] outline-none transition-all duration-300 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-none ${error ? 'border-danger focus:ring-danger/20' : 'border-warmgray-300'} ${disabled ? 'bg-warmgray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
        {...props}
      />
      {error && errorMessage && <p className="text-danger text-sm mt-1.5">{errorMessage}</p>}
    </div>
  );
}
