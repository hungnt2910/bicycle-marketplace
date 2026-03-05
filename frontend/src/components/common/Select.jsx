import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  options = [],
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage = '',
  label = '',
  required = false,
  placeholder = 'Select an option',
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
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-3 border-[1.5px] rounded-[16px] outline-none transition-all duration-300 focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 appearance-none ${error ? 'border-danger focus:ring-danger/20' : 'border-warmgray-300'} ${disabled ? 'bg-warmgray-100 cursor-not-allowed' : 'bg-white'} pr-10 ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warmgray-400 pointer-events-none"
        />
      </div>
      {error && errorMessage && <p className="text-danger text-sm mt-1.5">{errorMessage}</p>}
    </div>
  );
}
