import React from 'react';

const Logo = ({ onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
        >
            <span className="text-2xl md:text-3xl">🚴</span>
            <h1 className="text-lg md:text-2xl font-bold gradient-text hidden sm:block">
                Bicycle-Marketplace
            </h1>
            <h1 className="text-lg font-bold gradient-text sm:hidden">BCM</h1>
        </button>
    );
};

export default Logo;
