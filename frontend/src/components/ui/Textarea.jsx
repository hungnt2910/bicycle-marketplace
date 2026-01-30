import React from 'react';

const Textarea = ({
    label,
    error,
    className = '',
    placeholder,
    value,
    onChange,
    required = false,
    rows = 4,
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
            <textarea
                className={`textarea ${error ? 'input-error' : ''} ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-danger-600">{error}</p>
            )}
        </div>
    );
};

export default Textarea;
