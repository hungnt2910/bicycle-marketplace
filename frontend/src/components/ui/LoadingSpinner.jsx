import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-3',
        lg: 'w-8 h-8 border-4',
        xl: 'w-12 h-12 border-4',
    };

    return (
        <div className={`spinner ${sizes[size]} ${className}`} />
    );
};

export default LoadingSpinner;
