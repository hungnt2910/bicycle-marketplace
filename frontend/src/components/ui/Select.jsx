import React from 'react';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Chọn...',
    error,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    className={`select ${error ? 'input-error' : ''} ${className}`}
                    value={value}
                    onChange={onChange}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-700">
                    <span>▼</span>
                </div>
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
};

export default Select;
