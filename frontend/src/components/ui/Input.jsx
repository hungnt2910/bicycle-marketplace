import React from 'react';

const Input = ({
    label,
    error,
    className = '',
    type = 'text',
    placeholder,
    value,
    onChange,
    required = false,
    disabled = false,
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
            <input
                type={type}
                className={`input ${error ? 'input-error' : ''} ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
};

export default Input;
